import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}
export const SearchBar = ({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder = "Rechercher des facteurs d'émissions...",
  className
}: SearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleClear = () => {
    onChange("");
    setShowSuggestions(false);
  };
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSearch();
  };
  return <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative flex">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input value={value} onChange={e => {
          onChange(e.target.value);
          setShowSuggestions(e.target.value.length > 0);
        }} onKeyDown={e => {
          if (e.key === "Enter") {
            onSearch();
            setShowSuggestions(false);
          }
        }} placeholder={placeholder} className="pl-10 pr-10 h-12 text-lg bg-white text-foreground border-white/20 placeholder:text-muted-foreground focus:bg-white" />
          {value && <button onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>}
        </div>
        <Button onClick={onSearch} className="ml-2 h-12 px-6 bg-gray-50 text-violet-950">
          RECHERCHER
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && <div className="absolute top-full left-0 right-16 bg-background border border-border rounded-md shadow-lg z-50 mt-1">
          <div className="p-2 text-sm text-muted-foreground border-b bg-background">
            Suggestions : {suggestions.slice(0, 3).join(", ")}...
          </div>
          <div className="max-h-48 overflow-y-auto bg-background">
            {suggestions.slice(0, 8).map((suggestion, index) => <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="w-full text-left px-3 py-2 hover:bg-muted text-sm text-foreground bg-background">
                {suggestion}
              </button>)}
          </div>
        </div>}
    </div>;
};