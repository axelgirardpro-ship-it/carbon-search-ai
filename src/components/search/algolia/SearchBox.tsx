import React from 'react';
import { useSearchBox, useStats } from 'react-instantsearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const SearchBox: React.FC = () => {
  const { query, refine } = useSearchBox();
  const { nbHits } = useStats();

  console.log('SearchBox render:', { query, nbHits });

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => refine(e.target.value)}
        placeholder="Rechercher des facteurs d'émission..."
        className="flex-1"
      />
      <Button>Rechercher</Button>
      {nbHits !== undefined && (
        <span className="text-sm text-muted-foreground">
          {nbHits} résultats
        </span>
      )}
    </div>
  );
};