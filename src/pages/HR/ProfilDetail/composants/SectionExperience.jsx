import React from 'react';
import { Briefcase } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionExperience({ experience }) {
  if (!experience?.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={Briefcase} title="Expérience professionnelle" />
      <div className="space-y-8">
        {experience.map((exp, i) => (
          <div key={i} className="relative pl-8">
            {/* Ligne de temps visuelle */}
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white shadow-md"></div>
            <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-indigo-200"></div>

            <h3 className="font-extrabold text-xl text-gray-900">{exp.title}</h3>
            <p className="text-indigo-600 font-semibold mt-1">{exp.company}</p>
            <p className="text-sm text-gray-500 mt-1">
              {exp.start} – {exp.end || "Aujourd'hui"}
            </p>
            {exp.description && (
              <p className="text-gray-700 mt-3">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}