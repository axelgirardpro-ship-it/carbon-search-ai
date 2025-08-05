import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UpgradeButton = () => {
  const { toast } = useToast();

  const handleUpgrade = () => {
    // Rediriger vers la page profil
    window.location.href = '/profile';
  };

  // Don't show for premium users - simplified logic for now
  return null;

};