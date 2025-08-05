import React, { useState } from 'react';
import { SearchProvider } from './SearchProvider';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';
import { SearchStats } from './SearchStats';
import { AutoComplete } from './AutoComplete';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { UnifiedNavbar } from '@/components/ui/UnifiedNavbar';
import { QuotaWidget } from '@/components/ui/QuotaWidget';

const AlgoliaSearchContent: React.FC = () => {
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const { getRecentSearches } = useSearchHistory();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  React.useEffect(() => {
    const loadRecentSearches = async () => {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    };
    loadRecentSearches();
  }, [getRecentSearches]);

  const handleSuggestionClick = (suggestion: string) => {
    setShowAutoComplete(false);
    // The SearchBox will handle the search automatically through Algolia
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Base de données des facteurs d'émission
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Recherchez parmi plus de 55 000 facteurs d'émission provenant de sources officielles
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <SearchBox 
              onFocus={() => setShowAutoComplete(true)}
              onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
            />
            <AutoComplete
              visible={showAutoComplete}
              onSuggestionClick={handleSuggestionClick}
              recentSearches={recentSearches}
            />
          </div>

          <div className="mt-6">
            <QuotaWidget quotaData={{}} isLoading={false} />
          </div>
        </section>

        {/* Search Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <SearchFilters />
          </aside>

          {/* Results Section */}
          <section className="lg:col-span-3">
            <SearchStats />
            <SearchResults />
          </section>
        </div>
      </main>
    </div>
  );
};

export const AlgoliaSearchDashboard: React.FC = () => {
  return (
    <SearchProvider>
      <AlgoliaSearchContent />
    </SearchProvider>
  );
};