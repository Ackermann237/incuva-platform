// src/pages/Jobs/users/TrainingInterview/components/TipsPanel.jsx
import React from 'react';

export default function TipsPanel() {
  const tips = [
    "Prenez votre temps pour répondre, l'entretien n'est pas chronométré",
    "Utilisez des exemples concrets de vos expériences passées",
    "Structurez vos réponses (Situation, Action, Résultat)",
    "N'hésitez pas à poser des questions sur l'entreprise"
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Conseils pour réussir</h3>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-700">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}