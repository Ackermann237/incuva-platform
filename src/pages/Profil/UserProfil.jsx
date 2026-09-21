// frontend/src/pages/profil/UserProfil.jsx

// 1. IMPORTS DES COMPOSANTS
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getPresignedCvUrl, getPresignedPortfolioUrl, uploadCvToS3 } from '../../services/auth';
import { Check, AlertCircle, Upload, X } from 'lucide-react';
import LottieLoader from '../../components/lottie/LottieLoader';

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
  const topRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // portfolioFileInputRef n'est plus nécessaire ici car la ref n'était pas utilisée dans le parent
  const [uploadingCv, setUploadingCv] = useState(false);
  const [portfolioImageUpload, setPortfolioImageUpload] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // Le tableau de bord ouvre directement le profil en mode modification (state.edit)
  useEffect(() => {
    if (location.state?.edit) {
      setIsEditing(true);
      // On consomme l'indication : un retour ultérieur sur « Mon profil » n'ouvre pas à nouveau le mode modification
      navigate(location.pathname, { replace: true, state: { ...location.state, edit: false } });
    }
  }, [location.state]);

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

  // Vrai dépôt d'un fichier de portfolio (image ou PDF) : URL signée, envoi direct au stockage, puis lien enregistré
  // dans la réalisation ; il est sauvegardé avec le reste du profil au clic sur « Sauvegarder ».
  const handlePortfolioFileUpload = async (file, index) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Format non supporté pour le portfolio. Utilisez JPG, PNG, GIF, WEBP ou PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).');
      return;
    }

    setError('');
    setSuccess('');
    setPortfolioImageUpload((prev) => ({ ...prev, [index]: true }));

    try {
      const presigned = await getPresignedPortfolioUrl(file.name, file.type);
      if (!presigned.success) throw new Error(presigned.error || "Échec de la préparation de l'envoi");

      const fileUrl = await uploadCvToS3(presigned, file); // simple PUT du fichier vers l'URL signée

      setFormData((prev) => {
        const portfolio = [...(prev.portfolio || [])];
        portfolio[index] = { ...portfolio[index], fileUrl, fileName: file.name, fileType: file.type };
        return { ...prev, portfolio };
      });
      setSuccess('Fichier envoyé. Cliquez sur « Sauvegarder toutes les modifications » pour finaliser.');
    } catch (err) {
      console.error('Erreur d\'upload portfolio:', err);
      setError(err.message?.startsWith('Format') ? err.message : "Échec de l'envoi du fichier. Réessayez.");
    } finally {
      setPortfolioImageUpload((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handlePortfolioFileRemove = (index) => {
    setFormData((prev) => {
      const portfolio = [...(prev.portfolio || [])];
      portfolio[index] = { ...portfolio[index], fileUrl: '', fileName: '', fileType: '' };
      return { ...prev, portfolio };
    });
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

  // Repart des données enregistrées : les modifications abandonnées ne reviennent pas à la prochaine ouverture
  const resetForm = (source = profile) => ({
    ...source,
    skills: (source.skills || []).join(', '),
    languages: (source.languages || []).join(', '),
  });

  const startEditing = () => {
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (profile) setFormData(resetForm());
    setError('');
    setIsEditing(false);
  };

  const showProblem = (message) => {
    setError(message);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Contrôles avant envoi
    if (!(formData.first_name || '').trim() || !(formData.name || '').trim()) {
      showProblem('Le prénom et le nom sont obligatoires.');
      return;
    }
    const linkedin = (formData.linkedin || '').trim();
    if (linkedin && !/^https?:\/\/\S+$/i.test(linkedin)) {
      showProblem("L'adresse LinkedIn doit commencer par https:// (ex. https://linkedin.com/in/votre-nom).");
      return;
    }

    setSaving(true);

    try {
      const dataToSend = { ...formData };
      dataToSend.first_name = dataToSend.first_name.trim();
      dataToSend.name = dataToSend.name.trim();
      dataToSend.linkedin = linkedin;

      // Les blocs laissés vides (bouton « Ajouter » cliqué sans rien saisir) ne sont pas enregistrés
      const cleanItems = (items, keys) =>
        (items || [])
          .map((item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])))
          .filter((item) => keys.some((k) => item[k]));
      dataToSend.experience = cleanItems(dataToSend.experience, ['title', 'company']);
      dataToSend.education = cleanItems(dataToSend.education, ['degree', 'school']);

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
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => setSuccess(''), 5000);
      } else {
        showProblem(res.error || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      showProblem("Erreur serveur. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LottieLoader label="Chargement de votre profil..." fullScreen />
    );
  }

  // --- RENDU FINAL AVEC LES COMPOSANTS ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        <div ref={topRef} className="scroll-mt-24" />

        {/* HEADER */}
        <HeaderProfil
          profile={profile}
          isEditing={isEditing}
          setIsEditing={(value) => (value ? startEditing() : cancelEditing())}
          formData={formData}
          handleChange={handleChange}
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
              onStartEdit={startEditing}
            />

            <SectionCompetences
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleChange={handleChange}
              onStartEdit={startEditing}
            />

            <SectionPortfolio
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
              handlePortfolioFileUpload={handlePortfolioFileUpload}
              handlePortfolioFileRemove={handlePortfolioFileRemove}
              portfolioImageUpload={portfolioImageUpload}
              onStartEdit={() => { startEditing(); addItem('portfolio', { title: '', link: '', fileUrl: '', fileName: '' }); }}
            />

            <SectionExperience
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
              onStartEdit={() => { startEditing(); addItem('experience', { title: '', company: '', start: '', end: '', description: '' }); }}
            />

            <SectionFormation
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              handleArrayChange={handleArrayChange}
              addItem={addItem}
              removeItem={removeItem}
              onStartEdit={() => { startEditing(); addItem('education', { degree: '', school: '', start: '', end: '' }); }}
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
              onStartEdit={startEditing}
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