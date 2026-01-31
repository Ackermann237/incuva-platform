// src/pages/Jobs/Entreprises/TechnicalTestsDashboard/QuickActionCard.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  gradientFrom,
  gradientTo,
  borderColor,
  iconBgColor,
  iconColor,
  buttonColor
}) {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <button
            onClick={onClick}
            className={`${buttonColor} font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all`}
          >
            {buttonText} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}