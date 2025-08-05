import React from 'react';
import { useHits, useHitsPerPage, usePagination, useSortBy, useSearchBox } from 'react-instantsearch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { PremiumBlur } from '@/components/ui/PremiumBlur';
import { useEmissionFactorAccess } from '@/hooks/useEmissionFactorAccess';

interface AlgoliaHit {
  objectID: string;
  Nom: string;
  Description: string;
  FE: number;
  'Unité donnée d\'activité': string;
  Source: string;
  Secteur: string;
  'Sous-secteur': string;
  Localisation: string;
  Date: number;
  Incertitude: string;
  Périmètre: string;
  Contributeur: string;
  Commentaires: string;
  _highlightResult?: any;
}

const HitsPerPageComponent: React.FC = () => {
  const { items, refine } = useHitsPerPage({
    items: [
      { label: '9 par page', value: 9, default: true },
      { label: '18 par page', value: 18 },
      { label: '36 par page', value: 36 },
    ],
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Résultats par page:</span>
      <Select value={String(items.find(item => item.isRefined)?.value || 9)} onValueChange={(value) => refine(Number(value))}>
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const SortByComponent: React.FC = () => {
  const { options, refine, currentRefinement } = useSortBy({
    items: [
      { label: 'Pertinence', value: 'emission_factors' },
      { label: 'FE croissant', value: 'emission_factors_fe_asc' },
      { label: 'FE décroissant', value: 'emission_factors_fe_desc' },
      { label: 'Plus récent', value: 'emission_factors_date_desc' },
      { label: 'Plus ancien', value: 'emission_factors_date_asc' },
      { label: 'Nom A-Z', value: 'emission_factors_nom_asc' },
      { label: 'Nom Z-A', value: 'emission_factors_nom_desc' },
      { label: 'Source A-Z', value: 'emission_factors_source_asc' },
    ],
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Trier par:</span>
      <Select 
        value={currentRefinement || 'emission_factors'} 
        onValueChange={(value) => refine(value)}
      >
        <SelectTrigger className="w-auto min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const PaginationComponent: React.FC = () => {
  const { currentRefinement, nbPages, refine, isFirstPage, isLastPage } = usePagination();

  if (nbPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(0, currentRefinement - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(nbPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => refine(currentRefinement - 1)}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>

      {startPage > 0 && (
        <>
          <Button
            variant={0 === currentRefinement ? "default" : "outline"}
            size="sm"
            onClick={() => refine(0)}
          >
            1
          </Button>
          {startPage > 1 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentRefinement ? "default" : "outline"}
          size="sm"
          onClick={() => refine(page)}
        >
          {page + 1}
        </Button>
      ))}

      {endPage < nbPages - 1 && (
        <>
          {endPage < nbPages - 2 && <span className="px-2">...</span>}
          <Button
            variant={nbPages - 1 === currentRefinement ? "default" : "outline"}
            size="sm"
            onClick={() => refine(nbPages - 1)}
          >
            {nbPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => refine(currentRefinement + 1)}
        disabled={isLastPage}
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const StateResults: React.FC = () => {
  const { query } = useSearchBox();
  const { hits } = useHits<AlgoliaHit>();

  if (hits.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
        <p className="text-muted-foreground mb-4">
          Nous n'avons trouvé aucun facteur d'émission pour "{query}"
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Suggestions :</p>
          <ul className="mt-2 space-y-1">
            <li>• Vérifiez l'orthographe de votre recherche</li>
            <li>• Essayez des termes plus généraux</li>
            <li>• Utilisez moins de filtres</li>
          </ul>
        </div>
      </div>
    );
  }

  if (hits.length === 0 && !query) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Commencez votre recherche</h3>
        <p className="text-muted-foreground">
          Utilisez la barre de recherche ou les filtres pour explorer notre base de données
        </p>
      </div>
    );
  }

  return null;
};

export const SearchResults: React.FC = () => {
  const { hits } = useHits<AlgoliaHit>();
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { hasAccess } = useEmissionFactorAccess();

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getHighlightedText = (hit: AlgoliaHit, attribute: string) => {
    if (hit._highlightResult && hit._highlightResult[attribute] && hit._highlightResult[attribute].value) {
      return { __html: hit._highlightResult[attribute].value };
    }
    return { __html: hit[attribute as keyof AlgoliaHit] || '' };
  };

  const handleFavoriteToggle = async (hit: AlgoliaHit) => {
    const emissionFactor = {
      id: hit.objectID,
      nom: hit.Nom,
      description: hit.Description,
      fe: hit.FE,
      uniteActivite: hit['Unité donnée d\'activité'],
      source: hit.Source,
      secteur: hit.Secteur,
      sousSecteur: hit['Sous-secteur'],
      localisation: hit.Localisation,
      date: hit.Date,
      incertitude: hit.Incertitude,
      perimetre: hit.Périmètre,
      contributeur: hit.Contributeur,
      commentaires: hit.Commentaires
    };
    
    if (isFavorite(hit.objectID)) {
      await removeFromFavorites(hit.objectID);
    } else {
      await addToFavorites(emissionFactor);
    }
  };

  return (
    <div className="space-y-6">
      <StateResults />
      
      {hits.length > 0 && (
        <>
          {/* Header avec contrôles de tri et pagination */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {hits.length} résultat{hits.length > 1 ? 's' : ''} trouvé{hits.length > 1 ? 's' : ''}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <SortByComponent />
              <HitsPerPageComponent />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {hits.map((hit) => {
              const isExpanded = expandedRows.has(hit.objectID);
              const isFav = isFavorite(hit.objectID);
              const canView = hasAccess(hit.Source);

              return (
                <Card key={hit.objectID} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 
                            className="text-lg font-semibold text-foreground leading-tight cursor-pointer hover:text-primary"
                            onClick={() => toggleRowExpansion(hit.objectID)}
                            dangerouslySetInnerHTML={getHighlightedText(hit, 'Nom')}
                          />
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFavoriteToggle(hit)}
                              className={`${isFav ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(hit.objectID)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Facteur d'émission</span>
                            <PremiumBlur isBlurred={!canView}>
                              <p className="text-lg font-bold text-primary">{hit.FE?.toLocaleString()} kgCO₂eq</p>
                            </PremiumBlur>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Source</span>
                            <PremiumBlur isBlurred={!canView}>
                              <p className="text-sm" dangerouslySetInnerHTML={getHighlightedText(hit, 'Source')} />
                            </PremiumBlur>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Secteur</span>
                            <p className="text-sm" dangerouslySetInnerHTML={getHighlightedText(hit, 'Secteur')} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{hit.Localisation}</Badge>
                          <Badge variant="outline">{hit.Date}</Badge>
                          {hit['Sous-secteur'] && <Badge variant="secondary">{hit['Sous-secteur']}</Badge>}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            {hit.Description && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Description</span>
                                <PremiumBlur isBlurred={!canView}>
                                  <p className="text-sm mt-1" dangerouslySetInnerHTML={getHighlightedText(hit, 'Description')} />
                                </PremiumBlur>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Unité</span>
                                <PremiumBlur isBlurred={!canView}>
                                  <p className="text-sm mt-1">{hit['Unité donnée d\'activité']}</p>
                                </PremiumBlur>
                              </div>
                              {hit.Périmètre && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Périmètre</span>
                                  <PremiumBlur isBlurred={!canView}>
                                    <p className="text-sm mt-1">{hit.Périmètre}</p>
                                  </PremiumBlur>
                                </div>
                              )}
                              {hit.Incertitude && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Incertitude</span>
                                  <PremiumBlur isBlurred={!canView}>
                                    <p className="text-sm mt-1">{hit.Incertitude}</p>
                                  </PremiumBlur>
                                </div>
                              )}
                              {hit.Contributeur && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Contributeur</span>
                                  <PremiumBlur isBlurred={!canView}>
                                    <p className="text-sm mt-1">{hit.Contributeur}</p>
                                  </PremiumBlur>
                                </div>
                              )}
                            </div>
                            {hit.Commentaires && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Commentaires</span>
                                <PremiumBlur isBlurred={!canView}>
                                  <p className="text-sm mt-1">{hit.Commentaires}</p>
                                </PremiumBlur>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <PaginationComponent />
        </>
      )}
    </div>
  );
};