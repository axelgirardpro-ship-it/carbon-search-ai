import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const UpgradeButton = () => {
  const { subscriptionStatus } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = () => {
    // Redirection directe vers Stripe pour l'abonnement Standard
    window.open('https://buy.stripe.com/test_aEU8AY1wW0xz8ogaEE', '_blank');
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