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
          <div className="grid grid-cols-7 gap-8 items-center">
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
              <img src="/lovable-uploads/8edc4de0-1e88-4d97-972f-ed5d481c1b30.png" alt="AGRI BALYSE" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/a39b6717-f7d1-4045-a4ab-921fe28e5c53.png" alt="Electricity Maps" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/c27135f4-de5c-49fd-9e9f-4dc89a29274f.png" alt="PCAF" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/5310da27-1ab7-4efe-a090-a25937048f60.png" alt="ecoinvent" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/08a66c66-7e5d-4050-918f-aa08fd2d8612.png" alt="AIB" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/aa03a266-0170-4b29-b12a-2f86dea065a2.png" alt="EMBER" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/c0650cbc-f7d4-40e6-a022-e6b2bac57c2a.png" alt="Climate Trace" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/ba02a326-86d5-4773-8777-e613296e2582.png" alt="European Environment Agency" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/2d97e89d-91a3-4143-8432-605a4422e9f0.png" alt="Department for Business, Energy & Industrial Strategy" className="max-h-[50px]" />
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/01ca909f-ef8b-4b32-aea1-50f98ae9e4a6.png" alt="eco" className="max-h-[50px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-indigo-950">
            Découvrez la puissance<br />
            du moteur de recherche
          </h2>
          <div className="max-w-4xl mx-auto">
            <div style={{
            position: "relative",
            paddingBottom: "calc(52.44791666666667% + 41px)",
            height: 0,
            width: "100%"
          }}>
              <iframe src="https://demo.arcade.software/rg5Pizw2AGo4sO73KGPN?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true" title="Moteur de recherche de FE Sami - Démo" frameBorder="0" loading="lazy" style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              colorScheme: "light"
            }} allow="clipboard-write" className="rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Tabs Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-indigo-950 text-center mb-12">
            Un moteur de recherche<br />
            puissant et personnalisable
          </h2>
          <Tabs defaultValue="donnees" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-[#d7caf5] rounded-full items-center">
              <TabsTrigger value="donnees" className="rounded-full">Données</TabsTrigger>
              <TabsTrigger value="recherche" className="rounded-full">Recherche</TabsTrigger>
              <TabsTrigger value="personnalisation" className="rounded-full">Personnalisation</TabsTrigger>
              <TabsTrigger value="plus-loin" className="rounded-full">Pour aller plus loin</TabsTrigger>
            </TabsList>
            <TabsContent value="donnees" className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="font-bold text-indigo-950 text-3xl">
                  Le guichet unique de vos<br />
                  données carbone
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Une donnée structurée</h4>
                    <p className="text-indigo-950">Une structuration unique et homogène de plus de 20 bases de<br />données de références internationales.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Une donnée à jour</h4>
                    <p className="text-indigo-950">Une mise à jour en continu des bases pour une garantie de<br />qualité des FE.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">+ 250K FE à disposition</h4>
                    <p className="text-indigo-950">Plus de 250k FE génériques et spécifiques en cumulé,<br />disponibles au sein d'une structure commune.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <img src="/lovable-uploads/71d74bc4-61b0-4e95-befc-12b9508a15e4.png" alt="Interface base de données" className="w-full h-auto" />
              </div>
            </TabsContent>
            <TabsContent value="recherche" className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="font-bold text-indigo-950 text-3xl">
                  Moteur fluide et simple<br />
                  d'utilisation
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Recherche intelligente</h4>
                    <p className="text-indigo-950">Recherchez par mots-clés, codes, catégories ou filtres<br />avancés pour trouver rapidement vos FE.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Interface intuitive</h4>
                    <p className="text-indigo-950">Navigation simple et rapide avec des suggestions<br />automatiques et tri personnalisable.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Résultats précis</h4>
                    <p className="text-indigo-950">Algorithme optimisé pour vous proposer les facteurs<br />d'émission les plus pertinents selon vos critères.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <img src="/lovable-uploads/501e99e2-29fe-4086-8d1f-9bd8028d151d.png" alt="Interface de recherche" className="w-full h-auto" />
              </div>
            </TabsContent>
            <TabsContent value="personnalisation" className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="font-bold text-indigo-950 text-3xl">
                  Personnalisez le moteur<br />
                  selon vos besoins
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Favoris et collections</h4>
                    <p className="text-indigo-950">Sauvegardez vos FE préférés et créez des collections<br />thématiques pour un accès rapide.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Filtres personnalisés</h4>
                    <p className="text-indigo-950">Configurez des filtres selon vos secteurs d'activité<br />et vos besoins métier spécifiques.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Données sur-mesure</h4>
                    <p className="text-indigo-950">Intégrez vos propres FE spécifiques et créez votre<br />base de données personnalisée.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <img src="/lovable-uploads/e3feeaa6-9229-46a9-a227-0700f479943f.png" alt="Interface de personnalisation" className="w-full h-auto" />
              </div>
            </TabsContent>
            <TabsContent value="plus-loin" className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="font-bold text-indigo-950 text-3xl">
                  Allez plus loin que<br />
                  la recherche de FE
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Réalisez des benchmarks approfondis</h4>
                    <p className="text-indigo-950">Positionnez facilement un produit ou une entreprise par<br />rapport à des concurrents et des moyennes sectorielles de marché.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Plan d'action et décarbonation</h4>
                    <p className="text-indigo-950">Identifiez rapidement les bénéfices de changements de produits,<br />relocalisation, de fournisseurs (achats responsables), etc.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-indigo-950">Support expert</h4>
                    <p className="text-indigo-950">Bénéficiez de l'accompagnement de nos experts<br />carbone pour optimiser vos calculs.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <img src="/lovable-uploads/d9ebca49-6f11-4b52-a6b0-07a9d348c5b2.png" alt="Interface avancée" className="w-full h-auto" />
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
            <TabsList className="grid w-full grid-cols-2 mb-12 bg-[#d7caf5] rounded-full items-center">
              <TabsTrigger value="standards" className="rounded-full">Datasets standards</TabsTrigger>
              <TabsTrigger value="premium" className="rounded-full">Datasets premium</TabsTrigger>
            </TabsList>
            <TabsContent value="standards">
              <div className="grid grid-cols-7 gap-8">
                {["AIB", "Agribalyse", "BEIS", "Base Carbone", "Base Impacts", "CCF", "Climate Trace", "EEA", "EPA", "Exiobase", "EcoInvent", "Ecobalyse", "Electricity Maps", "Ember", "GESPoint5", "GLEC", "Kering", "OMEGA TP", "Open CEDA", "PCAF"].map((name, index) => <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                      {name === "AIB" ? (
                        <img src="/lovable-uploads/04c097ec-c73b-4fb8-8788-7db8dce6aae6.png" alt="AIB Logo" className="w-full h-full object-contain" />
                      ) : name === "Agribalyse" ? (
                        <img src="/lovable-uploads/fda086b7-f932-4837-beff-453157e04098.png" alt="Agribalyse Logo" className="w-full h-full object-contain" />
                      ) : name === "BEIS" ? (
                        <img src="/lovable-uploads/6a36c45c-748d-4f7b-83c3-06ab2651649f.png" alt="BEIS Logo" className="w-full h-full object-contain" />
                      ) : name === "Base Carbone" ? (
                        <img src="/lovable-uploads/e9be0482-b48d-476b-8536-b92ea3b88ea5.png" alt="Base Carbone Logo" className="w-full h-full object-contain" />
                      ) : name === "Base Impacts" ? (
                        <img src="/lovable-uploads/8351c94f-afcc-498e-b8fa-73f47451686a.png" alt="Base Impacts Logo" className="w-full h-full object-contain" />
                      ) : name === "CCF" ? (
                        <img src="/lovable-uploads/c9bb06bc-2cc4-4420-9704-4c9f16118e97.png" alt="CCF Logo" className="w-full h-full object-contain" />
                      ) : name === "Climate Trace" ? (
                        <img src="/lovable-uploads/47300cd4-f205-4264-a5b0-6f1406b312f8.png" alt="Climate Trace Logo" className="w-full h-full object-contain" />
                      ) : name === "EEA" ? (
                        <img src="/lovable-uploads/d2dffb4b-f32d-43ed-82bf-b071db714f91.png" alt="European Environment Agency Logo" className="w-full h-full object-contain" />
                      ) : name === "EPA" ? (
                        <img src="/lovable-uploads/75c9eac2-554f-4bb0-9719-08a698c80e1d.png" alt="US EPA Logo" className="w-full h-full object-contain" />
                      ) : name === "Exiobase" ? (
                        <img src="/lovable-uploads/373cff1a-5089-4167-b40a-38ff4d50cc36.png" alt="Exiobase Logo" className="w-full h-full object-contain" />
                      ) : name === "EcoInvent" ? (
                        <img src="/lovable-uploads/5cc1caa1-f312-4760-849c-0b4ec3ab5f76.png" alt="EcoInvent Logo" className="w-full h-full object-contain" />
                      ) : name === "Ecobalyse" ? (
                        <img src="/lovable-uploads/f775ed4f-912f-41cf-9ade-08338aadf665.png" alt="Ecobalyse Logo" className="w-full h-full object-contain" />
                      ) : name === "Electricity Maps" ? (
                        <img src="/lovable-uploads/0cc5974c-e436-42f5-9776-ad4cd768b072.png" alt="Electricity Maps Logo" className="w-full h-full object-contain" />
                      ) : name === "Ember" ? (
                        <img src="/lovable-uploads/88e14343-4589-4e34-b420-395130de1641.png" alt="Ember Logo" className="w-full h-full object-contain" />
                      ) : name === "GESPoint5" ? (
                        <img src="/lovable-uploads/8de84824-fb1b-441b-a7c2-50b92b4072e2.png" alt="1point5 Logo" className="w-full h-full object-contain" />
                      ) : name === "GLEC" ? (
                        <img src="/lovable-uploads/a5f3dea0-840a-4eed-b0ce-58ef94a75d67.png" alt="GLEC Logo" className="w-full h-full object-contain" />
                      ) : name === "Kering" ? (
                        <img src="/lovable-uploads/faa38581-8c17-443c-b8de-77a4ffc6c72e.png" alt="Kering Logo" className="w-full h-full object-contain" />
                      ) : name === "OMEGA TP" ? (
                        <img src="/lovable-uploads/4cce460f-a743-4cdf-9fdf-215ba86522d8.png" alt="OMEGA TP Logo" className="w-full h-full object-contain" />
                      ) : name === "Open CEDA" ? (
                        <img src="/lovable-uploads/6bd2c0d0-f9d1-4f7d-853f-cc2a7932bff5.png" alt="Open CEDA Logo" className="w-full h-full object-contain" />
                      ) : name === "PCAF" ? (
                        <img src="/lovable-uploads/b5978785-2cff-49c0-996a-225457820050.png" alt="PCAF Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-16 h-16 bg-[#6C5CE7]/10 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#6C5CE7] rounded"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-center">{name}</span>
                  </div>)}
              </div>
            </TabsContent>
            <TabsContent value="premium">
              <div className="grid grid-cols-7 gap-8">
                {["Inies", "Eco-platform", "EcoInvent"].map((name, index) => <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                      {name === "Inies" ? (
                        <img src="/lovable-uploads/59011962-91d0-4310-a1a6-4ce1c3bbb4b6.png" alt="Inies Logo" className="w-full h-full object-contain" />
                      ) : name === "Eco-platform" ? (
                        <img src="/lovable-uploads/7d492fef-d5aa-4fa5-9732-938c9b53680d.png" alt="Eco-platform Logo" className="w-full h-full object-contain" />
                      ) : name === "EcoInvent" ? (
                        <img src="/lovable-uploads/95586b3d-873f-4be8-a627-63fce61a19fd.png" alt="EcoInvent Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-16 h-16 bg-[#6C5CE7]/10 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#6C5CE7] rounded"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-center">{name}</span>
                  </div>)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Expert Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <img src="/lovable-uploads/aa4e0a75-7d42-444e-8f29-bd985c64a491.png" alt="Expert" className="w-80 h-80 object-cover rounded-lg" />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-indigo-950">
                Une base de données<br />
                structurée et enrichie par nos<br />
                experts
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-indigo-950">Des bases de données nettoyées et structurées</h3>
                  <p className="text-indigo-950">Nos experts nettoient et restructurent l'ensemble des bases de données intégrées afin de disposer d'un format unique de données.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-indigo-950">Enrichissement des bases de données</h3>
                  <p className="text-indigo-950">Vérification des facteurs par poste d'émissions, correction des effets de l'inflation, traduction des métadonnées...</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-indigo-950">Versionnage</h3>
                  <p className="text-indigo-950">Profitez d'un versionnage d'un maintien en temps réel de la base au gré des mises à jour des différentes sources de données.</p>
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
                <Button className="w-full bg-slate-950 hover:bg-slate-800 text-white mt-6">
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