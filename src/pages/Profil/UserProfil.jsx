// frontend/src/pages/profil/UserProfil.jsx

// 1. IMPORTS DES COMPOSANTS
import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, getPresignedCvUrl, uploadCvToS3 } from '../../services/auth';
import { Check, AlertCircle, Upload, X } from 'lucide-react';

// Composants du profil
import HeaderProfil from './composants/HeaderProfil';
import SectionBio from './composants/SectionBio';
import SectionCompetences from './composants/SectionCompetences';
import SectionPortfolio from './composants/SectionPortfolio';
import SectionExperience from './composants/SectionExperience';
import SectionFormation from './composants/SectionFormation';
import SectionCV from './composants/SectionCV';
import SidebarContact from './composants/SidebarContact';
import SaveButtonFixed from './composants/SaveButtonFixed';
import SectionCVAI from "./composants/SectionCVAI";


const UserProfil = () => {
  // --- ÉTATS & REFS ---
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const cvInputRef = useRef(null);
  // portfolioFileInputRef n'est plus nécessaire ici car la ref n'était pas utilisée dans le parent
  const [uploadingCv, setUploadingCv] = useState(false);
  const [portfolioImageUpload, setPortfolioImageUpload] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- LOGIQUE DE FETCHING ---
  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success) {
        // 1. Initialiser les données brutes (format Array pour l'affichage)
        const rawProfileData = {
          ...res.profile,
          bio: res.profile.bio || '',
          skills: res.profile.skills || [],
          languages: res.profile.languages || [],
          portfolio: res.profile.portfolio || [],
          experience: res.profile.experience || [],
          education: res.profile.education || [],
          linkedin: res.profile.linkedin || '',
          achievements: res.profile.achievements || [],
          cvUrl: res.profile.cvUrl || null,
          cvName: res.profile.cvName || null,
        };

        // 2. Préparer les données pour le formulaire (format String pour l'input des compétences/langues)
        const formDataFormatted = {
            ...rawProfileData,
            skills: rawProfileData.skills.join(', '),
            languages: rawProfileData.languages.join(', ')
        }

        setProfile(rawProfileData);
        setFormData(formDataFormatted);
      } else {
        setError("Impossible de charger le profil");
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS (Passés aux composant enfants) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, subfield, value) => {
    const updated = [...formData[field]];
    updated[index] = { ...updated[index], [subfield]: value };
    setFormData({ ...formData, [field]: updated });
  };

  const addItem = (field, template = {}) => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), template] });
  };

  const removeItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handlePortfolioFileUpload = (file, index) => {
    if (!file) return;

    // Simuler l'upload et la mise à jour (logique existante)
    setPortfolioImageUpload({ ...portfolioImageUpload, [index]: true });
    const simulatedUpload = setTimeout(() => {
        const fakeUrl = `https://fake-s3-bucket/portfolio/item-${index}-${file.name}`;

        const updatedPortfolio = [...formData.portfolio];
        updatedPortfolio[index].fileUrl = fakeUrl;
        updatedPortfolio[index].fileName = file.name;

        setFormData({ ...formData, portfolio: updatedPortfolio });
        setPortfolioImageUpload({ ...portfolioImageUpload, [index]: false });
    }, 1500);
  };

  const handleCVUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Format non supporté. Utilisez PDF, DOC ou DOCX.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Fichier trop volumineux (max 10 Mo)");
        return;
      }

      setUploadingCv(true);
      setError('');
      setSuccess('');

      try {
        const presignedRes = await getPresignedCvUrl(file.name, file.type);
        if (!presignedRes.success) throw new Error(presignedRes.error || "Échec de la pré-signature");

        // --- DÉBUT DU CORRECTIF ---
        // 1. Appel à uploadCvToS3 avec le corps de la réponse de pré-signature
        //    (presignedRes contient upload_url et final_url)
        const finalUrl = await uploadCvToS3(presignedRes, file);

        // 2. Mise à jour du formData avec l'URL publique finale
        setFormData(prev => ({
          ...prev,
          cvUrl: finalUrl,
          cvName: file.name,
        }));
        // --- FIN DU CORRECTIF ---


        setSuccess("CV téléversé avec succès ! Cliquez sur Sauvegarder pour finaliser.");
        e.target.value = null;
      } catch (err) {
        console.error("Erreur d'upload CV:", err);
        setError("Échec de l’upload CV. Réessayez.");
      } finally {
        setUploadingCv(false);
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dataToSend = { ...formData };

      // Conversion String → Array (pour le backend)
      dataToSend.skills = (dataToSend.skills || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      dataToSend.languages = (dataToSend.languages || '')
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      const res = await updateProfile(dataToSend);
      if (res.success) {
        // CORRECTION DE SYNCHRONISATION : Recharger le profil complet
        await fetchProfile(); // <--- AJOUTER CETTE LIGNE

        setIsEditing(false);
        setSuccess("Profil mis à jour avec succès !");
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.error || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      setError("Erreur serveur. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- RENDU FINAL AVEC LES COMPOSANTS ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <HeaderProfil
          profile={profile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />

        {/* MESSAGES */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-xl flex items-center gap-3">
            <Check className="w-6 h-6" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6" /> {error}
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* COLONNE GAUCHE (Sections) */}
          <div className="lg:col-span-2 space-y-8">

            <SectionBio
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleChange={handleChange}
            />

            <SectionCompetences
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleChange={handleChange}
            />

            <SectionPortfolio
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
              handlePortfolioFileUpload={handlePortfolioFileUpload}
              portfolioImageUpload={portfolioImageUpload}
            />

            <SectionExperience
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
            />

            <SectionFormation
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
            />

            <SectionCV
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              cvInputRef={cvInputRef}
              handleCVUpload={handleCVUpload}
              uploadingCv={uploadingCv}
            />

           <SectionCVAI
              formData={formData}
              isEditing={isEditing}
              handleChange={handleChange}
              handleArrayChange={handleArrayChange}
              cvUrl={formData.cvUrl}
              cvName={formData.cvName}
              setFormData={setFormData} // Ajoutez cette ligne
           />

          </div>

          {/* COLONNE DROITE (Contact/Langues) */}
          <div className="space-y-8">
            <SidebarContact
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* BOUTON SAUVEGARDE FIXE */}
        <SaveButtonFixed
          isEditing={isEditing}
          handleSubmit={handleSubmit}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default UserProfil;