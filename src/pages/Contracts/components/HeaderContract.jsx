// src/pages/Contracts/components/HeaderContract.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HeaderContract({ navigate }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-white rounded-lg transition-all hover:scale-110 hover:shadow-sm"
      >
        <ArrowLeft className="w-6 h-6 text-blue-600" />
      </button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Créer un contrat</h1>
        <p className="text-gray-600">
          Générez et envoyez un contrat à signer électroniquement
        </p>
      </div>
    </div>
  );
}