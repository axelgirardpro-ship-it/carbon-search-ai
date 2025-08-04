import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotaSubscription } from "@/contexts/QuotaSubscriptionContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Download, Shield, Globe, Users } from "lucide-react";

export default function Settings() {
  const { user, userRole } = useAuth();
  const { searchesUsed, searchesLimit, subscription } = useQuotaSubscription();
  const { favorites } = useFavorites();
  const { getRoleLabel, canAddUsers } = usePermissions();
  const { toast } = useToast();

  // Profile states
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    billing_company: "",
    billing_address: "",
    billing_postal_code: "",
    billing_country: "",
    billing_siren: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Preferences states
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });
  const [preferences, setPreferences] = useState({
    language: "fr",
    timezone: "Europe/Paris",
    units: "metric",
    resultsPerPage: "25",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          billing_company: data.billing_company || "",
          billing_address: data.billing_address || "",
          billing_postal_code: data.billing_postal_code || "",
          billing_country: data.billing_country || "",
          billing_siren: data.billing_siren || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          billing_company: profile.billing_company,
          billing_address: profile.billing_address,
          billing_postal_code: profile.billing_postal_code,
          billing_country: profile.billing_country,
          billing_siren: profile.billing_siren,
          workspace_id: userRole?.workspace_id || '',
          updated_at: new Date().toISOString(),
        });

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

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1QVTt1GdERdg8kRFLNq6gJQd' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement.",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail client.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notifications mises à jour",
      description: `Les notifications ${key} ont été ${value ? 'activées' : 'désactivées'}.`,
    });
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Préférences mises à jour",
      description: `${key} mis à jour avec succès.`,
    });
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
          
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
              <TabsTrigger value="data">Données</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
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
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Plan d'abonnement</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription?.subscribed ? "Plan Premium" : "Plan Freemium"}
                      </div>
                    </div>
                    {!subscription?.subscribed && (
                      <Button onClick={handleUpgrade}>Passer au Premium</Button>
                    )}
                    {subscription?.subscribed && (
                      <Button variant="outline" onClick={handleManageSubscription}>
                        Gérer l'abonnement
                      </Button>
                    )}
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

              <Card>
                <CardHeader>
                  <CardTitle>Informations de facturation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billing_company">Entreprise</Label>
                    <Input
                      id="billing_company"
                      value={profile.billing_company}
                      onChange={(e) => handleInputChange('billing_company', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_address">Adresse</Label>
                    <Input
                      id="billing_address"
                      value={profile.billing_address}
                      onChange={(e) => handleInputChange('billing_address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing_postal_code">Code postal</Label>
                      <Input
                        id="billing_postal_code"
                        value={profile.billing_postal_code}
                        onChange={(e) => handleInputChange('billing_postal_code', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_country">Pays</Label>
                      <Input
                        id="billing_country"
                        value={profile.billing_country}
                        onChange={(e) => handleInputChange('billing_country', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billing_siren">Numéro SIREN</Label>
                    <Input
                      id="billing_siren"
                      value={profile.billing_siren}
                      onChange={(e) => handleInputChange('billing_siren', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Sauvegarder les modifications</Button>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Notifications push</Label>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing-notifications">Communications marketing</Label>
                    <Switch
                      id="marketing-notifications"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Préférences utilisateur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Langue</Label>
                      <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="units">Unités</Label>
                      <Select value={preferences.units} onValueChange={(value) => handlePreferenceChange('units', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Métrique</SelectItem>
                          <SelectItem value="imperial">Impérial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="results-per-page">Résultats par page</Label>
                      <Select value={preferences.resultsPerPage} onValueChange={(value) => handlePreferenceChange('resultsPerPage', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Authentification à deux facteurs</div>
                      <div className="text-sm text-muted-foreground">Renforcez la sécurité de votre compte</div>
                    </div>
                    <Button variant="outline">Configurer 2FA</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Sessions actives</div>
                      <div className="text-sm text-muted-foreground">Gérez vos connexions</div>
                    </div>
                    <Button variant="outline">Voir les sessions</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export de données
                  </CardTitle>
                  <CardDescription>
                    Téléchargez une copie de vos données personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes données
                  </Button>
                </CardContent>
              </Card>

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
                        <div className="text-sm text-muted-foreground">Connexion avec Google</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Lier le compte</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Microsoft</div>
                        <div className="text-sm text-muted-foreground">Connexion avec Microsoft</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Lier le compte</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles concernant votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">Supprimer mon compte</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}