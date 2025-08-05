import React from 'react';
import { useRefinementList, useClearRefinements, useToggleRefinement, useRange } from 'react-instantsearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { X, Filter, RotateCcw } from 'lucide-react';
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

const ClearRefinementsWidget: React.FC = () => {
  const { canRefine, refine } = useClearRefinements();
  
  if (!canRefine) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={refine}
      className="text-slate-950 hover:text-slate-800"
    >
      <RotateCcw className="w-4 h-4 mr-1" />
      RÉINITIALISER LES FILTRES
    </Button>
  );
};

const RecentDataToggle: React.FC = () => {
  const { value, refine } = useToggleRefinement({
    attribute: 'Date',
    on: [2022, 2023, 2024, 2025]
  });

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
      <Switch
        checked={value.isRefined}
        onCheckedChange={() => refine(value)}
        id="recent-data"
      />
      <label htmlFor="recent-data" className="text-sm font-medium cursor-pointer">
        Données récentes (&lt; 3 ans)
      </label>
    </div>
  );
};

const FERangeInput: React.FC = () => {
  const { start, range, canRefine, refine } = useRange({
    attribute: 'FE'
  });

  const [min, setMin] = React.useState(start?.[0]?.toString() || '');
  const [max, setMax] = React.useState(start?.[1]?.toString() || '');

  const handleSubmit = () => {
    const minValue = min === '' ? undefined : parseFloat(min);
    const maxValue = max === '' ? undefined : parseFloat(max);
    refine([minValue, maxValue]);
  };

  const handleReset = () => {
    setMin('');
    setMax('');
    refine([undefined, undefined]);
  };

  if (!canRefine) return null;

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <h3 className="font-medium">Facteur d'émission (FE)</h3>
          <Filter className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-2">
        <div className="text-xs text-muted-foreground">
          Plage: {range?.min?.toLocaleString()} à {range?.max?.toLocaleString()}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Min</label>
            <Input
              type="number"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              onBlur={handleSubmit}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Max</label>
            <Input
              type="number"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              onBlur={handleSubmit}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleSubmit} className="flex-1">
            Appliquer
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const SearchFilters: React.FC = () => {

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">FILTRER PAR :</CardTitle>
          <ClearRefinementsWidget />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <RecentDataToggle />
        <FERangeInput />
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