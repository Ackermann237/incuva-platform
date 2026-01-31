// src/pages/Jobs/Entreprises/TechnicalTest/components/AlertMessages.jsx
import React from 'react';
import { AlertCircle, CheckSquare } from 'lucide-react';

const AlertMessages = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="mb-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckSquare className="w-5 h-5" />
          {success}
        </div>
      )}
    </div>
  );
};

export default AlertMessages;