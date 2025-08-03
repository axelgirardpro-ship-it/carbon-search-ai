import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4" style={{
      backgroundColor: '#d7caf5'
    }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche : H1, Paragraphe, CTAs */}
            <div className="space-y-6 order-2 lg:order-1">
              <h1 style={{
              fontSize: '48px'
            }} className="font-montserrat font-bold leading-tight text-indigo-950 text-4xl">
                Le moteur de recherche<br />
                de FE le plus puissant<br />
                du marché
              </h1>
              <p style={{
              fontSize: '16px'
            }} className="font-montserrat text-indigo-950">
                Accédez à plus de 255 000 facteurs d'émissions français et internationaux<br />
                agrégés et enrichis par nos experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button className="text-white px-8 py-3 rounded-md font-semibold font-montserrat w-full sm:w-auto bg-slate-950 hover:bg-slate-800">
                    Tester le moteur de recherche
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-[#2D3436] px-8 py-3 rounded-md font-semibold font-montserrat w-full sm:w-auto bg-indigo-200 hover:bg-indigo-100 text-indigo-950">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Colonne droite : Image */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <img src="/lovable-uploads/5891d941-bc3a-4cef-a0f8-23e6e733d4b1.png" alt="Interface de recherche de facteurs d'émission" className="w-full h-auto rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg mb-12 text-indigo-950">
            Retrouvez les plus grandes bases françaises et internationales
          </h2>
          <div className="grid grid-cols-6 gap-8 items-center">
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/3fdbfe68-8e5e-4c44-8ac1-edd24a2d8fac.png" alt="Empreinte" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/ac4b2170-676b-424b-906d-7f65f939022c.png" alt="Ecobalyse" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/f51cec17-9b6f-417a-919b-c29f1a77ac1a.png" alt="exiobase" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/9d73d9ce-baf8-4a47-bdd7-bcbcc41e709d.png" alt="inies" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">AGRI BALYSE</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">Electricity Maps</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">PCAF</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">ecoinvent</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">AIB</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">EMBER</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">Climate Trace</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#6C5CE7] text-lg font-medium">eco</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#2D3436] mb-12">
            Découvrez la puissance<br />
            du moteur de recherche
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#6C5CE7] to-[#2D3436] rounded-2xl p-8">
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">https://app.clixtechnologies.com</div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-[#6C5CE7] to-[#2D3436] rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="mb-4">🔍</div>
                    <div>Démo interactive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Tabs Section */}
      <section className="py-20 px-4 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-[#2D3436] text-center mb-12">
            Un moteur de recherche<br />
            puissant et personnalisable
          </h2>
          <Tabs defaultValue="donnees" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-white rounded-full">
              <TabsTrigger value="donnees" className="rounded-full">Données</TabsTrigger>
              <TabsTrigger value="recherche" className="rounded-full">Recherche</TabsTrigger>
              <TabsTrigger value="personnalisation" className="rounded-full">Personnalisation</TabsTrigger>
              <TabsTrigger value="plus-loin" className="rounded-full">Pour aller plus loin</TabsTrigger>
            </TabsList>
            <TabsContent value="donnees" className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#2D3436]">
                  Le guichet unique de vos<br />
                  données carbone
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Une donnée structurée</h4>
                    <p className="text-[#636E72]">Une structuration unique et homogène de plus de 20 bases de<br />données de références internationales.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Une donnée à jour</h4>
                    <p className="text-[#636E72]">Une mise à jour en continu des bases pour une garantie de<br />qualité des FE.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">+ 250K FE à disposition</h4>
                    <p className="text-[#636E72]">Plus de 250k FE génériques et spécifiques en cumulé,<br />disponibles au sein d'une structure commune.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="text-center mb-4 text-[#636E72]">Base de données</div>
                <div className="flex gap-4 mb-6">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded text-sm">Datasets communs</button>
                  <button className="px-4 py-2 text-[#6C5CE7] text-sm">Datasets importés</button>
                </div>
                <div className="space-y-2">
                  {["FE_Généralistes_2025", "FE_Agroalimentaire", "FE_Finance", "FE_Clients_2024", "FE_Combustibles", "FE_Divertissement_Inflation", "FE_Automobile", "FE_Santé", "FE_Industrie_2022"].map((item, index) => <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="text-sm">{item}</div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#6C5CE7]">Général</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Publié</span>
                      </div>
                    </div>)}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="recherche">
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-[#2D3436] mb-4">
                  Moteur fluide et simple d'utilisation
                </h3>
              </div>
            </TabsContent>
            <TabsContent value="personnalisation">
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-[#2D3436] mb-4">
                  Personnalisez le moteur
                </h3>
              </div>
            </TabsContent>
            <TabsContent value="plus-loin">
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-[#2D3436] mb-4">
                  Allez plus loin que la recherche
                </h3>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Databases Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-[#2D3436] text-center mb-12">
            Toutes les bases de données<br />
            sur une seule plateforme
          </h2>
          <Tabs defaultValue="standards" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12 bg-white rounded-full">
              <TabsTrigger value="standards" className="rounded-full">Datasets standards</TabsTrigger>
              <TabsTrigger value="premium" className="rounded-full">Datasets premium</TabsTrigger>
            </TabsList>
            <TabsContent value="standards">
              <div className="grid grid-cols-7 gap-8">
                {["AIB", "Agribalyse", "BEIS", "Base Carbone", "Base Impacts", "CCF", "Climate Trace", "EEA", "EPA", "Exiobase", "EcoInfo", "Ecobalyse", "Electricity Maps", "Ember", "GESPoint5", "GLEC", "Kering", "OMEGA TP", "Open CEDA", "PCAF"].map((name, index) => <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-[#6C5CE7]/10 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#6C5CE7] rounded"></div>
                    </div>
                    <span className="text-sm text-center">{name}</span>
                  </div>)}
              </div>
            </TabsContent>
            <TabsContent value="premium">
              <div className="grid grid-cols-7 gap-8">
                {["Base Carbone", "Base Impacts", "CCF", "Climate Trace"].map((name, index) => <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-[#6C5CE7]/10 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#6C5CE7] rounded"></div>
                    </div>
                    <span className="text-sm text-center">{name}</span>
                  </div>)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Expert Section */}
      <section className="py-20 px-4 bg-[#F8F9FA]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <img src="/lovable-uploads/45983903-6b93-459c-ac61-aa9cbb61ccae.png" alt="Guillaume - Expert" className="w-80 h-80 object-cover rounded-lg" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#2D3436]">
                Une base de données<br />
                structurée et enrichie par nos<br />
                experts
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Des bases de données nettoyées et structurées</h3>
                  <p className="text-[#636E72]">Notre équipe expertise nettoie et restructure l'ensemble des bases de données intégrées afin de disposer d'un format unique de données.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Enrichissement des bases de données</h3>
                  <p className="text-[#636E72]">Vérification des facteurs par poste d'émissions, correction des effets de l'inflation, traduction des métadonnées...</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Versionnage</h3>
                  <p className="text-[#636E72]">Profitez d'un versionnage d'un maintien en temps réel de la base au gré des mises à jour des différentes sources de données.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-[#2D3436] text-center mb-12">
            Un prix qui s'adapte<br />
            à vos besoins
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">STANDARD</CardTitle>
                <div className="text-sm text-[#636E72]">À partir de</div>
                <div className="text-4xl font-bold text-[#2D3436]">850€<span className="text-lg font-normal">/an</span></div>
                <p className="text-[#636E72] text-sm">Profitez des datasets standards et du moteur de recherche</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Accès au moteur de recherche</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Datasets standards (165k FE)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mises à jour hebdomadaires</span>
                </div>
                <Button className="w-full bg-[#2D3436] hover:bg-[#2D3436]/90 text-white mt-6">
                  En savoir plus
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 border-gray-200 relative">
              <Badge className="absolute -top-3 right-4 bg-green-500 text-white">Version Beta</Badge>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">PREMIUM</CardTitle>
                <div className="text-sm text-[#636E72]">À partir de</div>
                <div className="text-4xl font-bold text-[#2D3436]">3000€<span className="text-lg font-normal">/an</span></div>
                <p className="text-[#636E72] text-sm">Profitez des bases standards et premium et des fonctionnalités d'exports de données</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Accès au moteur de recherche</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Datasets standards (165k FE)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Datasets premium (90K FE)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mises à jour hebdomadaires</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Gestion des favoris</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Export des données</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Assistance de nos experts</span>
                </div>
                <Button className="w-full bg-[#2D3436] hover:bg-[#2D3436]/90 text-white mt-6">
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#2D3436] to-[#6C5CE7]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-white">
              <h2 className="text-3xl font-bold">
                Prendre rendez-vous<br />
                pour une démo
              </h2>
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8 py-3">
                Prendre rendez-vous
              </Button>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Interface de démo</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;