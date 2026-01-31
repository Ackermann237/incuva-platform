import React from 'react';
import { BarChart2 } from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Legend
} from "recharts";

// Couleurs pour le graphique (Doit être importé ou défini)
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Préparation des données pour le graphique (par localisation)
const prepareChartData = (jobs) => {
  const locationCounts = jobs.reduce((acc, job) => {
    const location = job.location || "Autre";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(locationCounts).map(([location, count], index) => ({
    name: location,
    value: count,
    color: COLORS[index % COLORS.length]
  }));
};

export default function ChartSection({ jobs }) {
  const chartData = prepareChartData(jobs);

  return (
    <div className="mb-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart2 className="text-purple-600" size={18} />
        Répartition des offres par localisation
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique */}
        <div className="h-64 lg:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  chartData.length <= 5 ? `${(percent * 100).toFixed(0)}%` : null
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ReTooltip
                formatter={(value, name) => [`${value} offre(s)`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  borderColor: "transparent",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Légende et statistiques */}
        <div className="flex flex-col justify-center">
          <div className="space-y-3">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    <span className="text-sm font-medium text-gray-900">{entry.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(entry.value / jobs.length) * 100}%`,
                        backgroundColor: entry.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Total: {jobs.length} offres disponibles
          </p>
        </div>
      </div>
    </div>
  );
}