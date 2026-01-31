// src/pages/Jobs/Entreprises/TechnicalTest/components/TabNavigation.jsx
import React from 'react';
import { PenTool, Brain, FileText, Eye } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab, testsCount, showPreviewTab }) => {
  const tabs = [
    {
      id: 'create',
      label: 'Créer manuellement',
      icon: PenTool,
      count: null
    },
    {
      id: 'ai',
      label: 'Générer avec l\'IA',
      icon: Brain,
      count: null
    },
    {
      id: 'list',
      label: 'Tests existants',
      icon: FileText,
      count: testsCount
    }
  ];

  if (showPreviewTab) {
    tabs.push({
      id: 'preview',
      label: 'Prévisualisation',
      icon: Eye,
      count: null
    });
  }

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;