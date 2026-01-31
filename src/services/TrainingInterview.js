// src/services/TrainingInterview.js
const API_BASE_URL = '/api/api';

/**
 * Récupère les questions d'entretien basées sur l'offre d'emploi
 * @param {string} applicationId - ID de la candidature
 * @param {Object} applicationData - Données de la candidature
 * @returns {Promise<Object>}
 */
export async function getInterviewQuestions(applicationId, applicationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        application_id: applicationId,
        job_data: {
          job_id: applicationData.job_id,
          job_title: applicationData.job_title,
          company_name: applicationData.company_name,
          description: applicationData.description
        }
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la génération des questions' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getInterviewQuestions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soumet une réponse à une question d'entretien pour évaluation
 * @param {string} sessionId - ID de la session d'entretien
 * @param {string} questionId - ID de la question
 * @param {string} answer - Réponse de l'utilisateur
 * @param {Object} jobContext - Contexte du poste
 * @returns {Promise<Object>}
 */
export async function submitInterviewAnswer(sessionId, questionId, answer, jobContext) {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/submit-answer`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        question_id: questionId,
        answer: answer,
        job_context: jobContext
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de l\'évaluation' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur submitInterviewAnswer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère le feedback complet d'une session d'entretien
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>}
 */
export async function getInterviewFeedback(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/feedback/${sessionId}`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération du feedback' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getInterviewFeedback:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère toutes les sessions d'entretien de l'utilisateur
 * @returns {Promise<Object>}
 */
export async function getUserInterviewSessions() {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/sessions`);
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération des sessions' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getUserInterviewSessions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sauvegarde une session d'entretien
 * @param {Object} sessionData - Données de la session
 * @returns {Promise<Object>}
 */
export async function saveInterviewSession(sessionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/save-session`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la sauvegarde' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur saveInterviewSession:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Télécharge le rapport d'entretien
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>}
 */
export async function downloadInterviewReport(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/training-interview/download-report/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Erreur lors du téléchargement' };
    }

    // Créer un blob pour le téléchargement
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-entretien-${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Erreur downloadInterviewReport:', error);
    return { success: false, error: error.message };
  }
}
