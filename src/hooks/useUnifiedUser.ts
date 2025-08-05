import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface UnifiedUser {
  id: string;
  user_id: string;
  workspace_id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  position?: string;
  phone?: string;
  email: string;
  plan_type: string;
  subscribed: boolean;
  trial_end?: string;
  subscription_end?: string;
  role: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
}

export const useUnifiedUser = () => {
  const { user, session } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnifiedUser = async () => {
    if (!user || !currentWorkspace) {
      setUnifiedUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer les données utilisateur depuis la table users pour ce workspace
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setUnifiedUser(null);
        setLoading(false);
        return;
      }

      // Récupérer le rôle depuis user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setUnifiedUser(null);
        setLoading(false);
        return;
      }

      // Combiner les données
      const unifiedData: UnifiedUser = {
        ...userData,
        role: roleData.role
      };

      setUnifiedUser(unifiedData);
    } catch (error) {
      console.error('Error in fetchUnifiedUser:', error);
      setUnifiedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUnifiedUser = async (updates: Partial<UnifiedUser>) => {
    if (!user || !unifiedUser) return { error: 'No user or unified user data' };

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', user.id)
        .eq('workspace_id', unifiedUser.workspace_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating unified user:', error);
        return { error };
      }

      // Mettre à jour avec le rôle existant
      const updatedData: UnifiedUser = {
        ...data,
        role: unifiedUser.role
      };
      setUnifiedUser(updatedData);
      return { data: updatedData, error: null };
    } catch (error) {
      console.error('Error in updateUnifiedUser:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchUnifiedUser();
  }, [user, session, currentWorkspace]);

  return {
    unifiedUser,
    loading,
    refreshUser: fetchUnifiedUser,
    updateUser: updateUnifiedUser,
  };
};