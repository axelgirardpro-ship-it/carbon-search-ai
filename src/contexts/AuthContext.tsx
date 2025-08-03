import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  id: string;
  company_id?: string;
  workspace_id?: string;
  role: 'admin' | 'gestionnaire' | 'lecteur' | 'supra_admin';
  companies?: {
    id: string;
    name: string;
    owner_id: string;
    plan_type: string;
  };
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
    subscription_tier: string | null;
    plan_type: string;
    trial_active: boolean;
  };
  refreshSubscription: () => Promise<void>;
  refreshUserRole: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithMicrosoft: () => Promise<{ error: any }>;
  signInWithSAML: () => Promise<{ error: any }>;
  linkSSOAccount: (provider: 'google' | 'microsoft' | 'saml') => Promise<{ error: any }>;
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
    subscription_tier: null,
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
          companies (
            id,
            name,
            owner_id,
            plan_type
          )
        `)
        .eq('user_id', userId);

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
        // Error fetching global roles
        console.log('global_user_roles table does not exist, which is expected after migration');
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
          const workspaceRole = allRoles.find(role => role.company_id || role.workspace_id);
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
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data) {
        setSubscriptionStatus({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          plan_type: data.plan_type || 'freemium',
          trial_active: data.trial_active || false,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error };
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      return { error };
    }
  };

  const signInWithSAML = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      // Note: SAML provider will be configured via Supabase Dashboard
      // For now, we'll use a placeholder that will be updated when SAML is configured
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as any, // Temporary placeholder - will be updated for SAML
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error };
    } catch (error) {
      console.error('Error signing in with SAML:', error);
      return { error };
    }
  };

  const linkSSOAccount = async (provider: 'google' | 'microsoft' | 'saml') => {
    try {
      const redirectUrl = `${window.location.origin}/profile`;
      const providerMap = {
        google: 'google',
        microsoft: 'azure',
        saml: 'saml'
      } as const;
      
      const { error } = await supabase.auth.linkIdentity({
        provider: providerMap[provider] as any,
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
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset user role when user changes
        if (!session?.user) {
          setUserRole(null);
          setSubscriptionStatus({
            subscribed: false,
            subscription_tier: null,
            plan_type: 'freemium',
            trial_active: false,
          });
        } else {
          // Defer subscription and role check to avoid deadlock
          setTimeout(() => {
            refreshSubscription();
            refreshUserRole(session.user.id);
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshSubscription();
          refreshUserRole(session.user.id);
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      signInWithGoogle,
      signInWithMicrosoft,
      signInWithSAML,
      linkSSOAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};