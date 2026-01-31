// services/planning.js
const API_BASE_URL = '/api/planning';

/**
 * Récupère le planning
 */
export async function getPlanning(params = {}) {
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
        error: data.error || 'Erreur lors de la récupération du planning'
      };
    }

    return {
      success: true,
      planning: data.planning || []
    };
  } catch (error) {
    console.error('Erreur getPlanning:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les employés pour le planning
 */
export async function getEmployeesForPlanning() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
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
      employees: data.employees || []
    };
  } catch (error) {
    console.error('Erreur getEmployeesForPlanning:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour le planning
 */
export async function updatePlanning(shiftId, shiftData) {
  try {
    const url = shiftId ? `${API_BASE_URL}/${shiftId}` : `${API_BASE_URL}`;
    const method = shiftId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(shiftData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour du planning'
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur updatePlanning:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprime un shift
 */
export async function deletePlanning(shiftId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${shiftId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la suppression'
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur deletePlanning:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un planning optimisé avec IA
 */
export async function generateOptimalPlanning(params) {
  try {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la génération du planning'
      };
    }

    return {
      success: true,
      planning: data.planning || [],
      recommendations: data.recommendations || [],
      statistics: data.statistics || {}
    };
  } catch (error) {
    console.error('Erreur generateOptimalPlanning:', error);
    return { success: false, error: error.message };
  }
}

export default {
  getPlanning,
  getEmployeesForPlanning,
  updatePlanning,
  deletePlanning,
  generateOptimalPlanning
};