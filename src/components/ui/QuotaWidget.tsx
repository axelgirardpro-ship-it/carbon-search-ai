import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSubscription, useQuotas } from "@/contexts/QuotaSubscriptionContext";
import { Link } from "react-router-dom";
import { Zap, Crown, TrendingUp, AlertTriangle } from "lucide-react";

export const QuotaWidget = () => {
  const { subscription, refreshSubscription } = useSubscription();
  const { searchesUsed, searchesLimit, exportsUsed, exportsLimit, canSearch, canExport } = useQuotas();

  const searchProgress = searchesLimit === -1 ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportProgress = exportsLimit === -1 ? 0 : (exportsUsed / exportsLimit) * 100;

  const isNearLimit = searchProgress > 80 || exportProgress > 80;
  const isAtLimit = !canSearch || !canExport;

  // Gestion des différents plans (premium, standard, freemium, trial)
  if (subscription?.subscribed && (subscription?.plan_type === 'premium' || subscription?.plan_type === 'standard')) {
    const isPremium = subscription.plan_type === 'premium';
    
    return (
      <Card className={`border-primary/20 ${isPremium ? 'bg-gradient-to-r from-primary/5 to-primary/10' : 'bg-gradient-to-r from-blue-500/5 to-blue-600/10'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-blue-600 text-white"}>
              {isPremium ? <Crown className="w-4 h-4 mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
              {isPremium ? 'Premium' : 'Standard'}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {isPremium ? 'Illimité' : 'Plan payant'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recherches</span>
              <span className="text-primary font-medium">
                {isPremium ? 'Illimitées ∞' : '1000 / mois'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Exports</span>
              <span className="text-primary font-medium">
                {isPremium ? 'Illimitées ∞' : '100 / mois'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isAtLimit ? "border-destructive/50" : isNearLimit ? "border-yellow-500/50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={subscription?.subscribed && subscription?.plan_type === 'premium' ? "default" : subscription?.trial_active ? "default" : "secondary"}>
              {subscription?.subscribed && subscription?.plan_type === 'premium' ? 'Premium' : 
               subscription?.subscribed && subscription?.plan_type === 'standard' ? 'Standard' :
               subscription?.trial_active ? "Essai" : "Freemium"}
            </Badge>
            {isAtLimit && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atteinte
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Recherches</span>
            <span className={!canSearch ? "text-destructive font-medium" : ""}>
              {searchesUsed} / {searchesLimit === -1 ? "∞" : searchesLimit}
            </span>
          </div>
          {searchesLimit !== -1 && (
            <Progress 
              value={searchProgress} 
              className={`h-2 ${searchProgress > 90 ? "bg-destructive/20" : searchProgress > 80 ? "bg-yellow-500/20" : ""}`}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Exports Excel</span>
            <span className={!canExport ? "text-destructive font-medium" : ""}>
              {exportsUsed} / {exportsLimit === -1 ? "∞" : exportsLimit}
            </span>
          </div>
          {exportsLimit !== -1 && (
            <Progress 
              value={exportProgress} 
              className={`h-2 ${exportProgress > 90 ? "bg-destructive/20" : exportProgress > 80 ? "bg-yellow-500/20" : ""}`}
            />
          )}
        </div>

        {isAtLimit && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Vous avez atteint vos limites mensuelles. Contactez l'administrateur pour augmenter votre plan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};