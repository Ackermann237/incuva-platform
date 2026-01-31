// frontend/src/pages/profil/composant/SectionFormation.jsx
import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

const SectionFormation = ({ profile, formData, isEditing, handleArrayChange, addItem, removeItem }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <GraduationCap className="w-7 h-7 text-purple-600" />
        Formation
      </h2>
      {isEditing ? (
        <div className="space-y-4">
          {formData.education?.map((edu, i) => (
            <div key={i} className="p-5 border rounded-2xl bg-gray-50 grid gap-3">
              <input placeholder="Diplôme ou Certification" value={edu.degree || ''} onChange={(e) => handleArrayChange('education', i, 'degree', e.target.value)} className="font-medium px-4 py-2 border rounded-xl" />
              <input placeholder="École ou Organisme" value={edu.school || ''} onChange={(e) => handleArrayChange('education', i, 'school', e.target.value)} className="px-4 py-2 border rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Début (ex: 2020)" value={edu.start || ''} onChange={(e) => handleArrayChange('education', i, 'start', e.target.value)} className="px-4 py-2 border rounded-xl" />
                <input type="text" placeholder="Fin (ou En cours)" value={edu.end || ''} onChange={(e) => handleArrayChange('education', i, 'end', e.target.value)} className="px-4 py-2 border rounded-xl" />
              </div>
              <button type="button" onClick={() => removeItem('education', i)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg">
                Supprimer
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addItem('education', { degree: '', school: '', start: '', end: '' })}
            className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-5 py-3 rounded-xl">
            <Plus className="w-5 h-5" /> Ajouter une formation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profile?.education?.length > 0 ? profile.education.map((edu, i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-2xl">
              <h4 className="font-bold">{edu.degree}</h4>
              <p className="text-gray-600">{edu.school} • {edu.start} – {edu.end || 'En cours'}</p>
            </div>
          )) : <p className="text-gray-500">Aucune formation ajoutée</p>}
        </div>
      )}
    </div>
  );
};

export default SectionFormation;