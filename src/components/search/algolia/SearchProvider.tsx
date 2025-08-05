import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Client Algolia avec nettoyage des paramètres
const rawSearchClient = algoliasearch('6BGAS85TYS', 'e06b7614aaff866708fbd2872de90d37');

// Wrapper pour nettoyer les paramètres avant envoi
const searchClient = {
  ...rawSearchClient,
  search: (requests: any[]) => {
    console.log('Search requests before cleaning:', requests);
    
    // Nettoyer les paramètres invalides
    const cleanedRequests = requests.map(request => {
      if (!request.params) {
        return request;
      }
      
      const cleanedParams = { ...request.params };
      
      // Supprimer tous les paramètres qui commencent par "data-"
      Object.keys(cleanedParams).forEach(key => {
        if (key.startsWith('data-') || key.includes('lov-name')) {
          console.log('Removing invalid parameter:', key);
          delete cleanedParams[key];
        }
      });
      
      return {
        ...request,
        params: cleanedParams
      };
    });
    
    console.log('Search requests after cleaning:', cleanedRequests);
    
    return rawSearchClient.search(cleanedRequests);
  }
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  console.log('SearchProvider with cleaned client mounting...');
  
  return (
    <InstantSearch 
      searchClient={searchClient as any} 
      indexName="emission_factors"
    >
      {children}
    </InstantSearch>
  );
};