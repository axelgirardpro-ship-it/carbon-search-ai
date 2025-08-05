import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface QuotaData {
  user_id: string;
  plan_type: string;
  searches_limit: number;
  exports_limit: number;
  searches_used: number;
  exports_used: number;
}

export const useQuotas = () => {
  const { user } = useAuth();
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotaData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
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
        
        setQuotaData(newQuota);
      } else {
        setQuotaData(data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQuotaData();
  }, [loadQuotaData]);

  const canSearch = quotaData ? 
    quotaData.plan_type === 'premium' || quotaData.plan_type === 'standard' || quotaData.searches_used < quotaData.searches_limit 
    : false;
  const canExport = quotaData ? 
    quotaData.plan_type === 'premium' || quotaData.exports_used < quotaData.exports_limit 
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
    incrementSearch,
    incrementExport,
    reloadQuota: loadQuotaData
  };
};