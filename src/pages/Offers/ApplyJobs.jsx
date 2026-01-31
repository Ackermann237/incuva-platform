// src/pages/Jobs/ApplyJob.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, DollarSign, Upload, CheckCircle,
  AlertCircle, ArrowLeft, Building2, FileText, ChevronDown,
  ChevronUp, Loader2, User, Calendar, Clock, Download
} from "lucide-react";
import { getJobDetail } from "../../services/jobs";

// Fonction utilitaire pour formater le texte (gras) sans utiliser de librairie lourde
const formatDescription = (text) => {
  if (!text) return null;
  // Remplace **texte** par <strong>texte</strong>
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index}>{content}</strong>;
    }
    return part;
  });
};

// Composant pour afficher la description avec l'option "Voir plus/moins"
const JobDescriptionDisplay = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialLimit = 500; // Caractères affichés initialement

  const displayDescription = useMemo(() => {
    // Si la description est vide ou courte, on affiche tout
    if (!description || description.length <= initialLimit) {
      return formatDescription(description);
    }

    const formatted = formatDescription(description);

    if (isExpanded) {
      // Si étendu, afficher toute la description formatée
      return formatted;
    } else {
      // Sinon, tronquer le texte avant de le reformater (approximation simple)
      const plainText = description.substring(0, initialLimit).trim();
      return (
        <>
          {formatDescription(plainText)}
          <span className="text-gray-500">...</span>
        </>
      );
    }
  }, [description, isExpanded, initialLimit]);

  if (!description) return <p className="text-gray-500 italic">Description non fournie.</p>;

  const needsToggle = description.length > initialLimit;

  return (
    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
      {displayDescription}
      {needsToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="block w-full text-center mt-3 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
        >
          {isExpanded ? (
            <span className="flex items-center justify-center gap-1">
              Réduire <ChevronUp className="w-4 h-4" />
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              Voir la description complète <ChevronDown className="w-4 h-4" />
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // États pour l'application rapide
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [userHasCV, setUserHasCV] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [quickApplyLoading, setQuickApplyLoading] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);

  // États pour le formulaire classique
  const [resume, setResume] = useState(null);
  const [motivationType, setMotivationType] = useState('text'); // 'text' ou 'file'
  const [motivationText, setMotivationText] = useState("");
  const [motivationFile, setMotivationFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadJob();
    checkUserProfile();
  }, [jobId]);

  const loadJob = async () => {
    setLoading(true);
    const res = await getJobDetail(jobId);
    if (res.success) {
      setJob(res.data);
    } else {
      setError("Offre non trouvée ou plus disponible.");
    }
    setLoading(false);
  };

  const checkUserProfile = async () => {
      setProfileCheckLoading(true);
      try {
        const response = await fetch('/api/auth/profile/check', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          setUserHasCV(data.hasCV);
          setProfileComplete(data.profileComplete);
          setProfileData(data.profile);

          // Debug: Afficher les données reçues
          console.log("Données du profil reçues:", {
            hasCV: data.hasCV,
            profileComplete: data.profileComplete,
            profile: data.profile,
            missingFields: data.missingFields
          });

          // Si le profil n'est pas complet, afficher les champs manquants
          if (!data.profileComplete && data.missingFields && data.missingFields.length > 0) {
            console.log("Champs manquants:", data.missingFields);
          }
        } else {
          console.error("Erreur API:", data.error);
          setUserHasCV(false);
          setProfileComplete(false);
        }
      } catch (error) {
        console.error("Erreur réseau vérification profil:", error);
        setUserHasCV(false);
        setProfileComplete(false);
      } finally {
        setProfileCheckLoading(false);
      }
  };

  const handleQuickApply = async () => {
    if (!profileComplete) {
      setError("Votre profil doit être complété avant de postuler en un clic. Veuillez compléter vos informations.");
      return;
    }

    if (!userHasCV) {
      setError("Un CV est requis pour postuler en un clic. Veuillez uploader votre CV dans votre profil.");
      return;
    }

    setQuickApplyLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/jobs/quick-apply/${jobId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/user_dashboard", { state: { activeTab: "offers" } });
        }, 2500);
      } else {
        setError(data.error || "Échec de la candidature en un clic.");
      }
    } catch (err) {
      setError("Impossible de soumettre la candidature. Vérifiez votre connexion.");
    } finally {
      setQuickApplyLoading(false);
    }
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResume(file);
      setError("");
    } else {
      setError("Veuillez uploader un fichier PDF, DOC ou DOCX pour le CV.");
      e.target.value = null;
    }
  };

  const handleMotivationFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setMotivationFile(file);
      setError("");
    } else {
      setError("La lettre de motivation doit être un fichier PDF.");
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) return setError("Votre CV est obligatoire.");

    // La lettre de motivation est désormais FACULTATIVE
    // Validation minimale si le type est TEXTE et qu'il y a du contenu
    if (motivationType === 'text' && motivationText.trim().length > 0 && motivationText.trim().length < 50) {
        return setError("Si vous saisissez une lettre de motivation, elle doit faire au moins 50 caractères.");
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("skills", skills);
    formData.append("experience", experience);
    formData.append("phone", phone);

    // Ajout de la lettre de motivation (facultative)
    if (motivationType === 'text' && motivationText.trim()) {
        formData.append("motivation_text", motivationText.trim());
    } else if (motivationType === 'file' && motivationFile) {
        formData.append("motivation_file", motivationFile);
    }

    try {
      const response = await fetch(`/api/jobs/apply/${jobId}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/user_dashboard", { state: { activeTab: "offers" } });
        }, 2500);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Impossible de soumettre la candidature. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre indisponible</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-6 text-purple-600 font-medium hover:underline">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header avec bouton Quick Apply */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Retour aux offres
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Postuler à cette offre
              </h1>
              <p className="text-xl text-gray-600 mt-3">Faites briller votre candidature</p>
            </div>

            {/* Bouton Postuler en un clic */}
            <button
              onClick={() => setShowQuickApply(true)}
              disabled={profileCheckLoading || (!userHasCV && !profileComplete)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
            >
              {profileCheckLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">Postuler en un clic</div>
                    <div className="text-xs opacity-90">CV déjà disponible</div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section État du Profil */}
        <div className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">État de votre profil</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${userHasCV ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {userHasCV ? '✓ CV disponible' : '✗ CV requis pour postuler en un clic'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${profileComplete ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {profileComplete ? '✓ Profil complet' : '✗ Profil incomplet'}
                  </span>
                </div>
              </div>
            </div>

            {(!userHasCV || !profileComplete) && (
              <button
                onClick={() => navigate('/user/profile/edit')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Compléter mon profil
              </button>
            )}
          </div>

          {/* Affichage des infos du profil si disponibles */}
          {profileData && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">
                  {profileData.firstName} {profileData.lastName}
                </span>
              </div>
              {profileData.skills && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Array.isArray(profileData.skills) ? profileData.skills : profileData.skills.split(','))
                    .slice(0, 5)
                    .map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Option d'application rapide */}
        {showQuickApply && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Postuler en un clic</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Utilisez votre profil existant et votre CV déjà enregistré pour postuler rapidement à cette offre.
                </p>

                {/* Résumé des informations utilisées */}
                <div className="bg-white/80 rounded-xl p-4 mb-4 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Informations utilisées :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {profileData?.firstName} {profileData?.lastName}
                      </span>
                    </div>
                    {profileData?.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{profileData.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        CV: {profileData?.cvName || 'disponible'}
                      </span>
                    </div>
                    {profileData?.skills && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          {Array.isArray(profileData.skills)
                            ? `${profileData.skills.length} compétences`
                            : 'Compétences disponibles'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowQuickApply(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors flex-1 sm:flex-none"
                >
                  Annuler
                </button>
                <button
                  onClick={handleQuickApply}
                  disabled={quickApplyLoading || !userHasCV || !profileComplete}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 transition-all duration-200"
                >
                  {quickApplyLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmer la candidature
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ligne de séparation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 text-gray-500 text-sm font-medium">
              OU remplissez le formulaire complet
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire classique */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              {success ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-14 h-14 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Candidature envoyée !</h2>
                  <p className="text-lg text-gray-600">L'entreprise va étudier votre profil avec attention.</p>
                  <p className="text-sm text-gray-500 mt-4">Redirection en cours...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* CV Upload */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Votre CV <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-purple-50/30">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeFileChange}
                        className="hidden"
                        id="resume-upload"
                        required
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        {resume ? (
                          <div className="space-y-3">
                            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                            <p className="text-lg font-medium text-gray-900">{resume.name}</p>
                            <p className="text-sm text-gray-500">Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-12 h-12 text-purple-600 mx-auto" />
                            <p className="text-lg font-medium text-gray-900">Cliquez pour uploader</p>
                            <p className="text-sm text-gray-500">PDF, DOC ou DOCX • Obligatoire</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Lettre de motivation (Facultatif + Choix) */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Lettre de motivation (Facultatif)
                    </label>

                    {/* Sélecteur de type */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                        <button
                            type="button"
                            onClick={() => setMotivationType('text')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                motivationType === 'text' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-purple-600'
                            }`}
                        >
                            Saisir le texte
                        </button>
                        <button
                            type="button"
                            onClick={() => setMotivationType('file')}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                                motivationType === 'file' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-purple-600'
                            }`}
                        >
                            Uploader un PDF
                        </button>
                    </div>

                    {motivationType === 'text' ? (
                        <>
                            <textarea
                                value={motivationText}
                                onChange={(e) => setMotivationText(e.target.value)}
                                rows={8}
                                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all resize-none"
                                placeholder="Expliquez pourquoi vous êtes le candidat idéal... (Min. 50 caractères si rempli)"
                            />
                            {motivationText.trim().length > 0 && (
                                <p className={`text-sm mt-2 text-right ${motivationText.trim().length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {motivationText.trim().length}/50 caractères min.
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-purple-50/30">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleMotivationFileChange}
                                className="hidden"
                                id="motivation-upload"
                            />
                            <label htmlFor="motivation-upload" className="cursor-pointer">
                                {motivationFile ? (
                                    <div className="space-y-3">
                                        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                                        <p className="text-lg font-medium text-gray-900">{motivationFile.name}</p>
                                        <p className="text-sm text-gray-500">Cliquez pour changer</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <FileText className="w-12 h-12 text-purple-600 mx-auto" />
                                        <p className="text-lg font-medium text-gray-900">Uploader votre PDF de LdM</p>
                                        <p className="text-sm text-gray-500">Uniquement PDF • Facultatif</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    )}
                  </div>

                  {/* Compétences */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Compétences clés (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                      placeholder="React, Python, Management d'équipe..."
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Téléphone (pour vous contacter rapidement)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  {error && (
                    <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg flex items-center gap-3 disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-5 h-5" />
                          Envoyer ma candidature
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Détails de l'offre (Widget) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-purple-600" />
                Détails de l'offre
              </h2>
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{job.company_name || "Entreprise"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span>{job.location}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                    <DollarSign className="w-6 h-6" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
                <div className="pt-5 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Description du poste</h4>
                  <JobDescriptionDisplay description={job.description} />
                </div>

                {/* Métriques de l'offre */}
                <div className="pt-5 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">À propos de cette offre</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date de publication</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type de contrat</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.contract_type || 'Non spécifié'}
                      </span>
                    </div>
                    {job.work_hours && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Horaires</span>
                        <span className="text-sm font-medium text-gray-900">
                          {job.work_hours}h/semaine
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conseils de candidature */}
                <div className="pt-5 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">💡 Conseils</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Vérifiez que votre CV est à jour</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Personnalisez votre lettre de motivation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Mettez en avant vos compétences clés</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}