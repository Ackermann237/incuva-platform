// src/pages/Employees/Absence/utils.jsx
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

// Fonctions pour les types d'absence
export const getAbsenceTypeColor = (type) => {
  switch (type) {
    case 'vacation': return 'bg-green-100 text-green-800 border-green-200';
    case 'sick': return 'bg-red-100 text-red-800 border-red-200';
    case 'maternity': return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'paternity': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'training': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getAbsenceTypeLabel = (type) => {
  switch (type) {
    case 'vacation': return 'Congés payés';
    case 'sick': return 'Maladie';
    case 'maternity': return 'Maternité';
    case 'paternity': return 'Paternité';
    case 'training': return 'Formation';
    case 'personal': return 'Personnel';
    case 'other': return 'Autre';
    default: return type;
  }
};

// Fonctions pour les statuts
export const getStatusColor = (status) => {

  const safeStatus = typeof status === 'string' ? status : status?.value;

  switch (safeStatus) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status) => {
  const safeStatus = typeof status === 'string' ? status : status?.value;

  switch (safeStatus) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};



export const getStatusLabel = (status) => {

  const safeStatus = typeof status === 'string' ? status : status?.value;

  switch (safeStatus) {
    case 'approved': return 'Approuvé';
    case 'pending': return 'En attente';
    case 'rejected': return 'Rejeté';
    default: return status;
  }
};

// Calcul de la durée d'une absence
export const calculateDuration = (start, end) => {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Inclure le premier jour
  } catch (error) {
    console.error('Erreur de calcul de durée:', error);
    return 0;
  }
};

// Formatage des dates
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Formatage des heures
export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return timeString;
  }
};

// Extraction des initiales d'un nom
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Filtrage des absences par période
export const filterByPeriod = (absences, period) => {
  if (period === 'all') return absences;

  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'this_week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'this_month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'last_3_months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'last_6_months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'this_year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return absences;
  }

  return absences.filter(absence => {
    const absenceDate = new Date(absence.start_date || absence.startDate);
    return absenceDate >= startDate;
  });
};

// Génération de données pour les graphiques
export const generateChartData = (absences, groupBy = 'type') => {
  const data = {};

  absences.forEach(absence => {
    const key = absence[groupBy];
    if (key) {
      data[key] = (data[key] || 0) + 1;
    }
  });

  return Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
    label: groupBy === 'type' ? getAbsenceTypeLabel(key) :
           groupBy === 'status' ? getStatusLabel(key) : key
  }));
};

export const getStatusInfo = (status) => {
  const info = {
    approved: {
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      label: 'Approuvé'
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className="w-4 h-4 text-yellow-600" />,
      label: 'En attente'
    },
    rejected: {
      color: 'bg-red-100 text-red-800',
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      label: 'Rejeté'
    }
  };

  return info[status] || {
    color: 'bg-gray-100 text-gray-800',
    icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
    label: status
  };
};