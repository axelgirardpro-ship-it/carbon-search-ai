import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'freemium' | 'standard' | 'premium';

interface PlanQuotaRules {
  freemium: { searches_limit: number; exports_limit: number };
  standard: { searches_limit: number; exports_limit: number };
  premium: { searches_limit: null; exports_limit: null };
}

const PLAN_QUOTA_RULES: PlanQuotaRules = {
  freemium: { searches_limit: 10, exports_limit: 0 },
  standard: { searches_limit: 1000, exports_limit: 100 },
  premium: { searches_limit: null, exports_limit: null }
};

export const useQuotaSync = () => {
  const { user } = useAuth();
  const { planType, isSupraAdmin } = usePermissions();

  const syncUserQuotas = useCallback(async () => {
    if (!user) return;

    // Déterminer le plan effectif (supra_admin = premium)
    const effectivePlanType: PlanType = isSupraAdmin ? 'premium' : (planType as PlanType || 'freemium');
    const quotaRules = PLAN_QUOTA_RULES[effectivePlanType];

    try {
      // Vérifier les quotas actuels
      const { data: currentQuota, error: fetchError } = await supabase
        .from('search_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération des quotas:', fetchError);
        return;
      }

      // Si pas de quotas ou plan différent, mettre à jour/créer
      if (!currentQuota || currentQuota.plan_type !== effectivePlanType) {
        const quotaData = {
          user_id: user.id,
          plan_type: effectivePlanType,
          searches_limit: quotaRules.searches_limit,
          exports_limit: quotaRules.exports_limit,
          searches_used: currentQuota?.searches_used || 0,
          exports_used: currentQuota?.exports_used || 0
        };

        if (currentQuota) {
          // Mise à jour
          const { error: updateError } = await supabase
            .from('search_quotas')
            .update(quotaData)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Erreur lors de la mise à jour des quotas:', updateError);
          }
        } else {
          // Création
          const { error: insertError } = await supabase
            .from('search_quotas')
            .insert(quotaData);

          if (insertError) {
            console.error('Erreur lors de la création des quotas:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des quotas:', error);
    }
  }, [user, planType, isSupraAdmin]);

  useEffect(() => {
    if (user && planType !== undefined) {
      syncUserQuotas();
    }
  }, [user, planType, isSupraAdmin, syncUserQuotas]);

  return { syncUserQuotas };
};

export { PLAN_QUOTA_RULES };