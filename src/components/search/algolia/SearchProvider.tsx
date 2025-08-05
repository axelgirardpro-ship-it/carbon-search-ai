import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Debug: Création du client
console.log('Creating Algolia search client...');
const searchClient = algoliasearch('6BGAS85TYS', 'e06b7614aaff866708fbd2872de90d37');
console.log('Search client created:', searchClient);

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  console.log('SearchProvider mounting...');
  
  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName="emission_factors"
    >
      {children}
    </InstantSearch>
  );
};