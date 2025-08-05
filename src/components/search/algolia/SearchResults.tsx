import React from 'react';
import { useHits } from 'react-instantsearch';

export const SearchResults: React.FC = () => {
  const { hits } = useHits();

  console.log('SearchResults render:', { hitsLength: hits.length, hits: hits.slice(0, 2) });

  if (hits.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Aucun résultat trouvé - Essayez de taper "acier"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Résultats ({hits.length})</h3>
      {hits.slice(0, 5).map((hit: any) => (
        <div key={hit.objectID} className="p-4 border rounded">
          <h4 className="font-semibold">{hit.Nom}</h4>
          <p>FE: {hit.FE}</p>
          <p>Source: {hit.Source}</p>
        </div>
      ))}
    </div>
  );
};