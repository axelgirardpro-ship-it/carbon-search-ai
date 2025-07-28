import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Database, Heart, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-hero-bg to-primary/90 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              EcoSearch
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Moteur de recherche de facteurs d'émissions carbone
            </p>
            <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
              Trouvez rapidement les facteurs d'émissions carbone dont vous avez besoin 
              pour vos calculs d'empreinte carbone avec notre base de données complète.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-hero-bg">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un outil complet pour gérer vos facteurs d'émissions carbone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Recherche avancée</h3>
              <p className="text-muted-foreground">
                Recherchez par mots-clés avec des suggestions intelligentes
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Filtres multiples</h3>
              <p className="text-muted-foreground">
                Filtrez par source, secteur, localisation et plus
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Favoris</h3>
              <p className="text-muted-foreground">
                Sauvegardez vos facteurs d'émissions les plus utilisés
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import de données</h3>
              <p className="text-muted-foreground">
                Importez vos propres bases de données de facteurs
              </p>
            </div>
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
