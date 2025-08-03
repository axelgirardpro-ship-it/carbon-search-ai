import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { userRole } = useAuth();

  const canAddUsers = () => {
    return userRole?.role === 'admin';
  };

  const canImportData = () => {
    return userRole?.role === 'admin' || userRole?.role === 'gestionnaire';
  };

  const canExportData = () => {
    return userRole?.role === 'admin' || userRole?.role === 'gestionnaire';
  };

  const canViewAllData = () => {
    return userRole?.role === 'admin' || userRole?.role === 'gestionnaire';
  };

  const canManageWorkspace = () => {
    return userRole?.role === 'admin';
  };

  const canDeleteData = () => {
    return userRole?.role === 'admin';
  };

  const isSupraAdmin = () => {
    return userRole?.role === 'supra_admin';
  };

  const getRoleLabel = () => {
    switch (userRole?.role as any) {
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

  return {
    canAddUsers,
    canImportData,
    canExportData,
    canViewAllData,
    canManageWorkspace,
    canDeleteData,
    isSupraAdmin,
    getRoleLabel,
    userRole,
  };
};