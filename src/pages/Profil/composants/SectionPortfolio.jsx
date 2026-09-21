// frontend/src/pages/profil/composant/SectionPortfolio.jsx
import React from 'react';
import { Trophy, Plus, Trash2, Link, FileText, Upload, Image as ImageIcon, X } from 'lucide-react';

// Un lien n'est affiché que s'il est en http(s) : évite les adresses « javascript: » enregistrées dans un profil
const isSafeUrl = (value) => /^https?:\/\//i.test(value || '');
const isImage = (item) => item.fileType?.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(item.fileName || item.fileUrl || '');

const SectionPortfolio = ({
    profile, formData, isEditing,
    handleArrayChange, addItem, removeItem,
    handlePortfolioFileUpload, handlePortfolioFileRemove, portfolioImageUpload, onStartEdit
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
                maxLength={120}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-300"
              />
              <div className="flex gap-2">
                 <input
                  type="url"
                  placeholder="Lien vers le projet (optionnel)"
                  value={item.link || ''}
                  onChange={(e) => handleArrayChange('portfolio', i, 'link', e.target.value)}
                  maxLength={300}
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-300"
                />
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.pdf"
                    onChange={(e) => { handlePortfolioFileUpload(e.target.files[0], i); e.target.value = ''; }}
                    disabled={!!portfolioImageUpload[i]}
                    className="hidden"
                    id={`portfolio-file-upload-${i}`}
                />
                <label
                    htmlFor={`portfolio-file-upload-${i}`}
                    title="Joindre une image ou un PDF (10 Mo maximum)"
                    className={`flex items-center gap-2 bg-white px-4 py-3 border rounded-xl transition ${portfolioImageUpload[i] ? 'cursor-wait' : 'cursor-pointer hover:bg-gray-100'}`}
                >
                    {portfolioImageUpload[i] ? (
                        <span className="flex items-center gap-2 text-purple-600">
                            <Upload className="w-5 h-5 animate-pulse" /> Envoi...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-gray-700">
                          <ImageIcon className="w-5 h-5" /> <span className="hidden sm:inline">Joindre un fichier</span>
                        </span>
                    )}
                </label>
                <button
                  type="button"
                  onClick={() => removeItem('portfolio', i)}
                  aria-label="Supprimer cette réalisation"
                  className="text-red-600 hover:bg-red-50 p-3 rounded-xl transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {item.fileUrl && (
                <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
                  {isImage(item) && isSafeUrl(item.fileUrl) ? (
                    <img src={item.fileUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <FileText className="h-8 w-8 flex-shrink-0 text-purple-500" />
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-700">{item.fileName || 'Fichier joint'}</p>
                  <button
                    type="button"
                    onClick={() => handlePortfolioFileRemove(i)}
                    aria-label="Retirer le fichier"
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
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
              {isImage(p) && isSafeUrl(p.fileUrl) && (
                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                  <img src={p.fileUrl} alt={p.title || 'Réalisation'} className="max-h-56 rounded-xl border border-white object-cover shadow-sm" loading="lazy" />
                </a>
              )}
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                {isSafeUrl(p.link) && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-purple-600 hover:underline">
                    <Link className="w-4 h-4" /> Voir le projet
                  </a>
                )}
                {isSafeUrl(p.fileUrl) && !isImage(p) && (
                  <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-purple-600 hover:underline">
                    <FileText className="w-4 h-4" /> {p.fileName || 'Voir le fichier'}
                  </a>
                )}
              </div>
            </div>
          )) : (
            <button type="button" onClick={onStartEdit} className="flex items-center gap-2 rounded-xl border border-dashed border-purple-300 px-5 py-3 text-purple-600 hover:bg-purple-50">
              <Plus className="w-5 h-5" /> Ajouter une réalisation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionPortfolio;
