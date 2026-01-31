import React from 'react';
import { GraduationCap } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionFormation({ education }) {
  if (!education?.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={GraduationCap} title="Formation" />
      <div className="space-y-6">
        {education.map((edu, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
            <h3 className="font-bold text-lg text-gray-900">{edu.degree}</h3>
            <p className="text-indigo-600 font-medium">{edu.school}</p>
            <p className="text-sm text-gray-500">{edu.period || `${edu.start} – ${edu.end}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}