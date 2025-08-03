import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotas } from "@/contexts/QuotaContext";
import { Link } from "react-router-dom";
import { Zap, Crown, TrendingUp, AlertTriangle } from "lucide-react";

export const QuotaWidget = () => {
  const { subscriptionStatus, refreshSubscription } = useAuth();
  const { searchesUsed, searchesLimit, exportsUsed, exportsLimit, canSearch, canExport } = useQuotas();

  const searchProgress = searchesLimit === -1 ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportProgress = exportsLimit === -1 ? 0 : (exportsUsed / exportsLimit) * 100;

  const isNearLimit = searchProgress > 80 || exportProgress > 80;
  const isAtLimit = !canSearch || !canExport;

  // Gestion des différents plans (premium, standard, freemium, trial)
  if (subscriptionStatus.subscribed && subscriptionStatus.plan_type === 'premium') {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-primary-foreground">
              <Crown className="w-4 h-4 mr-1" />
              Premium
            </Badge>
            <div className="text-sm text-muted-foreground">Illimité</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recherches</span>
              <span className="text-primary font-medium">Illimitées ∞</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Exports</span>
              <span className="text-primary font-medium">Illimitées ∞</span>
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
            <Badge variant={subscriptionStatus.subscribed && subscriptionStatus.plan_type === 'premium' ? "default" : subscriptionStatus.trial_active ? "default" : "secondary"}>
              {subscriptionStatus.subscribed && subscriptionStatus.plan_type === 'premium' ? 'Premium' : 
               subscriptionStatus.subscribed && subscriptionStatus.plan_type === 'standard' ? 'Standard' :
               subscriptionStatus.trial_active ? "Essai" : "Freemium"}
            </Badge>
            {isAtLimit && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atteinte
              </Badge>
            )}
          </div>
          {(isNearLimit || isAtLimit) && !subscriptionStatus.subscribed && (
            <Link to="/profile">
              <Button size="sm" className="h-7 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
          {/* Bouton de debug pour forcer le refresh */}
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs"
            onClick={refreshSubscription}
          >
            🔄
          </Button>
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
            <p className="text-xs text-muted-foreground text-center mb-2">
              Vous avez atteint vos limites mensuelles
            </p>
            <Link to="/profile" className="block">
              <Button size="sm" className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Passer au plan payant
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};