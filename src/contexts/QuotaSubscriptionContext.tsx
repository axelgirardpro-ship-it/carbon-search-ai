import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_end: string | null;
  plan_type: string;
  trial_active?: boolean;
}

interface QuotaSubscriptionContextType {
  // Quota data
  searchesUsed: number;
  searchesLimit: number;
  exportsUsed: number;
  exportsLimit: number;
  canSearch: boolean;
  canExport: boolean;
  incrementSearch: () => Promise<void>;
  incrementExport: () => Promise<void>;
  
  // Subscription data
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (plan: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  refreshQuotas: () => Promise<void>;
}

const QuotaSubscriptionContext = createContext<QuotaSubscriptionContextType | undefined>(undefined);

export const useQuotaSubscription = () => {
  const context = useContext(QuotaSubscriptionContext);
  if (!context) {
    throw new Error('useQuotaSubscription must be used within a QuotaSubscriptionProvider');
  }
  return context;
};

// Backward compatibility exports
export const useQuotas = () => {
  const context = useQuotaSubscription();
  return {
    searchesUsed: context.searchesUsed,
    searchesLimit: context.searchesLimit,
    exportsUsed: context.exportsUsed,
    exportsLimit: context.exportsLimit,
    canSearch: context.canSearch,
    canExport: context.canExport,
    refreshQuotas: context.refreshQuotas,
    incrementSearch: context.incrementSearch,
    incrementExport: context.incrementExport,
  };
};

export const useSubscription = () => {
  const context = useQuotaSubscription();
  return {
    subscription: context.subscription,
    loading: context.loading,
    refreshSubscription: context.refreshSubscription,
    createCheckoutSession: context.createCheckoutSession,
    openCustomerPortal: context.openCustomerPortal,
  };
};

interface QuotaSubscriptionProviderProps {
  children: ReactNode;
}

export const QuotaSubscriptionProvider = ({ children }: QuotaSubscriptionProviderProps) => {
  const { user } = useAuth();
  
  // Quota state
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [searchesLimit, setSearchesLimit] = useState(10);
  const [exportsUsed, setExportsUsed] = useState(0);
  const [exportsLimit, setExportsLimit] = useState(0);
  
  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);

  const canSearch = searchesLimit === -1 || searchesUsed < searchesLimit;
  const canExport = exportsLimit === -1 || exportsUsed < exportsLimit;

  const refreshQuotas = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('search_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSearchesUsed(data.searches_used || 0);
        setSearchesLimit(data.searches_limit || 10);
        setExportsUsed(data.exports_used || 0);
        setExportsLimit(data.exports_limit || 0);
      }
    } catch (error) {
      console.error('Error fetching quotas:', error);
    }
  };

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer le plan depuis la base de données Supabase uniquement
      const { data: workspacePlan, error: workspaceError } = await supabase
        .rpc('get_user_workspace_plan', { user_uuid: user.id });
      
      if (workspaceError) {
        console.error('Error fetching workspace plan:', workspaceError);
        setSubscription({
          subscribed: false,
          subscription_end: null,
          plan_type: 'freemium',
          trial_active: false
        });
        return;
      }
      
      const planType = workspacePlan || 'freemium';
      const isSubscribed = planType !== 'freemium';
      
      setSubscription({
        subscribed: isSubscribed,
        subscription_end: null,
        plan_type: planType,
        trial_active: false
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({
        subscribed: false,
        subscription_end: null,
        plan_type: 'freemium',
        trial_active: false
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementSearch = async () => {
    if (!user || !canSearch) return;

    try {
      const { error } = await supabase
        .from('search_quotas')
        .update({ 
          searches_used: searchesUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setSearchesUsed(prev => prev + 1);
        
        // Log audit trail
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'search_performed',
          details: { searches_used: searchesUsed + 1, searches_limit: searchesLimit }
        });
      }
    } catch (error) {
      console.error('Error incrementing search:', error);
    }
  };

  const incrementExport = async () => {
    if (!user || !canExport) return;

    try {
      const { error } = await supabase
        .from('search_quotas')
        .update({ 
          exports_used: exportsUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setExportsUsed(prev => prev + 1);
        
        // Log audit trail
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'export_performed',
          details: { exports_used: exportsUsed + 1, exports_limit: exportsLimit }
        });
      }
    } catch (error) {
      console.error('Error incrementing export:', error);
    }
  };

  // Fonctions Stripe supprimées - plus utilisées
  const createCheckoutSession = async (plan: string) => {
    throw new Error('Stripe checkout is no longer supported');
  };

  const openCustomerPortal = async () => {
    throw new Error('Stripe customer portal is no longer supported');
  };

  useEffect(() => {
    if (user) {
      refreshQuotas();
      refreshSubscription();
    }
  }, [user]);

  return (
    <QuotaSubscriptionContext.Provider value={{
      searchesUsed,
      searchesLimit,
      exportsUsed,
      exportsLimit,
      canSearch,
      canExport,
      incrementSearch,
      incrementExport,
      subscription,
      loading,
      refreshSubscription,
      createCheckoutSession,
      openCustomerPortal,
      refreshQuotas,
    }}>
      {children}
    </QuotaSubscriptionContext.Provider>
  );
};

// Keep old exports for backward compatibility
export const QuotaProvider = QuotaSubscriptionProvider;
export const SubscriptionProvider = QuotaSubscriptionProvider;
