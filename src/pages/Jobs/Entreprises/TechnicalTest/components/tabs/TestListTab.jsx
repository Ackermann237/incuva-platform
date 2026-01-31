// src/pages/Jobs/Entreprises/TechnicalTest/components/tabs/TestListTab.jsx
import React from 'react';
import { FileText, Clock, Eye, BarChart, Edit2, Trash2 } from 'lucide-react';

const TestListTab = ({ tests, handlePreviewTest, handleEditTest, handleDeleteTest, navigate }) => {
  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun test technique créé</h3>
        <p className="text-gray-600 mb-6">
          Créez votre premier test technique pour évaluer les candidats
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tests techniques existants</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{test.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {test.questions?.length || 0} questions • {test.duration} min
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                test.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {test.status === 'active' ? 'Actif' : 'Brouillon'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Score de passage: {test.passing_score}%</span>
              </div>

              {test.is_public && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Eye className="w-4 h-4" />
                  <span>Public</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart className="w-4 h-4" />
                <span>
                  {test.candidate_count || 0} candidat{test.candidate_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handlePreviewTest(test)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir
              </button>

              <button
                onClick={() => handleEditTest(test)}
                className="flex-1 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>

              <button
                onClick={() => handleDeleteTest(test.id)}
                className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestListTab;