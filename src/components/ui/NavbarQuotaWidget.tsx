import React, { useState } from 'react';
import { ChevronDown, Crown, Zap, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavbarQuotaWidgetProps {
  quotaData: any;
  isLoading: boolean;
}

export const NavbarQuotaWidget: React.FC<NavbarQuotaWidgetProps> = ({ quotaData, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!quotaData) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Erreur</span>
      </div>
    );
  }

  const planType = quotaData.plan_type || 'freemium';
  const searchesUsed = quotaData.searches_used || 0;
  const searchesLimit = quotaData.searches_limit || 10;
  const exportsUsed = quotaData.exports_used || 0;
  const exportsLimit = quotaData.exports_limit || 0;

  const canSearch = searchesUsed < searchesLimit || searchesLimit === -1;
  const canExport = exportsUsed < exportsLimit || exportsLimit === -1;
  const isAtLimit = !canSearch || !canExport;

  const searchProgress = searchesLimit === -1 ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportProgress = exportsLimit === -1 ? 0 : (exportsUsed / exportsLimit) * 100;

  const getPlanIcon = () => {
    if (planType === 'premium') return <Crown className="h-4 w-4" />;
    if (planType === 'standard') return <Zap className="h-4 w-4" />;
    return null;
  };

  const getPlanLabel = () => {
    if (planType === 'premium') return 'Premium';
    if (planType === 'standard') return 'Standard';
    if (planType === 'trial') return 'Essai';
    return 'Freemium';
  };

  const getPlanColor = () => {
    if (planType === 'premium') return 'text-yellow-600';
    if (planType === 'standard') return 'text-blue-600';
    if (planType === 'trial') return 'text-purple-600';
    return isAtLimit ? 'text-red-600' : 'text-gray-600';
  };

  const getSearchDisplay = () => {
    if (planType === 'premium') return 'Illimitées ∞';
    if (planType === 'standard') return '1000 / mois';
    return `${searchesUsed} / ${searchesLimit === -1 ? "∞" : searchesLimit}`;
  };

  const getExportDisplay = () => {
    if (planType === 'premium') return '1000 / mois';
    if (planType === 'standard') return 'Non disponible';
    return `${exportsUsed} / ${exportsLimit === -1 ? "∞" : exportsLimit}`;
  };

  // Pour premium et standard, affichage simplifié
  const isPremiumOrStandard = planType === 'premium' || planType === 'standard';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${getPlanColor()} hover:bg-violet-100 ${isAtLimit ? 'bg-red-50' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getPlanIcon()}
        <span className="whitespace-nowrap">{getPlanLabel()}</span>
        {isAtLimit && (
          <AlertTriangle className="h-3 w-3 text-red-500" />
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
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">Plan {getPlanLabel()}</h3>
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
                    <span className="text-sm font-medium text-gray-700">Recherches</span>
                    <span className={`text-sm font-medium ${!canSearch ? 'text-red-600' : 'text-gray-600'}`}>
                      {getSearchDisplay()}
                    </span>
                  </div>
                  {!isPremiumOrStandard && searchesLimit !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          !canSearch ? 'bg-red-500' : 
                          searchProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(searchProgress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Exports */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exports Excel</span>
                    <span className={`text-sm font-medium ${!canExport ? 'text-red-600' : 'text-gray-600'}`}>
                      {getExportDisplay()}
                    </span>
                  </div>
                  {!isPremiumOrStandard && exportsLimit !== -1 && exportsLimit > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          !canExport ? 'bg-red-500' : 
                          exportProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(exportProgress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Message d'information selon le plan */}
                {isAtLimit && (planType === 'freemium' || planType === 'trial') && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
                    <p className="text-xs text-red-700 leading-relaxed">
                      Vous avez atteint vos limites mensuelles. Contactez l'administrateur pour augmenter votre plan.
                    </p>
                  </div>
                )}

                {!isAtLimit && planType === 'freemium' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Contactez votre administrateur pour augmenter vos limites.
                    </p>
                  </div>
                )}

                {planType === 'trial' && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-md border border-purple-200">
                    <p className="text-xs text-purple-700 leading-relaxed">
                      Période d'essai en cours. Contactez votre administrateur pour un plan permanent.
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