export interface EmissionFactor {
  id: string;
  nom: string;
  description?: string;
  fe: number;
  uniteActivite: string;
  source: string;
  secteur: string;
  sousSecteur?: string;
  localisation: string;
  date: number;
  incertitude?: string;
  perimetre?: string;
  contributeur?: string;
  commentaires?: string;
  isFavorite?: boolean;
}

export interface SearchFilters {
  source: string;
  secteur: string;
  sousSecteur: string;
  uniteActivite: string;
  localisation: string;
  anneeRapport: string;
}