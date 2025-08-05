import React from 'react';
import { useSearchBox, useStats, useHits } from 'react-instantsearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const SearchBox: React.FC = () => {
  const { query, refine } = useSearchBox();
  const { nbHits } = useStats();
  const { hits } = useHits();

  console.log('SearchBox render:', { query, nbHits, hitsLength: hits.length });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            console.log('Search input change:', e.target.value);
            refine(e.target.value);
          }}
          placeholder="Rechercher des facteurs d'émission..."
          className="flex-1 bg-white border-white/20 text-indigo-950 placeholder:text-indigo-950/60 font-montserrat"
        />
        <Button className="bg-slate-950 hover:bg-slate-800 text-white font-montserrat">
          Rechercher
        </Button>
      </div>
      <div className="text-sm text-indigo-950 font-montserrat">
        {nbHits !== undefined ? `${nbHits} résultats` : 'Chargement...'}
      </div>
    </div>
  );
};