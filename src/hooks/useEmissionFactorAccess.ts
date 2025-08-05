import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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

  return {
    isPremiumUser,
    isFreemiumUser,
    isStandardUser,
    shouldBlurPremiumContent,
    getSourceLabel
  };
};