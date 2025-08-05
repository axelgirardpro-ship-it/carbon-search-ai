import React from 'react';
import { InstantSearch, Configure } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const searchClient = algoliasearch('6BGAS85TYS', 'e06b7614aaff866708fbd2872de90d37');

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName="emission_factors"
      future={{
        persistHierarchicalRootCount: true,
        preserveSharedStateOnUnmount: true,
      }}
    >
      <Configure
        hitsPerPage={9}
        snippetEllipsisText="..."
        highlightPreTag='<mark class="bg-yellow-200">'
        highlightPostTag="</mark>"
      />
      {children}
    </InstantSearch>
  );
};