// src/pages/Employees/Absence/StatsCard.jsx
import React from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const StatsCard = ({ title, value, icon, color, trend, percentage, unit }) => {
  const getIcon = () => {
    switch (icon) {
      case 'calendar': return <Calendar className="w-6 h-6" />;
      case 'clock': return <Clock className="w-6 h-6" />;
      case 'check': return <CheckCircle className="w-6 h-6" />;
      case 'trend': return <TrendingUp className="w-6 h-6" />;
      case 'users': return <Users className="w-6 h-6" />;
      case 'alert': return <AlertTriangle className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'red': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </p>

            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>

          {percentage !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentage}% du total</p>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;