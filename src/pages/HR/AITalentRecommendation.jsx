// src/pages/HR/AITalentRecommendation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { getJobList, getJobDetail } from "../../services/jobs";
import { askAI } from "../../services/aiAssistant";
import AIPromptModal from "../../components/AIPromptModal";

export default function AITalentRecommendation() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  // Charger uniquement les offres de l'entreprise connectée
  useEffect(() => {
    async function loadCompanyJobs() {
      try {
        const res = await fetch("/api/jobs/api/job_list");
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des offres:", error);
      }
    }
    loadCompanyJobs();
  }, []);

  const fetchRecommendations = async (jobId = null, prompt = null) => {
    setLoading(true);
    try {
      let context = {};
      if (jobId) {
        const res = await getJobDetail(jobId);
        if (res.success) {
          context.job = res.data;
        }
      }
      let aiPrompt = prompt;
      if (!aiPrompt && jobId) {
        aiPrompt = `Recommande-moi des talents qui correspondent à cette offre d'emploi :
        - Titre : ${context.job.title}
        - Localisation : ${context.job.location}
        - Salaire : ${context.job.salary_range}
        - Description : ${context.job.description}
        - Compétences requises : ${context.job.skills || []}
        `;
      } else if (!aiPrompt) {
        aiPrompt = "Recommande-moi des talents en fonction de mes besoins actuels.";
      }
      const res = await askAI(aiPrompt, context);
      if (res.response) {
        try {
          setRecommendations(JSON.parse(res.response));
        } catch (e) {
          setRecommendations([]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    fetchRecommendations(job.job_id);
  };

  const handleCustomPrompt = () => {
    setIsModalOpen(true);
  };

  const handlePromptSubmit = (prompt) => {
    setCustomPrompt(prompt);
    fetchRecommendations(null, prompt);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white shadow-sm hover:bg-gray-50 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Recommandations de Talents par IA</h1>
        </div>

        {/* OPTIONS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Comment souhaitez-vous procéder ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleCustomPrompt}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition"
            >
              <Sparkles className="w-5 h-5" />
              <span>Décrire mes besoins</span>
            </button>
            <div className="relative">
              <select
                onChange={(e) => {
                  const job = jobs.find(j => j.job_id === e.target.value);
                  if (job) handleJobSelect(job);
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                defaultValue=""
              >
                <option value="" disabled>Sélectionner une offre d'emploi</option>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.title} - {job.location}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Aucune offre disponible</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-600" />
            <p className="mt-4 text-gray-600">Recherche de talents en cours...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {selectedJob ? `Recommandations pour : ${selectedJob.title}` : "Recommandations personnalisées"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((talent, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-xl font-bold">
                      {talent.name ? talent.name.charAt(0) : "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{talent.name || "Talent anonyme"}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {talent.title || "Poste non spécifié"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-4 space-y-2">
                    {talent.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        {talent.location}
                      </p>
                    )}
                    {talent.rating && (
                      <p className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {talent.rating}/5
                      </p>
                    )}
                  </div>
                  {talent.skills && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {talent.skills.slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs bg-gray-100 border border-gray-200 rounded-full text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/hr/talent-market?search=${talent.name || ""}`)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Voir le profil
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {jobs.length === 0 ? (
              <>
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Vous n'avez pas encore d'offres d'emploi.</p>
                <button
                  onClick={() => navigate("/jobs/create_job")}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
                >
                  Créer une offre
                </button>
              </>
            ) : (
              <>
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune recommandation disponible</p>
                <p className="mt-2 text-sm">Sélectionnez une offre ou décrivez vos besoins pour obtenir des recommandations.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AIPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsightsGenerated={handlePromptSubmit}
      />
    </div>
  );
}
