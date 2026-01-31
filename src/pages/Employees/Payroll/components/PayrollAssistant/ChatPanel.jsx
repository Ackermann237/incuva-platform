// src/pages/Employees/Payroll/components/PayrollAssistant/ChatPanel.jsx
import React from 'react';
import {
  ChartPie,
  TrendingUp,
  BarChart3,
  Calculator,
  Target,
  Calendar,
  FileText,
  MessageSquare, Bot
} from 'lucide-react';

import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import SuggestionCard from './SuggestionCard';

const suggestionsByCategory = {
  "Analyse": [
    { text: "Analyse les coûts de paie par département", icon: ChartPie, category: "Analyse" },
    { text: "Quels employés ont le salaire le plus élevé ?", icon: TrendingUp, category: "Analyse" },
    { text: "Compare les coûts avec le mois dernier", icon: BarChart3, category: "Comparaison" }
  ],
  "Optimisation": [
    { text: "Comment optimiser les cotisations ?", icon: Calculator, category: "Optimisation" },
    { text: "Comment réduire les frais de paie ?", icon: Target, category: "Optimisation" }
  ],
  "Prévision": [
    { text: "Projette les coûts pour le prochain trimestre", icon: TrendingUp, category: "Prévision" }
  ],
  "Suivi": [
    { text: "Montre-moi les retards de paiement", icon: Calendar, category: "Suivi" }
  ],
  "Statut": [
    { text: "Quels sont les bulletins en attente ?", icon: FileText, category: "Statut" }
  ]
};

export default function ChatPanel({
  chatMessages,
  chatLoading,
  allPayslips,
  hasDataForChat,
  chatEndRef,
  handleSuggestionClick,
  userInput,
  setUserInput,
  sendMessage,
  chatMessagesCount
}) {
  if (chatMessages.length === 0) {
    return (
      <div className="w-3/5 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6 shadow-md">
              <MessageSquare className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Assistant IA de Paie
            </h3>
            <p className="text-gray-600 max-w-md mb-8">
              Posez-moi des questions sur vos {allPayslips.length} bulletins de paie, statistiques, tendances, ou demandez des recommandations.
            </p>

            <div className="w-full max-w-2xl space-y-6">
              {Object.entries(suggestionsByCategory).map(([category, suggestions]) => (
                suggestions.length > 0 && (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestions.map((suggestion, index) => (
                        <SuggestionCard
                          key={index}
                          suggestion={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 w-full max-w-2xl">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Essayez aussi</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Montre-moi les statistiques globales",
                  "Quelle est l'évolution des coûts ?",
                  "Y a-t-il des erreurs de calcul ?",
                  "Comment améliorer la productivité ?"
                ].map((text, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick({ text })}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ChatInput
          userInput={userInput}
          setUserInput={setUserInput}
          sendMessage={sendMessage}
          chatLoading={chatLoading}
          hasDataForChat={hasDataForChat}
          handleSuggestionClick={handleSuggestionClick}
        />
      </div>
    );
  }

  return (
    <div className="w-3/5 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="space-y-6">
          {chatMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {chatLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                  <span className="text-xs text-gray-500 ml-2">Réflexion en cours...</span>
                </div>
              </div>
            </div>
          )}

          {chatMessagesCount > 2 && !chatLoading && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3">Suggestions contextuelles :</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Peux-tu détailler ?",
                  "Donne-moi des exemples",
                  "Quelles sont les alternatives ?",
                  "Comment mettre en œuvre ?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const lastMessage = chatMessages[chatMessages.length - 1];
                      if (lastMessage.type === 'assistant') {
                        setUserInput(suggestion);
                        setTimeout(() => sendMessage(), 100);
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-full transition-colors border border-blue-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <ChatInput
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        chatLoading={chatLoading}
        hasDataForChat={hasDataForChat}
        handleSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}