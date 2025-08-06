import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Zap, Crown, TrendingUp, AlertTriangle } from "lucide-react";

interface QuotaWidgetProps {
  quotaData: any;
  isLoading: boolean;
}

export const QuotaWidget = ({ quotaData, isLoading }: QuotaWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quotaData) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Erreur
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Impossible de charger les informations de quota.
          </p>
        </CardContent>
      </Card>
    );
  }

  const searchesUsed = quotaData.searches_used || 0;
  const searchesLimit = quotaData.searches_limit;
  const exportsUsed = quotaData.exports_used || 0;
  const exportsLimit = quotaData.exports_limit;
  const planType = quotaData.plan_type || 'freemium';
  
  // Si les limites sont null, c'est illimité (supra admin)
  const isUnlimited = searchesLimit === null || exportsLimit === null;
  const canSearch = isUnlimited || searchesUsed < searchesLimit;
  const canExport = isUnlimited || exportsUsed < exportsLimit;

  const searchProgress = (isUnlimited || searchesLimit === -1) ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportProgress = (isUnlimited || exportsLimit === -1) ? 0 : (exportsUsed / exportsLimit) * 100;

  const isNearLimit = !isUnlimited && (searchProgress > 80 || exportProgress > 80);
  const isAtLimit = !canSearch || !canExport;

  // Gestion des supra admins et plans premium avec quotas illimités
  if (isUnlimited || planType === 'premium' || planType === 'standard') {
    const isPremium = planType === 'premium' || isUnlimited;
    
    return (
      <Card className={`bg-white border border-violet-200 ${isPremium ? 'border-primary/20' : 'border-blue-500/20'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={isPremium ? "bg-primary text-primary-foreground" : "bg-blue-600 text-white"}>
              {isPremium ? <Crown className="w-4 h-4 mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
              {isUnlimited ? 'Supra Admin' : isPremium ? 'Premium' : 'Standard'}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {isUnlimited || isPremium ? 'Illimité' : 'Plan payant'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recherches</span>
              <span className="text-primary font-medium">
                {isUnlimited || isPremium ? 'Illimitées ∞' : '1000 / mois'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Exports</span>
              <span className="text-primary font-medium">
                {isUnlimited || isPremium ? 'Illimités ∞' : '1000 / mois'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white border border-violet-200 ${isAtLimit ? "border-destructive/50" : isNearLimit ? "border-yellow-500/50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={planType === 'premium' ? "default" : planType === 'standard' ? "default" : "secondary"}>
              {planType === 'premium' ? 'Premium' : 
               planType === 'standard' ? 'Standard' :
               "Freemium"}
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
              {searchesUsed} / {(isUnlimited || searchesLimit === -1) ? "∞" : searchesLimit}
            </span>
          </div>
          {!isUnlimited && searchesLimit !== -1 && (
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
              {exportsUsed} / {(isUnlimited || exportsLimit === -1) ? "∞" : exportsLimit}
            </span>
          </div>
          {!isUnlimited && exportsLimit !== -1 && (
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