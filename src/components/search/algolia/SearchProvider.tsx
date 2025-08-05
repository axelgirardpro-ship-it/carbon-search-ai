import React from 'react';
import { InstantSearch } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Client Algolia avec nettoyage exhaustif des paramètres
const rawSearchClient = algoliasearch('6BGAS85TYS', 'e06b7614aaff866708fbd2872de90d37');

// Liste des paramètres valides Algolia
const VALID_ALGOLIA_PARAMS = [
  'query', 'queryType', 'typoTolerance', 'minWordSizefor1Typo', 'minWordSizefor2Typos',
  'allowTyposOnNumericTokens', 'ignorePlurals', 'disableTypoToleranceOnAttributes',
  'attributesToIndex', 'attributesToRetrieve', 'unretrievableAttributes', 'optionalWords',
  'attributesToHighlight', 'attributesToSnippet', 'highlightPreTag', 'highlightPostTag',
  'snippetEllipsisText', 'restrictHighlightAndSnippetArrays', 'hitsPerPage', 'page',
  'offset', 'length', 'minProximity', 'getRankingInfo', 'clickAnalytics', 'analytics',
  'analyticsTags', 'synonyms', 'replaceSynonymsInHighlight', 'minProximity', 'responseFields',
  'maxValuesPerFacet', 'sortFacetValuesBy', 'facets', 'maxFacetHits', 'attributesToRetrieve',
  'facetFilters', 'filters', 'numericFilters', 'tagFilters', 'sumOrFiltersScores',
  'restrictSearchableAttributes', 'facetingAfterDistinct', 'aroundLatLng', 'aroundLatLngViaIP',
  'aroundRadius', 'aroundPrecision', 'minimumAroundRadius', 'insideBoundingBox', 'insidePolygon',
  'naturalLanguages', 'ruleContexts', 'personalizationImpact', 'userToken', 'enablePersonalization',
  'distinct', 'attributeForDistinct', 'customRanking', 'ranking', 'relevancyStrictness'
];

// Wrapper pour nettoyer agressivement les paramètres
const searchClient = {
  ...rawSearchClient,
  search: (requests: any[]) => {
    console.log('🔍 Original search requests:', requests);
    
    const cleanedRequests = requests.map((request, index) => {
      if (!request.params) {
        return request;
      }
      
      const originalParams = { ...request.params };
      const cleanedParams: any = {};
      
      // Ne garder que les paramètres valides Algolia
      Object.keys(originalParams).forEach(key => {
        if (VALID_ALGOLIA_PARAMS.includes(key)) {
          cleanedParams[key] = originalParams[key];
        } else {
          console.log(`❌ Removing invalid parameter from request ${index}:`, key, '=', originalParams[key]);
        }
      });
      
      const cleanedRequest = {
        ...request,
        params: cleanedParams
      };
      
      console.log(`✅ Cleaned request ${index}:`, cleanedRequest);
      return cleanedRequest;
    });
    
    console.log('🚀 Final cleaned requests sent to Algolia:', cleanedRequests);
    
    return rawSearchClient.search(cleanedRequests);
  }
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  console.log('🔧 SearchProvider with exhaustive cleaning mounting...');
  
  return (
    <InstantSearch 
      searchClient={searchClient as any} 
      indexName="emission_factors"
    >
      {children}
    </InstantSearch>
  );
};