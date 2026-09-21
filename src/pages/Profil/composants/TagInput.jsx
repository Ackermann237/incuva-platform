// frontend/src/pages/Profil/composants/TagInput.jsx
// Saisie de listes (compétences, langues) : on tape puis Entrée ou virgule, chaque élément devient une pastille supprimable.
// La valeur reste une chaîne « a, b, c » (format déjà utilisé par le formulaire et converti en liste à l'enregistrement).
import React, { useState } from 'react';
import { X } from 'lucide-react';

const MAX_TAGS = 50;
const MAX_TAG_LENGTH = 60;

const splitTags = (value) => (value || '').split(',').map((s) => s.trim()).filter(Boolean);

export default function TagInput({ name, value, onChange, placeholder, hint }) {
  const [draft, setDraft] = useState('');
  const tags = splitTags(value);

  const emit = (list) => onChange({ target: { name, value: list.join(', ') } });

  const commit = (raw) => {
    const next = [...tags];
    splitTags(raw).forEach((tag) => {
      const exists = next.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (!exists && next.length < MAX_TAGS) next.push(tag.slice(0, MAX_TAG_LENGTH));
    });
    emit(next);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      emit(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-200">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 py-1.5 pl-4 pr-2 text-sm font-medium text-purple-800">
            {tag}
            <button
              type="button"
              onClick={() => emit(tags.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-purple-200"
              aria-label={`Retirer ${tag}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={tags.length ? 'Ajouter...' : placeholder}
          className="min-w-[10rem] flex-1 bg-transparent py-1 outline-none"
          aria-label={placeholder}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">{hint || 'Tapez puis appuyez sur Entrée ou virgule pour ajouter.'}</p>
    </div>
  );
}
