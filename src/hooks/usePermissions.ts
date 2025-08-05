import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUnifiedUser } from "./useUnifiedUser";

export const usePermissions = () => {
  const { currentWorkspace } = useWorkspace();
  const { unifiedUser } = useUnifiedUser();

  // Permissions basées sur le RÔLE (indépendamment du plan)
  const canAddUsers = () => {
    return unifiedUser?.role === 'admin' || unifiedUser?.role === 'supra_admin';
  };

  const canImportData = () => {
    return unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire' || unifiedUser?.role === 'supra_admin';
  };

  const canExportFE = () => {
    return unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire';
  };

  const canViewAllData = () => {
    return unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire';
  };

  const canManageWorkspace = () => {
    return unifiedUser?.role === 'admin';
  };

  const canDeleteData = () => {
    return unifiedUser?.role === 'admin';
  };

  const isSupraAdmin = () => {
    return unifiedUser?.role === 'supra_admin';
  };

  // Permissions basées sur le PLAN du workspace
  const canAccessFavorites = () => {
    return currentWorkspace?.plan_type === 'premium';
  };

  const canExportFromDashboard = () => {
    return currentWorkspace?.plan_type === 'premium';
  };

  const hasSearchLimit = () => {
    return currentWorkspace?.plan_type === 'freemium';
  };

  const canExportData = () => {
    // Combinaison : rôle permet + plan permet
    return canExportFE() && canExportFromDashboard();
  };

  const getRoleLabel = () => {
    switch (unifiedUser?.role as any) {
      case 'supra_admin':
        return 'Supra Administrateur';
      case 'admin':
        return 'Administrateur';
      case 'gestionnaire':
        return 'Gestionnaire';
      case 'lecteur':
        return 'Lecteur';
      default:
        return 'Non assigné';
    }
  };

  const getPlanLabel = () => {
    switch (currentWorkspace?.plan_type) {
      case 'premium':
        return 'Premium';
      case 'standard':
        return 'Standard';
      case 'freemium':
        return 'Freemium';
      default:
        return 'Freemium';
    }
  };

  return {
    // Permissions par rôle
    canAddUsers,
    canImportData,
    canExportFE,
    canViewAllData,
    canManageWorkspace,
    canDeleteData,
    isSupraAdmin,
    
    // Permissions par plan
    canAccessFavorites,
    canExportFromDashboard,
    hasSearchLimit,
    
    // Permissions combinées
    canExportData,
    
    // Labels et données
    getRoleLabel,
    getPlanLabel,
    userRole: unifiedUser,
    workspacePlan: currentWorkspace,
  };
};