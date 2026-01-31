// frontend/src/pages/profil/composant/SaveButtonFixed.jsx
import React from 'react';
import { Save } from 'lucide-react';

const SaveButtonFixed = ({ isEditing, handleSubmit, saving }) => {
  if (!isEditing) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl flex items-center gap-4 hover:shadow-purple-600/50 transition-all disabled:opacity-70"
      >
        {saving ? (
          <>Sauvegarde en cours...</>
        ) : (
          <>
            <Save className="w-7 h-7" />
            Sauvegarder toutes les modifications
          </>
        )}
      </button>
    </div>
  );
};

export default SaveButtonFixed;