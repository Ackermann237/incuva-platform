// src/pages/Jobs/CandidateView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobList, getJobApplications } from "../../services/jobs";
import { Briefcase, Users, X, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CandidateView() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [loading, setLoading] = useState(true);

  // Modales
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const toJSDate = (ts) => {
      if (!ts) return null;

      // Si Firestore timestamp
      if (ts.seconds) {
        return new Date(ts.seconds * 1000);
      }

      // Si chaîne de date ISO ou timestamp normal
      const d = new Date(ts);
      return isNaN(d) ? null : d;
  };

  useEffect(() => {
    loadJobsAndApplications();
  }, []);

  const loadJobsAndApplications = async () => {
    setLoading(true);
    const jobRes = await getJobList();
    if (jobRes.success) {
      setJobs(jobRes.data);
      const appsMap = {};
      for (const job of jobRes.data) {
        const appsRes = await getJobApplications(job.job_id);
        if (appsRes.success) {
          appsMap[job.job_id] = appsRes.data;
        }
      }
      setApplicationsByJob(appsMap);
    }
    setLoading(false);
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setJobModalOpen(true);
  };

  const openCandidateModal = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateModalOpen(true);
  };

  const openChat = async (candidateId, jobId) => {
      try {
        const res = await fetch("/api/messaging/start_conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_id: candidateId,
            job_id: jobId
          })
        });

        const data = await res.json();
        if (data.success) {
          navigate(`/messaging/conversation/${data.chat_id}`);
        } else {
          console.error("Erreur démarrage conversation:", data.error);
        }
      } catch (err) {
        console.error("Erreur réseau:", err);
      }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="mt-2 text-gray-600">Chargement des candidatures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune offre publiée</p>
          </div>
        ) : (
          jobs.map((job) => {
            const apps = applicationsByJob[job.job_id] || [];
            return (
              <div
                key={job.job_id}
                onClick={() => openJobModal(job)}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-orange-300 transition-all hover:shadow-xl cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    {apps.length}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{job.location}</span>
                  <span>{format(toJSDate(job.submitted_at), "dd MMMM yyyy", { locale: fr })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* === MODALE : Liste des candidatures d'une offre === */}
      {jobModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Candidatures pour <span className="text-orange-600">{selectedJob.title}</span>
              </h3>
              <button
                onClick={() => setJobModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {applicationsByJob[selectedJob.job_id]?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune candidature</p>
              ) : (
                <div className="space-y-3">
                  {applicationsByJob[selectedJob.job_id].map((app) => (
                    <div
                      key={app.application_id}
                      onClick={() => openCandidateModal(app)}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {app.candidate_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{app.candidate_name}</p>
                          <p className="text-xs text-gray-500">
                            {format(toJSDate(app.submitted_at), "dd MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className="text-sm font-medium capitalize">
                          {app.status === 'pending' ? 'En cours' : app.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MODALE : Détail d'une candidature === */}
      {candidateModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Détail de la candidature</h3>
              <button
                onClick={() => setCandidateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedCandidate.candidate_name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedCandidate.candidate_name}</p>
                  <p className="text-sm text-gray-600">Postulé le {format(toJSDate(selectedCandidate.submitted_at), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Lettre de motivation</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                  {selectedCandidate.motivation}
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">CV</p>
                <a
                  href={selectedCandidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline text-sm"
                >
                  Télécharger le CV
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Compétences</p>
                  <p className="text-gray-600">{selectedCandidate.skills || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Expérience</p>
                  <p className="text-gray-600">{selectedCandidate.experience || "Non spécifié"}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Contact</p>
                <p className="text-gray-600">{selectedCandidate.phone || "Non spécifié"}</p>
              </div>

              <div className="pt-4 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    openChat(
                      selectedCandidate.candidate_id,
                      selectedJob.job_id
                    );
                    setCandidateModalOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter le candidat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}