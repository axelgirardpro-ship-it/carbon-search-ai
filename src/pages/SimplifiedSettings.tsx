import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuotaSubscription } from "@/contexts/QuotaSubscriptionContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, Unlink, Mail, UserPlus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WorkspaceUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function Settings() {
  const { user, userRole } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { searchesUsed, searchesLimit, subscription } = useQuotaSubscription();
  const { favorites } = useFavorites();
  const { getRoleLabel, canAddUsers } = usePermissions();
  const { toast } = useToast();

  // Profile states
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [loadingSSO, setLoadingSSO] = useState(false);

  // Workspace users states
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("lecteur");
  const [loadingInvite, setLoadingInvite] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkGoogleLinked();
    if (canAddUsers()) {
      fetchWorkspaceUsers();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user || !currentWorkspace) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkspaceUsers = async () => {
    if (!userRole?.workspace_id) return;
    
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase.functions.invoke('get-admin-contacts', {
        body: { workspace_id: userRole.workspace_id }
      });

      if (error) throw error;
      setWorkspaceUsers(data || []);
    } catch (error) {
      console.error('Error fetching workspace users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs du workspace.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !userRole?.workspace_id) return;
    
    try {
      setLoadingInvite(true);
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteEmail,
          workspace_id: userRole.workspace_id,
          role: inviteRole
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${inviteEmail}.`,
      });
      
      setInviteEmail("");
      fetchWorkspaceUsers();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvite(false);
    }
  };

  const checkGoogleLinked = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (error) {
        console.error('Error fetching identities:', error);
        return;
      }
      
      const hasGoogleIdentity = data?.identities?.some(identity => identity.provider === 'google');
      setGoogleLinked(!!hasGoogleIdentity);
    } catch (error) {
      console.error('Error checking Google linked status:', error);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setLoadingSSO(true);
      const redirectUrl = `${window.location.origin}/settings`;
      
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Liaison en cours",
        description: "Vous allez être redirigé vers Google pour lier votre compte.",
      });
    } catch (error) {
      console.error('Error linking Google account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lier le compte Google.",
        variant: "destructive",
      });
    } finally {
      setLoadingSSO(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    try {
      setLoadingSSO(true);
      
      const { data, error: identitiesError } = await supabase.auth.getUserIdentities();
      if (identitiesError) throw identitiesError;
      
      const googleIdentity = data?.identities?.find(identity => identity.provider === 'google');
      if (!googleIdentity) throw new Error('Google identity not found');
      
      const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
      if (error) throw error;
      
      setGoogleLinked(false);
      toast({
        title: "Compte délié",
        description: "Votre compte Google a été délié avec succès.",
      });
    } catch (error) {
      console.error('Error unlinking Google account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de délier le compte Google.",
        variant: "destructive",
      });
    } finally {
      setLoadingSSO(false);
    }
  };

  const handleSave = async () => {
    if (!user || !currentWorkspace) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'gestionnaire': return 'secondary';
      case 'lecteur': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statut du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <div className="text-sm text-muted-foreground">Favoris</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{searchesUsed} / {searchesLimit}</div>
                    <div className="text-sm text-muted-foreground">Recherches mensuelles</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{getRoleLabel()}</div>
                    <div className="text-sm text-muted-foreground">Rôle</div>
                  </div>
                </div>
                
                {/* Plan du workspace */}
                <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-lg">Plan du workspace</div>
                      <div className="text-sm text-muted-foreground">
                        {currentWorkspace?.name}
                      </div>
                    </div>
                    <Badge 
                      className={`${
                        subscription?.plan_type === 'premium' 
                          ? 'bg-primary text-primary-foreground' 
                          : subscription?.plan_type === 'standard'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {subscription?.plan_type === 'premium' ? 'Premium' : 
                       subscription?.plan_type === 'standard' ? 'Standard' : 'Freemium'}
                    </Badge>
                  </div>
                  {subscription?.plan_type === 'premium' && (
                    <div className="mt-2 text-sm text-primary">
                      ✨ Accès illimité aux recherches et exports
                    </div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Gestion de l'abonnement</div>
                  <div className="text-sm text-muted-foreground">
                    Pour gérer votre abonnement, merci de contacter : axelgirard.pro@gmail.com
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={profile.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
              </CardContent>
            </Card>

            {canAddUsers() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs & Comptes
                  </CardTitle>
                  <CardDescription>
                    Gérez les utilisateurs de votre workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Invite new user */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        placeholder="Email de l'utilisateur à inviter"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="lecteur">Lecteur</option>
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button 
                      onClick={handleInviteUser}
                      disabled={!inviteEmail || loadingInvite}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inviter
                    </Button>
                  </div>

                  {/* Users list */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Utilisateurs actuels</h4>
                    {loadingUsers ? (
                      <div className="text-center py-4">Chargement...</div>
                    ) : workspaceUsers.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">Aucun utilisateur trouvé</div>
                    ) : (
                      workspaceUsers.map((workspaceUser) => (
                        <div key={workspaceUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">
                                {workspaceUser.first_name} {workspaceUser.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {workspaceUser.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(workspaceUser.role)}>
                              {workspaceUser.role === 'admin' ? 'Administrateur' :
                               workspaceUser.role === 'gestionnaire' ? 'Gestionnaire' : 'Lecteur'}
                            </Badge>
                            {workspaceUser.email !== user?.email && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer {workspaceUser.first_name} {workspaceUser.last_name} du workspace ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction>Supprimer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Liaison de comptes SSO</CardTitle>
                <CardDescription>
                  Liez votre compte à des services d'authentification externe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Google</div>
                      <div className="text-sm text-muted-foreground">
                        {googleLinked ? "Compte lié" : "Connexion avec Google"}
                      </div>
                    </div>
                  </div>
                  {googleLinked ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUnlinkGoogle}
                      disabled={loadingSSO}
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Délier
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLinkGoogle}
                      disabled={loadingSSO}
                    >
                      Lier le compte
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Sauvegarder les modifications</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}