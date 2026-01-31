// src/pages/Employees/Planning/Filters.jsx
import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

export default function Filters({ filters, setFilters }) {
  const [showFilters, setShowFilters] = useState(false);

  const departments = [
    { value: 'all', label: 'Tous les départements' },
    { value: 'sales', label: 'Ventes' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'development', label: 'Développement' },
    { value: 'support', label: 'Support' },
    { value: 'hr', label: 'Ressources Humaines' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Opérations' }
  ];

  const shiftTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'work', label: 'Travail' },
    { value: 'overtime', label: 'Heures supplémentaires' },
    { value: 'vacation', label: 'Congés' },
    { value: 'sick', label: 'Maladie' },
    { value: 'training', label: 'Formation' },
    { value: 'meeting', label: 'Réunion' },
    { value: 'remote', label: 'Télétravail' }
  ];

  const handleReset = () => {
    setFilters({
      department: 'all',
      status: 'all',
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Rechercher un employé, un poste..."
          />
        </div>
      </div>

      {/* Bouton pour afficher/masquer les filtres */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>

        {filters.department !== 'all' || filters.status !== 'all' || filters.search ? (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 transition-all"
          >
            <X className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de shift */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de shift
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {shiftTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut employé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut employé
              </label>
              <select
                value={filters.employeeStatus}
                onChange={(e) => setFilters({ ...filters, employeeStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="on_leave">En congé</option>
                <option value="part_time">Temps partiel</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}