// src/pages/Employees/Payroll/components/Bulletins/Footer.jsx
import React from 'react';
import { Shield, Download } from 'lucide-react';

const Footer = ({ onClose, company }) => {
  const handleDownload = () => {
    console.log('Télécharger le PDF');
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-100 border-t border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">
              Ce bulletin de paie est un document légal. Conservez-le pendant 5 ans.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Pour toute question, contactez votre service RH au {company?.phone || 'N/A'} ou {company?.email || 'N/A'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm"
          >
            Fermer
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger le PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;