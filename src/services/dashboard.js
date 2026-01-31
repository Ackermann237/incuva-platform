// frontend/src/services/dashboard.js
const API_BASE_URL = "/api/dashboard";

/**
 * 🔹 Récupérer les données du dashboard utilisateur
 * @returns {Promise<object>}
 */
export async function getUserDashboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/user_dashboard`, {
      credentials: "include"
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la récupération du dashboard");
    }
    return await res.json(); // { success: true, user, jobs, applications, interviews, etc. }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Mettre à jour le profil utilisateur
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export async function updateProfile(formData) {
  try {
    const res = await fetch(`${API_BASE_URL}/update_profile`, {
      method: "POST",
      body: formData,
    });
    return await res.json(); // { success: true, message } ou { success: false, error }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Enregistrer la position géographique de l'utilisateur
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function savePosition(latitude, longitude) {
  try {
    const res = await fetch(`${API_BASE_URL}/save_position`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude }),
    });
    return await res.json(); // { success: true, message } ou { success: false, error }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer la liste des jobs pour un utilisateur
 * @returns {Promise<object>}
 */
export async function getJobListUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/job_list_user`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la récupération des jobs");
    }
    return await res.json(); // { success: true, jobs } ou { success: false, error }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer les données d'analyse RH (applications, entretiens, contrats, stats, insights)
 * @param {string} period - Période pour générer les insights (ex: 'week', 'month')
 * @returns {Promise<object>}
 */
export async function getDataAnalysis(period = "month") {
  try {
    const res = await fetch(`${API_BASE_URL}/data_analysis`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erreur serveur");

    // Normaliser : extraire les données brutes
    return {
      success: true,
      applications: json.applications || [],
      interviews: json.interviews || [],
      contracts: json.contracts || [],
      applications_stats: json.applications_stats || {},
      interviews_stats: json.interviews_stats || {},
      contracts_stats: json.contracts_stats || {},
      insights: json.insights || ""
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


// 🔹 Export centralisé
export default {
  getUserDashboard,
  updateProfile,
  savePosition,
  getJobListUser,
  getDataAnalysis,
};
