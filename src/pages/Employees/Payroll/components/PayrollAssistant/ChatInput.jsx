// src/pages/Employees/Payroll/components/PayrollAssistant/ChatInput.jsx
import React from 'react';
import { Send, RefreshCw, Sparkles } from 'lucide-react';

export default function ChatInput({
  userInput,
  setUserInput,
  sendMessage,
  chatLoading,
  hasDataForChat,
  handleSuggestionClick
}) {
  const quickTags = [
    { tag: "Coûts", question: "Quels sont les coûts totaux de paie ?" },
    { tag: "Anomalies", question: "Y a-t-il des anomalies à corriger ?" },
    { tag: "Projections", question: "Quelles sont les projections pour l'année prochaine ?" },
    { tag: "Optimisation", question: "Comment optimiser les charges sociales ?" }
  ];

  const examples = [
    "Montre-moi les bulletins du dernier mois",
    "Quels employés ont le salaire le plus élevé ?",
    "Y a-t-il des retards de paiement ?",
    "Analyse l'évolution des coûts sur 6 mois",
    "Compare les salaires par département"
  ];

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Suggestions rapides :</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {quickTags.map(({ tag, question }, index) => (
              <button
                key={index}
                onClick={() => setUserInput(question)}
                className="px-2 py-1 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-xs rounded border border-gray-300 hover:border-blue-300 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Posez votre question sur la paie (ex: 'Analyse les coûts du dernier trimestre', 'Détecte les anomalies salariales', 'Projette le budget pour l'année prochaine')..."
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm transition-all placeholder-gray-400"
          rows="2"
          disabled={chatLoading || !hasDataForChat}
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <button
            onClick={() => {
              if (userInput.trim()) {
                setUserInput('');
              } else {
                const randomExample = examples[Math.floor(Math.random() * examples.length)];
                handleSuggestionClick({ text: randomExample });
              }
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title={userInput.trim() ? "Effacer" : "Exemple aléatoire"}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || chatLoading || !hasDataForChat}
            className={`p-2 rounded-lg transition-all ${
              userInput.trim() && !chatLoading && hasDataForChat
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-md hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Envoyer le message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const example = examples[Math.floor(Math.random() * examples.length)];
              handleSuggestionClick({ text: example });
            }}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors hover:underline"
            disabled={chatLoading}
          >
            <Sparkles className="w-3 h-3" />
            Exemple de question
          </button>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd>
          <span>pour envoyer</span>
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Shift</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd>
          <span>pour sauter une ligne</span>
        </div>
      </div>
    </div>
  );
}