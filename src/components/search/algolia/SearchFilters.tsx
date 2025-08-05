import React from 'react';
import { useRefinementList, useCurrentRefinements } from 'react-instantsearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RefinementListProps {
  attribute: string;
  title: string;
  searchable?: boolean;
  limit?: number;
}

const RefinementList: React.FC<RefinementListProps> = ({ 
  attribute, 
  title, 
  searchable = false, 
  limit = 10 
}) => {
  const { items, refine, searchForItems, canToggleShowMore, isShowingMore, toggleShowMore } = 
    useRefinementList({ attribute, limit });

  if (items.length === 0) return null;

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <h3 className="font-medium">{title}</h3>
          <Filter className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {searchable && (
          <input
            type="search"
            placeholder={`Rechercher ${title.toLowerCase()}...`}
            onChange={(e) => searchForItems(e.target.value)}
            className="w-full px-3 py-1 text-sm border rounded-md"
          />
        )}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${attribute}-${item.value}`}
                checked={item.isRefined}
                onCheckedChange={() => refine(item.value)}
              />
              <label
                htmlFor={`${attribute}-${item.value}`}
                className="flex-1 text-sm cursor-pointer flex justify-between"
              >
                <span className={item.isRefined ? 'font-medium' : ''}>{item.label}</span>
                <span className="text-muted-foreground">({item.count})</span>
              </label>
            </div>
          ))}
        </div>
        {canToggleShowMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleShowMore}
            className="w-full"
          >
            {isShowingMore ? 'Voir moins' : 'Voir plus'}
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const SearchFilters: React.FC = () => {
  const { items: currentRefinements, refine: clearRefinement } = useCurrentRefinements();

  const clearAllRefinements = () => {
    currentRefinements.forEach((refinement) => {
      refinement.refinements.forEach((nestedRefinement) => {
        clearRefinement(nestedRefinement);
      });
    });
  };

  return (
    <Card className="bg-filter-bg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">FILTRER PAR :</CardTitle>
          {currentRefinements.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllRefinements}
              className="text-slate-950 hover:text-slate-800"
            >
              <X className="w-4 h-4 mr-1" />
              RÉINITIALISER LES FILTRES
            </Button>
          )}
        </div>
        {currentRefinements.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {currentRefinements.map((refinement) =>
              refinement.refinements.map((nestedRefinement) => (
                <Badge
                  key={`${refinement.attribute}-${nestedRefinement.value}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {nestedRefinement.label}
                  <button
                    onClick={() => clearRefinement(nestedRefinement)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <RefinementList
          attribute="Source"
          title="Source"
          searchable
          limit={15}
        />
        <RefinementList
          attribute="Secteur"
          title="Secteur"
          searchable
          limit={15}
        />
        <RefinementList
          attribute="Sous-secteur"
          title="Sous-secteur"
          searchable
          limit={15}
        />
        <RefinementList
          attribute="Unité donnée d'activité"
          title="Unité"
          searchable
          limit={15}
        />
        <RefinementList
          attribute="Localisation"
          title="Localisation"
          searchable
          limit={15}
        />
        <RefinementList
          attribute="Date"
          title="Date"
          limit={10}
        />
      </CardContent>
    </Card>
  );
};