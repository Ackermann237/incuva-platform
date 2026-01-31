// services/absences.js
const API_BASE_URL = '/api/absences';

/**
 * Récupère les absences
 * @param {object} params - Paramètres de filtrage
 * @returns {Promise<object>} - { success, absences, error }
 */
export async function getAbsences(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des absences'
      };
    }

    return {
      success: true,
      absences: data.absences || []
    };
  } catch (error) {
    console.error('Erreur getAbsences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les statistiques des absences
 * @returns {Promise<object>} - { success, stats, error }
 */
export async function getAbsenceStats() {
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

    return {
      success: true,
      stats: data.stats || {}
    };
  } catch (error) {
    console.error('Erreur getAbsenceStats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour une absence
 * @param {string} absenceId - ID de l'absence (null pour création)
 * @param {object} absenceData - Données de l'absence
 * @returns {Promise<object>} - { success, message, error }
 */
export async function updateAbsence(absenceId, absenceData) {
  try {
    const url = absenceId ? `${API_BASE_URL}/${absenceId}` : `${API_BASE_URL}`;
    const method = absenceId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(absenceData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour de l\'absence'
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur updateAbsence:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Approuve une absence
 * @param {string} absenceId - ID de l'absence
 * @returns {Promise<object>} - { success, message, error }
 */
export async function approveAbsence(absenceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${absenceId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'approbation'
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur approveAbsence:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère la liste des employés
 * @returns {Promise<object>} - { success, employees, error }
 */
export async function getEmployees() {
  try {
    const response = await fetch('/api/employees', {
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
      employees: data.employees || data.data || []
    };
  } catch (error) {
    console.error('Erreur getEmployees:', error);
    return { success: false, error: error.message };
  }
}

export default {
  getAbsences,
  getAbsenceStats,
  updateAbsence,
  approveAbsence
};