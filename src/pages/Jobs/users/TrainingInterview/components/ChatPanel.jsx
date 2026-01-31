// src/pages/Jobs/users/TrainingInterview/components/ChatPanel.jsx
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Bot, Loader2 } from 'lucide-react';

export default function ChatPanel({ conversation, isSubmitting }) {
  const chatContainerRef = useRef(null);

  // Faire défiler vers le bas quand la conversation change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <>
      {/* Header du chat */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Coach d'Entretien IA</h3>
            <p className="text-white/90 text-sm">
              Pose des questions réalistes et donne des feedbacks personnalisés
            </p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto p-6 space-y-6 bg-gray-50"
      >
        {conversation.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
            index={index}
          />
        ))}

        {isSubmitting && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-600">Analyse de votre réponse...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}