// services/jobs.js
const API_BASE_URL = '/api/jobs/api'; // Préfixe de l'API
const API_BASE_URLs = '/api/jobs';


/**
 * Vérifie si le fichier CV est valide côté frontend
 * @param {File} file
 * @returns {boolean}
 */
export function isValidResume(file) {
  const allowedExtensions = ['pdf', 'doc', 'docx'];
  const ext = file.name.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Crée une nouvelle offre d'emploi
 * @param {Object} jobData - { title, description, location, salary_range }
 * @returns {Promise<Object>} - { success, job_id, message, error }
 */
export async function createJob(jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/create_job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la création du job' };
    return { success: true, ...data };
  } catch (error) {
    console.error('Erreur createJob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère la liste des jobs d'une entreprise
 * @returns {Promise<Object>} - { success, jobs, error }
 */
export async function getJobList() {
  try {
    const response = await fetch(`${API_BASE_URL}/job_list`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération des jobs' };
    return { success: true, data: data.jobs };
  } catch (error) {
    console.error('Erreur getJobList:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les détails d'un job spécifique
 * @param {string} jobId
 * @returns {Promise<Object>} - { success, job, error }
 */
export async function getJobDetail(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/job_detail/${jobId}`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération du job' };
    return { success: true, data: data.job };
  } catch (error) {
    console.error(`Erreur getJobDetail pour ${jobId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprime un job
 * @param {string} jobId
 * @returns {Promise<Object>} - { success, message, error }
 */
export async function deleteJob(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_job/${jobId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la suppression du job' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error(`Erreur deleteJob pour ${jobId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour le statut d'une candidature
 * @param {string} applicationId
 * @param {string} status - 'accepted', 'rejected', 'withdrawn'
 * @returns {Promise<Object>} - { success, message, error }
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    const response = await fetch(`${API_BASE_URLs}/application/${applicationId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la mise à jour du statut' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error(`Erreur updateApplicationStatus pour ${applicationId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère toutes les candidatures pour une offre spécifique
 * @param {string} jobId
 * @returns {Promise<Object>} - { success, applications, error }
 */
export async function getJobApplications(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/job_applications/${jobId}`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération des candidatures' };
    return { success: true, data: data.applications };
  } catch (error) {
    console.error(`Erreur getJobApplications pour ${jobId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour une offre d'emploi
 * @param {string} jobId
 * @param {Object} jobData - { title, description, location, salary_range }
 * @returns {Promise<Object>} - { success, message, error }
 */
export async function updateJob(jobId, jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/update_job/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la mise à jour' };
    return { success: true, ...data };
  } catch (error) {
    console.error('Erreur updateJob:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer toutes les offres publiques
export async function getAllJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/all_active`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true, jobs: data.jobs };
  } catch (error) {
    return { success: false, error: "Erreur réseau" };
  }
}

// Récupérer les candidatures du candidat connecté
export async function getMyApplications() {
  try {
    const response = await fetch(`${API_BASE_URL}/my_applications`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true, applications: data.applications };
  } catch (error) {
    return { success: false, error: "Erreur réseau" };
  }
}

export async function getRecruitmentInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}/insights`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur insights' };
    return { success: true, data: data.insights };
  } catch (error) {
    console.error('Erreur getRecruitmentInsights:', error);
    return { success: false, error: error.message };
  }
}

export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard_stats`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur stats' };
    return { success: true, data: data.stats };
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    return { success: false, error: error.message };
  }
}

export async function getTalentDetail(talentId) {
  try {
    const response = await fetch(`/hr/talent_detail/${talentId}`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || "Talent non trouvé" };
    return { success: true, data: data.talent };
  } catch (error) {
    console.error("Erreur getTalentDetail:", error);
    return { success: false, error: "Erreur réseau" };
  }
}


export async function createService(serviceData) {
  try {
    const response = await fetch('/api/jobs/create_service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

