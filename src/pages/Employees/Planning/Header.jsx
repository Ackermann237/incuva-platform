// src/pages/Employees/Planning/Header.jsx
import React from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  RefreshCw, Loader2, Sparkles, Grid, Table
} from 'lucide-react';

export default function Header({
  viewMode,
  setViewMode,
  currentDate,
  setCurrentDate,
  getStartDate,
  getEndDate,
  onAddShift,
  onRefresh,
  aiGenerating
}) {
  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (viewMode === 'month' || viewMode === 'calendar') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getDisplayDate = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (viewMode === 'week') {
      return `Semaine du ${getStartDate()} au ${getEndDate()}`;
    } else if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      });
    } else if (viewMode === 'calendar') {
      return currentDate.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const viewModes = [
    { id: 'day', label: 'Jour' },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            Planning des employés
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les horaires et les shifts de vos employés
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Boutons de sélection de vue principale */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 hover:border-blue-300'
              }`}
            >
              <Grid className="w-4 h-4" />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                viewMode === 'week' || viewMode === 'day' || viewMode === 'month'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 hover:border-blue-300'
              }`}
            >
              <Table className="w-4 h-4" />
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Contrôles de navigation */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 text-center md:text-left">
              {getDisplayDate()}
            </h2>

            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              Aujourd'hui
            </button>

            {/* Affichage des vues spécifiques pour le mode Tableau */}
            {(viewMode === 'week' || viewMode === 'day' || viewMode === 'month') && (
              <div className="hidden md:flex items-center gap-2 ml-4 border-l pl-4 border-gray-300">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-all"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>

            <button
              onClick={() => {
                // Fonction d'optimisation IA
              }}
              disabled={aiGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {aiGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Optimiser IA
            </button>

            <button
              onClick={onAddShift}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Ajouter un shift
            </button>
          </div>
        </div>

        {/* Menu des vues pour mobile */}
        {(viewMode === 'week' || viewMode === 'day' || viewMode === 'month') && (
          <div className="flex md:hidden items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-1 ${
                  viewMode === mode.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}