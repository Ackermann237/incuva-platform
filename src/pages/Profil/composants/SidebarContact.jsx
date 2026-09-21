// frontend/src/pages/profil/composant/SidebarContact.jsx
import React from 'react';
import { Mail, Phone, Linkedin, Globe, MapPin, Plus } from 'lucide-react';
import TagInput from './TagInput';

// Un lien n'est affiché que s'il est en http(s) : évite les adresses « javascript: » enregistrées dans un profil
const isSafeUrl = (value) => /^https?:\/\//i.test(value || '');

const SidebarContact = ({ profile, formData, isEditing, handleChange, onStartEdit }) => {
  return (
    <div className="space-y-8">
      {/* Contact */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6">Informations de contact</h3>
        <div className="space-y-5 text-gray-700">
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <span className="break-all">{profile?.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                maxLength={30}
                className="w-full px-4 py-2 border rounded-xl"
              />
            ) : (
              <span>{profile?.phone || 'Non renseigné'}</span>
            )}
          </div>
          {isEditing && (
            <>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  placeholder="Ville (ex. Paris)"
                  maxLength={80}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  placeholder="Pays (ex. FR)"
                  maxLength={80}
                  className="w-full px-4 py-2 border rounded-xl"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-4">
            <Linkedin className="w-5 h-5 text-purple-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                maxLength={300}
                className="w-full px-4 py-2 border rounded-xl"
              />
            ) : isSafeUrl(profile?.linkedin) ? (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Profil LinkedIn</a>
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
          <TagInput
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            placeholder="Français (natif), Anglais (C1)..."
            hint="Ex. « Anglais (C1) », puis Entrée pour ajouter."
          />
        ) : (
          <div className="space-y-2">
            {profile?.languages?.length > 0 ? profile.languages.map((lang, i) => (
              <div key={i} className="text-gray-700">{lang}</div>
            )) : (
              <button type="button" onClick={onStartEdit} className="flex items-center gap-2 rounded-xl border border-dashed border-purple-300 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50">
                <Plus className="w-4 h-4" /> Ajouter mes langues
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarContact;
