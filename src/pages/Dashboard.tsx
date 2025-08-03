import { useState, useEffect, useCallback, useRef } from "react";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel, Filters } from "@/components/search/FilterPanel";
import { ResultsTable } from "@/components/search/ResultsTable";
import { QuotaWidget } from "@/components/ui/QuotaWidget";
import { EmissionFactor } from "@/types/emission-factor";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuotas } from "@/contexts/QuotaContext";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Removed mock data - now using Supabase data

const suggestions = [
  "glass", "recycled glass", "sodium", "verre", "verre recyclé", 
  "aluminum", "steel", "concrete", "plastic", "wood"
];

const Dashboard = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentWorkspace } = useWorkspace();
  const { incrementExport, canExport, canSearch, incrementSearch } = useQuotas();
  const { recordSearch } = useSearchHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    source: "",
    secteur: "",
    categorie: "",
    uniteActivite: "",
    localisation: "",
    anneeRapport: ""
  });
  const [results, setResults] = useState<EmissionFactor[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Refs pour éviter les boucles infinies
  const canSearchRef = useRef(canSearch);
  const incrementSearchRef = useRef(incrementSearch);
  
  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    canSearchRef.current = canSearch;
    incrementSearchRef.current = incrementSearch;
  }, [canSearch, incrementSearch]);

  const performSearch = useCallback(async (query: string) => {
    // Vérifier si l'utilisateur peut effectuer une recherche (utiliser la ref)
    if (!canSearchRef.current) {
      toast.error("Limite de recherche atteinte. Passez à un plan payant pour continuer.");
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Incrémenter le compteur de recherches SEULEMENT si on va faire la recherche (utiliser la ref)
      await incrementSearchRef.current();
      let supabaseQuery = supabase
        .from('emission_factors')
        .select('*');

      // Search logic: public data + current workspace data
      if (currentWorkspace) {
        supabaseQuery = supabaseQuery.or(`is_public.eq.true,workspace_id.eq.${currentWorkspace.id}`);
      } else {
        // If no workspace, only show public data
        supabaseQuery = supabaseQuery.eq('is_public', true);
      }

      // Apply search filter if query is provided
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`nom.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply other filters
      if (filters.source) {
        supabaseQuery = supabaseQuery.ilike('source', `%${filters.source}%`);
      }
      if (filters.secteur) {
        supabaseQuery = supabaseQuery.ilike('secteur', `%${filters.secteur}%`);
      }
      if (filters.categorie) {
        supabaseQuery = supabaseQuery.ilike('categorie', `%${filters.categorie}%`);
      }
      if (filters.localisation) {
        supabaseQuery = supabaseQuery.ilike('localisation', `%${filters.localisation}%`);
      }
      if (filters.anneeRapport) {
        supabaseQuery = supabaseQuery.ilike('date', `%${filters.anneeRapport}%`);
      }

      const { data, error } = await supabaseQuery.limit(100);

      if (error) {
        console.error('Error fetching emission factors:', error);
        setResults([]);
        return;
      }

      // Transform Supabase data to match EmissionFactor interface
      const searchResults: EmissionFactor[] = (data || []).map(item => ({
        id: item.id,
        nom: item.nom,
        description: item.description || '',
        fe: Number(item.fe),
        unite: item.unite,
        source: item.source,
        secteur: item.secteur,
        categorie: item.categorie,
        localisation: item.localisation,
        date: item.date,
        incertitude: item.incertitude || '',
        isFavorite: isFavorite(item.id)
      }));
      
      setResults(searchResults);
      
      // Record search in history (called separately to avoid dependency issues)
      recordSearch(query, filters, searchResults.length);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isFavorite, currentWorkspace]); // Enlever canSearch et incrementSearch des dépendances

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 400);

      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length === 0 && hasSearched) {
      // Clear results when search is empty
      setResults([]);
      setHasSearched(false);
    }
  }, [searchQuery, performSearch, hasSearched]); // Remettre performSearch dans les dépendances maintenant qu'il est stable

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      source: "",
      secteur: "",
      categorie: "",
      uniteActivite: "",
      localisation: "",
      anneeRapport: ""
    });
  };

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === results.length ? [] : results.map(r => r.id)
    );
  };

  const handleToggleFavorite = async (id: string) => {
    const item = results.find(r => r.id === id);
    if (!item) return;

    try {
      console.log('🚀 Dashboard: Toggling favorite for item:', item);
      
      if (item.isFavorite) {
        await removeFromFavorites(id);
        console.log('🚀 Dashboard: Removed from favorites');
      } else {
        await addToFavorites(item);
        console.log('🚀 Dashboard: Added to favorites');
      }
      
      // Update local state after successful DB operation
      setResults(prev => prev.map(result => 
        result.id === id ? { ...result, isFavorite: !result.isFavorite } : result
      ));
    } catch (error) {
      console.error('🚨 Dashboard: Error toggling favorite:', error);
    }
  };

  const handleExport = async () => {
    if (!canExport) {
      toast.error("Limite d'exports atteinte. Veuillez upgrader votre abonnement.");
      return;
    }

    try {
      await incrementExport();
      
      const selectedResults = results.filter(r => selectedItems.includes(r.id));
      const csvContent = [
        "Nom,FE,Unité,Source,Localisation,Date",
        ...selectedResults.map(r => `"${r.nom}",${r.fe},"${r.unite}","${r.source}","${r.localisation}","${r.date}"`)
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "facteurs_emissions.csv";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Export réalisé avec succès !");
    } catch (error) {
      console.error('Error during export:', error);
      toast.error("Erreur lors de l'export");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      {/* Search Section */}
      <div className="homepage-violet-bg homepage-text py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Rechercher des facteurs d'émissions
            </h1>
            
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              suggestions={suggestions}
              className="mb-6"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Quota Widget */}
        <div className="mb-6">
          <QuotaWidget />
        </div>
        
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        <div className="mt-8">
          {hasSearched ? (
            <ResultsTable
              results={results}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              onToggleFavorite={handleToggleFavorite}
              onExport={handleExport}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-muted-foreground">
                Utilisez la barre de recherche ci-dessus pour trouver des facteurs d'émissions carbone
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;