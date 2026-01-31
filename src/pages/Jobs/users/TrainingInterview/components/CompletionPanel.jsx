// src/pages/Jobs/users/TrainingInterview/components/CompletionPanel.jsx
import React from 'react';
import { Award, Download } from 'lucide-react';

export default function CompletionPanel({ navigate }) {
  return (
    <div className="p-8 text-center border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Simulation terminée !
        </h3>
        <p className="text-gray-600 mb-6">
          Vous avez complété la simulation d'entretien. Consultez votre performance
          dans le panneau de droite pour voir vos scores détaillés.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/my-applications')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Retour aux candidatures
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
            <Download className="w-4 h-4 inline mr-2" />
            Télécharger le rapport
          </button>
        </div>
      </div>
    </div>
  );
}