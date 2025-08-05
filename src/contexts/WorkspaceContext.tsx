import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan_type: string;
  created_at: string;
  updated_at: string;
  billing_company?: string;
  billing_address?: string;
  billing_postal_code?: string;
  billing_country?: string;
  billing_siren?: string;
  billing_vat_number?: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  refreshWorkspaces: () => Promise<void>;
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
  const { userProfile } = useUser();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workspaces:', error);
        setWorkspaces([]);
        setCurrentWorkspace(null);
      } else {
        setWorkspaces(data || []);
        
        // Set current workspace based on user profile or first available
        if (data?.length > 0) {
          const userWorkspace = userProfile?.workspace_id 
            ? data.find(w => w.id === userProfile.workspace_id)
            : null;
          setCurrentWorkspace(userWorkspace || data[0]);
        }
      }
    } catch (error) {
      console.error('Error in fetchWorkspaces:', error);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user, userProfile]);

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name,
          owner_id: user.id,
          plan_type: 'freemium'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace:', error);
        return null;
      }

      setWorkspaces(prev => [data, ...prev]);
      setCurrentWorkspace(data);
      return data;
    } catch (error) {
      console.error('Error in createWorkspace:', error);
      return null;
    }
  };

  const refreshWorkspaces = async () => {
    setLoading(true);
    await fetchWorkspaces();
  };

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      switchWorkspace,
      createWorkspace,
      refreshWorkspaces,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};