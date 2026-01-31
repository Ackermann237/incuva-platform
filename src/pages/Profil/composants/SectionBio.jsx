// frontend/src/pages/profil/composant/SectionBio.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';

const SectionBio = ({ profile, formData, isEditing, handleChange }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Briefcase className="w-7 h-7 text-purple-600" />
        À propos de moi
      </h2>
      {isEditing ? (
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows="5"
          className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none transition"
          placeholder="Parlez de vous, vos motivations, votre parcours professionnel..."
        />
      ) : (
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {profile?.bio || "Aucune description pour le moment. Ajoutez-en une pour vous démarquer !"}
        </p>
      )}
    </div>
  );
};

export default SectionBio;