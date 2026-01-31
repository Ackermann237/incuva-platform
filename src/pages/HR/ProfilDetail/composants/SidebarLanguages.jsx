import React from 'react';
import { Globe } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SidebarLanguages({ languages }) {
  if (!languages?.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={Globe} title="Langues parlées" />
      <div className="space-y-3">
        {languages.map((lang, i) => (
          <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-800">{lang.language}</span>
            <span className="text-indigo-600 font-semibold">{lang.level || "Non précisé"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}