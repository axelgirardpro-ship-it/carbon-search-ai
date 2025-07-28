import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export interface Filters {
  source: string;
  secteur: string;
  categorie: string;
  uniteActivite: string;
  localisation: string;
  anneeRapport: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onResetFilters: () => void;
}

export const FilterPanel = ({ filters, onFilterChange, onResetFilters }: FilterPanelProps) => {
  const filterOptions = {
    source: ["Base Impacts 3.0", "ADEME", "GHG Protocol", "EPA"],
    secteur: ["Énergie", "Transport", "Industrie", "Bâtiment", "Agriculture"],
    categorie: ["Matériaux", "Combustibles", "Électricité", "Transport"],
    uniteActivite: ["kgCO2e/kg", "kgCO2e/m3", "kgCO2e/kWh", "kgCO2e/km"],
    localisation: ["Europe", "France", "Allemagne", "Monde"],
    anneeRapport: ["2023", "2022", "2021", "2020", "2019"]
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="bg-filter-bg p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">FILTRER PAR :</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-primary hover:text-primary/80"
          >
            <X className="w-4 h-4 mr-1" />
            RÉINITIALISER LES FILTRES
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Select value={filters.source} onValueChange={(value) => onFilterChange("source", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.source.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.secteur} onValueChange={(value) => onFilterChange("secteur", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.secteur.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.categorie} onValueChange={(value) => onFilterChange("categorie", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.categorie.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.uniteActivite} onValueChange={(value) => onFilterChange("uniteActivite", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Unité donnée activité" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.uniteActivite.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.localisation} onValueChange={(value) => onFilterChange("localisation", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Localisation" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.localisation.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.anneeRapport} onValueChange={(value) => onFilterChange("anneeRapport", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Année de rapport" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.anneeRapport.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};