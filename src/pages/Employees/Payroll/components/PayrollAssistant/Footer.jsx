// src/pages/Employees/Payroll/components/PayrollAssistant/Footer.jsx
import React from 'react';
import { Sparkles, MessageSquare, FileText, Loader2 } from 'lucide-react';

export default function Footer({
  analysis,
  allPayslips,
  chatMessages,
  handleSuggestionClick,
  loadAllPayslips,
  setChatMessages,
  setAnalysis,
  onClose
}) {
  const userQuestionsCount = chatMessages.filter(m => m.type === 'user').length;
  const quickSuggestions = [
    { text: "Quels sont les bulletins en attente ?" },
    { text: "Analyse les coûts de paie par département" },
    { text: "Y a-t-il des anomalies dans les salaires ?" }
  ];

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {analysis ? (
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {allPayslips.length} bulletins analysés
              </span>
              <span className="text-gray-400">•</span>
              <span className="font-medium flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {userQuestionsCount} questions
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">IA active</span>
            </div>
          ) : allPayslips.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="font-medium flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {allPayslips.length} bulletins chargés
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Prêt pour l'analyse IA</span>
            </div>
          ) : (
            <span className="text-gray-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Chargement des données...
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {analysis && (
            <>
              <button
                onClick={() => {
                  const randomSuggestion = quickSuggestions[Math.floor(Math.random() * quickSuggestions.length)];
                  handleSuggestionClick(randomSuggestion);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:shadow-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Nouvelle question
              </button>
              <button
                onClick={() => {
                  setChatMessages([]);
                  setAnalysis(null);
                  loadAllPayslips();
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                Nouvelle analyse
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:shadow-sm transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}