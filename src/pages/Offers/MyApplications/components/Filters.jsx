// src/pages/Offers/MyApplications/components/Filters.jsx
import React from 'react';
import { Search } from 'lucide-react';

export default function Filters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  showOnlyAccepted,
  setShowOnlyAccepted
}) {
  return (
    <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Barre de recherche */}
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Rechercher par poste, entreprise..."
            />
          </div>
        </div>

        {/* Filtre par statut */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Refusées</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      {/* Option "Afficher uniquement les acceptées" */}
      <div className="mt-4 flex items-center">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={showOnlyAccepted}
              onChange={(e) => setShowOnlyAccepted(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyAccepted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyAccepted ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="ml-3 text-gray-700 font-medium">
            Afficher uniquement les candidatures acceptées
          </span>
        </label>
      </div>
    </div>
  );
}