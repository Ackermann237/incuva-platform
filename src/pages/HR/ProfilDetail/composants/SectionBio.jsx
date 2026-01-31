import React from 'react';
import { FileText } from 'lucide-react';
import { SectionHeader } from './Helpers';

export default function SectionBio({ bio }) {
  if (!bio) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <SectionHeader icon={FileText} title="À propos" />
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{bio}</p>
    </div>
  );
}