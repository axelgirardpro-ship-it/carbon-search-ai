import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'gestionnaire' | 'lecteur' | 'supra_admin')[];
  requirePermission?: 'canAddUsers' | 'canImportData' | 'canExportData' | 'canViewAllData' | 'canManageCompany' | 'canDeleteData';
  fallback?: ReactNode;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  requirePermission, 
  fallback = null 
}: RoleGuardProps) => {
  const permissions = usePermissions();
  const { userRole } = permissions;

  // Check by role
  if (allowedRoles) {
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      return <>{fallback}</>;
    }
  }

  // Check by permission
  if (requirePermission) {
    const hasPermission = permissions[requirePermission]();
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};