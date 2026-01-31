import React from 'react';
import { FileText } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionCV({ cvUrl, cvName, setShowCvModal }) {
  if (!cvUrl) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={FileText} title="Curriculum Vitæ" />

      {/* 1. Bouton "Prévisualiser" */}
      <button
        onClick={() => setShowCvModal(true)}
        className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition transform hover:-translate-y-0.5"
      >
        <FileText className="w-6 h-6" />
        Prévisualiser le CV
      </button>

      {/* 2. Bouton "Télécharger" (Optionnel) */}
      <a
        href={cvUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
        download
      >
        Télécharger
      </a>
    </div>
  );
}