import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotas } from "@/hooks/useQuotas";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSupraAdmin } from "@/hooks/useSupraAdmin";

export const DebugUserStatus = () => {
  const { user } = useAuth();
  const { quotaData, isLoading: quotaLoading, reloadQuota } = useQuotas();
  const { favorites, loading: favLoading } = useFavorites();
  const { isSupraAdmin, loading: supraLoading } = useSupraAdmin();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (user && quotaData && !quotaLoading) {
      setDebugInfo({
        userEmail: user.email,
        isSupraAdmin,
        quotaData: {
          ...quotaData,
          searches_limit_type: quotaData.searches_limit === null ? 'unlimited' : 'limited',
          exports_limit_type: quotaData.exports_limit === null ? 'unlimited' : 'limited'
        },
        favoritesCount: favorites.length,
        allSystemsOk: quotaData.searches_limit === null && quotaData.exports_limit === null
      });
    }
  }, [user, quotaData, quotaLoading, isSupraAdmin, favorites]);

  if (quotaLoading || favLoading || supraLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Diagnostic en cours...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {debugInfo?.allSystemsOk ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          )}
          Diagnostic Utilisateur
        </CardTitle>
        <CardDescription>
          Statut des fonctionnalités pour {user?.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Statut Supra Admin</h4>
            <p className={`text-sm ${isSupraAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isSupraAdmin ? '✅ Activé' : '❌ Désactivé'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Quotas de recherche</h4>
            <p className={`text-sm ${quotaData?.searches_limit === null ? 'text-green-600' : 'text-orange-600'}`}>
              {quotaData?.searches_limit === null ? '✅ Illimité' : `❌ Limité (${quotaData?.searches_limit})`}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Quotas d'export</h4>
            <p className={`text-sm ${quotaData?.exports_limit === null ? 'text-green-600' : 'text-orange-600'}`}>
              {quotaData?.exports_limit === null ? '✅ Illimité' : `❌ Limité (${quotaData?.exports_limit})`}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Favoris</h4>
            <p className="text-sm text-blue-600">
              📚 {favorites.length} favoris
            </p>
          </div>
        </div>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Données brutes</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <Button onClick={reloadQuota} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les quotas
        </Button>
      </CardContent>
    </Card>
  );
};