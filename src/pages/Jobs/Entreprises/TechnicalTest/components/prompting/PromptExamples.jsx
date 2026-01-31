// src/pages/Jobs/Entreprises/TechnicalTest/components/prompting/PromptExamples.jsx
import React from 'react';

const PromptExamples = ({ loadExamplePrompt }) => {
  const examples = [
    { id: 'practical', label: 'Test pratique' },
    { id: 'theoretical', label: 'Test théorique' },
    { id: 'mixed', label: 'Mixte' },
    { id: 'senior', label: 'Niveau senior' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Exemples rapides de prompts
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => loadExamplePrompt(example.id)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm text-center"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptExamples;