export interface EmissionFactor {
  id: string;
  nom: string;
  description?: string;
  fe: number;
  unite: string;
  source: string;
  secteur: string;
  categorie: string;
  localisation: string;
  date: string;
  incertitude?: string;
  isFavorite?: boolean;
}

export interface SearchFilters {
  source: string;
  secteur: string;
  categorie: string;
  uniteActivite: string;
  localisation: string;
  anneeRapport: string;
}