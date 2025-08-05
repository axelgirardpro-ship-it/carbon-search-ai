import { useAuth } from "@/contexts/AuthContext";
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
  subscription_tier?: string;
  trial_end?: string;
  subscription_end?: string;
  role: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
}

export const useUnifiedUser = () => {
  const { user, session } = useAuth();
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnifiedUser = async () => {
    if (!user) {
      setUnifiedUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching unified user:', error);
        setUnifiedUser(null);
      } else {
        setUnifiedUser(data);
      }
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

      setUnifiedUser(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateUnifiedUser:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchUnifiedUser();
  }, [user, session]);

  return {
    unifiedUser,
    loading,
    refreshUser: fetchUnifiedUser,
    updateUser: updateUnifiedUser,
  };
};