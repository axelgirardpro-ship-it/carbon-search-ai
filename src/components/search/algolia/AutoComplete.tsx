import React, { useMemo } from 'react';
import { useSearchBox } from 'react-instantsearch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp } from 'lucide-react';

interface AutoCompleteProps {
  visible: boolean;
  onSuggestionClick: (suggestion: string) => void;
  recentSearches?: string[];
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({ 
  visible, 
  onSuggestionClick,
  recentSearches = []
}) => {
  // For now, we'll use a simple suggestion list based on recent searches
  // In a full implementation, you'd want to configure query suggestions in Algolia
  const displaySuggestions = useMemo(() => {
    return []; // Will be populated by recentSearches prop
  }, []);

  if (!visible) return null;

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
      <CardContent className="p-0">
        {displaySuggestions.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Suggestions populaires
            </div>
            {displaySuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-2"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <span className="truncate">{suggestion}</span>
              </Button>
            ))}
          </div>
        )}
        
        {recentSearches.length > 0 && (
          <div className="border-t p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              Recherches récentes
            </div>
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-2"
                onClick={() => onSuggestionClick(search)}
              >
                <span className="truncate">{search}</span>
              </Button>
            ))}
          </div>
        )}
        
        {displaySuggestions.length === 0 && recentSearches.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Aucune suggestion disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
};