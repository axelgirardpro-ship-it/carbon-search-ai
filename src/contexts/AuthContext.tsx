import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: {
    subscribed: boolean;
    subscription_tier: string | null;
    plan_type: string;
    trial_active: boolean;
  };
  refreshSubscription: () => Promise<void>;
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
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscribed: false,
    subscription_tier: null,
    plan_type: 'freemium',
    trial_active: false,
  });

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer subscription check to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            refreshSubscription();
          }, 0);
        } else {
          setSubscriptionStatus({
            subscribed: false,
            subscription_tier: null,
            plan_type: 'freemium',
            trial_active: false,
          });
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
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      subscriptionStatus,
      refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};