// src/pages/Jobs/Entreprises/TechnicalTest/components/tabs/AITestTab.jsx
import React, { useState } from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import PromptingInterface from '../prompting/PromptingInterface';

const AITestTab = ({
  aiPromptConfig,
  setAiPromptConfig,
  job,
  generatingAI,
  handleGenerateAITest,
  handleAddFocusArea,
  handleRemoveFocusArea,
  loadExamplePrompt
}) => {
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Générer un test avec l'IA</h2>
          <p className="text-gray-600 mt-1">
            L'IA analysera votre offre et générera un test technique personnalisé selon vos directives
          </p>
        </div>
      </div>

      {job && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Offre d'emploi analysée :</h3>
          <div className="space-y-2">
            <p className="text-blue-800"><span className="font-medium">Titre :</span> {job.title}</p>
            <p className="text-blue-800"><span className="font-medium">Compétences :</span> {job.required_skills?.join(', ') || 'Non spécifiées'}</p>
            {job.description && (
              <p className="text-blue-800 text-sm line-clamp-2">
                <span className="font-medium">Description :</span> {job.description.substring(0, 200)}...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interface de prompting */}
      <PromptingInterface
        aiPromptConfig={aiPromptConfig}
        setAiPromptConfig={setAiPromptConfig}
        showAdvancedPrompt={showAdvancedPrompt}
        setShowAdvancedPrompt={setShowAdvancedPrompt}
        handleAddFocusArea={handleAddFocusArea}
        handleRemoveFocusArea={handleRemoveFocusArea}
        loadExamplePrompt={loadExamplePrompt}
      />

      {/* Bouton de génération */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-gray-900">Résumé de la configuration</h4>
            <p className="text-sm text-gray-600">
              {aiPromptConfig.number_of_questions} questions • {aiPromptConfig.difficulty} •
              {aiPromptConfig.question_types.map(t =>
                t === 'mcq' ? ' QCM' : t === 'coding' ? ' Code' : ' Ouvertes'
              ).join(', ')}
            </p>
          </div>
          <button
            onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAdvancedPrompt ? 'Masquer les options' : 'Plus d\'options'}
          </button>
        </div>

        <button
          onClick={handleGenerateAITest}
          disabled={generatingAI || aiPromptConfig.question_types.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {generatingAI ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Générer le test avec l'IA</span>
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 text-center mt-3">
          L'IA analysera votre offre et vos directives pour créer un test personnalisé que vous pourrez modifier
        </p>
      </div>
    </div>
  );
};

export default AITestTab;