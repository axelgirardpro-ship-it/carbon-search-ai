import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useUnifiedUser } from "./useUnifiedUser";

export const usePermissions = () => {
  const { currentWorkspace } = useWorkspace();
  const { unifiedUser } = useUnifiedUser();

  // Check if user is originally a supra admin (bypass all restrictions)
  const isOriginalSupraAdmin = () => {
    // Check if current role is supra_admin OR check database for original role
    return unifiedUser?.role === 'supra_admin';
  };

  // Permissions basées sur le RÔLE (indépendamment du plan)
  const canAddUsers = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
  };

  const canImportData = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire';
  };

  const canExportFE = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire';
  };

  const canViewAllData = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin' || unifiedUser?.role === 'gestionnaire';
  };

  const canManageWorkspace = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
  };

  const canDeleteData = () => {
    return isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
  };

  const isSupraAdmin = () => {
    return unifiedUser?.role === 'supra_admin';
  };

  // Permissions basées sur le PLAN du workspace
  const canAccessFavorites = () => {
    return currentWorkspace?.plan_type === 'premium';
  };

  const canExportFromDashboard = () => {
    // Seuls les comptes premium peuvent exporter
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
    isOriginalSupraAdmin,
    
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