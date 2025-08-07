import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { ResultsTable } from "@/components/search/ResultsTable";
import { Button } from "@/components/ui/button";
import { EmissionFactor } from "@/types/emission-factor";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/ui/RoleGuard";
import { FavoritesFilterPanel, FavoritesFilters } from "@/components/search/FavoritesFilterPanel";

const Favorites = () => {
  const { favorites, loading, removeFromFavorites, addToFavorites } = useFavorites();
  const { canExport } = usePermissions();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<FavoritesFilters>({
    search: '',
    source: '',
    localisation: '',
    date: '',
    importType: 'all'
  });

  // Filter favorites based on filters
  const filteredFavorites = useMemo(() => {
    return favorites.filter(favorite => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = favorite.nom.toLowerCase().includes(searchLower) ||
          (favorite.description && favorite.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Source filter
      if (filters.source && favorite.source !== filters.source) {
        return false;
      }

      // Location filter
      if (filters.localisation && favorite.localisation !== filters.localisation) {
        return false;
      }

      // Date filter
      if (filters.date && favorite.date.toString() !== filters.date) {
        return false;
      }

      // Import type filter
      if (filters.importType !== 'all') {
        const isImported = Boolean(favorite.workspace_id);
        if (filters.importType === 'imported' && !isImported) return false;
        if (filters.importType === 'not_imported' && isImported) return false;
      }

      return true;
    });
  }, [favorites, filters]);

  // Get unique values for filter options
  const availableSources = useMemo(() => 
    [...new Set(favorites.map(f => f.source))].filter(Boolean).sort(), 
    [favorites]
  );
  
  const availableLocations = useMemo(() => 
    [...new Set(favorites.map(f => f.localisation))].filter(Boolean).sort(), 
    [favorites]
  );
  
  const availableDates = useMemo(() => 
    [...new Set(favorites.map(f => f.date))].filter(Boolean).sort().reverse().map(String), 
    [favorites]
  );

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredFavorites.length ? [] : filteredFavorites.map(f => f.id)
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


  const handleCopyToClipboard = async () => {
    try {
      const selectedFavorites = filteredFavorites.filter(f => selectedItems.includes(f.id));
      const headers = ["Nom", "FE", "Unité donnée d'activité", "Source", "Localisation", "Date"];
      const tsvContent = [
        headers.join("\t"),
        ...selectedFavorites.map(f => [
          f.nom,
          f.fe,
          f.uniteActivite,
          f.source,
          f.localisation,
          f.date
        ].join("\t"))
      ].join("\n");
      
      await navigator.clipboard.writeText(tsvContent);
      
      toast({
        title: "Copié dans le presse-papier",
        description: `${selectedFavorites.length} élément(s) copié(s). Vous pouvez maintenant les coller dans Excel ou Google Sheets.`,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la copie dans le presse-papier",
      });
    }
  };

  const handleExport = async () => {
    if (!canExport) {
      toast({
        variant: "destructive",
        title: "Limite d'exports atteinte",
        description: "Veuillez upgrader votre abonnement pour continuer à exporter.",
      });
      return;
    }

    try {
      
      const selectedFavorites = filteredFavorites.filter(f => selectedItems.includes(f.id));
      const csvContent = [
        "Nom,FE,Unité donnée d'activité,Source,Localisation,Date",
        ...selectedFavorites.map(f => `"${f.nom}",${f.fe},"${f.uniteActivite}","${f.source}","${f.localisation}","${f.date}"`)
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes_favoris_emissions.csv";
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réalisé",
        description: "Vos favoris ont été exportés avec succès !",
      });
    } catch (error) {
      console.error('Error during export:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'export",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center homepage-text">
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
            <FavoritesFilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableSources={availableSources}
              availableLocations={availableLocations}
              availableDates={availableDates}
            />
            <div className="mb-4">
              <RoleGuard requirePermission="canExport">
                <Button 
                  onClick={handleExport}
                  disabled={selectedItems.length === 0}
                >
                  Exporter la sélection ({selectedItems.length})
                </Button>
              </RoleGuard>
            </div>
            <ResultsTable
              results={filteredFavorites.map(fav => ({ ...fav, isFavorite: true }))}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              onToggleFavorite={handleToggleFavorite}
              onExport={handleExport}
              onCopyToClipboard={handleCopyToClipboard}
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
            <Button asChild>
              <Link to="/search">
                Commencer une recherche
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;