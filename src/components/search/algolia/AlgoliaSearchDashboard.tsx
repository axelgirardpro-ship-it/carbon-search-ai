import React from 'react';
import { SearchProvider } from './SearchProvider';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';
import { SearchStats } from './SearchStats';
import { UnifiedNavbar } from '@/components/ui/UnifiedNavbar';
import { QuotaWidget } from '@/components/ui/QuotaWidget';
import { useQuotas } from '@/hooks/useQuotas';

const AlgoliaSearchContent: React.FC = () => {
  const { quotaData, isLoading } = useQuotas();

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4" style={{backgroundColor: '#d7caf5'}}>
        <div className="container mx-auto">
          <div className="text-center space-y-6">
          
            
            <div className="max-w-2xl mx-auto">
              <SearchBox />
            </div>

            <div className="mt-8 max-w-lg mx-auto">
              <QuotaWidget quotaData={quotaData} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
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

export const SearchDashboard: React.FC = () => {
  return (
    <SearchProvider>
      <AlgoliaSearchContent />
    </SearchProvider>
  );
};