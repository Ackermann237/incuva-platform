// src/pages/Contracts/CreateContract.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Sparkles, PenTool, Zap, BookOpen, X, Maximize2 } from "lucide-react";
import contractsService from "../../services/contracts";
import { getJobList } from "../../services/jobs";
import HeaderContract from "../Contracts/components/HeaderContract";
import DetailContract from "../Contracts/components/DetailContract";
import PreviewContract from "../Contracts/components/PreviewContract";

export default function CreateContract() {
  const { chatId, candidateId } = useParams();
  const navigate = useNavigate();

  // États du contrat
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [aiMode, setAiMode] = useState("auto"); // "auto", "prompt", "manual"
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [candidateCountry, setCandidateCountry] = useState("");

  const [formData, setFormData] = useState({
    position: "",
    salary: "",
    contract_type: "CDI",
    description: "",
  });

  // États de la vue/processus
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manualContractText, setManualContractText] = useState("");
  const contentEditableRef = useRef(null);

  // Template de prompt par défaut
  const defaultPrompt = `En tant qu'expert juridique, générez un contrat de travail juste avec le titre des articles pour le poste de ${formData.position} avec un salaire de ${formData.salary}€ (${formData.contract_type}), Je saisirai le contenu des articles moi meme.
  
  IMPORTANT : Ce contrat doit être CONFORME AU DROIT DU TRAVAIL de ${candidateCountry || "France"}.
  
  Inclure obligatoirement ces articles :
  1. Parties contractantes
  2. Objet et durée du contrat
  3. Rémunération et avantages
  4. Horaires et lieu de travail
  5. Congés et absences
  6. Confidentialité et propriété intellectuelle
  7. Conditions de résiliation
  8. Dispositions générales
  
  Style : Formel, précis juridiquement, structure claire.`;

  // 1. CHARGEMENT DES OFFRES ET INFORMATIONS
  useEffect(() => {
    const fetchData = async () => {
      setLoadingJobs(true);

      // Charger les offres d'emploi
      const res = await getJobList();
      if (res.success) {
        setJobOffers(res.data);
      }

      // Récupérer le pays du candidat
      try {
        const candidateRes = await fetch(`/api/users/${candidateId}/country`);
        if (candidateRes.ok) {
          const data = await candidateRes.json();
          if (data.success && data.country) {
            setCandidateCountry(data.country);
          }
        }
      } catch (err) {
        console.error("Erreur récupération pays:", err);
      }

      setLoadingJobs(false);
    };

    fetchData();
  }, [candidateId]);

  // 2. GESTION DU MODE IA/MANUEL
  const handleAiModeChange = (mode) => {
    setAiMode(mode);
    if (mode === "manual") {
      // En mode manuel, activer l'édition automatiquement
      setIsEditing(true);
      // Template de base pour mode manuel
      const template = `<div class="contract-manual-template">
        <h2>Contrat de Travail - ${formData.position || "[POSTE]"}</h2>
        
        <div class="parties">
          <h3>ARTICLE 1 - PARTIES</h3>
          <p>Entre les soussignés :</p>
          <p><strong>L'EMPLOYEUR</strong> : [NOM ENTREPRISE]</p>
          <p><strong>L'EMPLOYÉ(E)</strong> : ${candidateCountry ? `Résidant en ${candidateCountry}` : "[NOM CANDIDAT]"}</p>
        </div>
        
        <div class="objet">
          <h3>ARTICLE 2 - OBJET DU CONTRAT</h3>
          <p>Le présent contrat a pour objet d'engager l'employé(e) en qualité de ${formData.position || "[POSTE]"}.</p>
        </div>
        
        <div class="remuneration">
          <h3>ARTICLE 3 - RÉMUNÉRATION</h3>
          <p>En contrepartie de son travail, l'employé(e) percevra une rémunération annuelle brute de ${formData.salary || "[SALAIRE]"} €.</p>
        </div>
        
        <div class="duree">
          <h3>ARTICLE 4 - DURÉE ET PÉRIODE D'ESSAI</h3>
          <p>Le contrat est conclu pour une durée ${formData.contract_type === "CDI" ? "indéterminée" : "déterminée"}.</p>
        </div>
      </div>`;

      setPreview(template);
      setManualContractText(template);
      setSuccess("Mode manuel activé. Vous pouvez éditer directement dans la zone de prévisualisation.");
    }
  };

  // 3. SYNCHRONISATION LORS DU CHOIX D'UNE OFFRE
  const handleJobSelect = useCallback((e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);

    if (jobId) {
      const selectedJob = jobOffers.find(job => job.job_id === jobId);
      if (selectedJob) {
        setFormData({
          position: selectedJob.title,
          salary: selectedJob.salary_range.replace(/[^0-9]/g, ''),
          contract_type: selectedJob.contract_type || "CDI",
          description: formData.description,
        });
        setError("");
      }
    } else {
      setFormData(prev => ({ ...prev, position: "", salary: "", contract_type: "CDI" }));
    }
  }, [jobOffers, formData.description]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleManualModeToggle = useCallback(() => {
    setIsManualMode(prev => {
      if (!prev) {
        setSelectedJobId("");
        setFormData({ position: "", salary: "", contract_type: "CDI", description: "" });
      }
      return !prev;
    });
  }, []);

  // 4. GÉNÉRATION AVEC IA
  const handleGenerate = async () => {
    if (aiMode === "manual") {
      // En mode manuel, pas besoin de génération
      setSuccess("En mode manuel, éditez directement dans la zone de prévisualisation.");
      return;
    }

    if (!formData.position || !formData.salary || isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      setError("Position et un salaire numérique valide sont requis");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      let generationData = {
        ...formData,
        salary: parseFloat(formData.salary),
        chat_id: chatId,
        candidate_id: candidateId,
        job_source_id: selectedJobId || 'manual',
        candidate_country: candidateCountry,
        ai_mode: aiMode
      };

      // Si mode prompt personnalisé, ajouter le prompt
      if (aiMode === "prompt" && customPrompt.trim()) {
        generationData.custom_prompt = customPrompt;
      }

      const res = await contractsService.generateContract(generationData);

      if (res.success) {
        setPreview(res.contract_content);
        setIsEditing(false);
        setSuccess(aiMode === "prompt"
          ? "Contrat généré selon votre prompt personnalisé"
          : "Contrat généré automatiquement avec IA");
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError("Erreur lors de la génération du contrat");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // 5. SAUVEGARDE DE L'ÉDITION
  const handleSaveEdit = () => {
    if (contentEditableRef.current) {
      const sanitizedContent = contentEditableRef.current.innerHTML;
      setPreview(sanitizedContent);
      setManualContractText(sanitizedContent);
      setIsEditing(false);
      setSuccess("Modifications sauvegardées");
    }
  };

  // 6. GESTION DU TEXTE EN MODE MANUEL
  const handleManualTextChange = (e) => {
    const newContent = e.target.innerHTML;
    setPreview(newContent);
    setManualContractText(newContent);
  };

  // 7. ENVOI
  const handleSendContract = async () => {
    if (!preview || preview.trim() === "") {
      setError("Veuillez d'abord créer ou générer un contrat");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await contractsService.createContract(
        chatId,
        candidateId,
        {
          position: formData.position,
          salary: parseFloat(formData.salary),
          contract_type: formData.contract_type,
          description: formData.description,
          contract_content: preview,
          job_source_id: selectedJobId || 'manual',
          generation_mode: aiMode,
          custom_prompt_used: aiMode === "prompt" ? customPrompt : null
        }
      );

      if (res.success) {
        setSuccess("Contrat envoyé ! Le candidat peut le signer via le lien.");
        setTimeout(() => navigate(`/messaging/conversation/${chatId}`), 2000);
      } else {
        setError(res.message || "Échec de l'envoi");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du contrat");
    } finally {
      setLoading(false);
    }
  };

  // 8. OUVRIR/FERMER MODALE PROMPT
  const openPromptModal = () => {
    if (!customPrompt) {
      setCustomPrompt(defaultPrompt);
    }
    setShowPromptModal(true);
  };

  const closePromptModal = () => {
    setShowPromptModal(false);
  };

  // 9. GÉNÉRER AVEC PROMPT
  const generateWithPrompt = async () => {
    if (!customPrompt.trim()) {
      setError("Veuillez saisir un prompt");
      return;
    }
    await handleGenerate();
    closePromptModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-6">
      <div className="max-w-6xl mx-auto">
        <HeaderContract navigate={navigate} />

        {/* Messages d'erreur/succès */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Formulaire et options */}
          <div className="space-y-6">
            <DetailContract
              formData={formData}
              jobOffers={jobOffers}
              selectedJobId={selectedJobId}
              isManualMode={isManualMode}
              loadingJobs={loadingJobs}
              generating={generating}
              loading={loading}
              preview={preview}
              handleManualModeToggle={handleManualModeToggle}
              handleJobSelect={handleJobSelect}
              handleChange={handleChange}
              handleGenerate={handleGenerate}
              handleSendContract={handleSendContract}
            />

            {/* Section Mode de Génération */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Mode de génération du contrat
              </h3>

              <div className="space-y-4">

                {/* Option 1 : Prompt personnalisé IA */}
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    id="prompt-ai"
                    name="ai-mode"
                    checked={aiMode === "prompt"}
                    onChange={() => {
                      handleAiModeChange("prompt");
                      openPromptModal();
                    }}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <label htmlFor="prompt-ai" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">IA avec Prompt Personnalisé</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Vous rédigez les instructions précises pour l'IA
                    </p>
                    {aiMode === "prompt" && customPrompt && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Prompt: {customPrompt.substring(0, 50)}...
                      </p>
                    )}
                  </label>
                </div>

                {/* Option 2 : Saisie manuelle */}
                <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    id="manual"
                    name="ai-mode"
                    checked={aiMode === "manual"}
                    onChange={() => handleAiModeChange("manual")}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <label htmlFor="manual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Saisie Manuelle</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Vous rédigez entièrement le contrat dans la zone de prévisualisation
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Prévisualisation */}
          <PreviewContract
            preview={preview}
            isEditing={isEditing}
            contentEditableRef={contentEditableRef}
            setIsEditing={setIsEditing}
            handleSaveEdit={handleSaveEdit}
            aiMode={aiMode}
            onManualTextChange={aiMode === "manual" ? handleManualTextChange : null}
          />
        </div>
      </div>

      {/* Modale pour le prompt personnalisé */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold">Prompt personnalisé pour l'IA</h3>
              </div>
              <button
                onClick={closePromptModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instructions pour l'IA
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows="12"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none font-mono text-sm"
                  placeholder="Décrivez précisément le contrat que vous souhaitez..."
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => setCustomPrompt(defaultPrompt)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Utiliser le template par défaut
                  </button>
                  <span className="text-sm text-gray-500">
                    {customPrompt.length} caractères
                  </span>
                </div>
              </div>

              {/* Informations automatiques */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Informations automatiquement incluses
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Nom de l'entreprise</li>
                  <li>• Nom du candidat</li>
                  <li>• Pays du candidat: {candidateCountry || "Non spécifié"}</li>
                  <li>• Date actuelle</li>
                  <li>• Poste: {formData.position || "Non spécifié"}</li>
                  <li>• Salaire: {formData.salary || "Non spécifié"} €</li>
                  <li>• Type de contrat: {formData.contract_type}</li>
                </ul>
              </div>

              {/* Conseils */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Conseils pour un bon prompt</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Soyez précis et détaillé</li>
                  <li>• Mentionnez les clauses importantes</li>
                  <li>• Précisez la législation souhaitée</li>
                  <li>• Définissez le style (formel, technique, etc.)</li>
                  <li>• Structurez vos attentes en sections</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-4">
              <button
                onClick={closePromptModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={generateWithPrompt}
                disabled={!customPrompt.trim() || generating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Génération en cours...
                  </>
                ) : (
                  "Générer le contrat"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}