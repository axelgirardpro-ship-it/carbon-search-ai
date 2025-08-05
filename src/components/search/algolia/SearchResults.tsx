import React from 'react';
import { useHits } from 'react-instantsearch';

export const SearchResults: React.FC = () => {
  const { hits } = useHits();

  console.log('SearchResults render:', { hits });

  if (hits.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Aucun résultat trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hits.map((hit: any) => (
        <div key={hit.objectID} className="p-4 border rounded">
          <h3 className="font-semibold">{hit.Nom}</h3>
          <p>FE: {hit.FE}</p>
          <p>Source: {hit.Source}</p>
        </div>
      ))}
    </div>
  );
};