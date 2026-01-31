// src/pages/Employees/Payroll/components/PayrollStats.jsx
import React from 'react';
import { TrendingUp, Users, DollarSign, CreditCard, BarChart3, Calendar, AlertCircle, TrendingDown } from 'lucide-react';

export default function PayrollStats({ stats }) {
  if (!stats) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const statCards = [
    {
      title: "Coût total de la paie",
      value: formatCurrency(stats.total_payroll_cost || 0),
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      changeColor: "text-green-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Salaire moyen",
      value: formatCurrency(stats.average_salary || 0),
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      change: "+5%",
      changeColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Bulletins",
      value: stats.total_payslips || 0,
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      change: "+8%",
      changeColor: "text-green-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Paiements en attente",
      value: formatCurrency(stats.pending_payments || 0),
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      change: "À traiter",
      changeColor: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Taxes et cotisations",
      value: formatCurrency(stats.taxes_total + stats.contributions_total || 0),
      icon: CreditCard,
      color: "from-red-500 to-red-600",
      change: "-3%",
      changeColor: "text-green-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Ce mois-ci",
      value: formatCurrency(stats.this_month_total || 0),
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      change: "+15%",
      changeColor: "text-green-600",
      bgColor: "bg-indigo-50"
    }
  ];

  // Calcul des pourcentages par statut
  const getStatusStats = () => {
    const total = stats.total_payslips || 1;
    return {
      draft: {
        count: stats.by_status?.draft || 0,
        percentage: ((stats.by_status?.draft || 0) / total * 100).toFixed(1)
      },
      approved: {
        count: stats.by_status?.approved || 0,
        percentage: ((stats.by_status?.approved || 0) / total * 100).toFixed(1)
      },
      paid: {
        count: stats.by_status?.paid || 0,
        percentage: ((stats.by_status?.paid || 0) / total * 100).toFixed(1)
      }
    };
  };

  const statusStats = getStatusStats();

  return (
    <div className="mb-8">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${stat.changeColor.includes('green') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-xl font-bold text-gray-900 truncate">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Graphique de répartition par statut */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des bulletins par statut</h3>

        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Brouillon ({statusStats.draft.count})</span>
              <span className="text-sm font-medium text-gray-900">{statusStats.draft.percentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Approuvé ({statusStats.approved.count})</span>
              <span className="text-sm font-medium text-gray-900">{statusStats.approved.percentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Payé ({statusStats.paid.count})</span>
              <span className="text-sm font-medium text-gray-900">{statusStats.paid.percentage}%</span>
            </div>
          </div>

          {/* Graphique circulaire simplifié */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Payé */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray={`${statusStats.paid.percentage * 2.51} 251.2`}
                strokeDashoffset="0"
              />
              {/* Approuvé */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="20"
                strokeDasharray={`${statusStats.approved.percentage * 2.51} 251.2`}
                strokeDashoffset={`-${statusStats.paid.percentage * 2.51}`}
              />
              {/* Brouillon */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="20"
                strokeDasharray={`${statusStats.draft.percentage * 2.51} 251.2`}
                strokeDashoffset={`-${(statusStats.paid.percentage + statusStats.approved.percentage) * 2.51}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total_payslips || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tendances mensuelles */}
        {stats.by_month && Object.keys(stats.by_month).length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Évolution mensuelle</h4>
            <div className="flex items-end h-32 gap-2">
              {Object.entries(stats.by_month).slice(-6).map(([month, amount], index) => {
                const maxAmount = Math.max(...Object.values(stats.by_month).slice(-6));
                const height = (amount / maxAmount) * 80;
                const monthName = new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' });

                return (
                  <div key={month} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg"
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">{monthName}</div>
                    <div className="text-xs font-medium text-gray-900">
                      {formatCurrency(amount).replace('€', '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}