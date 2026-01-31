// src/pages/Jobs/Entreprises/TechnicalTestsDashboard/TestDetailsModal.jsx
import React from 'react';
import { X, Edit2, FileText, Clock, Users, CheckSquare, Code } from 'lucide-react';

export default function TestDetailsModal({ test, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
                <p className="text-gray-600">{test.job_title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Informations générales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium">{test.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score de passage:</span>
                    <span className="font-medium">{test.passing_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{test.questions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points totaux:</span>
                    <span className="font-medium">{test.total_points || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Configuration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test public:</span>
                    <span className={`font-medium ${test.is_public ? 'text-green-600' : 'text-gray-600'}`}>
                      {test.is_public ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouvelle tentative:</span>
                    <span className={`font-medium ${test.allow_retake ? 'text-green-600' : 'text-gray-600'}`}>
                      {test.allow_retake ? 'Autorisée' : 'Interdite'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Résultats:</span>
                    <span className={`font-medium ${test.show_results ? 'text-green-600' : 'text-gray-600'}`}>
                      {test.show_results ? 'Affichés' : 'Masqués'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {test.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">{test.description}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Types de questions</h4>
                <div className="space-y-2">
                  {test.questions?.reduce((acc, q) => {
                    acc[q.type] = (acc[q.type] || 0) + 1;
                    return acc;
                  }, {}) && Object.entries(test.questions?.reduce((acc, q) => {
                    acc[q.type] = (acc[q.type] || 0) + 1;
                    return acc;
                  }, {})).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-600">
                        {type === 'mcq' ? 'Questions à choix multiple' :
                         type === 'coding' ? 'Exercices de code' :
                         type === 'open_ended' ? 'Questions ouvertes' :
                         type === 'true_false' ? 'Vrai/Faux' : type}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu des questions */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu des questions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {test.questions?.slice(0, 5).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-600">
                        {question.type === 'mcq' ? 'QCM' :
                         question.type === 'coding' ? 'Code' :
                         question.type === 'open_ended' ? 'Ouverte' : 'Vrai/Faux'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{question.points || 1} point(s)</span>
                  </div>
                  <p className="text-gray-900 line-clamp-2">{question.question}</p>
                </div>
              ))}
              {test.questions && test.questions.length > 5 && (
                <div className="text-center text-gray-500 text-sm">
                  + {test.questions.length - 5} autres questions...
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Fermer
            </button>
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Modifier le test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}