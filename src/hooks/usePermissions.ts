import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useSupraAdmin } from "@/hooks/useSupraAdmin";

export const usePermissions = () => {
  const { user } = useAuth();
  const { userProfile } = useUser();
  const { isSupraAdmin } = useSupraAdmin();

  // Can import data: supra_admin or admin
  const canImportData = isSupraAdmin || userProfile?.role === 'admin';
  
  // Can export: based on plan and quotas
  const canExport = true; // This will be managed by quota system
  
  // Can manage users: admin or supra_admin
  const canManageUsers = isSupraAdmin || userProfile?.role === 'admin';
  
  // Can add users (alias for canManageUsers for backward compatibility)
  const canAddUsers = canManageUsers;

  return {
    isSupraAdmin,
    canImportData,
    canExport,
    canManageUsers,
    canAddUsers, // Backward compatibility
    role: userProfile?.role,
    planType: userProfile?.plan_type
  };
};