// frontend/src/pages/profil/composant/SectionCompetences.jsx
import React from 'react';
import { Award } from 'lucide-react';

const SectionCompetences = ({ profile, formData, isEditing, handleChange }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Award className="w-7 h-7 text-purple-600" />
        Compétences
      </h2>
      {isEditing ? (
        <div>
          <input
            type="text"
            name="skills"
            value={formData.skills || ''}
            onChange={handleChange}
            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
            placeholder="React, Python, Figma, SEO, Management d'équipe..."
          />
          <p className="text-sm text-gray-500 mt-2">Séparez les compétences par des virgules</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {profile?.skills?.length > 0 ? (
            profile.skills.map((skill, i) => (
              <span key={i} className="px-5 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full font-medium">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Aucune compétence indiquée</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionCompetences;