// src/pages/Employees/Planning/StatsCard.jsx
import React from 'react';
import { Users, Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { calculateTotalHours, getAverageHoursPerEmployee } from './utils';

export default function StatsCard({ planning = [], employees = [] }) {
  // Utiliser planning normalisé
  const normalizedPlanning = Array.isArray(planning) ? planning : [];
  const normalizedEmployees = Array.isArray(employees) ? employees : [];

  const stats = {
    totalShifts: normalizedPlanning.length,
    totalEmployees: normalizedEmployees.length,
    totalHours: calculateTotalHours(normalizedPlanning),
    averageHours: getAverageHoursPerEmployee(normalizedPlanning, normalizedEmployees),
    todayShifts: normalizedPlanning.filter(shift => {
      const today = new Date().toISOString().split('T')[0];
      return shift.date === today;
    }).length
  };

  const statCards = [
    {
      title: "Shifts planifiés",
      value: stats.totalShifts,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Employés",
      value: stats.totalEmployees,
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Heures totales",
      value: `${stats.totalHours.toFixed(1)}h`,
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Moyenne/employé",
      value: `${stats.averageHours.toFixed(1)}h`,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Shifts aujourd'hui",
      value: stats.todayShifts,
      icon: CheckCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 ${stat.bgColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                index === 0 ? 'bg-blue-100 text-blue-800' :
                index === 1 ? 'bg-green-100 text-green-800' :
                index === 2 ? 'bg-purple-100 text-purple-800' :
                index === 3 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                +12%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}