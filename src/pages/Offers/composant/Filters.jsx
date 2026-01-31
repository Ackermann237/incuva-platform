import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { Select, Checkbox, RangeSlider, ToggleButtonGroup } from './FormComponents'; // Import des components de formulaire
import { DEFAULT_FILTERS } from '../OffersAvailable'; // Import des valeurs par défaut

export default function Filters({
  filters,
  handleFilterChange,
  sectors,
  handleSectorToggle,
  resetFilters,
  showFilters,
  setShowFilters,
  jobs,
}) {
  // Nombre de filtres actifs
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) =>
    key !== "view" && key !== "salaryMin" && key !== "salaryMax" && val && val.length > 0
  ).length;

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Champ de recherche */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une offre, une entreprise ou un mot-clé..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Boutons de contrôle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm relative"
          >
            <SlidersHorizontal size={18} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Boutons toggle pour la vue */}
          <ToggleButtonGroup
            value={filters.view}
            onChange={(value) => handleFilterChange("view", value)}
            options={[
              { value: "grid", icon: <LayoutGrid size={18} /> },
              { value: "list", icon: <List size={18} /> }
            ]}
            className="bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Filtres avancés (dépliant) */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtre par localisation */}
            <Select
              label="Localisation"
              value={filters.location}
              onChange={(value) => handleFilterChange("location", value)}
              options={[
                { value: "", label: "Toutes" },
                ...[...new Set(jobs.map(job => job.location))].map(location => ({
                  value: location,
                  label: location
                }))
              ]}
            />

            {/* Filtre par date */}
            <Select
              label="Date de publication"
              value={filters.date}
              onChange={(value) => handleFilterChange("date", value)}
              options={[
                { value: "all", label: "Toutes les dates" },
                { value: "week", label: "7 derniers jours" },
                { value: "month", label: "30 derniers jours" },
                { value: "quarter", label: "3 derniers mois" }
              ]}
            />

            {/* Filtre par salaire */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Salaire (€)</p>
              <RangeSlider
                min={DEFAULT_FILTERS.salaryMin}
                max={DEFAULT_FILTERS.salaryMax}
                value={[filters.salaryMin, filters.salaryMax]}
                onChange={([min, max]) => {
                  handleFilterChange("salaryMin", min);
                  handleFilterChange("salaryMax", max);
                }}
              />
            </div>

            {/* Filtre par secteur */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Secteurs</p>
              <div className="space-y-2">
                {sectors.map(sector => (
                  <Checkbox
                    key={sector}
                    checked={filters.sectors.includes(sector)}
                    onChange={() => handleSectorToggle(sector)}
                    label={sector}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X size={16} />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
}