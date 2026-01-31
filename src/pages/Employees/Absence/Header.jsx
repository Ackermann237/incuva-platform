// src/pages/Employees/Absence/Header.jsx
import React from 'react';
import { Calendar, Filter, Plus, Search } from 'lucide-react';

const Header = ({
  showFilters,
  setShowFilters,
  setShowAbsenceModal,
  setEditingAbsence,
  resetNewAbsence,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            Gestion des absences
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez et gérez les congés et absences de vos employés
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
          </button>
          <button
            onClick={() => {
              setEditingAbsence(null);
              resetNewAbsence();
              setShowAbsenceModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle absence
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          placeholder="Rechercher par nom, poste, raison..."
        />
      </div>
    </div>
  );
};

export default Header;