import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const UpgradeButton = () => {
  const { quotas } = useGlobalState();
  const { toast } = useToast();

  const handleUpgrade = () => {
    // Rediriger vers la page profil
    window.location.href = '/profile';
  };

  // Don't show for premium users - simplified logic for now
  return null;

};