// src/pages/Employees/Payroll/components/PayrollAssistant/MessageBubble.jsx
import React from 'react';
import { Bot, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.type === 'user';
  const isError = message.isError;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
              : isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}