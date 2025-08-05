import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Interfaces unifiées
interface UnifiedUser {
  id: string;
  user_id: string;
  workspace_id: string;
  first_name: string;
  last_name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  plan_type: string;
  subscribed: boolean;
  trial_end?: string;
  subscription_end?: string;
  role: string;
  original_role?: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
}

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan_type: string;
  created_at: string;
  updated_at: string;
}

interface GlobalPermissions {
  // Permissions par rôle
  canAddUsers: boolean;
  canImportData: boolean;
  canExportFE: boolean;
  canViewAllData: boolean;
  canManageWorkspace: boolean;
  canDeleteData: boolean;
  isSupraAdmin: boolean;
  isOriginalSupraAdmin: boolean;
  
  // Permissions par plan
  canAccessFavorites: boolean;
  canExportFromDashboard: boolean;
  hasSearchLimit: boolean;
  
  // Permissions combinées
  canExportData: boolean;
}

interface GlobalQuotas {
  searchesUsed: number;
  searchesLimit: number;
  exportsUsed: number;
  exportsLimit: number;
  canSearch: boolean;
  canExport: boolean;
}

interface GlobalStateContextType {
  // État d'authentification
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  
  // Données utilisateur unifiées
  unifiedUser: UnifiedUser | null;
  userLoading: boolean;
  
  // Espaces de travail
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  workspaceLoading: boolean;
  
  // Permissions globales
  permissions: GlobalPermissions;
  
  // Quotas
  quotas: GlobalQuotas;
  quotaLoading: boolean;
  
  // Actions globales
  refreshGlobalState: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshPermissions: () => void;
  refreshQuotas: () => Promise<void>;
  
  // Actions workspace
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  
  // Actions quotas
  incrementSearch: () => Promise<void>;
  incrementExport: () => Promise<void>;
  
  // Actions auth
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: { firstName?: string; lastName?: string; company?: string }) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
  // États d'authentification
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // États utilisateur
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // États workspace
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  // États quotas
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [searchesLimit, setSearchesLimit] = useState(10);
  const [exportsUsed, setExportsUsed] = useState(0);
  const [exportsLimit, setExportsLimit] = useState(0);
  const [quotaLoading, setQuotaLoading] = useState(false);

  // Calculer les permissions de manière reactive
  const permissions: GlobalPermissions = useCallback(() => {
    const isOriginalSupraAdmin = () => {
      return unifiedUser?.role === 'supra_admin' || unifiedUser?.original_role === 'supra_admin';
    };

    const canAddUsers = isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
    const canImportData = isOriginalSupraAdmin() || ['admin', 'gestionnaire'].includes(unifiedUser?.role || '');
    const canExportFE = isOriginalSupraAdmin() || ['admin', 'gestionnaire'].includes(unifiedUser?.role || '');
    const canViewAllData = isOriginalSupraAdmin() || ['admin', 'gestionnaire'].includes(unifiedUser?.role || '');
    const canManageWorkspace = isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
    const canDeleteData = isOriginalSupraAdmin() || unifiedUser?.role === 'admin';
    const isSupraAdmin = unifiedUser?.role === 'supra_admin';

    const canAccessFavorites = currentWorkspace?.plan_type === 'premium';
    const canExportFromDashboard = currentWorkspace?.plan_type === 'premium';
    const hasSearchLimit = currentWorkspace?.plan_type === 'freemium';

    const canExportData = canExportFE && canExportFromDashboard;

    return {
      canAddUsers,
      canImportData,
      canExportFE,
      canViewAllData,
      canManageWorkspace,
      canDeleteData,
      isSupraAdmin,
      isOriginalSupraAdmin: isOriginalSupraAdmin(),
      canAccessFavorites,
      canExportFromDashboard,
      hasSearchLimit,
      canExportData,
    };
  }, [unifiedUser, currentWorkspace])();

  // Calculer les quotas de manière reactive
  const quotas: GlobalQuotas = {
    searchesUsed,
    searchesLimit,
    exportsUsed,
    exportsLimit,
    canSearch: searchesLimit === -1 || searchesUsed < searchesLimit,
    canExport: exportsLimit === -1 || exportsUsed < exportsLimit,
  };

  // Fonctions de rafraîchissement
  const refreshUser = async () => {
    if (!user || !session) {
      setUnifiedUser(null);
      return;
    }

    setUserLoading(true);
    try {
      // D'abord vérifier s'il y a un rôle global supra_admin
      const { data: globalRoleData } = await supabase
        .from('user_roles')
        .select('role, original_role')
        .eq('user_id', user.id)
        .is('workspace_id', null)
        .eq('role', 'supra_admin')
        .single();

      if (globalRoleData?.role === 'supra_admin') {
        const unifiedData: UnifiedUser = {
          id: user.id,
          user_id: user.id,
          workspace_id: currentWorkspace?.id || '',
          first_name: '',
          last_name: '',
          company: 'Global Admin',
          position: 'Supra Administrateur',
          phone: '',
          email: user.email || '',
          plan_type: 'premium',
          subscribed: true,
          trial_end: undefined,
          subscription_end: undefined,
          role: 'supra_admin',
          original_role: globalRoleData.original_role || 'supra_admin',
          assigned_by: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUnifiedUser(unifiedData);
        setUserLoading(false);
        return;
      }

      // Vérifier s'il y a un rôle avec original_role = supra_admin (supra admin temporairement changé)
      const { data: tempRoleData } = await supabase
        .from('user_roles')
        .select('role, original_role, workspace_id')
        .eq('user_id', user.id)
        .eq('original_role', 'supra_admin')
        .single();

      if (tempRoleData?.original_role === 'supra_admin') {
        const unifiedData: UnifiedUser = {
          id: user.id,
          user_id: user.id,
          workspace_id: currentWorkspace?.id || tempRoleData.workspace_id || '',
          first_name: '',
          last_name: '',
          company: 'Global Admin (Rôle temporaire)',
          position: 'Supra Administrateur',
          phone: '',
          email: user.email || '',
          plan_type: 'premium',
          subscribed: true,
          trial_end: undefined,
          subscription_end: undefined,
          role: tempRoleData.role,
          original_role: 'supra_admin',
          assigned_by: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUnifiedUser(unifiedData);
        setUserLoading(false);
        return;
      }

      // Sinon, récupérer les données utilisateur normales
      if (!currentWorkspace?.id) {
        setUnifiedUser(null);
        setUserLoading(false);
        return;
      }

      // Récupérer les données utilisateur et rôle séparément
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (userError || !userData) {
        setUnifiedUser(null);
        setUserLoading(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, original_role, assigned_by')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (roleError || !roleData) {
        setUnifiedUser(null);
        setUserLoading(false);
        return;
      }

      const unifiedData: UnifiedUser = {
        ...userData,
        role: roleData.role,
        original_role: roleData.original_role,
        assigned_by: roleData.assigned_by,
      };

      setUnifiedUser(unifiedData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUnifiedUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return;
    }

    setWorkspaceLoading(true);
    try {
      const workspaceIds = await getUserWorkspaceIds(user.id);
      let query = supabase
        .from('workspaces')
        .select('*');

      if (workspaceIds) {
        query = query.or(`owner_id.eq.${user.id},id.in.(${workspaceIds})`);
      } else {
        query = query.eq('owner_id', user.id);
      }

      const { data: userWorkspaces, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workspaces:', error);
        return;
      }

      setWorkspaces(userWorkspaces || []);
      
      // Si pas de workspace courant mais qu'il y en a, sélectionner le premier
      if (!currentWorkspace && userWorkspaces && userWorkspaces.length > 0) {
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const savedWorkspace = savedWorkspaceId 
          ? userWorkspaces.find(w => w.id === savedWorkspaceId)
          : userWorkspaces[0];
        
        setCurrentWorkspace(savedWorkspace || userWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error in refreshWorkspaces:', error);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const refreshQuotas = async () => {
    if (!user) return;

    setQuotaLoading(true);
    try {
      const { data } = await supabase
        .from('search_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSearchesUsed(data.searches_used || 0);
        setSearchesLimit(data.searches_limit || 10);
        setExportsUsed(data.exports_used || 0);
        setExportsLimit(data.exports_limit || 0);
      }
    } catch (error) {
      console.error('Error fetching quotas:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const refreshPermissions = () => {
    // Les permissions sont calculées de manière reactive
    // Cette fonction existe pour la compatibilité
  };

  const refreshGlobalState = async () => {
    console.log('🔄 Refreshing global state...');
    await Promise.all([
      refreshUser(),
      refreshWorkspaces(),
      refreshQuotas(),
    ]);
    console.log('✅ Global state refreshed');
  };

  // Helper function
  const getUserWorkspaceIds = async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('workspace_id')
        .eq('user_id', userId)
        .not('workspace_id', 'is', null);

      if (error || !data || data.length === 0) return '';
      
      const validIds = data
        .map(role => role.workspace_id)
        .filter(id => id && id.trim() !== '');
      
      return validIds.length > 0 ? validIds.join(',') : '';
    } catch {
      return '';
    }
  };

  // Actions workspace
  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
      // Rafraîchir l'utilisateur pour le nouveau workspace
      await refreshUser();
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          owner_id: user.id,
          plan_type: 'freemium'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace:', error);
        return null;
      }

      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          workspace_id: data.id,
          role: 'admin',
          assigned_by: user.id
        });

      await refreshWorkspaces();
      return data;
    } catch (error) {
      console.error('Error in createWorkspace:', error);
      return null;
    }
  };

  // Actions quotas
  const incrementSearch = async () => {
    if (!user || !quotas.canSearch) return;

    try {
      const { error } = await supabase
        .from('search_quotas')
        .update({ 
          searches_used: searchesUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setSearchesUsed(prev => prev + 1);
        
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'search_performed',
          details: { searches_used: searchesUsed + 1, searches_limit: searchesLimit }
        });
      }
    } catch (error) {
      console.error('Error incrementing search:', error);
    }
  };

  const incrementExport = async () => {
    if (!user || !quotas.canExport) return;

    try {
      const { error } = await supabase
        .from('search_quotas')
        .update({ 
          exports_used: exportsUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setExportsUsed(prev => prev + 1);
        
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'export_performed',
          details: { exports_used: exportsUsed + 1, exports_limit: exportsLimit }
        });
      }
    } catch (error) {
      console.error('Error incrementing export:', error);
    }
  };

  // Actions auth
  const signOut = async () => {
    try {
      setAuthLoading(true);
      
      if (session?.user) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', session.user.id);
      }

      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset all state
      setUser(null);
      setSession(null);
      setUnifiedUser(null);
      setCurrentWorkspace(null);
      setWorkspaces([]);
      setSearchesUsed(0);
      setExportsUsed(0);
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData?: { firstName?: string; lastName?: string; company?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName,
            company: userData?.company
          }
        }
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session) {
        await supabase.auth.signOut();
        localStorage.clear();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Configuration des listeners d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
        
        if (!session?.user) {
          setUnifiedUser(null);
          setCurrentWorkspace(null);
          setWorkspaces([]);
        } else {
          // Déclencher le rafraîchissement global après connexion
          setTimeout(() => {
            refreshGlobalState();
          }, 100);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshGlobalState();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Rafraîchir l'utilisateur quand le workspace change
  useEffect(() => {
    if (currentWorkspace && user) {
      refreshUser();
    }
  }, [currentWorkspace?.id, user?.id]);

  const value: GlobalStateContextType = {
    // État d'authentification
    user,
    session,
    authLoading,
    
    // Données utilisateur unifiées
    unifiedUser,
    userLoading,
    
    // Espaces de travail
    currentWorkspace,
    workspaces,
    workspaceLoading,
    
    // Permissions globales
    permissions,
    
    // Quotas
    quotas,
    quotaLoading,
    
    // Actions globales
    refreshGlobalState,
    refreshUser,
    refreshWorkspaces,
    refreshPermissions,
    refreshQuotas,
    
    // Actions workspace
    switchWorkspace,
    createWorkspace,
    
    // Actions quotas
    incrementSearch,
    incrementExport,
    
    // Actions auth
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hooks de compatibilité avec l'ancien système
export const useAuth = () => {
  const { user, session, authLoading, signOut, signIn, signUp, signInWithGoogle } = useGlobalState();
  return {
    user,
    session,
    loading: authLoading,
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
    // Fonctions héritées pour compatibilité
    userRole: null,
    subscriptionStatus: { subscribed: false, plan_type: 'freemium', trial_active: false },
    refreshSubscription: async () => {},
    refreshUserRole: async () => {},
    resetPassword: async () => ({ data: null, error: null }),
    linkSSOAccount: async () => ({ error: null }),
  };
};

export const useUnifiedUser = () => {
  const { unifiedUser, userLoading, refreshUser } = useGlobalState();
  return {
    unifiedUser,
    loading: userLoading,
    fetchUnifiedUser: refreshUser,
    updateUnifiedUser: async () => {},
  };
};

export const usePermissions = () => {
  const { permissions, unifiedUser, currentWorkspace } = useGlobalState();
  
  const getRoleLabel = () => {
    switch (unifiedUser?.role) {
      case 'supra_admin': return 'Supra Administrateur';
      case 'admin': return 'Administrateur';
      case 'gestionnaire': return 'Gestionnaire';
      case 'lecteur': return 'Lecteur';
      default: return 'Non assigné';
    }
  };

  const getPlanLabel = () => {
    switch (currentWorkspace?.plan_type) {
      case 'premium': return 'Premium';
      case 'standard': return 'Standard';
      case 'freemium': return 'Freemium';
      default: return 'Freemium';
    }
  };

  return {
    ...permissions,
    getRoleLabel,
    getPlanLabel,
    userRole: unifiedUser,
    workspacePlan: currentWorkspace,
  };
};

export const useWorkspace = () => {
  const { 
    currentWorkspace, 
    workspaces, 
    workspaceLoading, 
    switchWorkspace, 
    refreshWorkspaces, 
    createWorkspace 
  } = useGlobalState();
  
  return {
    currentWorkspace,
    workspaces,
    loading: workspaceLoading,
    switchWorkspace,
    refreshWorkspaces,
    createWorkspace,
  };
};

export const useQuotaSubscription = () => {
  const { quotas, quotaLoading, incrementSearch, incrementExport, refreshQuotas, currentWorkspace } = useGlobalState();
  
  return {
    ...quotas,
    loading: quotaLoading,
    incrementSearch,
    incrementExport,
    refreshQuotas,
    subscription: {
      subscribed: currentWorkspace?.plan_type !== 'freemium',
      subscription_end: null,
      plan_type: currentWorkspace?.plan_type || 'freemium',
      trial_active: false,
    },
    refreshSubscription: async () => {},
    createCheckoutSession: async () => { throw new Error('Not supported'); },
    openCustomerPortal: async () => { throw new Error('Not supported'); },
  };
};

export const useQuotas = () => {
  const context = useQuotaSubscription();
  return {
    searchesUsed: context.searchesUsed,
    searchesLimit: context.searchesLimit,
    exportsUsed: context.exportsUsed,
    exportsLimit: context.exportsLimit,
    canSearch: context.canSearch,
    canExport: context.canExport,
    refreshQuotas: context.refreshQuotas,
    incrementSearch: context.incrementSearch,
    incrementExport: context.incrementExport,
  };
};