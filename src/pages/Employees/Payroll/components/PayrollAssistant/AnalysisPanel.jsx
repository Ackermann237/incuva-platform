// src/pages/Employees/Payroll/components/PayrollAssistant/AnalysisPanel.jsx
import React from 'react';
import {
  Loader2, AlertCircle, Zap, Sparkles,
  BarChart3, TrendingUp, Lightbulb,
  FileText, PieChart, ShieldAlert, Calculator, Target,
  Calendar, Users, BarChart3 as BarChartIcon
} from 'lucide-react';
import SuggestionCard from './SuggestionCard';

const quickSuggestions = [
  {
    text: "Quels sont les bulletins en attente ?",
    icon: FileText,
    category: "Statut"
  },
  {
    text: "Analyse les coûts de paie par département",
    icon: PieChart,
    category: "Analyse"
  },
  {
    text: "Y a-t-il des anomalies dans les salaires ?",
    icon: ShieldAlert,
    category: "Sécurité"
  },
  {
    text: "Projette les coûts pour le prochain trimestre",
    icon: TrendingUp,
    category: "Prévision"
  },
  {
    text: "Comment optimiser les cotisations ?",
    icon: Calculator,
    category: "Optimisation"
  },
  {
    text: "Quels employés ont le salaire le plus élevé ?",
    icon: TrendingUp,
    category: "Analyse"
  },
  {
    text: "Montre-moi les retards de paiement",
    icon: Calendar,
    category: "Suivi"
  },
  {
    text: "Compare les coûts avec le mois dernier",
    icon: BarChartIcon,
    category: "Comparaison"
  },
  {
    text: "Quelle est la répartition par type de contrat ?",
    icon: Users,
    category: "Répartition"
  },
  {
    text: "Comment réduire les frais de paie ?",
    icon: Target,
    category: "Optimisation"
  }
];

const tabs = [
  { id: 'summary', label: 'Résumé', icon: BarChart3 },
  { id: 'trends', label: 'Tendances', icon: TrendingUp },
  { id: 'recommendations', label: 'Recommandations', icon: Lightbulb },
  { id: 'alerts', label: 'Alertes', icon: AlertCircle }
];

export default function AnalysisPanel({
  loading,
  error,
  analysis,
  activeTab,
  setActiveTab,
  allPayslips,
  analyzeData,
  handleSuggestionClick
}) {
  const renderTabContent = () => {
    const Icon = tabs.find(t => t.id === activeTab)?.icon;

    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Résumé exécutif</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {analysis.summary || 'Aucun résumé disponible'}
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tendances détectées</h3>
            {analysis.trends?.map((trend, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{trend}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommandations</h3>
            {analysis.recommendations?.map((rec, index) => (
              <div key={index} className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{rec}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Alertes</h3>
            {analysis.alerts?.map((alert, index) => (
              <div key={index} className="bg-white border border-red-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{alert}</div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyse des données de paie avec IA...</p>
          <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur d'analyse</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={analyzeData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-6">
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="min-h-[300px]">
            {renderTabContent()}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Questions courantes</h4>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Prêt à analyser</h3>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Analysez vos {allPayslips.length} bulletins de paie avec l'intelligence artificielle pour obtenir des insights précieux.
        </p>
        <button
          onClick={analyzeData}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          disabled={loading}
        >
          <Zap className="w-5 h-5" />
          {loading ? 'Analyse en cours...' : 'Démarrer l\'analyse IA'}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Exemples de questions</h4>
          <div className="space-y-2">
            {quickSuggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                {suggestion.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}