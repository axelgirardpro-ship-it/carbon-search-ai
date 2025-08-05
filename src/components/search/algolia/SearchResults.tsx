import React from 'react';
import { useHits, useHitsPerPage, usePagination } from 'react-instantsearch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { PremiumBlur } from '@/components/ui/PremiumBlur';
import { useEmissionFactorAccess } from '@/hooks/useEmissionFactorAccess';

interface AlgoliaHit {
  objectID: string;
  Nom: string;
  Description: string;
  FE: number;
  'Unité activité': string;
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

const PaginationComponent: React.FC = () => {
  const { pages, currentRefinement, nbPages, isFirstPage, isLastPage, refine } = usePagination();

  if (nbPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => refine(currentRefinement - 1)}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>
      
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentRefinement ? "default" : "outline"}
            size="sm"
            onClick={() => refine(page)}
            className="w-10"
          >
            {page + 1}
          </Button>
        ))}
      </div>

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

export const SearchResults: React.FC = () => {
  const { hits } = useHits<AlgoliaHit>();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { hasAccess, getSourceLabel } = useEmissionFactorAccess();
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

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
    const highlight = hit._highlightResult?.[attribute];
    if (highlight?.value) {
      return { __html: highlight.value };
    }
    return { __html: hit[attribute as keyof AlgoliaHit] || '' };
  };

  if (!hits.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun résultat trouvé pour votre recherche.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec hits per page */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {hits.length} résultat{hits.length > 1 ? 's' : ''} trouvé{hits.length > 1 ? 's' : ''}
        </div>
        <HitsPerPageComponent />
      </div>

      {/* Results */}
      <div className="space-y-4">
      {hits.map((hit) => {
        const isExpanded = expandedRows.has(hit.objectID);
        const isItemFavorite = isFavorite(hit.objectID);
        const shouldBlur = !hasAccess(hit.Source);

        return (
          <Card key={hit.objectID} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 
                      className="font-semibold text-lg"
                      dangerouslySetInnerHTML={getHighlightedText(hit, 'Nom')}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const emissionFactor = {
                          id: hit.objectID,
                          nom: hit.Nom,
                          description: hit.Description,
                          fe: hit.FE,
                          uniteActivite: hit['Unité activité'],
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
                          removeFromFavorites(hit.objectID);
                        } else {
                          addToFavorites(emissionFactor);
                        }
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isItemFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(hit.objectID)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{hit.Source}</Badge>
                    <Badge variant="outline">{hit.Secteur}</Badge>
                  </div>
                </div>

                <PremiumBlur isBlurred={shouldBlur}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Facteur d'émission:</span>
                      <p className="font-semibold">{hit.FE} {hit['Unité activité']}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Localisation:</span>
                      <p dangerouslySetInnerHTML={getHighlightedText(hit, 'Localisation')} />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Date:</span>
                      <p>{hit.Date}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Sous-secteur:</span>
                      <p>{hit['Sous-secteur'] || '-'}</p>
                    </div>
                  </div>

                  {hit.Description && (
                    <div className="mt-4">
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <p 
                        className="mt-1 text-sm"
                        dangerouslySetInnerHTML={getHighlightedText(hit, 'Description')}
                      />
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {hit.Incertitude && (
                          <div>
                            <span className="font-medium text-muted-foreground">Incertitude:</span>
                            <p>{hit.Incertitude}</p>
                          </div>
                        )}
                        {hit.Périmètre && (
                          <div>
                            <span className="font-medium text-muted-foreground">Périmètre:</span>
                            <p>{hit.Périmètre}</p>
                          </div>
                        )}
                        {hit.Contributeur && (
                          <div>
                            <span className="font-medium text-muted-foreground">Contributeur:</span>
                            <p>{hit.Contributeur}</p>
                          </div>
                        )}
                      </div>
                      {hit.Commentaires && (
                        <div>
                          <span className="font-medium text-muted-foreground">Commentaires:</span>
                          <p className="mt-1 text-sm">{hit.Commentaires}</p>
                        </div>
                      )}
                    </div>
                  )}
                </PremiumBlur>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      {/* Pagination */}
      <PaginationComponent />
    </div>
  );
};