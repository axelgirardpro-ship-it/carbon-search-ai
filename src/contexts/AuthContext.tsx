import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  id: string;
  workspace_id?: string;
  role: 'admin' | 'gestionnaire' | 'lecteur' | 'supra_admin';
  workspaces?: {
    id: string;
    name: string;
    owner_id: string;
    plan_type: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  subscriptionStatus: {
    subscribed: boolean;
    plan_type: string;
    trial_active: boolean;
  };
  refreshSubscription: () => Promise<void>;
  refreshUserRole: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: { firstName?: string; lastName?: string; company?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  linkSSOAccount: (provider: 'google') => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscribed: false,
    plan_type: 'freemium',
    trial_active: false,
  });

  const refreshUserRole = async (userId: string) => {
    try {
      // Try to get workspace roles first
      const { data: workspaceRoles, error: workspaceError } = await supabase
        .from('user_roles')
        .select(`
          *,
          workspaces (
            id,
            name,
            owner_id,
            plan_type
          )
        `)
        .eq('user_id', userId)
        .not('workspace_id', 'is', null);

      if (workspaceError && workspaceError.code !== 'PGRST116') {
        console.error('Error fetching workspace roles:', workspaceError);
      }

      // Get global roles from user_roles with NULL workspace_id
      let globalRoles: any[] = [];
      try {
        const { data: globalRoleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .is('workspace_id', null);
        
        globalRoles = globalRoleData || [];
      } catch (error) {
        // Error fetching global roles - expected after migration
      }

      // Combine all roles
      const allRoles = [...(workspaceRoles || []), ...globalRoles];

      if (allRoles.length > 0) {
        // Prioritize supra_admin role if it exists
        const supraAdminRole = allRoles.find(role => role.role === 'supra_admin');
        if (supraAdminRole) {
          setUserRole(supraAdminRole as UserRole);
        } else {
          // Otherwise, take the first workspace-specific role
          const workspaceRole = allRoles.find(role => role.workspace_id);
          setUserRole((workspaceRole || allRoles[0]) as UserRole);
        }
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error refreshing user role:', error);
      setUserRole(null);
    }
  };

  const refreshSubscription = async () => {
    if (!session) return;
    
    try {
      // Get workspace plan instead of user subscription
      const { data: workspacePlan, error } = await supabase
        .rpc('get_user_workspace_plan', { user_uuid: session.user.id });
      
      if (error) throw error;
      
      const planType = workspacePlan || 'freemium';
      const isSubscribed = planType !== 'freemium';
      
      setSubscriptionStatus({
        subscribed: isSubscribed,
        plan_type: planType,
        trial_active: false, // Les trials sont maintenant gérés au niveau workspace si nécessaire
      });
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscriptionStatus({
        subscribed: false,
        plan_type: 'freemium',
        trial_active: false,
      });
    }
  };

  const createUserSession = async (session: Session) => {
    try {
      // Get user agent and IP (IP will be handled by the server)
      const userAgent = navigator.userAgent;
      
      // Clean up any existing sessions for this user first
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', session.user.id);
      
      // Create new session record
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: session.user.id,
          session_token: session.access_token,
          user_agent: userAgent,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (error) {
        console.error('Error creating user session:', error);
      } else {
        console.log('User session created successfully');
      }
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  };

  const updateSessionActivity = async () => {
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          last_activity: new Date().toISOString() 
        })
        .eq('user_id', session.user.id)
        .eq('session_token', session.access_token);

      if (error) {
        console.error('Error updating session activity:', error);
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Starting sign out process...');
      
      // Clean up database sessions first
      if (session?.user) {
        try {
          await supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', session.user.id);
          console.log('Database sessions cleaned up');
        } catch (dbError) {
          console.error('Error cleaning database sessions:', dbError);
        }
      }

      // Force clear localStorage before sign out
      localStorage.clear();
      console.log('localStorage cleared');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Supabase sign out completed');
      
      // Reset all state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setSubscriptionStatus({
        subscribed: false,
        plan_type: 'freemium',
        trial_active: false,
      });
      
      // Add delay before potential redirect to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: { firstName?: string; lastName?: string; company?: string }) => {
    try {
      console.log('Signup attempt:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName,
            company: userData?.company
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
      } else {
        console.log('Signup successful:', data);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google SSO sign in...');
      
      // Check for existing session and clean if needed
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session) {
        console.log('Found existing session, cleaning up...');
        await supabase.auth.signOut();
        localStorage.clear();
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('Initiating Google OAuth with redirect:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Force account selection
          },
        },
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
      } else {
        console.log('Google OAuth initiated successfully');
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error };
    }
  };


  const linkSSOAccount = async (provider: 'google') => {
    try {
      const redirectUrl = `${window.location.origin}/settings`;
      
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error(`Error linking ${provider} account:`, error);
      return { error };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset user role when user changes
        if (!session?.user) {
          setUserRole(null);
          setSubscriptionStatus({
            subscribed: false,
            plan_type: 'freemium',
            trial_active: false,
          });
        } else {
          // Defer subscription and role check to avoid deadlock
          setTimeout(() => {
            refreshSubscription();
            refreshUserRole(session.user.id);
            // Create user session when user logs in
            createUserSession(session);
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshSubscription();
          refreshUserRole(session.user.id);
          // Create user session for existing session
          createUserSession(session);
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update session activity every 5 minutes
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(() => {
      updateSessionActivity();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [session]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      subscriptionStatus,
      refreshSubscription,
      refreshUserRole,
      signOut,
      signUp,
      signIn,
      resetPassword,
      signInWithGoogle,
      linkSSOAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};