import { useEffect } from 'react';
import { useGlobalState } from '@/contexts/GlobalStateContext';

export const useGlobalStateDebug = (componentName: string) => {
  const {
    user,
    unifiedUser,
    currentWorkspace,
    permissions,
    quotas,
    authLoading,
    userLoading,
    workspaceLoading,
    quotaLoading,
  } = useGlobalState();

  useEffect(() => {
    const debugInfo = {
      component: componentName,
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      unifiedUser: unifiedUser ? {
        role: unifiedUser.role,
        original_role: unifiedUser.original_role,
        workspace_id: unifiedUser.workspace_id,
        plan_type: unifiedUser.plan_type,
      } : null,
      currentWorkspace: currentWorkspace ? {
        id: currentWorkspace.id,
        name: currentWorkspace.name,
        plan_type: currentWorkspace.plan_type,
      } : null,
      permissions: {
        isSupraAdmin: permissions.isSupraAdmin,
        isOriginalSupraAdmin: permissions.isOriginalSupraAdmin,
        canExportData: permissions.canExportData,
        canAccessFavorites: permissions.canAccessFavorites,
      },
      quotas: {
        canSearch: quotas.canSearch,
        canExport: quotas.canExport,
        searchesUsed: quotas.searchesUsed,
        searchesLimit: quotas.searchesLimit,
      },
      loadingStates: {
        authLoading,
        userLoading,
        workspaceLoading,
        quotaLoading,
      },
    };

    console.log(`🔍 [${componentName}] Global State Debug:`, debugInfo);
  }, [
    componentName,
    user?.id,
    unifiedUser?.role,
    unifiedUser?.original_role,
    currentWorkspace?.id,
    currentWorkspace?.plan_type,
    permissions.isSupraAdmin,
    permissions.isOriginalSupraAdmin,
    authLoading,
    userLoading,
    workspaceLoading,
    quotaLoading,
  ]);

  return {
    debugState: {
      user,
      unifiedUser,
      currentWorkspace,
      permissions,
      quotas,
      loadingStates: {
        authLoading,
        userLoading,
        workspaceLoading,
        quotaLoading,
      },
    },
  };
};