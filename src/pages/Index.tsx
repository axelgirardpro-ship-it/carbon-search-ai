import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Database, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  Globe,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/25">
              <Star className="w-4 h-4 mr-2" />
              Le moteur de recherche de FE le plus puissant
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              EcoSearch
            </h1>
            
            <p className="text-2xl md:text-3xl mb-8 text-white/90 font-medium">
              Accédez instantanément aux facteurs d'émissions carbone
            </p>
            
            <p className="text-xl mb-12 text-white/80 max-w-3xl mx-auto leading-relaxed">
              La plateforme de référence utilisée par les experts carbone pour accéder aux données 
              ADEME, INIES, Base Impacts et bien plus. Recherche avancée, export Excel, API REST.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-premium transition-bounce">
                  <Zap className="w-5 h-5 mr-2" />
                  Essai gratuit 7 jours
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg glass-effect text-primary-foreground hover:bg-white/10 transition-smooth border-white/30">
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-white/70 mb-6">Utilisé par plus de 2000+ experts carbone</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
                <div className="flex items-center space-x-2">
                  <Database className="w-6 h-6" />
                  <span className="text-sm font-medium">ADEME</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-6 h-6" />
                  <span className="text-sm font-medium">INIES</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm font-medium">Base Impacts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">Secteur Public</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation Section */}
      <div className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des données fiables aux outils d'analyse avancés, découvrez pourquoi 
              EcoSearch est le choix des experts carbone.
            </p>
          </div>

          <Tabs defaultValue="donnees" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="donnees" className="text-lg py-4">
                <Database className="w-5 h-5 mr-2" />
                Données
              </TabsTrigger>
              <TabsTrigger value="recherche" className="text-lg py-4">
                <Search className="w-5 h-5 mr-2" />
                Recherche
              </TabsTrigger>
              <TabsTrigger value="personnalisation" className="text-lg py-4">
                <Shield className="w-5 h-5 mr-2" />
                Personnalisation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="donnees" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="card-hover">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Base ADEME</CardTitle>
                    <CardDescription>
                      Plus de 3000 facteurs d'émissions officiels français
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="card-hover">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>INIES</CardTitle>
                    <CardDescription>
                      Données environnementales des produits de construction
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="card-hover">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Base Impacts</CardTitle>
                    <CardDescription>
                      ACV alimentaire et agriculture française
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="recherche" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center p-6 card-hover">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Recherche intelligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Auto-complétion et suggestions contextuelles
                  </p>
                </Card>
                
                <Card className="text-center p-6 card-hover">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Filtres avancés</h3>
                  <p className="text-sm text-muted-foreground">
                    Source, secteur, géographie, incertitude
                  </p>
                </Card>
                
                <Card className="text-center p-6 card-hover">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Export Excel</h3>
                  <p className="text-sm text-muted-foreground">
                    Téléchargement direct au format Excel
                  </p>
                </Card>
                
                <Card className="text-center p-6 card-hover">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Favoris</h3>
                  <p className="text-sm text-muted-foreground">
                    Sauvegarde de vos FE les plus utilisés
                  </p>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="personnalisation" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 card-hover">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Sécurité entreprise</h3>
                      <p className="text-muted-foreground mb-4">
                        Conformité RGPD, hébergement français, audit logs complets
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Headers de sécurité stricts
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Session management avancé
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Traçabilité complète des actions
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-8 card-hover">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Données personnalisées</h3>
                      <p className="text-muted-foreground mb-4">
                        Importez et gérez vos propres facteurs d'émissions
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Import CSV/Excel
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Validation automatique
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Gestion des versions
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tarification simple et transparente
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Commencez gratuitement, puis choisissez le plan qui correspond à vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <Card className="relative card-hover border-2">
              <CardHeader className="pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Standard</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Pour les consultants et équipes
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Populaire</Badge>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-bold">850€</span>
                  <span className="text-muted-foreground">/an</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Accès complet aux données ADEME
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    1000 recherches/mois
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    100 exports Excel/mois
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Support par email
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Historique 12 mois
                  </li>
                </ul>
                <Link to="/signup" className="block">
                  <Button className="w-full" size="lg">
                    Essai gratuit 7 jours
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative card-hover border-2 border-primary shadow-premium">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-2">
                  <Star className="w-4 h-4 mr-1" />
                  Recommandé
                </Badge>
              </div>
              <CardHeader className="pb-8 pt-8">
                <div>
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Pour les organisations
                  </CardDescription>
                </div>
                <div className="mt-6">
                  <span className="text-4xl font-bold">3000€</span>
                  <span className="text-muted-foreground">/an</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Toutes les données (ADEME, INIES, Base Impacts)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Recherches illimitées
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Exports illimités
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Support prioritaire & téléphone
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Import de données personnalisées
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    API REST accès complet
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Conformité entreprise (RGPD, audit logs)
                  </li>
                </ul>
                <Link to="/signup" className="block">
                  <Button className="w-full premium-gradient hover:opacity-90" size="lg">
                    <Zap className="w-5 h-5 mr-2" />
                    Essai gratuit 7 jours
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Toutes les options incluent un essai gratuit de 7 jours
            </p>
            <p className="text-sm text-muted-foreground">
              Facturation annuelle • Résiliation à tout moment • Support inclus
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à EcoSearch 
            pour leurs calculs d'empreinte carbone.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Créer un compte gratuit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
