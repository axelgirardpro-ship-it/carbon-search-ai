import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings2, RefreshCw, User, Building2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { usePermissions } from "@/hooks/usePermissions";

export const TestEnvironmentControls = () => {
  const { user } = useAuth();
  const { userProfile, refreshProfile } = useUser();
  const { currentWorkspace } = useWorkspace();
  const permissions = usePermissions();
  const { toast } = useToast();
  const [tempRole, setTempRole] = useState<string>("");
  const [tempPlanType, setTempPlanType] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Ne pas afficher ce composant si pas supra admin
  if (!permissions.isSupraAdmin) {
    return null;
  }

  const changeTemporaryRole = async () => {
    if (!user || !currentWorkspace || !tempRole) return;

    setLoading(true);
    try {
      // Temporairement changer le rôle (plus besoin de original_role)
      const { error } = await supabase
        .from('user_roles')
        .update({ role: tempRole })
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      // Rafraîchir l'état global
        await refreshProfile();
      
      toast({
        title: "Rôle temporaire modifié",
        description: `Votre rôle a été changé temporairement vers "${tempRole}" pour ce workspace.`,
      });
    } catch (error) {
      console.error('Error changing temporary role:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de changer le rôle temporaire",
      });
    } finally {
      setLoading(false);
    }
  };

  const changeWorkspacePlan = async () => {
    if (!currentWorkspace || !tempPlanType) return;

    setLoading(true);
    try {
      // Mettre à jour le plan du workspace
      const { error } = await supabase
        .from('workspaces')
        .update({ plan_type: tempPlanType })
        .eq('id', currentWorkspace.id);

      if (error) throw error;

      // Rafraîchir l'état global
        await refreshProfile();
      
      toast({
        title: "Plan du workspace modifié",
        description: `Le plan du workspace "${currentWorkspace.name}" a été changé vers "${tempPlanType}".`,
      });
    } catch (error) {
      console.error('Error changing workspace plan:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de changer le plan du workspace",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToSupraAdmin = async () => {
    if (!user || !currentWorkspace) return;

    setLoading(true);
    try {
      // Reset to admin role (supra admin via is_supra_admin flag)
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      // Rafraîchir l'état global
      await refreshProfile();
      
      toast({
        title: "Retour au statut Supra Admin",
        description: "Votre statut de Supra Admin a été restauré.",
      });
    } catch (error) {
      console.error('Error resetting to supra admin:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de restaurer le statut Supra Admin",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <Settings2 className="w-5 h-5 mr-2" />
          Contrôles d'Environnement de Test
        </CardTitle>
        <CardDescription className="text-orange-600">
          Outils pour tester différentes configurations de rôles et plans (réservé aux Supra Admins)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations actuelles */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration actuelle:</strong>
            <div className="mt-2 space-y-1">
              <div>Rôle: <Badge variant="outline">{userProfile?.role || 'supra_admin'}</Badge></div>
              <div>Workspace: <Badge variant="outline">{currentWorkspace?.name || 'Aucun'}</Badge></div>
              <div>Plan: <Badge variant="outline">{currentWorkspace?.plan_type || 'N/A'}</Badge></div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Changement de rôle temporaire */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="temp-role" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Changer de rôle temporairement
              </Label>
              <div className="mt-2 space-y-2">
                <Select value={tempRole} onValueChange={setTempRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supra_admin">Supra Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                    <SelectItem value="lecteur">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={changeTemporaryRole}
                  disabled={!tempRole || !currentWorkspace || loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Appliquer le rôle
                </Button>
              </div>
            </div>
          </div>

          {/* Changement de plan workspace */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="temp-plan" className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Changer le plan du workspace
              </Label>
              <div className="mt-2 space-y-2">
                <Select value={tempPlanType} onValueChange={setTempPlanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freemium">Freemium (10 recherches, 0 exports)</SelectItem>
                    <SelectItem value="standard">Standard (100 recherches, 0 exports)</SelectItem>
                    <SelectItem value="premium">Premium (500 recherches, 1000 exports)</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={changeWorkspacePlan}
                  disabled={!tempPlanType || !currentWorkspace || loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Appliquer le plan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de reset */}
        <div className="pt-4 border-t border-orange-200">
          <Button 
            onClick={resetToSupraAdmin}
            variant="outline"
            disabled={loading}
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurer le statut Supra Admin global
          </Button>
        </div>

        <Alert className="bg-orange-100 border-orange-300">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Note:</strong> Ces changements sont temporaires et destinés aux tests. 
            Utilisez le bouton "Restaurer" pour revenir au statut Supra Admin global.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};