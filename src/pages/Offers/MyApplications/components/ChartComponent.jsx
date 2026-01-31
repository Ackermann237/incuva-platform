// src/pages/Offers/MyApplications/components/ChartComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function ChartComponent({
  applications,
  chartType,
  setChartType,
  timeRange,
  setTimeRange,
  stats
}) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    prepareChartData();
  }, [applications, timeRange]);

  const prepareChartData = () => {
    if (applications.length === 0) {
      setChartData([]);
      return;
    }

    const groupedData = groupApplicationsByTime();
    const data = Object.keys(groupedData).map(date => ({
      date,
      ...groupedData[date]
    }));

    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setChartData(data);
  };

  const groupApplicationsByTime = () => {
    const groups = {};

    applications.forEach(app => {
      const date = new Date(app.applied_at || app.submitted_at);
      let key;

      switch (timeRange) {
        case 'week':
          key = `Sem ${getWeekNumber(date)}`;
          break;
        case 'month':
          key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `T${quarter} ${date.getFullYear()}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      }

      if (!groups[key]) {
        groups[key] = { accepted: 0, rejected: 0, pending: 0, total: 0 };
      }

      groups[key][app.status] = (groups[key][app.status] || 0) + 1;
      groups[key].total += 1;
    });

    return groups;
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const CHART_COLORS = {
    accepted: '#10b981',
    rejected: '#ef4444',
    pending: '#f59e0b',
    total: '#3b82f6'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">
                {entry.dataKey === 'accepted' ? 'Acceptées' :
                 entry.dataKey === 'rejected' ? 'Refusées' :
                 entry.dataKey === 'pending' ? 'En attente' : 'Total'}:
              </span>
              <span className="font-semibold ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartButtons = [
    { type: 'line', icon: LineChartIcon, label: 'Ligne' },
    { type: 'bar', icon: BarChart3, label: 'Barres' },
    { type: 'area', icon: TrendingUp, label: 'Aire' },
    { type: 'pie', icon: PieChartIcon, label: 'Secteurs' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Évolution de vos candidatures
          </h3>
          <p className="text-gray-600">
            Visualisez la progression de vos candidatures dans le temps
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {/* Boutons type de graphique */}
          <div className="flex items-center gap-2">
            {chartButtons.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  chartType === type
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Sélecteur de période */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="week">Par semaine</option>
            <option value="month">Par mois</option>
            <option value="quarter">Par trimestre</option>
            <option value="year">Par année</option>
          </select>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke={CHART_COLORS.accepted}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Acceptées"
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke={CHART_COLORS.rejected}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Refusées"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke={CHART_COLORS.pending}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="En attente"
                />
              </RechartsLineChart>
            ) : chartType === 'bar' ? (
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="accepted" fill={CHART_COLORS.accepted} name="Acceptées" />
                <Bar dataKey="rejected" fill={CHART_COLORS.rejected} name="Refusées" />
                <Bar dataKey="pending" fill={CHART_COLORS.pending} name="En attente" />
              </RechartsBarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  stackId="1"
                  stroke={CHART_COLORS.accepted}
                  fill={CHART_COLORS.accepted}
                  fillOpacity={0.6}
                  name="Acceptées"
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stackId="1"
                  stroke={CHART_COLORS.rejected}
                  fill={CHART_COLORS.rejected}
                  fillOpacity={0.6}
                  name="Refusées"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke={CHART_COLORS.pending}
                  fill={CHART_COLORS.pending}
                  fillOpacity={0.6}
                  name="En attente"
                />
              </AreaChart>
            ) : (
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Acceptées', value: stats.accepted },
                    { name: 'Refusées', value: stats.rejected },
                    { name: 'En attente', value: stats.pending }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Acceptées', value: stats.accepted },
                    { name: 'Refusées', value: stats.rejected },
                    { name: 'En attente', value: stats.pending }
                  ].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Acceptées' ? CHART_COLORS.accepted :
                        entry.name === 'Refusées' ? CHART_COLORS.rejected :
                        CHART_COLORS.pending
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Candidatures']} />
                <Legend />
              </RechartsPieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Pas assez de données pour afficher le graphique</p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <StatsPanel stats={stats} />
        <PerformancePanel stats={stats} applications={applications} />
      </div>
    </div>
  );
}

function StatsPanel({ stats }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Répartition des statuts</h4>
      <div className="space-y-3">
        <StatItem
          color="green"
          label="Acceptées"
          value={stats.accepted}
          percentage={stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}
        />
        <StatItem
          color="red"
          label="Refusées"
          value={stats.rejected}
          percentage={stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}
        />
        <StatItem
          color="yellow"
          label="En attente"
          value={stats.pending}
          percentage={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}
        />
      </div>
    </div>
  );
}

function PerformancePanel({ stats, applications }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Indicateurs de performance</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Taux d'acceptation</span>
          <span className="font-semibold text-green-600">
            {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Candidatures actives</span>
          <span className="font-semibold text-blue-600">{stats.pending}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Moyenne mensuelle</span>
          <span className="font-semibold text-purple-600">
            {applications.length > 0 ? Math.round(applications.length / 3) : 0}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatItem({ color, label, value, percentage }) {
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`}></div>
        <span className="text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
}