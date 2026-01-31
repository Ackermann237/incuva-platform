// src/pages/Employees/Absence/Filters.jsx
import React from 'react';

const Filters = ({
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  selectedPeriod,
  setSelectedPeriod,
  selectedDepartment,
  setSelectedDepartment,
  resetFilters,
  absences
}) => {

  // Extraire les départements uniques
  const departments = [...new Set(absences.map(a => a.department).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'absence
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">Tous les types</option>
            <option value="vacation">Congés payés</option>
            <option value="sick">Maladie</option>
            <option value="maternity">Maternité</option>
            <option value="paternity">Paternité</option>
            <option value="training">Formation</option>
            <option value="personal">Personnel</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes périodes</option>
            <option value="this_week">Cette semaine</option>
            <option value="this_month">Ce mois</option>
            <option value="last_3_months">3 derniers mois</option>
            <option value="last_6_months">6 derniers mois</option>
            <option value="this_year">Cette année</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Département
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous départements</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg font-medium transition-all shadow-sm"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;