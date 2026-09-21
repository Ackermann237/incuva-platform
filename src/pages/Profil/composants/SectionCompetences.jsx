// frontend/src/pages/profil/composant/SectionCompetences.jsx
import React from 'react';
import { Award, Plus } from 'lucide-react';
import TagInput from './TagInput';

const SectionCompetences = ({ profile, formData, isEditing, handleChange, onStartEdit }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Award className="w-7 h-7 text-purple-600" />
        Compétences
      </h2>
      {isEditing ? (
        <TagInput
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="React, Python, Figma, SEO, Management d'équipe..."
          hint="Tapez une compétence puis appuyez sur Entrée ou virgule pour l'ajouter."
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          {profile?.skills?.length > 0 ? (
            profile.skills.map((skill, i) => (
              <span key={i} className="px-5 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full font-medium">
                {skill}
              </span>
            ))
          ) : (
            <button type="button" onClick={onStartEdit} className="flex items-center gap-2 rounded-xl border border-dashed border-purple-300 px-5 py-3 text-purple-600 hover:bg-purple-50">
              <Plus className="w-5 h-5" /> Ajouter mes compétences
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionCompetences;
