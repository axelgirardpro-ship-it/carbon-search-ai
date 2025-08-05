import React, { useState, useEffect } from 'react';
import { useSearchBox, useHits } from 'react-instantsearch';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  placeholder = "Rechercher des facteurs d'émission...",
  className = "",
  onFocus,
  onBlur
}) => {
  const { query, refine, clear } = useSearchBox();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { getRecentSearches } = useSearchHistory();

  // Get suggestions from current search results
  const { hits } = useHits();
  const suggestions = React.useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const suggestionSet = new Set<string>();
    hits.slice(0, 10).forEach((hit: any) => {
      // Extract unique terms from various fields
      [hit.Nom, hit.Source, hit.Secteur, hit.Localisation].forEach(field => {
        if (field && typeof field === 'string') {
          // Split by common separators and add partial matches
          const words = field.toLowerCase().split(/[\s,.-]+/);
          words.forEach(word => {
            if (word.length > 2 && word.includes(query.toLowerCase())) {
              suggestionSet.add(field);
            }
          });
        }
      });
    });
    
    return Array.from(suggestionSet).slice(0, 5);
  }, [hits, query]);

  useEffect(() => {
    const loadRecentSearches = async () => {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    };
    loadRecentSearches();
  }, [getRecentSearches]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    refine(value);
    setShowSuggestions(value.length > 0);
  };

  const handleClear = () => {
    clear();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    refine(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (query.length > 0 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    onBlur?.();
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Autocomplete dropdown */}
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
            <CardContent className="p-0">
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 px-2"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="truncate">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className={`p-2 ${suggestions.length > 0 ? 'border-t' : ''}`}>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Recherches récentes
                  </div>
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 px-2"
                      onClick={() => handleSuggestionClick(search)}
                    >
                      <span className="truncate">{search}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Button 
        type="submit" 
        size="lg"
        className="h-12 px-6"
      >
        RECHERCHER
      </Button>
    </div>
  );
};