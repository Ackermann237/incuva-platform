// src/pages/Jobs/Entreprises/TechnicalTest/components/prompting/AdvancedPrompting.jsx
import React from 'react';
import { Type, MessageSquare, X } from 'lucide-react';
import FocusAreas from './FocusAreas';
import PromptExamples from './PromptExamples';

const AdvancedPrompting = ({
  aiPromptConfig,
  setAiPromptConfig,
  newFocusArea,
  setNewFocusArea,
  handleAddFocusArea,
  handleRemoveFocusArea,
  loadExamplePrompt
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Focus areas */}
      <FocusAreas
        aiPromptConfig={aiPromptConfig}
        newFocusArea={newFocusArea}
        setNewFocusArea={setNewFocusArea}
        handleAddFocusArea={handleAddFocusArea}
        handleRemoveFocusArea={handleRemoveFocusArea}
      />

      {/* Prompt personnalisé */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Instructions personnalisées pour l'IA
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rédigez vos propres instructions pour guider l'IA
            </label>
            <textarea
              value={aiPromptConfig.customPrompt}
              onChange={(e) => setAiPromptConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Je veux un test qui se concentre sur les bonnes pratiques de sécurité, l'optimisation des performances et les patterns de design..."
            />
          </div>

          {/* Exemples de prompts */}
          <PromptExamples loadExamplePrompt={loadExamplePrompt} />
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-3">Niveau d'expérience cible</h4>
          <div className="space-y-2">
            {['junior', 'intermediate', 'senior', 'expert'].map((level) => (
              <label key={level} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={aiPromptConfig.experienceLevel === level}
                  onChange={() => setAiPromptConfig(prev => ({ ...prev, experienceLevel: level }))}
                  className="text-blue-600"
                />
                <span className="text-gray-700 capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-3">Style de test</h4>
          <div className="space-y-2">
            {['theoretical', 'practical', 'mixed'].map((style) => (
              <label key={style} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={aiPromptConfig.testStyle === style}
                  onChange={() => setAiPromptConfig(prev => ({ ...prev, testStyle: style }))}
                  className="text-blue-600"
                />
                <span className="text-gray-700 capitalize">
                  {style === 'mixed' ? 'Mixte' : style === 'theoretical' ? 'Théorique' : 'Pratique'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Topics à inclure/exclure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-3">Topics spécifiques à inclure</h4>
          <input
            type="text"
            value={aiPromptConfig.specificTopics}
            onChange={(e) => setAiPromptConfig(prev => ({ ...prev, specificTopics: e.target.value }))}
            placeholder="Ex: React Hooks, State Management, API Design..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-bold text-gray-900 mb-3">Topics à exclure</h4>
          <input
            type="text"
            value={aiPromptConfig.excludeTopics}
            onChange={(e) => setAiPromptConfig(prev => ({ ...prev, excludeTopics: e.target.value }))}
            placeholder="Ex: Legacy code, Bibliothèques obsolètes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Critères d'évaluation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-3">Critères d'évaluation supplémentaires</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={aiPromptConfig.evaluationCriteria.includeComplexityAnalysis}
              onChange={(e) => setAiPromptConfig(prev => ({
                ...prev,
                evaluationCriteria: {
                  ...prev.evaluationCriteria,
                  includeComplexityAnalysis: e.target.checked
                }
              }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Analyse complexité</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={aiPromptConfig.evaluationCriteria.includeBestPractices}
              onChange={(e) => setAiPromptConfig(prev => ({
                ...prev,
                evaluationCriteria: {
                  ...prev.evaluationCriteria,
                  includeBestPractices: e.target.checked
                }
              }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Bonnes pratiques</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={aiPromptConfig.evaluationCriteria.includeErrorHandling}
              onChange={(e) => setAiPromptConfig(prev => ({
                ...prev,
                evaluationCriteria: {
                  ...prev.evaluationCriteria,
                  includeErrorHandling: e.target.checked
                }
              }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Gestion erreurs</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={aiPromptConfig.evaluationCriteria.includeOptimization}
              onChange={(e) => setAiPromptConfig(prev => ({
                ...prev,
                evaluationCriteria: {
                  ...prev.evaluationCriteria,
                  includeOptimization: e.target.checked
                }
              }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Optimisation</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPrompting;