// src/pages/Jobs/Entreprises/TechnicalTest/components/prompting/BasicConfig.jsx
import React from 'react';
import { Sliders, CheckSquare, Code, FileText } from 'lucide-react';

const BasicConfig = ({ aiPromptConfig, setAiPromptConfig }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-blue-600" />
        Configuration de base
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau de difficulté
          </label>
          <div className="flex gap-2">
            {[
              { value: 'easy', label: 'Débutant' },
              { value: 'medium', label: 'Intermédiaire' },
              { value: 'hard', label: 'Avancé' }
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => setAiPromptConfig(prev => ({ ...prev, difficulty: level.value }))}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  aiPromptConfig.difficulty === level.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de questions
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="30"
              value={aiPromptConfig.number_of_questions}
              onChange={(e) => setAiPromptConfig(prev => ({ ...prev, number_of_questions: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <div className="w-16 text-center">
              <span className="text-lg font-bold text-blue-600">{aiPromptConfig.number_of_questions}</span>
              <div className="text-xs text-gray-500">questions</div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Types de questions
          </label>
          <div className="space-y-2">
            {[
              { id: 'mcq', label: 'Questions à choix multiple', icon: CheckSquare },
              { id: 'coding', label: 'Exercices de code', icon: Code },
              { id: 'open_ended', label: 'Questions ouvertes', icon: FileText }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <label key={type.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={aiPromptConfig.question_types.includes(type.id)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...aiPromptConfig.question_types, type.id]
                        : aiPromptConfig.question_types.filter(t => t !== type.id);
                      setAiPromptConfig(prev => ({ ...prev, question_types: newTypes }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={aiPromptConfig.include_explanations}
              onChange={(e) => setAiPromptConfig(prev => ({ ...prev, include_explanations: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Inclure des explications pour les réponses</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={aiPromptConfig.include_code_exercises}
              onChange={(e) => setAiPromptConfig(prev => ({ ...prev, include_code_exercises: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Inclure des exercices de code pratique</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default BasicConfig;