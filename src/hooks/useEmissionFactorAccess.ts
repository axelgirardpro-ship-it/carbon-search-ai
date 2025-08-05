import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

export const useEmissionFactorAccess = () => {
  const { subscriptionStatus } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const isPremiumUser = subscriptionStatus.plan_type === 'premium';
  const isFreemiumUser = subscriptionStatus.plan_type === 'freemium';
  const isStandardUser = subscriptionStatus.plan_type === 'standard';

  const shouldBlurPremiumContent = (source: string, isPremiumSource: boolean) => {
    // Don't blur if user has premium access
    if (isPremiumUser) return false;
    
    // Don't blur if it's not a premium source
    if (!isPremiumSource) return false;
    
    // Blur premium content for non-premium users
    return true;
  };

  const getSourceLabel = (hasWorkspaceId: boolean, source: string, isPremiumSource?: boolean) => {
    if (hasWorkspaceId) {
      return { label: 'Importé', variant: 'secondary' as const };
    }
    
    if (isPremiumSource && !isPremiumUser) {
      return { label: 'Premium', variant: 'default' as const };
    }
    
    return null;
  };

  const checkIsPremiumSource = async (source: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('fe_sources')
        .select('access_level')
        .eq('source_name', source)
        .eq('is_global', true)
        .single();
      
      return data?.access_level === 'premium';
    } catch (error) {
      return false;
    }
  };

  return {
    isPremiumUser,
    isFreemiumUser,
    isStandardUser,
    shouldBlurPremiumContent,
    getSourceLabel,
    checkIsPremiumSource
  };
};