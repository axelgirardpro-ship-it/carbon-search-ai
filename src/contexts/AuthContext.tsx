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
  signOut: () => Promise<void>;
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
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        return;
      }

      setUserRole(data as UserRole);
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
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};