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
    position: "",
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddress: "",
    billingPostalCode: "",
    billingCountry: "France",
    billingVatNumber: "",
    billingSiren: ""
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
            position: data.position || "",
            billingFirstName: data.billing_first_name || "",
            billingLastName: data.billing_last_name || "",
            billingCompany: data.billing_company || "",
            billingAddress: data.billing_address || "",
            billingPostalCode: data.billing_postal_code || "",
            billingCountry: data.billing_country || "France",
            billingVatNumber: data.billing_vat_number || "",
            billingSiren: data.billing_siren || ""
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
          position: formData.position,
          billing_first_name: formData.billingFirstName,
          billing_last_name: formData.billingLastName,
          billing_company: formData.billingCompany,
          billing_address: formData.billingAddress,
          billing_postal_code: formData.billingPostalCode,
          billing_country: formData.billingCountry,
          billing_vat_number: formData.billingVatNumber,
          billing_siren: formData.billingSiren
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

  const handleUpgrade = (plan: 'standard' | 'premium') => {
    const stripeUrls = {
      standard: 'https://buy.stripe.com/test_cNi00l65X7kz0RG88sbZe00',
      premium: 'https://buy.stripe.com/test_28E28tcul6gv57WcoIbZe01'
    };
    
    window.open(stripeUrls[plan], '_blank');
    
    toast({
      title: "Redirection vers le paiement",
      description: "Vous allez être redirigé vers Stripe pour finaliser votre abonnement",
    });
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
                        >
                          Standard (850€/an)
                        </Button>
                        <Button 
                          onClick={() => handleUpgrade('premium')}
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

          {/* Personal and Billing Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informations personnelles et de facturation</CardTitle>
              <CardDescription>
                Modifiez vos informations de profil et de facturation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Informations personnelles</h4>
                
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
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              <Separator />

              {/* Billing Information Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Informations de facturation</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingFirstName">Prénom à facturer</Label>
                    <Input
                      id="billingFirstName"
                      value={formData.billingFirstName}
                      onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingLastName">Nom à facturer</Label>
                    <Input
                      id="billingLastName"
                      value={formData.billingLastName}
                      onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCompany">Nom de l'entreprise</Label>
                  <Input
                    id="billingCompany"
                    value={formData.billingCompany}
                    onChange={(e) => handleInputChange("billingCompany", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Adresse</Label>
                  <Input
                    id="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingPostalCode">Code postal</Label>
                    <Input
                      id="billingPostalCode"
                      value={formData.billingPostalCode}
                      onChange={(e) => handleInputChange("billingPostalCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingCountry">Pays</Label>
                    <Input
                      id="billingCountry"
                      value={formData.billingCountry}
                      onChange={(e) => handleInputChange("billingCountry", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingVatNumber">Numéro de TVA (optionnel)</Label>
                    <Input
                      id="billingVatNumber"
                      value={formData.billingVatNumber}
                      onChange={(e) => handleInputChange("billingVatNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingSiren">SIREN</Label>
                    <Input
                      id="billingSiren"
                      value={formData.billingSiren}
                      onChange={(e) => handleInputChange("billingSiren", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Actions du compte</h4>
                
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

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    Changer le mot de passe
                  </Button>
                  {subscription?.subscribed ? (
                    <Button variant="destructive" size="sm" onClick={handleManageSubscription}>
                      Annuler l'abonnement
                    </Button>
                  ) : null}
                </div>
              </div>

              <Separator />

              {/* SSO Account Linking */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Comptes liés</h4>
                <p className="text-sm text-muted-foreground">
                  Liez des comptes SSO pour une connexion plus rapide
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium">Google</span>
                    </div>
                    <Button variant="outline" size="sm">Lier</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#f35325" d="M1 1h10v10H1z"/>
                        <path fill="#81bc06" d="M13 1h10v10H13z"/>
                        <path fill="#05a6f0" d="M1 13h10v10H1z"/>
                        <path fill="#ffba08" d="M13 13h10v10H13z"/>
                      </svg>
                      <span className="font-medium">Microsoft</span>
                    </div>
                    <Button variant="outline" size="sm">Lier</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 fill-current text-purple-600" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="font-medium">SAML/Entreprise</span>
                    </div>
                    <Button variant="outline" size="sm">Lier</Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;