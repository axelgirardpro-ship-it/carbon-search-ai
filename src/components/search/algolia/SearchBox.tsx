import React from 'react';
import { useSearchBox } from 'react-instantsearch';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    refine(event.target.value);
  };

  const handleClear = () => {
    clear();
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
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