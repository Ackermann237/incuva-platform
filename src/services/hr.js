// frontend/src/services/hr.js
const API_BASE_URL = "/api/hr";

/**
 * 🔹 Récupérer les données de gestion du recrutement pour l'entreprise
 * @returns {Promise<object>} { success, metrics, jobs, applications, favorite_count, job_applications }
 */
export async function getRecruitmentManagement() {
  try {
    const res = await fetch(`${API_BASE_URL}/recruitment_management`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la récupération des données de recrutement");
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer les candidatures pour un poste donné
 * @param {string} jobId
 * @returns {Promise<object>} { success, job_title, applications }
 */
export async function getCandidateSubmissions(jobId) {
  try {
    const res = await fetch(`${API_BASE_URL}/candidate_submit/${jobId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la récupération des candidatures");
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer la liste des talents avec recherche optionnelle
 * @param {string} [searchQuery] - texte de recherche
 * @returns {Promise<object>} { success, talents, favorite_ids, error }
 */
export async function getTalentMarket(searchQuery = '') {
  try {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    const res = await fetch(`${API_BASE_URL}/talent_market${query}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erreur lors de la récupération des talents');
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer les détails d'un talent spécifique
 * @param {string} talentId
 * @returns {Promise<object>} { success, talent, error }
 */
export async function getTalentDetail(talentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/talent_detail/${talentId}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erreur lors de la récupération du talent');
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Initier une conversation avec un talent
 * @param {string} talentId
 * @param {string} talentUserUid
 */
export async function initiateChat(talentId, talentUserUid) {
  try {
    const res = await fetch(`${API_BASE_URL}/initiate_chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ talent_id: talentId, talent_user_uid: talentUserUid })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Ajouter un talent aux favoris
 * @param {string} talentId
 */
export async function addFavorite(talentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/add_favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ talent_id: talentId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer tous les favoris
 */
export async function getFavorites() {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Supprimer un talent des favoris
 * @param {string} talentId
 */
export async function removeFavorite(talentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/remove_favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ talent_id: talentId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer tous les contrats de l'entreprise
 */
export async function getAgreements() {
  try {
    const res = await fetch(`${API_BASE_URL}/agreements`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔹 Récupérer tous les entretiens rejetés de l'entreprise
 */
export async function getRejections() {
  try {
    const res = await fetch(`${API_BASE_URL}rejections`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}



export default {
  getRecruitmentManagement,
  getCandidateSubmissions,
  getTalentMarket,
  getTalentDetail,
  initiateChat,
  addFavorite,
  getFavorites,
  removeFavorite,
  getAgreements,
  getRejections,
};



