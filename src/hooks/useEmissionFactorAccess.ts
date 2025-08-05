import { useGlobalState } from "@/contexts/GlobalStateContext";

export const useEmissionFactorAccess = () => {
  const { user, currentWorkspace } = useGlobalState();

  const hasAccess = (source: string) => {
    if (!user) return false;
    return true; // Simplified logic for now
  };

  return {
    hasAccess,
    user,
    currentWorkspace,
  };
};