// frontend/src/services/aiAssistant.js
const API_BASE_URL = "/api/ai_assistant";

// 🔹 Vérifier le statut du serveur
export async function pingJarvis() {
  const res = await fetch(`${API_BASE_URL}/ping`);
  return res.json();
}

// 🔹 Envoyer une question à l’IA
export async function askAI(prompt, context = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context })
    });
    return await res.json();
  } catch (err) {
    return { response: "Erreur de connexion à l'IA." };
  }
}

// 🔹 Récupérer les candidatures
export async function getApplications() {
  const res = await fetch(`${API_BASE_URL}/action/view_applications`);
  return res.json();
}

// 🔹 Récupérer les prestataires
export async function getProviders() {
  const res = await fetch(`${API_BASE_URL}/action/view_providers`);
  return res.json();
}

// 🔹 Récupérer les services
export async function getServices() {
  const res = await fetch(`${API_BASE_URL}/action/view_services`);
  return res.json();
}

// 🔹 Récupérer les recommandations de talents
export async function getTalentRecommendations(prompt, jobId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        context: jobId ? { job_id: jobId } : {}
      })
    });
    return await res.json();
  } catch (err) {
    return { response: "Erreur de connexion à l'IA." };
  }
}
