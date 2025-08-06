import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuotaSync, type PlanType } from "@/hooks/useQuotaSync";

interface QuotaData {
  user_id: string;
  plan_type: PlanType;
  searches_limit: number | null; // null = unlimited
  exports_limit: number | null; // null = unlimited
  searches_used: number;
  exports_used: number;
}

export const useQuotas = () => {
  const { user } = useAuth();
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Synchroniser les quotas avec le plan utilisateur
  const { syncUserQuotas } = useQuotaSync();

  const loadQuotaData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Synchroniser d'abord les quotas
    await syncUserQuotas();
    
    try {
      const { data, error } = await supabase
        .from('search_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        setError(error.message);
        return;
      }
      
      // Si aucun quota n'existe, en créer un par défaut
      if (!data) {
        const { data: newQuota, error: insertError } = await supabase
          .from('search_quotas')
          .insert({
            user_id: user.id,
            plan_type: 'freemium',
            searches_limit: 10,
            exports_limit: 0,
            searches_used: 0,
            exports_used: 0
          })
          .select()
          .single();
        
        if (insertError) {
          setError(insertError.message);
          return;
        }
        
        setQuotaData(newQuota as QuotaData);
      } else {
        setQuotaData(data as QuotaData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, syncUserQuotas]);

  useEffect(() => {
    loadQuotaData();
  }, [loadQuotaData]);

  // Logique simplifiée et cohérente pour les quotas
  const canSearch = quotaData ? 
    quotaData.searches_limit === null || quotaData.searches_used < quotaData.searches_limit 
    : false;
  const canExport = quotaData ? 
    quotaData.exports_limit === null || quotaData.exports_used < quotaData.exports_limit 
    : false;
  
  // Un utilisateur est "à la limite" seulement s'il ne peut plus faire d'actions principales
  const isAtLimit = quotaData ? 
    !canSearch || (quotaData.plan_type === 'freemium' && quotaData.exports_limit !== null && !canExport)
    : false;

  const incrementSearch = useCallback(async () => {
    if (!user || !quotaData) return;
    
    const { error } = await supabase
      .from('search_quotas')
      .update({ searches_used: quotaData.searches_used + 1 })
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    setQuotaData(prev => prev ? { ...prev, searches_used: prev.searches_used + 1 } : null);
  }, [user, quotaData]);
  
  const incrementExport = useCallback(async () => {
    if (!user || !quotaData) return;
    
    const { error } = await supabase
      .from('search_quotas')
      .update({ exports_used: quotaData.exports_used + 1 })
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    setQuotaData(prev => prev ? { ...prev, exports_used: prev.exports_used + 1 } : null);
  }, [user, quotaData]);

  return {
    quotaData,
    isLoading,
    error,
    canSearch,
    canExport,
    isAtLimit,
    incrementSearch,
    incrementExport,
    reloadQuota: loadQuotaData
  };
};