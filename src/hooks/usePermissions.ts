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

  const canManageCompany = () => {
    return userRole?.role === 'admin';
  };

  const canDeleteData = () => {
    return userRole?.role === 'admin';
  };

  const isSuperAdmin = () => {
    return userRole?.role === 'super_admin' as any;
  };

  const getRoleLabel = () => {
    switch (userRole?.role as any) {
      case 'super_admin':
        return 'Super Administrateur';
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
    canManageCompany,
    canDeleteData,
    isSuperAdmin,
    getRoleLabel,
    userRole,
  };
};