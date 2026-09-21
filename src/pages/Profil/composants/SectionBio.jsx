// frontend/src/pages/profil/composant/SectionBio.jsx
import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

const MAX_BIO = 2000;

const SectionBio = ({ profile, formData, isEditing, handleChange, onStartEdit }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Briefcase className="w-7 h-7 text-purple-600" />
        À propos de moi
      </h2>
      {isEditing ? (
        <div>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            maxLength={MAX_BIO}
            rows="5"
            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none transition"
            placeholder="Parlez de vous, vos motivations, votre parcours professionnel..."
          />
          <p className="mt-1 text-right text-xs text-gray-400">{(formData.bio || '').length}/{MAX_BIO}</p>
        </div>
      ) : profile?.bio ? (
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
      ) : (
        <button type="button" onClick={onStartEdit} className="flex items-center gap-2 rounded-xl border border-dashed border-purple-300 px-5 py-3 text-purple-600 hover:bg-purple-50">
          <Plus className="w-5 h-5" /> Rédiger ma présentation
        </button>
      )}
    </div>
  );
};

export default SectionBio;
