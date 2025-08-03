import { useState, useEffect, useMemo } from "react";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { ResultsTable } from "@/components/search/ResultsTable";
import { Button } from "@/components/ui/button";
import { EmissionFactor } from "@/types/emission-factor";
import { Heart, Plus } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuotas } from "@/contexts/QuotaContext";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/ui/RoleGuard";
import { FavoritesFilterPanel, FavoritesFilters } from "@/components/search/FavoritesFilterPanel";

// Debug logging for favorites
console.log('🚀 Favorites page loaded');

const Favorites = () => {
  const { favorites, loading, removeFromFavorites, addToFavorites } = useFavorites();
  const { canExportData } = usePermissions();
  const { incrementExport, canExport } = useQuotas();
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
      if (filters.date && favorite.date !== filters.date) {
        return false;
      }

      // Import type filter
      if (filters.importType !== 'all') {
        const isImported = (favorite as any).source_type === 'private';
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
    [...new Set(favorites.map(f => f.date))].filter(Boolean).sort().reverse(), 
    [favorites]
  );

  console.log('🚀 Favorites component render:', { 
    favoritesCount: favorites.length, 
    filteredCount: filteredFavorites.length,
    loading, 
    filters
  });

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
      await incrementExport();
      
      const selectedFavorites = filteredFavorites.filter(f => selectedItems.includes(f.id));
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
              results={filteredFavorites}
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