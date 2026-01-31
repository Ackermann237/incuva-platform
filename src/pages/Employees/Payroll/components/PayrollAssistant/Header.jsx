// src/pages/Employees/Payroll/components/PayrollAssistant/Header.jsx
import React from 'react';
import { X, Sparkles, FileText } from 'lucide-react';

export default function Header({ analysis, allPayslips, onClose }) {
  return (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assistant IA - Gestion de Paie</h2>
            <p className="text-sm text-gray-600">
              {analysis ? `${allPayslips.length} bulletins analysés` :
               allPayslips.length > 0 ? `${allPayslips.length} bulletins disponibles` :
               'Chargement des données...'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}