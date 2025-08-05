import React from 'react';
import { SearchProvider } from './SearchProvider';
import { SearchBox } from './SearchBox';
import { SearchResults } from './SearchResults';
import { UnifiedNavbar } from '@/components/ui/UnifiedNavbar';

const AlgoliaSearchContent: React.FC = () => {
  console.log('AlgoliaSearchContent mounting...');

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Test Algolia</h1>
        
        <div className="space-y-6">
          <SearchBox />
          <SearchResults />
        </div>
      </main>
    </div>
  );
};

export const AlgoliaSearchDashboard: React.FC = () => {
  console.log('AlgoliaSearchDashboard mounting...');
  
  return (
    <SearchProvider>
      <AlgoliaSearchContent />
    </SearchProvider>
  );
};