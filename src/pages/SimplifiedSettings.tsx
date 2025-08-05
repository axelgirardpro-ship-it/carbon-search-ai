import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { TestEnvironmentControls } from "@/components/admin/TestEnvironmentControls";
import { useToast } from "@/hooks/use-toast";
import { useGlobalState, usePermissions } from "@/contexts/GlobalStateContext";
import { 
  User, 
  LogOut, 
  Building, 
  Crown,
  Settings,
  Shield,
  ExternalLink,
  Trash2,
  Download
} from "lucide-react";

const SimplifiedSettings = () => {
  const { 
    signOut, 
    currentWorkspace, 
    unifiedUser 
  } = useGlobalState();
  const permissions = usePermissions();
  
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnecté avec succès",
        description: "Vous avez été déconnecté de votre compte.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre compte et vos préférences
          </p>
        </div>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informations du compte
            </CardTitle>
            <CardDescription>
              Informations générales sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{unifiedUser?.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                <p className="text-sm">
                  {unifiedUser?.first_name && unifiedUser?.last_name 
                    ? `${unifiedUser.first_name} ${unifiedUser.last_name}`
                    : 'Non renseigné'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                <div className="mt-1">
                  <Badge variant={permissions.getRoleLabel() === 'Supra Administrateur' ? 'default' : 'secondary'}>
                    {permissions.getRoleLabel()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan du workspace</label>
                <div className="mt-1">
                  <Badge variant={permissions.getPlanLabel() === 'Premium' ? 'default' : 'secondary'}>
                    {permissions.getPlanLabel()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Workspace */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Workspace
            </CardTitle>
            <CardDescription>
              Informations sur votre espace de travail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom du workspace</label>
                <p className="text-sm">{currentWorkspace?.name || 'Aucun workspace'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan</label>
                <p className="text-sm capitalize">{currentWorkspace?.plan_type || 'freemium'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Admin - visible seulement pour les supra admins */}
        {permissions.isOriginalSupraAdmin && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Shield className="mr-2 h-5 w-5" />
                Administration
              </CardTitle>
              <CardDescription>
                Outils d'administration (Supra Admin uniquement)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => window.open('/admin', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Panneau d'administration
                </Button>
              </div>
              
              {/* Contrôles d'environnement de test */}
              <Separator className="my-6" />
              <TestEnvironmentControls />
            </CardContent>
          </Card>
        )}

        {/* Actions du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Actions du compte
            </CardTitle>
            <CardDescription>
              Gérez votre session et vos données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Se déconnecter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Note de sécurité pour les supra admins */}
        {permissions.isOriginalSupraAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">Statut Supra Administrateur</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Vous avez accès à toutes les fonctionnalités d'administration. 
                    Utilisez ces privilèges de manière responsable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimplifiedSettings;