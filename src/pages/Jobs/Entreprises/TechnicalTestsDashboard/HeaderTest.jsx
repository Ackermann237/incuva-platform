// src/pages/Jobs/Entreprises/TechnicalTestsDashboard/HeaderTest.jsx
import React from 'react';
import { Plus, FileText, Users, CheckSquare, Brain, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeaderTest({ statistics, onCreateTest }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tests Techniques</h1>
          <p className="text-gray-600 mt-2">
            Gérez tous vos tests techniques et évaluez les compétences de vos candidats
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/test-results')}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-2 border border-blue-200"
            title="Voir les résultats"
          >
            <BarChart className="w-4 h-4" />
            <span className="hidden sm:inline">Résultats des tests</span>
          </button>

          <button
            onClick={onCreateTest}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer un nouveau test
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tests actifs</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.activeTests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {statistics.draftTests} brouillons
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Candidats évalués</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalCandidates}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Score moyen: {statistics.averageScore.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Questions totales</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {statistics.publicTests} tests publics
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance IA</p>
                <p className="text-3xl font-bold text-gray-900">86%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Tests générés par IA: 12
            </div>
          </div>
        </div>
      )}
    </div>
  );
}