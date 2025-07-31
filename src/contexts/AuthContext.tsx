import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  id: string;
  company_id: string;
  role: 'admin' | 'gestionnaire' | 'lecteur';
  companies: {
    id: string;
    name: string;
    owner_id: string;
    plan_type: string;
  };
}

interface GlobalUserRole {
  role: 'supra_admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  globalUserRole: GlobalUserRole | null;
  subscriptionStatus: {
    subscribed: boolean;
    subscription_tier: string | null;
    plan_type: string;
    trial_active: boolean;
  };
  refreshSubscription: () => Promise<void>;
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
  const [globalUserRole, setGlobalUserRole] = useState<GlobalUserRole | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscribed: false,
    subscription_tier: null,
    plan_type: 'freemium',
    trial_active: false,
  });

  const refreshUserRole = async (userId: string) => {
    try {
      // Get workspace-specific role
      const { data: workspaceRole, error: workspaceError } = await supabase
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
        .eq('user_id', userId)
        .single();

      if (workspaceError && workspaceError.code !== 'PGRST116') {
        console.error('Error fetching user role:', workspaceError);
      } else {
        setUserRole(workspaceRole as UserRole);
      }

      // Get global role
      const { data: globalRole, error: globalError } = await supabase
        .from('global_user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (globalError && globalError.code !== 'PGRST116') {
        console.error('Error fetching global user role:', globalError);
        setGlobalUserRole(null);
      } else {
        setGlobalUserRole(globalRole as GlobalUserRole);
      }
    } catch (error) {
      console.error('Error refreshing user role:', error);
      setUserRole(null);
      setGlobalUserRole(null);
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'saml',
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
        provider: providerMap[provider],
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
          setGlobalUserRole(null);
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
      globalUserRole,
      subscriptionStatus,
      refreshSubscription,
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