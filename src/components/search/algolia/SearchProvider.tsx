import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Test simple de connexion Algolia
const searchClient = algoliasearch('6BGAS85TYS', 'e06b7614aaff866708fbd2872de90d37');

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  console.log('SearchProvider mounting...', { searchClient });
  
  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName="emission_factors"
    >
      {children}
    </InstantSearch>
  );
};