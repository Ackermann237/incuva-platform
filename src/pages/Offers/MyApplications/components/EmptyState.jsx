// src/pages/Offers/MyApplications/components/EmptyState.jsx
import React from 'react';
import { Briefcase, AlertCircle } from 'lucide-react';

export default function EmptyState({ type, message, action, actionLabel, navigate }) {
  if (type === 'error') {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{message}</p>
        <button
          onClick={action}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="p-8 text-center">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature trouvée</h3>
        <p className="text-gray-600 mb-4">
          Vous n'avez encore postulé à aucune offre.
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
        >
          Explorer les offres d'emploi
        </button>
      </div>
    );
  }

  // type === 'noResults'
  return (
    <div className="p-8 text-center">
      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature trouvée</h3>
      <p className="text-gray-600 mb-4">
        Aucune candidature ne correspond aux critères de recherche
      </p>
    </div>
  );
}