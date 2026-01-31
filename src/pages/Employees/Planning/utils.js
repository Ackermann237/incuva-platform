// src/pages/Employees/Planning/utils.jsx

// Formater une date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

// Formater l'heure
export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Retourne "HH:MM"
};

// Calculer la durée entre deux heures
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const duration = (end - start) / (1000 * 60 * 60); // heures
  return duration < 0 ? duration + 24 : duration; // Gérer les shifts sur minuit
};

// Calculer le total des heures
export const calculateTotalHours = (planning) => {
  return planning.reduce((total, shift) => {
    const startTime = shift.start_time || shift.startTime || '00:00';
    const endTime = shift.end_time || shift.endTime || '00:00';
    return total + calculateDuration(startTime, endTime);
  }, 0);
};

// Calculer la moyenne d'heures par employé
export const getAverageHoursPerEmployee = (planning, employees) => {
  if (employees.length === 0) return 0;

  const hoursByEmployee = {};
  planning.forEach(shift => {
    const startTime = shift.start_time || shift.startTime || '00:00';
    const endTime = shift.end_time || shift.endTime || '00:00';
    const hours = calculateDuration(startTime, endTime);
    hoursByEmployee[shift.employee_id] = (hoursByEmployee[shift.employee_id] || 0) + hours;
  });

  const totalHours = Object.values(hoursByEmployee).reduce((sum, hours) => sum + hours, 0);
  return totalHours / employees.length;
};

// Couleurs pour les types de shift
export const getShiftTypeColor = (type) => {
  const colors = {
    'work': 'bg-blue-100 text-blue-800 border-blue-200',
    'overtime': 'bg-purple-100 text-purple-800 border-purple-200',
    'vacation': 'bg-green-100 text-green-800 border-green-200',
    'sick': 'bg-red-100 text-red-800 border-red-200',
    'training': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'meeting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'remote': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'break': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Labels pour les types de shift
export const getShiftTypeLabel = (type) => {
  const labels = {
    'work': 'Travail',
    'overtime': 'Heures supp',
    'vacation': 'Congé',
    'sick': 'Maladie',
    'training': 'Formation',
    'meeting': 'Réunion',
    'remote': 'Télétravail',
    'break': 'Pause'
  };
  return labels[type] || type;
};

// Normaliser les données de shift
export const normalizeShift = (shift) => {
  if (!shift) return null;

  return {
    ...shift,
    startTime: shift.start_time || shift.startTime,
    endTime: shift.end_time || shift.endTime,
    employeeName: shift.employee_name || shift.employeeName,
    // Assurer que les champs sont présents
    start_time: shift.start_time || shift.startTime,
    end_time: shift.end_time || shift.endTime,
    employee_name: shift.employee_name || shift.employeeName
  };
};