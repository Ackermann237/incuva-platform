// frontend/src/pages/profil/composant/SectionPortfolio.jsx
import React from 'react';
import { Trophy, Plus, Trash2, Link, FileText, Upload, Image as ImageIcon } from 'lucide-react';

const SectionPortfolio = ({
    profile, formData, isEditing,
    handleArrayChange, addItem, removeItem,
    handlePortfolioFileUpload, portfolioImageUpload
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Trophy className="w-7 h-7 text-purple-600" />
        Portfolio & Réalisations
      </h2>
      {isEditing ? (
        <div className="space-y-4">
          {formData.portfolio?.map((item, i) => (
            <div key={i} className="grid grid-cols-1 gap-4 p-5 border rounded-2xl bg-gray-50">
              <input
                type="text"
                placeholder="Titre du projet"
                value={item.title || ''}
                onChange={(e) => handleArrayChange('portfolio', i, 'title', e.target.value)}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-300"
              />
              <div className="flex gap-2">
                 <input
                  type="url"
                  placeholder="Lien vers le projet (optionnel)"
                  value={item.link || ''}
                  onChange={(e) => handleArrayChange('portfolio', i, 'link', e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-300"
                />
                <input
                    type="file"
                    accept="image/*, .pdf"
                    onChange={(e) => handlePortfolioFileUpload(e.target.files[0], i)}
                    className="hidden"
                    id={`portfolio-file-upload-${i}`}
                />
                <label
                    htmlFor={`portfolio-file-upload-${i}`}
                    className="flex items-center gap-2 bg-white px-4 py-3 border rounded-xl cursor-pointer hover:bg-gray-100 transition"
                >
                    {portfolioImageUpload[i] ? (
                        <span className="flex items-center gap-2 text-purple-600">
                            <Upload className="w-5 h-5 animate-spin" /> Upload...
                        </span>
                    ) : (
                        <ImageIcon className="w-5 h-5 text-gray-700" />
                    )}
                </label>
                <button
                  type="button"
                  onClick={() => removeItem('portfolio', i)}
                  className="text-red-600 hover:bg-red-50 p-3 rounded-xl transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
               {item.fileName && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" /> Fichier : {item.fileName}
                  </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem('portfolio', { title: '', link: '', fileUrl: '', fileName: '' })}
            className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-5 py-3 rounded-xl transition">
            <Plus className="w-5 h-5" /> Ajouter une réalisation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profile?.portfolio?.length > 0 ? profile.portfolio.map((p, i) => (
            <div key={i} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <h4 className="font-bold text-lg">{p.title}</h4>
              {(p.link || p.fileUrl) && (
                <a
                   href={p.link || p.fileUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-purple-600 hover:underline mt-2"
                >
                  {p.link ? <Link className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {p.link ? 'Voir le projet' : p.fileName || 'Voir le fichier'}
                </a>
              )}
            </div>
          )) : (
            <p className="text-gray-500">Aucun projet ajouté pour le moment</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionPortfolio;