// src/pages/Jobs/users/TrainingInterview/components/MessageBubble.jsx
import React from 'react';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message, index }) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white border border-gray-200 shadow-sm rounded-bl-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : 'bg-gray-100'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <span className="font-semibold">
            {isUser ? 'Vous' : 'Coach IA'}
          </span>
          <span className="text-xs opacity-70 ml-auto">
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="whitespace-pre-line">
          {typeof message.content === 'string' ? message.content : message.content}
        </div>
      </div>
    </div>
  );
}