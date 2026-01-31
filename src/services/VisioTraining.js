// src/services/VisioTraining.js
const API_BASE_URL = '/api';

/**
 * Démarre une session d'entretien en visio
 * @param {string} applicationId - ID de la candidature
 * @param {Object} jobData - Données du job
 * @returns {Promise<Object>}
 */
export async function startVisioInterview(applicationId, jobData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/visio-training/start-visio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        application_id: applicationId,
        job_data: jobData
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors du démarrage' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur startVisioInterview:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soumet une réponse à une question d'entretien visio
 * @param {string} visioSessionId - ID de la session visio
 * @param {string} questionId - ID de la question
 * @param {string} answer - Réponse de l'utilisateur
 * @param {string} recordingUrl - URL de l'enregistrement (optionnel)
 * @returns {Promise<Object>}
 */
export async function submitVisioAnswer(visioSessionId, questionId, answer, recordingUrl = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/visio-training/submit-visio-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        visio_session_id: visioSessionId,
        question_id: questionId,
        answer: answer,
        recording_url: recordingUrl
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de l\'évaluation' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur submitVisioAnswer:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Termine une session d'entretien visio
 * @param {string} visioSessionId - ID de la session visio
 * @returns {Promise<Object>}
 */
export async function endVisioSession(visioSessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/visio-training/end-visio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        visio_session_id: visioSessionId
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la terminaison' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur endVisioSession:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les enregistrements d'une session visio
 * @param {string} visioSessionId - ID de la session visio
 * @returns {Promise<Object>}
 */
export async function getVisioRecordings(visioSessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/visio-training/recordings/${visioSessionId}`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getVisioRecordings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère l'historique des sessions visio de l'utilisateur
 * @returns {Promise<Object>}
 */
export async function getVisioHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/visio-training/history`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getVisioHistory:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Télécharge un enregistrement d'entretien
 * @param {string} recordingUrl - URL de l'enregistrement
 * @returns {Promise<Object>}
 */
export async function downloadRecording(recordingUrl) {
  try {
    const response = await fetch(recordingUrl);

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enregistrement-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Erreur downloadRecording:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un rapport PDF d'entretien visio
 * @param {string} visioSessionId - ID de la session visio
 * @returns {Promise<Object>}
 */
export async function generateVisioReport(visioSessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/visio-training/report/${visioSessionId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Erreur lors de la génération' };
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-visio-${visioSessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Erreur generateVisioReport:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soumet une réponse audio à une question d'entretien visio
 * @param {string} visioSessionId - ID de la session visio
 * @param {string} questionId - ID de la question
 * @param {string} audioTranscript - Transcription audio
 * @param {number} audioDuration - Durée de l'audio en secondes
 * @param {Object} audioMetrics - Métriques audio supplémentaires
 * @returns {Promise<Object>}
 */
export async function submitAudioAnswer(visioSessionId, questionId, audioTranscript, audioDuration, audioMetrics = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/visio-training/submit-audio-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        visio_session_id: visioSessionId,
        question_id: questionId,
        audio_transcript: audioTranscript,
        audio_duration: audioDuration,
        audio_metrics: audioMetrics
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de l\'évaluation audio' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur submitAudioAnswer:', error);
    return { success: false, error: error.message };
  }
}