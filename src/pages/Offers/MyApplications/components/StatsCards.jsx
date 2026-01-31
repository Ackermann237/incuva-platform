// src/pages/Offers/MyApplications/components/StatsCards.jsx
import React from 'react';
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total candidatures"
        value={stats.total}
        icon={<Briefcase className="w-6 h-6 text-blue-600" />}
        color="blue"
      />
      <StatCard
        label="Acceptées"
        value={stats.accepted}
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        color="green"
      />
      <StatCard
        label="Refusées"
        value={stats.rejected}
        icon={<XCircle className="w-6 h-6 text-red-600" />}
        color="red"
      />
      <StatCard
        label="En attente"
        value={stats.pending}
        icon={<Clock className="w-6 h-6 text-yellow-600" />}
        color="yellow"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  const valueColor = {
    blue: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${valueColor[color]} mt-1`}>{value}</p>
        </div>
        <div className={`p-3 ${colorClasses[color]} rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}