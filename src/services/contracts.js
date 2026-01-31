// frontend/src/services/contracts.js
const API_BASE_URL = "/api/contracts";

/**
 * Crée un contrat pour un candidat
 * @param {string} chatId
 * @param {string} candidateId
 * @param {object} contractData - { position, salary, contract_type, description, contract_content }
 * @returns {Promise<object>}
 */
export async function createContract(chatId, candidateId, contractData) {
  const { salary, ...rest } = contractData;

  const res = await fetch(`${API_BASE_URL}/create/${chatId}/${candidateId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...rest,
      salary: parseFloat(salary) || 0,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Erreur lors de la création du contrat");
  }

  return res.json();
}

/**
 * Génère un contrat avec différentes options
 */
export async function generateContract(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...data,
        salary: parseFloat(data.salary) || 0,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.error || "Erreur lors de la génération"
      };
    }

    return result;

  } catch (err) {
    return {
      success: false,
      error: err.message || "Erreur réseau"
    };
  }
}

/**
 * Récupère les détails d'un contrat
 * @param {string} contract_id
 */
export async function viewContract(contract_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/view/${contract_id}`, {
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Accepte ou rejette un contrat (candidat uniquement)
 * @param {string} contract_id
 * @param {"accept" | "reject"} action
 */
export async function updateContractStatus(contract_id, action) {
  try {
    const res = await fetch(`${API_BASE_URL}/view/${contract_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Récupère tous les contrats de l'entreprise
 */
export async function getCompanyContracts() {
  try {
    const res = await fetch(`${API_BASE_URL}/list`, {
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erreur serveur");
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Sauvegarde la signature d'un contrat
 * @param {string} contractId
 * @param {object} signatureData
 * @returns {Promise<object>}
 */
export async function saveContractSignature(contractId, signatureData) {
  try {
    const res = await fetch(`/api/contracts/${contractId}/signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(signatureData)
    });

    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
// Export centralisé
export default {
  createContract,
  generateContract,
  viewContract,
  updateContractStatus,
  getCompanyContracts,
  saveContractSignature,
};