// frontend/src/pages/profil/composant/SidebarContact.jsx
import React from 'react';
import { Mail, Phone, Linkedin, Globe } from 'lucide-react';

const SidebarContact = ({ profile, formData, isEditing, handleChange }) => {
  return (
    <div className="space-y-8">
      {/* Contact */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6">Informations de contact</h3>
        <div className="space-y-5 text-gray-700">
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-purple-600" />
            <span>{profile?.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5 text-purple-600" />
            <span>{profile?.phone || 'Non renseigné'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Linkedin className="w-5 h-5 text-purple-600" />
            {isEditing ? (
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 border rounded-xl"
              />
            ) : profile?.linkedin ? (
              <a href={profile.linkedin} target="_blank" className="text-purple-600 hover:underline">Profil LinkedIn</a>
            ) : (
              <span className="text-gray-500">Non renseigné</span>
            )}
          </div>
        </div>
      </div>

      {/* Langues */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Globe className="w-6 h-6 text-purple-600" /> Langues
        </h3>
        {isEditing ? (
          <input
            type="text"
            name="languages"
            value={formData.languages || ''}
            onChange={handleChange}
            className="w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-purple-200"
            placeholder="Français (natif), Anglais (C1), Espagnol (B2)..."
          />
        ) : (
          <div className="space-y-2">
            {profile?.languages?.length > 0 ? profile.languages.map((lang, i) => (
              <div key={i} className="text-gray-700">{lang}</div>
            )) : <p className="text-gray-500">Aucune langue indiquée</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContact;