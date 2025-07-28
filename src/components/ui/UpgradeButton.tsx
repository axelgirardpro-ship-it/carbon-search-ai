import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const UpgradeButton = () => {
  const { subscriptionStatus } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      const planType = subscriptionStatus.plan_type === 'freemium' ? 'standard' : 'premium';
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de checkout manquante');
      }
    } catch (error) {
      console.error('Erreur upgrade:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la redirection vers le paiement",
      });
    }
  };

  // Don't show for premium users
  if (subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === 'premium') {
    return null;
  }

  const isPremium = subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === 'premium';
  const isStandard = subscriptionStatus.subscribed && subscriptionStatus.subscription_tier === 'standard';

  return (
    <Button 
      onClick={handleUpgrade}
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 hover:from-yellow-500 hover:to-orange-600"
    >
      {isStandard ? (
        <Crown className="w-4 h-4 mr-2" />
      ) : (
        <Zap className="w-4 h-4 mr-2" />
      )}
      {isStandard ? 'Premium' : 'Upgrade'}
    </Button>
  );
};