import { useState, useEffect, useCallback, useRef } from "react";
import { UnifiedNavbar } from "@/components/ui/UnifiedNavbar";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel, Filters } from "@/components/search/FilterPanel";
import { ResultsTable } from "@/components/search/ResultsTable";
import { QuotaWidget } from "@/components/ui/QuotaWidget";
import { EmissionFactor } from "@/types/emission-factor";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useSuggestions } from "@/hooks/useSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { recordSearch } = useSearchHistory();
  
  // State pour la gestion des quotas
  const [quotaData, setQuotaData] = useState<any>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);
  
  // Initialize searchQuery state first
  const [searchQuery, setSearchQuery] = useState("");
  
  // Now use searchQuery in other hooks
  const { suggestions, recentSearches } = useSuggestions(searchQuery);
  const [filters, setFilters] = useState<Filters>({
    source: "",
    secteur: "",
    sousSecteur: "",
    uniteActivite: "",
    localisation: "",
    anneeRapport: ""
  });
  const [results, setResults] = useState<EmissionFactor[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Charger les quotas de l'utilisateur
  const loadQuotaData = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingQuota(true);
    try {
      const { data, error } = await supabase
        .from('search_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading quota:', error);
        return;
      }
      
      // Si aucun quota n'existe, en créer un par défaut
      if (!data) {
        const { data: newQuota, error: insertError } = await supabase
          .from('search_quotas')
          .insert({
            user_id: user.id,
            plan_type: 'freemium',
            searches_limit: 10,
            exports_limit: 0,
            searches_used: 0,
            exports_used: 0
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating quota:', insertError);
          return;
        }
        
        setQuotaData(newQuota);
      } else {
        setQuotaData(data);
      }
    } catch (error) {
      console.error('Error in loadQuotaData:', error);
    } finally {
      setIsLoadingQuota(false);
    }
  }, [user]);

  useEffect(() => {
    loadQuotaData();
  }, [loadQuotaData]);
  
  // Fonctions pour gérer les quotas
  const canSearch = quotaData ? quotaData.searches_used < quotaData.searches_limit : false;
  const canExport = quotaData ? quotaData.exports_used < quotaData.exports_limit : false;
  
  const incrementSearch = async () => {
    if (!user || !quotaData) return;
    
    const { error } = await supabase
      .from('search_quotas')
      .update({ searches_used: quotaData.searches_used + 1 })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error incrementing search:', error);
      throw error;
    }
    
    // Mettre à jour l'état local
    setQuotaData(prev => prev ? { ...prev, searches_used: prev.searches_used + 1 } : null);
  };
  
  const incrementExport = async () => {
    if (!user || !quotaData) return;
    
    const { error } = await supabase
      .from('search_quotas')
      .update({ exports_used: quotaData.exports_used + 1 })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error incrementing export:', error);
      throw error;
    }
    
    // Mettre à jour l'état local
    setQuotaData(prev => prev ? { ...prev, exports_used: prev.exports_used + 1 } : null);
  };

  const performSearch = useCallback(async (query: string) => {
    // Vérifier si l'utilisateur peut effectuer une recherche
    if (!canSearch) {
      toast.error("Limite de recherche atteinte. Passez à un plan payant pour continuer.");
      return;
    }
    
    // Éviter les recherches vides ou trop courtes qui pourraient causer des boucles
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      
      let supabaseQuery = supabase
        .from('emission_factors')
        .select('*');

      // The new 4-tier access logic is now handled by the updated RLS policy
      // We don't need to manually filter here anymore as the database policy handles:
      // Tier 1: Private workspace emission factors
      // Tier 2: Global public emission factors  
      // Tier 3: Global premium emission factors (for premium users)
      // Tier 4: Specifically assigned sources

      // Apply search filter if query is provided
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`"Nom".ilike.%${query}%,"Description".ilike.%${query}%`);
      }

      // Apply other filters
      if (filters.source) {
        supabaseQuery = supabaseQuery.ilike('"Source"', `%${filters.source}%`);
      }
      if (filters.secteur) {
        supabaseQuery = supabaseQuery.ilike('"Secteur"', `%${filters.secteur}%`);
      }
      if (filters.sousSecteur) {
        supabaseQuery = supabaseQuery.ilike('"Sous-secteur"', `%${filters.sousSecteur}%`);
      }
      if (filters.uniteActivite) {
        supabaseQuery = supabaseQuery.ilike('"Unité donnée d\'activité"', `%${filters.uniteActivite}%`);
      }
      if (filters.localisation) {
        supabaseQuery = supabaseQuery.ilike('"Localisation"', `%${filters.localisation}%`);
      }
      if (filters.anneeRapport) {
        supabaseQuery = supabaseQuery.ilike('"Date"', `%${filters.anneeRapport}%`);
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
        nom: item["Nom"] || '',
        description: item["Description"] || '',
        fe: Number(item["FE"]) || 0,
        uniteActivite: item["Unité donnée d'activité"] || '',
        source: item["Source"] || '',
        secteur: item["Secteur"] || '',
        sousSecteur: item["Sous-secteur"] || '',
        localisation: item["Localisation"] || '',
        date: Number(item["Date"]) || 0,
        incertitude: String(item["Incertitude"] || ''),
        perimetre: item["Périmètre"] || '',
        contributeur: item["Contributeur"] || '',
        commentaires: item["Commentaires"] || '',
        isFavorite: isFavorite(item.id)
      }));
      
      setResults(searchResults);
      
      // Incrémenter le compteur de recherches seulement si des résultats sont trouvés
      if (searchResults.length > 0) {
        await incrementSearch();
      }
      
      // Record search in history (called separately to avoid dependency issues)
      recordSearch(query, filters, searchResults.length);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isFavorite, currentWorkspace, canSearch, incrementSearch, recordSearch]);

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  // Clear results when search query is empty
  useEffect(() => {
    if (searchQuery.length === 0 && hasSearched) {
      setResults([]);
      setHasSearched(false);
    }
  }, [searchQuery, hasSearched]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      source: "",
      secteur: "",
      sousSecteur: "",
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
      if (item.isFavorite) {
        await removeFromFavorites(id);
      } else {
        await addToFavorites(item);
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
        "Nom,FE,Unité donnée d'activité,Source,Localisation,Date",
        ...selectedResults.map(r => `"${r.nom}",${r.fe},"${r.uniteActivite}","${r.source}","${r.localisation}","${r.date}"`)
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
          recentSearches={recentSearches}
          className="mb-6"
        />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Quota Widget */}
        <div className="mb-6">
          <QuotaWidget quotaData={quotaData} isLoading={isLoadingQuota} />
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