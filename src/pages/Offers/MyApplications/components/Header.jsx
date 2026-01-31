// src/pages/Offers/MyApplications/components/Header.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';

export default function Header({ navigate }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-blue-600" />
            Mes Candidatures & Entretiens
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos candidatures et préparez-vous aux entretiens
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Voir les offres
        </button>
      </div>
    </div>
  );
}