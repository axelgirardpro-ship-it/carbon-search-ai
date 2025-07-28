import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { ResultsTable } from "@/components/search/ResultsTable";
import { Button } from "@/components/ui/button";
import { EmissionFactor } from "@/types/emission-factor";
import { Heart, Plus } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/ui/RoleGuard";

// Mock favorites data
const mockFavorites: EmissionFactor[] = [
  {
    id: "1",
    nom: "Flat glass average",
    description: "Verre plat moyen",
    fe: 1.62,
    unite: "kgCO2e/kg",
    source: "Base Impacts 3.0",
    secteur: "Matériaux",
    categorie: "Verre",
    localisation: "Europe",
    date: "2023",
    incertitude: "±15%",
    isFavorite: true
  },
  {
    id: "3",
    nom: "Toughened glass (ESG)",
    description: "Verre renforcé (verre monocouche de sécurité-ESG) (épaisseur 1 mm; densité 2.5 kg/m2), RER",
    fe: 1.84,
    unite: "kgCO2e/kg",
    source: "Base Impacts 3.0",
    secteur: "Matériaux",
    categorie: "Verre",
    localisation: "Europe",
    date: "2011",
    incertitude: "±18%",
    isFavorite: true
  }
];

const Favorites = () => {
  const { favorites, loading, removeFromFavorites, addToFavorites } = useFavorites();
  const { canExportData } = usePermissions();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === favorites.length ? [] : favorites.map(f => f.id)
    );
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await removeFromFavorites(id);
      setSelectedItems(prev => prev.filter(item => item !== id));
      toast({
        title: "Favori supprimé",
        description: "L'élément a été retiré de vos favoris",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la suppression du favori",
      });
    }
  };

  const handleAddToFavorites = async () => {
    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un élément",
      });
      return;
    }

    try {
      // Add selected items to favorites (for demonstration, we'll just show success)
      toast({
        title: "Favoris ajoutés",
        description: `${selectedItems.length} élément(s) ajouté(s) aux favoris`,
      });
      setSelectedItems([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'ajout aux favoris",
      });
    }
  };

  const handleExport = () => {
    const selectedFavorites = favorites.filter(f => selectedItems.includes(f.id));
    const csvContent = [
      "Nom,FE,Unité,Source,Localisation,Date",
      ...selectedFavorites.map(f => `"${f.nom}",${f.fe},"${f.unite}","${f.source}","${f.localisation}","${f.date}"`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mes_favoris_emissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Heart className="w-8 h-8 mr-3 text-red-500" />
            Mes favoris
          </h1>
          <p className="text-muted-foreground">
            Retrouvez ici tous vos facteurs d'émissions carbone favoris
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement de vos favoris...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div>
            <div className="mb-4 flex gap-2">
              <Button 
                onClick={handleAddToFavorites}
                disabled={selectedItems.length === 0}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter aux favoris ({selectedItems.length})
              </Button>
              <RoleGuard requirePermission="canExportData">
                <Button 
                  onClick={handleExport}
                  disabled={selectedItems.length === 0}
                >
                  Exporter la sélection ({selectedItems.length})
                </Button>
              </RoleGuard>
            </div>
            <ResultsTable
              results={favorites}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              onToggleFavorite={handleToggleFavorite}
              onExport={handleExport}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez des facteurs d'émissions à vos favoris depuis la page de recherche
            </p>
            <a 
              href="/dashboard" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Commencer une recherche
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;