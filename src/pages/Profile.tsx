import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Building, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotas } from "@/contexts/QuotaContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/ui/RoleGuard";

const Profile = () => {
  const { user, userRole } = useAuth();
  const { searchesUsed, searchesLimit } = useQuotas();
  const { favorites } = useFavorites();
  const { subscription, loading: subscriptionLoading, createCheckoutSession, openCustomerPortal, refreshSubscription } = useSubscription();
  const { getRoleLabel } = usePermissions();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    position: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: user.email || "",
            company: data.company || userRole?.companies.name || "",
            position: data.position || ""
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, userRole]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
          position: formData.position
        });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du profil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'standard' | 'premium') => {
    try {
      await createCheckoutSession(plan);
      toast({
        title: "Redirection vers le paiement",
        description: "Vous allez être redirigé vers Stripe pour finaliser votre abonnement",
      });
    } catch (error) {
      console.error('Erreur upgrade:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la redirection vers le paiement",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'ouverture du portail client",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <User className="w-8 h-8 mr-3 text-primary" />
              Mon profil
            </h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          {/* Account Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Statut du compte
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Actif
                  </Badge>
                  {userRole && (
                    <Badge variant="outline">
                      {getRoleLabel()}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{searchesUsed}</div>
                  <div className="text-sm text-muted-foreground">Recherches effectuées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{favorites.length}</div>
                  <div className="text-sm text-muted-foreground">Favoris sauvegardés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Datasets importés</div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Plan d'abonnement</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan actuel: <strong>{subscription?.plan_type || 'Gratuit'}</strong>
                      {subscription?.subscription_tier && (
                        <span className="ml-2 text-primary">({subscription.subscription_tier})</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!subscription?.subscribed ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => handleUpgrade('standard')}
                          disabled={subscriptionLoading}
                        >
                          Standard (850€/an)
                        </Button>
                        <Button 
                          onClick={() => handleUpgrade('premium')}
                          disabled={subscriptionLoading}
                        >
                          Premium (3000€/an)
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={handleManageSubscription}>
                        Gérer l'abonnement
                      </Button>
                    )}
                  </div>
                </div>
                
                {subscription?.subscribed && subscription.subscription_end && (
                  <div className="text-sm text-muted-foreground">
                    <p>Renouvellement: {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Modifiez vos informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Membre depuis</span>
                </div>
                <span className="text-sm text-muted-foreground">15 mars 2024</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span>Plan actuel</span>
                </div>
                <Badge variant={subscription?.subscribed ? "default" : "secondary"}>
                  {subscription?.subscription_tier || subscription?.plan_type || 'Gratuit'}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Actions du compte</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Changer le mot de passe
                  </Button>
                  <Button variant="outline" size="sm">
                    Télécharger mes données
                  </Button>
                  <Button variant="destructive" size="sm">
                    Supprimer le compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;