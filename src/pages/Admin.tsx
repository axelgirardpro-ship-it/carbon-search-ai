import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  Building, 
  Database, 
  Search,
  Activity,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, userRole } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalSearches: 0,
    activeFavorites: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminStats = async () => {
      if (!user || !isSuperAdmin()) {
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 Admin: Loading admin stats...');
        
        // Count users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Count companies
        const { count: companyCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        // Count search quotas (proxy for active users)
        const { count: searchCount } = await supabase
          .from('search_quotas')
          .select('searches_used', { count: 'exact', head: true });

        // Count favorites
        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true });

        console.log('🚀 Admin: Stats loaded', {
          userCount, 
          companyCount, 
          searchCount, 
          favoritesCount
        });

        setStats({
          totalUsers: userCount || 0,
          totalCompanies: companyCount || 0,
          totalSearches: searchCount || 0,
          activeFavorites: favoritesCount || 0
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors du chargement des statistiques",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, [user, isSuperAdmin, toast]);

  // Redirect if not super admin
  if (!user || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Accès refusé. Cette page est réservée aux super administrateurs.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-primary" />
            Console d'administration
          </h1>
          <p className="text-muted-foreground">
            Gestion avancée de la plateforme EcoSearch
          </p>
          <div className="mt-4">
            <Badge variant="destructive" className="mr-2">
              Super Admin
            </Badge>
            <Badge variant="outline">
              {user.email}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Comptes actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Workspaces créés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recherches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSearches}</div>
              <p className="text-xs text-muted-foreground">
                Sessions actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoris</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFavorites}</div>
              <p className="text-xs text-muted-foreground">
                Éléments sauvegardés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestion des entreprises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Gestion des entreprises
              </CardTitle>
              <CardDescription>
                Consulter et gérer les entreprises clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Consulter les workspaces
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Gérer les accès aux bases
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Voir l'utilisation par client
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestion des données */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Gestion des données
              </CardTitle>
              <CardDescription>
                Import et mise à jour de la base globale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Importer des données CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Gérer les sources de données
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Historique des imports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Analytics et suivi
              </CardTitle>
              <CardDescription>
                Métriques d'utilisation détaillées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Recherches par entreprise
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Utilisateurs actifs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Tendances d'usage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Système */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Administration système
              </CardTitle>
              <CardDescription>
                Outils d'administration avancés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Gérer les rôles utilisateurs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Logs système
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Configuration avancée
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations de debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {userRole?.role || 'Pas de rôle'}</p>
              <p><strong>Super Admin:</strong> {isSuperAdmin() ? 'Oui' : 'Non'}</p>
              <p><strong>Company:</strong> {userRole?.companies?.name || 'Aucune'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;