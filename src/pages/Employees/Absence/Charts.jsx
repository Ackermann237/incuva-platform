// src/pages/Employees/Absence/Charts.jsx
import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const Charts = ({ stats, absences, filteredAbsences }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Graphique par type d'absence
    const typeData = Object.entries(stats.by_type || {}).map(([type, count]) => ({
      name: getAbsenceTypeLabel(type),
      value: count,
      color: getAbsenceTypeColor(type)
    }));

    // Graphique par statut
    const statusData = Object.entries(stats.by_status || {}).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      color: getStatusColor(status)
    }));

    // Graphique par mois (6 derniers mois)
    const monthData = getLast6MonthsData(stats.by_month || {});

    // Graphique par employé (top 10)
    const employeeData = getTopEmployeesData(absences);

    return { typeData, statusData, monthData, employeeData };
  };

  const getAbsenceTypeLabel = (type) => {
    const labels = {
      'vacation': 'Congés payés',
      'sick': 'Maladie',
      'maternity': 'Maternité',
      'paternity': 'Paternité',
      'training': 'Formation',
      'personal': 'Personnel',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  const getAbsenceTypeColor = (type) => {
    const colors = {
      'vacation': '#10b981',
      'sick': '#ef4444',
      'maternity': '#ec4899',
      'paternity': '#3b82f6',
      'training': '#f59e0b',
      'personal': '#8b5cf6',
      'other': '#6b7280'
    };
    return colors[type] || '#9ca3af';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#10b981',
      'rejected': '#ef4444'
    };
    return colors[status] || '#9ca3af';
  };

  const getLast6MonthsData = (byMonth) => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      months.push({
        name: monthName,
        absences: byMonth[monthKey] || 0,
        mois: monthKey
      });
    }

    return months;
  };

  const getTopEmployeesData = (absences) => {
    const employeeCount = {};

    absences.forEach(absence => {
      const employeeName = absence.employeeName || 'Inconnu';
      employeeCount[employeeName] = (employeeCount[employeeName] || 0) + 1;
    });

    return Object.entries(employeeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        absences: count
      }));
  };

  const { typeData, statusData, monthData, employeeData } = prepareChartData();

  const renderChart = () => {
    switch (activeTab) {
      case 'types':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} absences`, 'Nombre']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} absences`, 'Nombre']}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="absences"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Absences"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'employees':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} absences`, 'Nombre']} />
              <Bar dataKey="absences" fill="#8b5cf6" name="Absences par employé" />
            </BarChart>
          </ResponsiveContainer>
        );

      default: // overview
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique par statut */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Répartition par statut</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} absences`, 'Nombre']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique par mois */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Évolution sur 6 mois</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} absences`, 'Nombre']}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="absences"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Absences"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Analyse des absences
          </h3>
          <p className="text-sm text-gray-600">Visualisation des données d'absences</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'types', label: 'Par type', icon: <PieChart className="w-4 h-4" /> },
          { id: 'timeline', label: 'Timeline', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'employees', label: 'Par employé', icon: <Calendar className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Graphique */}
      {renderChart()}

      {/* Légende pour overview */}
      {activeTab === 'overview' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredAbsences.length}</div>
              <div className="text-sm text-gray-600">Absences filtrées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {absences.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">En attente de traitement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {absences.filter(a => a.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approuvées</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;