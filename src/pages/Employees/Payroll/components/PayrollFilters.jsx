// src/pages/Employees/Payroll/components/PayrollFilters.jsx
import React, { useState } from 'react';
import { Filter, Search, X, Calendar, User, FileText } from 'lucide-react';

export default function PayrollFilters({ filters, setFilters, employees }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleReset = () => {
    setFilters({
      employee_id: 'all',
      period_start: '',
      period_end: '',
      status: 'all',
      search: ''
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'paid', label: 'Payé' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'Toutes les méthodes' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'cash', label: 'Espèces' }
  ];

  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const setCurrentMonth = () => {
    const range = getCurrentMonthRange();
    setFilters(prev => ({
      ...prev,
      period_start: range.start,
      period_end: range.end
    }));
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    setFilters(prev => ({
      ...prev,
      period_start: firstDay.toISOString().split('T')[0],
      period_end: lastDay.toISOString().split('T')[0]
    }));
  };

  const setLastThreeMonths = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters(prev => ({
      ...prev,
      period_start: firstDay.toISOString().split('T')[0],
      period_end: lastDay.toISOString().split('T')[0]
    }));
  };

  const hasActiveFilters = () => {
    return filters.employee_id !== 'all' ||
           filters.status !== 'all' ||
           filters.period_start ||
           filters.period_end ||
           filters.search;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Rechercher un employé, un numéro de bulletin..."
          />
        </div>
      </div>

      {/* Boutons de période rapide */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={setCurrentMonth}
          className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Ce mois-ci
        </button>
        <button
          onClick={setLastMonth}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Mois dernier
        </button>
        <button
          onClick={setLastThreeMonths}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          3 derniers mois
        </button>
      </div>

      {/* Contrôles des filtres */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2 transition-all"
          >
            <X className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Employé
              </label>
              <select
                value={filters.employee_id}
                onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Tous les employés</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.candidate_name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                value={filters.payment_method || 'all'}
                onChange={(e) => setFilters({ ...filters, payment_method: e.target.value === 'all' ? '' : e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {paymentMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Période personnalisée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.period_start}
                onChange={(e) => setFilters({ ...filters, period_start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.period_end}
                onChange={(e) => setFilters({ ...filters, period_end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {hasActiveFilters() && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filtres actifs :</h4>
              <div className="flex flex-wrap gap-2">
                {filters.employee_id !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    <User className="w-3 h-3" />
                    {employees.find(e => e.id === filters.employee_id)?.candidate_name || 'Employé'}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <FileText className="w-3 h-3" />
                    {statusOptions.find(s => s.value === filters.status)?.label}
                  </span>
                )}
                {filters.period_start && filters.period_end && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(filters.period_start).toLocaleDateString('fr-FR')} - {new Date(filters.period_end).toLocaleDateString('fr-FR')}
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    <Search className="w-3 h-3" />
                    Recherche : "{filters.search}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}