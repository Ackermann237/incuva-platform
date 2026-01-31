// src/pages/Jobs/Entreprises/TechnicalTest/components/prompting/PromptingInterface.jsx
import React, { useState } from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import BasicConfig from './BasicConfig';
import AdvancedPrompting from './AdvancedPrompting';

const PromptingInterface = ({
  aiPromptConfig,
  setAiPromptConfig,
  showAdvancedPrompt,
  setShowAdvancedPrompt,
  handleAddFocusArea,
  handleRemoveFocusArea,
  loadExamplePrompt
}) => {
  const [newFocusArea, setNewFocusArea] = useState('');

  return (
    <>
      {/* Configuration de base */}
      <BasicConfig
        aiPromptConfig={aiPromptConfig}
        setAiPromptConfig={setAiPromptConfig}
      />

      {/* Bouton pour afficher/masquer les options avancées */}
      <button
        onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h4 className="font-medium text-gray-900">Options de prompting avancées</h4>
            <p className="text-sm text-gray-600">Donnez des directives spécifiques à l'IA</p>
          </div>
        </div>
        <div className={`transform transition-transform ${showAdvancedPrompt ? 'rotate-180' : ''}`}>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      </button>

      {/* Options avancées */}
      {showAdvancedPrompt && (
        <AdvancedPrompting
          aiPromptConfig={aiPromptConfig}
          setAiPromptConfig={setAiPromptConfig}
          newFocusArea={newFocusArea}
          setNewFocusArea={setNewFocusArea}
          handleAddFocusArea={handleAddFocusArea}
          handleRemoveFocusArea={handleRemoveFocusArea}
          loadExamplePrompt={loadExamplePrompt}
        />
      )}
    </>
  );
};

export default PromptingInterface;