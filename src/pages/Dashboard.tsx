import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/ui/navbar";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel, Filters } from "@/components/search/FilterPanel";
import { ResultsTable } from "@/components/search/ResultsTable";
import { EmissionFactor } from "@/types/emission-factor";
import { useFavorites } from "@/contexts/FavoritesContext";

// Mock data - à remplacer par l'API Algolia
const mockResults: EmissionFactor[] = [
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
    incertitude: "±15%"
  },
  {
    id: "2",
    nom: "Curved glass, RER",
    description: "Verre courbé, RER",
    fe: 2.41,
    unite: "kgCO2e/kg",
    source: "Base Impacts 3.0",
    secteur: "Matériaux",
    categorie: "Verre",
    localisation: "Europe",
    date: "2011",
    incertitude: "±20%"
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
    incertitude: "±18%"
  },
  {
    id: "4",
    nom: "Patterned glass, RER",
    description: "Verre à motifs, RER",
    fe: 1.17,
    unite: "kgCO2e/kg",
    source: "Base Impacts 3.0",
    secteur: "Matériaux",
    categorie: "Verre",
    localisation: "Europe",
    date: "2011",
    incertitude: "±12%"
  },
  {
    id: "5",
    nom: "Container glass, RER",
    description: "Verre d'emballage, RER",
    fe: 0.81396,
    unite: "kgCO2e/kg",
    source: "Base Impacts 3.0",
    secteur: "Matériaux",
    categorie: "Verre",
    localisation: "Europe",
    date: "2011",
    incertitude: "±10%"
  }
];

const suggestions = [
  "glass", "recycled glass", "sodium", "verre", "verre recyclé", 
  "aluminum", "steel", "concrete", "plastic", "wood"
];

const Dashboard = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
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

  const performSearch = useCallback((query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    // Simulate API call to Algolia
    setTimeout(() => {
      let searchResults: EmissionFactor[] = [];
      if (query.toLowerCase().includes("glass") || query.toLowerCase().includes("verre")) {
        searchResults = mockResults;
      } else if (query === "") {
        searchResults = mockResults;
      } else {
        searchResults = [];
      }
      
      // Mark items as favorite based on context
      const resultsWithFavorites = searchResults.map(item => ({
        ...item,
        isFavorite: isFavorite(item.id)
      }));
      
      setResults(resultsWithFavorites);
      setIsLoading(false);
    }, 800);
  }, []);

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
  }, [searchQuery, performSearch, hasSearched]);

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

  const handleExport = () => {
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Search Section */}
      <div className="bg-search-bg text-white py-12">
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