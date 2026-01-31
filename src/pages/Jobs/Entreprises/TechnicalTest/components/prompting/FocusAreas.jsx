// src/pages/Jobs/Entreprises/TechnicalTest/components/prompting/FocusAreas.jsx
import React from 'react';
import { Type, X } from 'lucide-react';

const FocusAreas = ({
  aiPromptConfig,
  newFocusArea,
  setNewFocusArea,
  handleAddFocusArea,
  handleRemoveFocusArea
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Type className="w-5 h-5 text-blue-600" />
        Domaines de focus spécifiques
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ajouter des domaines de compétence spécifiques
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFocusArea}
              onChange={(e) => setNewFocusArea(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newFocusArea.trim()) {
                  handleAddFocusArea(newFocusArea);
                  setNewFocusArea('');
                }
              }}
              placeholder="Ex: React Hooks, Node.js, MongoDB..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => {
                if (newFocusArea.trim()) {
                  handleAddFocusArea(newFocusArea);
                  setNewFocusArea('');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        </div>

        {aiPromptConfig.focusAreas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domaines sélectionnés:
            </label>
            <div className="flex flex-wrap gap-2">
              {aiPromptConfig.focusAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {area}
                  <button
                    onClick={() => handleRemoveFocusArea(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusAreas;