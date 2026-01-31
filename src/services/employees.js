// services/employees.js
const API_BASE_URL = '/api/employees';

/**
 * Récupère la liste des employés de l'entreprise
 * @returns {Promise<object>} - { success, employees, stats, error }
 */
export async function getEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des employés'
      };
    }

    return {
      success: true,
      employees: data.employees || [],
      stats: data.stats || {}
    };
  } catch (error) {
    console.error('Erreur getEmployees:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les détails d'un employé spécifique
 * @param {string} employeeId - ID de l'employé
 * @returns {Promise<object>} - { success, employee, error }
 */
export async function getEmployeeDetail(employeeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${employeeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des détails'
      };
    }

    return { success: true, employee: data.employee };
  } catch (error) {
    console.error('Erreur getEmployeeDetail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour les informations d'un employé
 * @param {string} employeeId - ID de l'employé
 * @param {object} updateData - Données à mettre à jour
 * @returns {Promise<object>} - { success, message, error }
 */
export async function updateEmployee(employeeId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/${employeeId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour'
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur updateEmployee:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les statistiques des employés
 * @returns {Promise<object>} - { success, stats, error }
 */
export async function getEmployeeStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des statistiques'
      };
    }

    return { success: true, stats: data.stats };
  } catch (error) {
    console.error('Erreur getEmployeeStats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Recherche des employés par critères
 * @param {object} searchCriteria - Critères de recherche
 * @returns {Promise<object>} - { success, employees, count, error }
 */
export async function searchEmployees(searchCriteria) {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(searchCriteria)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la recherche'
      };
    }

    return {
      success: true,
      employees: data.employees || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error('Erreur searchEmployees:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporte la liste des employés au format CSV
 * @param {Array} employees - Liste des employés à exporter
 * @returns {string} - Contenu CSV
 */
export function exportEmployeesToCSV(employees) {
  if (!employees || employees.length === 0) {
    return '';
  }

  const headers = [
    'Nom', 'Poste', 'Email', 'Téléphone',
    'Salaire', 'Type de contrat', 'Statut',
    'Date d\'embauche', 'Localisation', 'Pays'
  ];

  const rows = employees.map(employee => [
    employee.candidate_name || '',
    employee.position || '',
    employee.email || '',
    employee.phone || '',
    employee.salary ? `${employee.salary} €` : '',
    employee.contract_type || '',
    employee.status || '',
    employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : '',
    employee.location || '',
    employee.country || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Export centralisé
export default {
  getEmployees,
  getEmployeeDetail,
  updateEmployee,
  getEmployeeStats,
  searchEmployees,
  exportEmployeesToCSV
};