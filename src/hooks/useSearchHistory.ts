import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export const useSearchHistory = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const recordSearch = useCallback(async (
    searchQuery: string, 
    filters: any, 
    resultsCount: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          workspace_id: currentWorkspace?.id || null,
          search_query: searchQuery,
          search_filters: filters,
          results_count: resultsCount
        });

      if (error) {
        console.error('Error recording search history:', error);
      }
    } catch (error) {
      console.error('Error recording search history:', error);
    }
  }, [user, currentWorkspace]);

  return { recordSearch };
};