// frontend/src/pages/profil/composant/SectionCV.jsx
import React from 'react';
import { FileText, Upload, Check, AlertCircle } from 'lucide-react';

const SectionCV = ({ profile, formData, isEditing, cvInputRef, handleCVUpload, uploadingCv }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <FileText className="w-7 h-7 text-purple-600" />
        Curriculum Vitæ
      </h2>
      {isEditing ? (
        <div>
          <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
          <button
            onClick={() => cvInputRef.current?.click()}
            disabled={uploadingCv}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-xl transition disabled:opacity-70">
            {uploadingCv ? (
                <><Upload className="w-5 h-5 animate-spin" /> Upload en cours...</>
            ) : (
                <><Upload className="w-5 h-5" /> {formData.cvName ? 'Changer mon CV' : 'Téléverser mon CV'}</>
            )}
          </button>
          {formData.cvName && (
            <p className={`mt-4 flex items-center gap-2 ${uploadingCv ? 'text-yellow-600' : 'text-green-600'}`}>
              {uploadingCv ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
               Fichier actuel : {formData.cvName}
            </p>
          )}
        </div>
      ) : profile?.cvUrl ? (
        <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-purple-600 hover:text-purple-800 font-bold transition">
          <FileText className="w-6 h-6" /> Voir mon CV ({profile.cvName})
        </a>
      ) : (
        <p className="text-gray-500 italic">Aucun CV téléversé</p>
      )}
    </div>
  );
};

export default SectionCV;