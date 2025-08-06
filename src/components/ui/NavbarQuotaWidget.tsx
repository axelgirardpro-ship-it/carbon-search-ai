import React, { useState } from 'react';
import { ChevronDown, Crown, Zap, AlertCircle } from 'lucide-react';
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
  const isPremium = planType === 'premium';
  const isStandard = planType === 'standard';
  
  const getPlanIcon = () => {
    if (isPremium) return <Crown className="h-4 w-4" />;
    if (isStandard) return <Zap className="h-4 w-4" />;
    return null;
  };

  const getPlanLabel = () => {
    if (isPremium) return 'Premium';
    if (isStandard) return 'Standard';
    return 'Freemium';
  };

  const getPlanColor = () => {
    if (isPremium) return 'text-yellow-600';
    if (isStandard) return 'text-blue-600';
    return 'text-gray-600';
  };

  const searchesUsed = quotaData.searches_used || 0;
  const searchesLimit = quotaData.searches_limit || 10;
  const exportsUsed = quotaData.exports_used || 0;
  const exportsLimit = quotaData.exports_limit || 0;

  const searchPercentage = isPremium ? 0 : (searchesUsed / searchesLimit) * 100;
  const exportPercentage = isPremium ? 0 : (exportsUsed / exportsLimit) * 100;

  const isSearchLimitReached = !isPremium && searchesUsed >= searchesLimit;
  const isExportLimitReached = !isPremium && exportsUsed >= exportsLimit;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${getPlanColor()} hover:bg-violet-100`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getPlanIcon()}
        <span>{getPlanLabel()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Plan {getPlanLabel()}</h3>
                {getPlanIcon()}
              </div>

              <div className="space-y-4">
                {/* Recherches */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Recherches</span>
                    <span className="text-sm text-gray-600">
                      {isPremium ? 'Illimitées ∞' : `${searchesUsed} / ${searchesLimit}`}
                    </span>
                  </div>
                  {!isPremium && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isSearchLimitReached ? 'bg-red-500' : 
                          searchPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(searchPercentage, 100)}%` }}
                      />
                    </div>
                  )}
                  {isSearchLimitReached && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Limite atteinte
                    </Badge>
                  )}
                </div>

                {/* Exports */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exports</span>
                    <span className="text-sm text-gray-600">
                      {isPremium ? 'Illimitées ∞' : `${exportsUsed} / ${exportsLimit}`}
                    </span>
                  </div>
                  {!isPremium && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isExportLimitReached ? 'bg-red-500' : 
                          exportPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(exportPercentage, 100)}%` }}
                      />
                    </div>
                  )}
                  {isExportLimitReached && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Limite atteinte
                    </Badge>
                  )}
                </div>

                {/* Message pour freemium/standard */}
                {(planType === 'freemium' || planType === 'standard') && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-600">
                      {planType === 'freemium' 
                        ? 'Contactez votre administrateur pour augmenter vos limites.'
                        : 'Passez au plan Premium pour des recherches illimitées.'
                      }
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