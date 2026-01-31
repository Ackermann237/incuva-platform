// src/pages/Employees/Payroll/components/PayrollAssistant/SuggestionCard.jsx
import React from 'react';

export default function SuggestionCard({ suggestion, onClick, compact = false }) {
  const Icon = suggestion.icon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="text-left p-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700 transition-all flex items-center gap-2"
      >
        <Icon className="w-3 h-3" />
        <span className="truncate">{suggestion.text}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-left p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-sm text-gray-700 hover:text-blue-700 hover:shadow-sm flex items-start gap-2 group"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <span className="flex-1">{suggestion.text}</span>
    </button>
  );
}