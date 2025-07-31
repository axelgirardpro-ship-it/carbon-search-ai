import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar";
import { 
  Search, 
  Database, 
  CheckCircle, 
  Star, 
  Users, 
  ArrowRight,
  Globe,
  BarChart3,
  Filter,
  Download,
  Settings,
  Zap,
  Calendar,
  Phone
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen font-montserrat">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Le moteur de recherche de FE le plus puissant du marché
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                Accédez à plus de 255 000 facteurs d'émissions français et internationaux 
                agrégés et enrichis par nos experts.
              </p>
              <Button size="lg" className="px-8 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-premium transition-bounce">
                <ArrowRight className="w-5 h-5 mr-2" />
                En savoir plus
              </Button>
            </div>
            
            {/* Colonne droite - Screenshot */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=2160&h=1440&fit=crop" 
                  alt="Interface EcoSearch" 
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION LOGOS PARTENAIRES */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
              Retrouvez les plus grandes bases françaises et internationales
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center justify-items-center">
            {[
              'Base Empreinte', 'Ecobalyse', 'Exiobase', 'Base Inies', 'Agribalyse', 
              'Electricity Maps', 'PCAF', 'EcoInvent', 'AIB', 'Ember', 'Climate Trace', 
              'EEA', 'BEIS', 'Eco-Platform'
            ].map((logo, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white rounded-lg shadow-soft flex items-center justify-center mb-2">
                  <Database className="w-8 h-8 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION DÉMO INTERACTIVE */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Découvrez la puissance du moteur de recherche
            </h2>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-muted rounded-lg overflow-hidden shadow-elegant">
              <div style={{ paddingBottom: '52.44%' }} className="relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-xl font-semibold text-foreground">Démo interactive</p>
                    <p className="text-muted-foreground">Arcade embed à venir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION FONCTIONNALITÉS (TABS) */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Un moteur de recherche puissant et personnalisable
            </h2>
          </div>

          <Tabs defaultValue="donnees" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="donnees" className="text-lg py-4">
                <Database className="w-5 h-5 mr-2" />
                Données
              </TabsTrigger>
              <TabsTrigger value="recherche" className="text-lg py-4">
                <Search className="w-5 h-5 mr-2" />
                Recherche
              </TabsTrigger>
              <TabsTrigger value="personnalisation" className="text-lg py-4">
                <Settings className="w-5 h-5 mr-2" />
                Personnalisation
              </TabsTrigger>
              <TabsTrigger value="plus-loin" className="text-lg py-4">
                <Zap className="w-5 h-5 mr-2" />
                Pour aller plus loin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="donnees" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop" 
                    alt="Données" 
                    className="rounded-lg shadow-elegant w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    Guichet unique de vos données carbone
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Plus de 255 000 facteurs d'émissions agrégés</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Données enrichies et vérifiées par nos experts</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Mises à jour hebdomadaires automatiques</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recherche" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop" 
                    alt="Recherche" 
                    className="rounded-lg shadow-elegant w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    Moteur fluide et simple d'utilisation
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Recherche intelligente avec auto-complétion</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Filtres avancés par source, secteur et géographie</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Export Excel en un clic</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="personnalisation" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop" 
                    alt="Personnalisation" 
                    className="rounded-lg shadow-elegant w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    Personnalisez le moteur
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Interface adaptable à vos besoins</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Gestion des favoris et collections</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">API REST pour intégration custom</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plus-loin" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop" 
                    alt="Plus loin" 
                    className="rounded-lg shadow-elegant w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    Allez plus loin que la recherche
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Accompagnement par nos experts carbone</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">Formation et méthodologie carbone</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 5. SECTION BASES DE DONNÉES (TABS) */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Toutes les bases de données sur une seule plateforme
            </h2>
          </div>

          <Tabs defaultValue="standards" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12">
              <TabsTrigger value="standards" className="text-lg py-4">
                Datasets standards
              </TabsTrigger>
              <TabsTrigger value="premium" className="text-lg py-4">
                Datasets premium
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="standards" className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-2">
                      <Database className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Dataset {i + 1}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="premium" className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Premium {i + 1}</span>
                  </div>
                ))}
                <div className="text-center col-span-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <span className="text-lg font-semibold text-foreground">+ 4000 FE d'entreprises</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 6. SECTION EXPERT */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche - Photo Guillaume */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&h=800&fit=crop" 
                alt="Guillaume - Expert carbone" 
                className="rounded-lg shadow-elegant w-full max-w-md mx-auto"
              />
            </div>
            
            {/* Colonne droite */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
                Base de données structurée et enrichie par nos experts
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Validation experte</h3>
                    <p className="text-muted-foreground">
                      Chaque facteur d'émission est vérifié et validé par notre équipe d'experts carbone 
                      pour garantir la fiabilité des données.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Enrichissement continu</h3>
                    <p className="text-muted-foreground">
                      Nos données sont constamment enrichies avec de nouveaux facteurs, métadonnées 
                      et mises à jour des sources officielles.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Accompagnement personnalisé</h3>
                    <p className="text-muted-foreground">
                      Notre équipe vous accompagne dans l'utilisation de la plateforme et dans 
                      vos projets carbone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION PRICING */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Un prix qui s'adapte à vos besoins
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <Card className="relative card-hover border-2">
              <CardHeader className="pb-8">
                <div>
                  <CardTitle className="text-2xl text-foreground">Standard</CardTitle>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">850€</span>
                    <span className="text-muted-foreground">/an</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Accès moteur de recherche</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Datasets standards (165k FE)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Mises à jour hebdomadaires</span>
                  </li>
                </ul>
                <Button className="w-full" size="lg" variant="outline">
                  En savoir plus
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative card-hover border-2 border-primary shadow-premium">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-white px-6 py-2">
                  Version Beta
                </Badge>
              </div>
              <CardHeader className="pb-8 pt-8">
                <div>
                  <CardTitle className="text-2xl text-foreground">Premium</CardTitle>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">3000€</span>
                    <span className="text-muted-foreground">/an</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Accès moteur de recherche</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Datasets standards (165k FE)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Datasets premium (90K FE)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Mises à jour hebdomadaires</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Gestion des favoris</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Export des données</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-muted-foreground">Assistance de nos experts</span>
                  </li>
                </ul>
                <Button className="w-full premium-gradient hover:opacity-90 text-white" size="lg">
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. SECTION CTA FINALE */}
      <section className="py-24 final-cta-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Prendre rendez-vous pour une démo
              </h2>
              <Button size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-white shadow-premium transition-bounce">
                <Calendar className="w-5 h-5 mr-2" />
                Prendre rendez-vous
              </Button>
            </div>
            
            {/* Colonne droite - Screenshot */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=600&fit=crop" 
                  alt="Interface de démonstration" 
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;