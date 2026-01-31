// src/pages/Employees/Payroll/components/Bulletins/Header.jsx
import React from 'react';
import { FileText, Sparkles, Printer, Download, Mail, X } from 'lucide-react';

const Header = ({ payslip, employee, onSwitchView, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log('Télécharger le bulletin', payslip.id);
  };

  const handleSendEmail = () => {
    console.log('Envoyer par email', payslip.id);
  };

  return (
    <div className="sticky top-0 z-[9999] bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Bulletin de Paie #{payslip.payslip_number}
            </h2>
            <p className="text-blue-100">
              {employee?.candidate_name || payslip.employee_name || 'Employé inconnu'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSwitchView('modern')}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-colors backdrop-blur-sm flex items-center gap-2"
            title="Vue Moderne"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Vue Moderne</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
            title="Imprimer"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
            title="Télécharger"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendEmail}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
            title="Envoyer par email"
          >
            <Mail className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;