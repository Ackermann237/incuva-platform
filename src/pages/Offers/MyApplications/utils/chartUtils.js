// src/pages/Offers/MyApplications/utils/chartUtils.js

export const CHART_COLORS = {
  accepted: '#10b981',
  rejected: '#ef4444',
  pending: '#f59e0b',
  total: '#3b82f6'
};

export const chartTypes = [
  { type: 'line', label: 'Ligne', icon: 'LineChart' },
  { type: 'bar', label: 'Barres', icon: 'BarChart3' },
  { type: 'area', label: 'Aire', icon: 'TrendingUp' },
  { type: 'pie', label: 'Secteurs', icon: 'PieChart' }
];

export const timeRanges = [
  { value: 'week', label: 'Par semaine' },
  { value: 'month', label: 'Par mois' },
  { value: 'quarter', label: 'Par trimestre' },
  { value: 'year', label: 'Par année' }
];

export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function groupApplicationsByTime(applications, timeRange) {
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
}