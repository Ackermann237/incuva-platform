// frontend/src/services/auth.js
const API_BASE_URL = "/api/auth";

// 🔹 Sélection du type de compte
export async function selectAccountType(accountType) {
  const res = await fetch(`${API_BASE_URL}/select_account_type`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_type: accountType }),
  });
  return res.json();
}

// 🔹 Enregistrement individu
export async function registerIndividual(registerData) {
  const res = await fetch(`${API_BASE_URL}/register_individual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });
  return res.json();
}

// 🔹 Enregistrement entreprise
export async function registerCompany(registerData) {
  const res = await fetch(`${API_BASE_URL}/register_company`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });
  return res.json();
}

// 🔹 Vérification du code email
export async function verifyEmail(code) {
  const res = await fetch(`${API_BASE_URL}/verify_email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verification_code: code }),
  });
  return res.json();
}

export async function updatePosition(latitude, longitude) {
  const res = await fetch(`${API_BASE_URL}/update_position`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
  return res.json();
}

export async function resendVerificationCode() {
  const res = await fetch(`${API_BASE_URL}/resend_verification_code`, { method: 'POST' });
  return res.json();
}

export async function checkAccountType(email) {
  const res = await fetch(`${API_BASE_URL}/check_account_type`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function resetPassword(email) {
  const res = await fetch(`${API_BASE_URL}/reset_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// 🔹 Vérifier le code de réinitialisation
export async function verifyResetCode(code) {
  const res = await fetch(`${API_BASE_URL}/verify_reset_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verification_code: code }),
  });
  return res.json();
}

// 🔹 Définir un nouveau mot de passe
export async function setNewPassword(email, password) {
  const res = await fetch(`${API_BASE_URL}/set_new_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// 🔹 Déconnexion
export async function logout() {
  const res = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/profile_info`);
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${API_BASE_URL}/update_profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Fonction existante pour obtenir l'URL pré-signée
export async function getPresignedCvUrl(filename, filetype) {
  const res = await fetch(`${API_BASE_URL}/get_presigned_cv_url`, {
    method: 'POST',
    // Correction : Le header doit être un objet
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, filetype }),
  });
  return res.json();
}


// Fonction mise à jour pour uploader sur S3 via PUT
export async function uploadCvToS3(presignedData, file) {

  // L'objet presignedData contient maintenant upload_url et final_url
  const uploadUrl = presignedData.upload_url;
  const finalUrl = presignedData.final_url;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    // Le corps de la requête est le fichier lui-même (Blob/File)
    body: file,
    // Headers Cruciaux : Content-Type et ACL doivent correspondre à ceux de la signature côté serveur
    headers: {
        'Content-Type': file.type, // Doit correspondre à 'filetype' envoyé à l'API
    },
  });

  if (!res.ok) {
    // Tenter de lire le corps de l'erreur S3 peut aider au débogage
    let errorText = await res.text();
    console.error("Détails de l'erreur S3:", errorText);
    throw new Error(`Échec de l’upload S3 avec statut : ${res.status}`);
  }

  // Si l'upload PUT est réussi, nous retournons l'URL publique finale
  return finalUrl;
}