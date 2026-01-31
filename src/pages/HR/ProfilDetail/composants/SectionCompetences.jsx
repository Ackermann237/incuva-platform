import React from 'react';
import { Award } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionCompetences({ skills }) {
  if (!skills?.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={Award} title="Compétences" />
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium border border-indigo-200 shadow-sm transition hover:bg-indigo-100"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}