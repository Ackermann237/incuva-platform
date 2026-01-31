// src/pages/Employees/Payroll/components/Bulletins/Tabs.jsx
import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'summary', label: 'Synthèse' },
    { id: 'contributions', label: 'Cotisations' },
    { id: 'details', label: 'Détails' },
    { id: 'company', label: 'Entreprise' }
  ];

  return (
    <div className="px-6 pt-6 border-b border-gray-200">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-t border-x border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;