// src/pages/Jobs/Entreprises/TechnicalTest/components/Header.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Header = ({ job, navigate, jobId }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tests Techniques</h1>
            <p className="text-gray-600">
              Pour l'offre: <span className="font-semibold">{job?.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/jobs/edit/${jobId}`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Retour à l'offre
        </button>
      </div>
    </div>
  );
};

export default Header;