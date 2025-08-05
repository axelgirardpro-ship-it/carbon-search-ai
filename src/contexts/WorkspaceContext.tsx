import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan_type: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const workspaceIds = await getUserWorkspaceIds(user.id);
      let query = supabase
        .from('workspaces')
        .select('*');

      // Récupérer les workspaces de l'utilisateur (owner ou membre)
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
        setCurrentWorkspace(userWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error in refreshWorkspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour récupérer les IDs des workspaces de l'utilisateur via user_roles
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

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
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

      // Ajouter le rôle admin pour le créateur
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

  useEffect(() => {
    if (user) {
      refreshWorkspaces();
      
      // Récupérer le workspace courant depuis localStorage
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (savedWorkspaceId) {
        // Attendre que les workspaces soient chargés
        setTimeout(() => {
          const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
          if (savedWorkspace) {
            setCurrentWorkspace(savedWorkspace);
          }
        }, 100);
      }
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      switchWorkspace,
      refreshWorkspaces,
      createWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};