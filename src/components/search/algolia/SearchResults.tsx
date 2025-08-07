import React from 'react';
import { useHits, useHitsPerPage, usePagination, useSearchBox } from 'react-instantsearch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, Lock, Copy } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PremiumBlur } from '@/components/ui/PremiumBlur';
import { useEmissionFactorAccess } from '@/hooks/useEmissionFactorAccess';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuotaContext } from './SearchProvider';
import ReactMarkdown from 'react-markdown';

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
      <span className="text-sm text-indigo-950 font-montserrat">Résultats par page:</span>
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

interface SortByComponentProps {
  onSortChange: (sortKey: string) => void;
  currentSort: string;
}

const SortByComponent: React.FC<SortByComponentProps> = ({ onSortChange, currentSort }) => {
  const sortOptions = [
    { label: 'Pertinence', value: 'relevance' },
    { label: 'FE croissant', value: 'fe_asc' },
    { label: 'FE décroissant', value: 'fe_desc' },
    { label: 'Plus récent', value: 'date_desc' },
    { label: 'Plus ancien', value: 'date_asc' },
    { label: 'Nom A-Z', value: 'nom_asc' },
    { label: 'Nom Z-A', value: 'nom_desc' },
    { label: 'Source A-Z', value: 'source_asc' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-indigo-950 font-montserrat">Trier par:</span>
      <Select 
        value={currentSort} 
        onValueChange={onSortChange}
      >
        <SelectTrigger className="w-auto min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
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
  const { hits: originalHits } = useHits<AlgoliaHit>();
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [currentSort, setCurrentSort] = React.useState<string>('relevance');
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { hasAccess, shouldBlurPremiumContent, canUseFavorites } = useEmissionFactorAccess();
  const { canExport } = usePermissions();
  const { toast } = useToast();
  const { user } = useAuth();
  const { quotaData, canExport: canExportQuota, incrementExport } = useQuotaContext();

  // Function to sort hits based on current sort option
  const sortHits = React.useCallback((hits: AlgoliaHit[], sortKey: string): AlgoliaHit[] => {
    if (sortKey === 'relevance') return hits; // Keep Algolia's relevance order
    
    return [...hits].sort((a, b) => {
      switch (sortKey) {
        case 'fe_asc':
          return (a.FE || 0) - (b.FE || 0);
        case 'fe_desc':
          return (b.FE || 0) - (a.FE || 0);
        case 'date_desc':
          return (b.Date || 0) - (a.Date || 0);
        case 'date_asc':
          return (a.Date || 0) - (b.Date || 0);
        case 'nom_asc':
          return (a.Nom || '').localeCompare(b.Nom || '', 'fr', { numeric: true, sensitivity: 'base' });
        case 'nom_desc':
          return (b.Nom || '').localeCompare(a.Nom || '', 'fr', { numeric: true, sensitivity: 'base' });
        case 'source_asc':
          return (a.Source || '').localeCompare(b.Source || '', 'fr', { numeric: true, sensitivity: 'base' });
        default:
          return 0;
      }
    });
  }, []);

  // Apply sorting to hits
  const hits = React.useMemo(() => {
    return sortHits(originalHits, currentSort);
  }, [originalHits, currentSort, sortHits]);

  const handleSortChange = (sortKey: string) => {
    setCurrentSort(sortKey);
  };

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

  const handleItemSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === hits.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(hits.map(hit => hit.objectID)));
    }
  };

  const handleCopyToClipboard = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un facteur d'émission.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedResults = hits.filter(hit => selectedItems.has(hit.objectID));
      const headers = [
        "Nom", 
        "Description", 
        "FE", 
        "Unité donnée d'activité", 
        "Source", 
        "Secteur", 
        "Sous-secteur", 
        "Localisation", 
        "Date", 
        "Incertitude", 
        "Périmètre", 
        "Contributeur", 
        "Commentaires"
      ];
      const tsvContent = [
        headers.join("\t"),
        ...selectedResults.map(hit => [
          hit.Nom || '',
          hit.Description || '',
          hit.FE || '',
          hit['Unité donnée d\'activité'] || '',
          hit.Source || '',
          hit.Secteur || '',
          hit['Sous-secteur'] || '',
          hit.Localisation || '',
          hit.Date || '',
          hit.Incertitude || '',
          hit.Périmètre || '',
          hit.Contributeur || '',
          hit.Commentaires || ''
        ].join("\t"))
      ].join("\n");
      
      await navigator.clipboard.writeText(tsvContent);
      
      toast({
        title: "Copié dans le presse-papier",
        description: `${selectedItems.size} élément(s) copié(s). Vous pouvez maintenant les coller dans Excel ou Google Sheets.`,
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la copie dans le presse-papier",
      });
    }
  };

  const handleExport = async () => {
    if (!canExport || !canExportQuota) {
      toast({
        title: "Export non autorisé",
        description: "Limite d'exports atteinte. Veuillez upgrader votre abonnement.",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.size === 0) {
      toast({
        title: "Aucune sélection",
        description: "Veuillez sélectionner au moins un facteur d'émission.",
        variant: "destructive",
      });
      return;
    }

    try {
      await incrementExport();
      
      const selectedResults = hits.filter(hit => selectedItems.has(hit.objectID));
      const csvHeaders = [
        "Nom",
        "Description", 
        "FE",
        "Unité donnée d'activité",
        "Source",
        "Secteur",
        "Sous-secteur",
        "Localisation",
        "Date",
        "Incertitude",
        "Périmètre",
        "Contributeur",
        "Commentaires"
      ];
      
      const csvContent = [
        csvHeaders.join(","),
        ...selectedResults.map(hit => [
          `"${hit.Nom || ''}"`,
          `"${hit.Description || ''}"`,
          hit.FE || '',
          `"${hit['Unité donnée d\'activité'] || ''}"`,
          `"${hit.Source || ''}"`,
          `"${hit.Secteur || ''}"`,
          `"${hit['Sous-secteur'] || ''}"`,
          `"${hit.Localisation || ''}"`,
          hit.Date || '',
          `"${hit.Incertitude || ''}"`,
          `"${hit.Périmètre || ''}"`,
          `"${hit.Contributeur || ''}"`,
          `"${hit.Commentaires || ''}"`
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `facteurs_emissions_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: `${selectedItems.size} facteur(s) d'émission exporté(s)`,
      });
      
      setSelectedItems(new Set());
      
    } catch (error) {
      console.error('Error during export:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export",
        variant: "destructive",
      });
    }
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
          {/* Header avec sélection et export */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.size === hits.length && hits.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-indigo-950 data-[state=checked]:bg-indigo-950 data-[state=checked]:border-indigo-950"
                />
                <span className="text-sm font-medium font-montserrat text-indigo-950">
                  {selectedItems.size === hits.length && hits.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
                </span>
              </div>
              {selectedItems.size > 0 && (
                <Badge variant="secondary">
                  {selectedItems.size} sélectionné{selectedItems.size > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {selectedItems.size > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleCopyToClipboard} variant="outline" className="flex items-center gap-2 font-montserrat">
                  <Copy className="h-4 w-4" />
                  Copier ({selectedItems.size})
                </Button>
                <Button onClick={handleExport} className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-montserrat">
                  <Download className="h-4 w-4" />
                  Exporter ({selectedItems.size})
                </Button>
              </div>
            )}
          </div>

          {/* Header avec contrôles de tri et pagination */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="text-sm text-indigo-950 font-montserrat">
                {hits.length} résultat{hits.length > 1 ? 's' : ''} trouvé{hits.length > 1 ? 's' : ''}
              </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <SortByComponent onSortChange={handleSortChange} currentSort={currentSort} />
              <HitsPerPageComponent />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {hits.map((hit) => {
              const isExpanded = expandedRows.has(hit.objectID);
              const isFav = isFavorite(hit.objectID);
              const canView = hasAccess(hit.Source);
              const shouldBlur = shouldBlurPremiumContent(hit.Source);

              return (
                <Card key={hit.objectID} className="relative overflow-hidden bg-white border border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedItems.has(hit.objectID)}
                          onCheckedChange={() => handleItemSelect(hit.objectID)}
                          className="mt-1 border-indigo-950 data-[state=checked]:bg-indigo-950 data-[state=checked]:border-indigo-950"
                        />
                        <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 
                            className="text-lg font-semibold text-indigo-950 leading-tight cursor-pointer font-montserrat"
                            onClick={() => toggleRowExpansion(hit.objectID)}
                            dangerouslySetInnerHTML={getHighlightedText(hit, 'Nom')}
                          />
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => canUseFavorites() ? handleFavoriteToggle(hit) : undefined}
                              disabled={!canUseFavorites()}
                              className={`${isFav ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'} ${!canUseFavorites() ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={!canUseFavorites() ? "Fonctionnalité disponible uniquement avec le plan Premium" : ""}
                            >
                              {!canUseFavorites() ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                              )}
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
                            <PremiumBlur isBlurred={shouldBlur}>
                              <p className="text-lg font-bold text-indigo-950 font-montserrat">{hit.FE ? (typeof hit.FE === 'number' ? parseFloat(hit.FE.toFixed(4)) : parseFloat(parseFloat(String(hit.FE)).toFixed(4))).toLocaleString('fr-FR') : ''} kgCO₂eq</p>
                            </PremiumBlur>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Unité</span>
                            <PremiumBlur isBlurred={shouldBlur}>
                              <p className="text-sm" dangerouslySetInnerHTML={getHighlightedText(hit, 'Unité donnée d\'activité')} />
                            </PremiumBlur>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Source</span>
                            <PremiumBlur isBlurred={shouldBlur}>
                              <p className="text-sm" dangerouslySetInnerHTML={getHighlightedText(hit, 'Source')} />
                            </PremiumBlur>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          {hit.Périmètre && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Périmètre</span>
                              <PremiumBlur isBlurred={shouldBlur}>
                                <p className="text-sm">{hit.Périmètre}</p>
                              </PremiumBlur>
                            </div>
                          )}
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
                                 <span className="text-sm font-medium text-indigo-950">Description</span>
                                 <PremiumBlur isBlurred={shouldBlur}>
                                   <div className="text-sm mt-1 text-break-words prose prose-sm max-w-none">
                                     <ReactMarkdown 
                                       components={{
                                         a: ({ href, children, ...props }) => (
                                           <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>
                                             {children}
                                           </a>
                                         )
                                       }}
                                     >
                                       {hit.Description}
                                     </ReactMarkdown>
                                   </div>
                                 </PremiumBlur>
                               </div>
                             )}
                             <div>
                               <span className="text-sm font-medium text-indigo-950">Secteur</span>
                               <p className="text-sm mt-1" dangerouslySetInnerHTML={getHighlightedText(hit, 'Secteur')} />
                             </div>
                             {hit.Incertitude && (
                               <div>
                                 <span className="text-sm font-medium text-indigo-950">Incertitude</span>
                                 <PremiumBlur isBlurred={shouldBlur}>
                                   <p className="text-sm mt-1">{hit.Incertitude}</p>
                                 </PremiumBlur>
                               </div>
                             )}
                             {hit.Contributeur && (
                               <div>
                                 <span className="text-sm font-medium text-indigo-950">Contributeur</span>
                                 <PremiumBlur isBlurred={shouldBlur}>
                                   <div className="text-sm mt-1 text-break-words prose prose-sm max-w-none">
                                     <ReactMarkdown 
                                       components={{
                                         a: ({ href, children, ...props }) => (
                                           <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>
                                             {children}
                                           </a>
                                         )
                                       }}
                                     >
                                       {hit.Contributeur}
                                     </ReactMarkdown>
                                   </div>
                                 </PremiumBlur>
                               </div>
                             )}
                             {hit.Commentaires && (
                               <div>
                                 <span className="text-sm font-medium text-indigo-950">Commentaires</span>
                                 <PremiumBlur isBlurred={shouldBlur}>
                                   <div className="text-sm mt-1 text-break-words prose prose-sm max-w-none">
                                     <ReactMarkdown 
                                       components={{
                                         a: ({ href, children, ...props }) => (
                                           <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>
                                             {children}
                                           </a>
                                         )
                                       }}
                                     >
                                       {hit.Commentaires}
                                     </ReactMarkdown>
                                   </div>
                                 </PremiumBlur>
                               </div>
                             )}
                          </div>
                        )}
                        </div>
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