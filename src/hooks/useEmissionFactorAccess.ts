import { useGlobalState } from "@/contexts/GlobalStateContext";

export const useEmissionFactorAccess = () => {
  const { user, currentWorkspace } = useGlobalState();

  const hasAccess = (source: string) => {
    if (!user) return false;
    return true; // Simplified logic for now
  };

  const shouldBlurPremiumContent = (source: string, isPremiumSource?: boolean) => {
    // Blur premium content for non-premium users
    if (isPremiumSource && currentWorkspace?.plan_type !== 'premium') {
      return true;
    }
    return false;
  };

  const getSourceLabel = (isWorkspaceSpecific: boolean, source: string, isPremiumSource?: boolean) => {
    if (isWorkspaceSpecific) {
      return {
        variant: "secondary" as const,
        label: "Workspace"
      };
    }
    if (isPremiumSource) {
      return {
        variant: "default" as const,
        label: "Premium"
      };
    }
    return null;
  };

  return {
    hasAccess,
    shouldBlurPremiumContent,
    getSourceLabel,
    user,
    currentWorkspace,
  };
};