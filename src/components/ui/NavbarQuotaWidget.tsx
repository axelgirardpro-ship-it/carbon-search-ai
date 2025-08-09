import React, { useState } from 'react';
import { ChevronDown, Crown, Zap, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlanType } from '@/hooks/useQuotaSync';

interface QuotaData {
  plan_type: PlanType;
  searches_used: number;
  searches_limit: number | null;
  exports_used: number;
  exports_limit: number | null;
}

interface NavbarQuotaWidgetProps {
  quotaData: QuotaData | null;
  isLoading: boolean;
  isAtLimit?: boolean;
}

export const NavbarQuotaWidget: React.FC<NavbarQuotaWidgetProps> = ({ quotaData, isLoading, isAtLimit = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!quotaData) {
    return (
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Erreur</span>
      </div>
    );
  }

  const planType = quotaData.plan_type;
  const searchesUsed = quotaData.searches_used;
  const searchesLimit = quotaData.searches_limit;
  const exportsUsed = quotaData.exports_used;
  const exportsLimit = quotaData.exports_limit;

  const searchProgress = searchesLimit === null ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportProgress = exportsLimit === null ? 0 : (exportsUsed / exportsLimit) * 100;

  const getPlanIcon = () => {
    if (planType === 'premium') return <Crown className="h-4 w-4" />;
    if (planType === 'standard') return <Zap className="h-4 w-4" />;
    return null;
  };

  const getPlanLabel = () => {
    if (planType === 'premium') return 'Premium';
    if (planType === 'standard') return 'Standard';
    return 'Freemium';
  };

  const getPlanColor = () => {
    if (planType === 'premium') return 'text-accent';
    if (planType === 'standard') return 'text-primary';
    return isAtLimit ? 'text-destructive' : 'text-muted-foreground';
  };

  const getSearchDisplay = () => {
    if (searchesLimit === null) return 'Illimitées ∞';
    return `${searchesUsed} / ${searchesLimit}`;
  };

  const getExportDisplay = () => {
    if (exportsLimit === null) return 'Illimitées ∞';
    if (exportsLimit === 0) return 'Non disponible';
    return `${exportsUsed} / ${exportsLimit}`;
  };

  // Pour premium et standard, affichage simplifié
  const isPremiumOrStandard = planType === 'premium' || planType === 'standard';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 ${isAtLimit ? 'bg-destructive hover:bg-destructive/90' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getPlanIcon()}
        <span className="whitespace-nowrap">{getPlanLabel()}</span>
        {isAtLimit && (
          <AlertTriangle className="h-3 w-3 text-destructive" />
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-popover rounded-lg shadow-lg border border-border z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-foreground">Plan {getPlanLabel()}</h3>
                  {getPlanIcon()}
                </div>
                {isAtLimit && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Limite atteinte
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                {/* Recherches */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Recherches</span>
                    <span className={`text-sm font-medium ${searchProgress >= 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {getSearchDisplay()}
                    </span>
                  </div>
                  {!isPremiumOrStandard && searchesLimit !== null && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          searchProgress >= 100 ? 'bg-destructive' : 
                          searchProgress > 80 ? 'bg-amber-500' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(searchProgress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Exports */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Exports Excel</span>
                    <span className={`text-sm font-medium ${exportProgress >= 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {getExportDisplay()}
                    </span>
                  </div>
                  {!isPremiumOrStandard && exportsLimit !== null && exportsLimit > 0 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          exportProgress >= 100 ? 'bg-destructive' : 
                          exportProgress > 80 ? 'bg-amber-500' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(exportProgress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Message d'information selon le plan */}
                {isAtLimit && planType === 'freemium' && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    <p className="text-xs text-destructive leading-relaxed">
                      Vous avez atteint vos limites mensuelles. Contactez l'administrateur pour augmenter votre plan.
                    </p>
                  </div>
                )}

                {!isAtLimit && planType === 'freemium' && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Contactez votre administrateur pour augmenter vos limites.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};