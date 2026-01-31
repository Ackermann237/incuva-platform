// frontend/src/pages/profil/composant/SectionExperience.jsx
import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

const SectionExperience = ({ profile, formData, isEditing, handleArrayChange, addItem, removeItem }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Briefcase className="w-7 h-7 text-purple-600" />
        Expérience professionnelle
      </h2>
      {isEditing ? (
        <div className="space-y-4">
          {formData.experience?.map((exp, i) => (
            <div key={i} className="p-5 border rounded-2xl bg-gray-50 grid gap-3">
              <input placeholder="Poste" value={exp.title || ''} onChange={(e) => handleArrayChange('experience', i, 'title', e.target.value)} className="font-medium px-4 py-2 border rounded-xl" />
              <input placeholder="Entreprise" value={exp.company || ''} onChange={(e) => handleArrayChange('experience', i, 'company', e.target.value)} className="px-4 py-2 border rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Début (ex: 2022)" value={exp.start || ''} onChange={(e) => handleArrayChange('experience', i, 'start', e.target.value)} className="px-4 py-2 border rounded-xl" />
                <input type="text" placeholder="Fin (ou Aujourd'hui)" value={exp.end || ''} onChange={(e) => handleArrayChange('experience', i, 'end', e.target.value)} className="px-4 py-2 border rounded-xl" />
              </div>
              <textarea placeholder="Description..." value={exp.description || ''} onChange={(e) => handleArrayChange('experience', i, 'description', e.target.value)} rows="2" className="px-4 py-2 border rounded-xl" />
              <button type="button" onClick={() => removeItem('experience', i)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg">
                Supprimer
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem('experience', { title: '', company: '', start: '', end: '', description: '' })}
            className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-5 py-3 rounded-xl">
            <Plus className="w-5 h-5" /> Ajouter une expérience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profile?.experience?.length > 0 ? profile.experience.map((exp, i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-2xl">
              <h4 className="font-bold">{exp.title}</h4>
              <p className="text-gray-600">{exp.company} • {exp.start} – {exp.end || 'Aujourd\'hui'}</p>
              <p className="text-gray-700 mt-2">{exp.description}</p>
            </div>
          )) : <p className="text-gray-500">Aucune expérience ajoutée</p>}
        </div>
      )}
    </div>
  );
};

export default SectionExperience;