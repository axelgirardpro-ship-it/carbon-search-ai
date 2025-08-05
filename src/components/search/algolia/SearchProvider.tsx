import React, { createContext, useContext } from 'react';
import { InstantSearch } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { useQuotas } from '@/hooks/useQuotas';
import { toast } from 'sonner';

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

// Context pour partager les quotas
const QuotaContext = createContext<ReturnType<typeof useQuotas> | null>(null);

export const useQuotaContext = () => {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error('useQuotaContext must be used within SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  console.log('🔧 SearchProvider with exhaustive cleaning mounting...');
  const quotaHook = useQuotas();
  
  // Wrapper pour intercepter les recherches et décrémenter les quotas
  const quotaAwareSearchClient = {
    ...searchClient,
    search: async (requests: any[]) => {
      // Vérifier si l'utilisateur peut effectuer une recherche
      if (!quotaHook.canSearch) {
        toast.error("Limite de recherche atteinte. Passez à un plan payant pour continuer.");
        return { results: [] };
      }
      
      try {
        const result = await searchClient.search(requests);
        
        // Incrémenter le quota seulement si la recherche a des résultats
        if (result.results && result.results.length > 0 && 'hits' in result.results[0] && result.results[0].hits.length > 0) {
          await quotaHook.incrementSearch();
        }
        
        return result;
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    }
  };
  
  return (
    <QuotaContext.Provider value={quotaHook}>
      <InstantSearch 
        searchClient={quotaAwareSearchClient as any} 
        indexName="emission_factors"
      >
        {children}
      </InstantSearch>
    </QuotaContext.Provider>
  );
};