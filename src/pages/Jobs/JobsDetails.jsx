// src/pages/Jobs/JobsDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, getJobApplications, updateApplicationStatus } from "../../services/jobs";
import {
  Briefcase, MapPin, DollarSign, Calendar, Users, X,
  ChevronRight, CheckCircle, XCircle, Clock, ArrowLeft,
  Download, Phone, Code2, Eye, FileText, UserCheck,
  Zap, Lightbulb, User, Mail, ExternalLink, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function JobsDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    quickApply: 0
  });

  // Modale détails candidat
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Modale prévisualisation document
  const [viewingDoc, setViewingDoc] = useState(null); // { url, title }

  const [updating, setUpdating] = useState(null);

  const toJSDate = (ts) => {
      if (!ts) return null;
      if (ts.seconds) {
        return new Date(ts.seconds * 1000);
      }
      const d = new Date(ts);
      return isNaN(d) ? null : d;
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    const [jobRes, appsRes] = await Promise.all([
      getJobDetail(jobId),
      getJobApplications(jobId)
    ]);

    if (jobRes.success) {
      setJob(jobRes.data);
    }

    if (appsRes.success) {
      const apps = appsRes.data;
      setApplications(apps);

      // Calculer les statistiques
      const quickApplyCount = apps.filter(app => app.is_quick_apply).length;
      const pendingCount = apps.filter(app => app.status === 'pending').length;
      const acceptedCount = apps.filter(app => app.status === 'accepted').length;
      const rejectedCount = apps.filter(app => app.status === 'rejected').length;

      setStats({
        total: apps.length,
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        quickApply: quickApplyCount
      });
    }
    setLoading(false);
  };

  const openModal = (app) => {
    setSelectedCandidate(app);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    setUpdating(applicationId);
    const res = await updateApplicationStatus(applicationId, status);
    if (res.success) {
      setApplications(prev => prev.map(app =>
        app.application_id === applicationId ? { ...app, status } : app
      ));

      // Mettre à jour les stats
      if (status === 'accepted') {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          accepted: prev.accepted + 1
        }));
      } else if (status === 'rejected') {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1
        }));
      }

      setModalOpen(false);
    }
    setUpdating(null);
  };

  // --- FONCTION DE FORMATAGE ---
  const formatDescription = (content) => {
    if (!content) return "";
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*\*/g, '');

    // Ajout de classes Tailwind pour le rendu
    return formatted
        .replace(/<p>/g, '<p class="mb-4 text-gray-700 leading-relaxed">')
        .replace(/<strong>/g, '<strong class="font-bold text-gray-900">')
        .replace(/\n/g, '<br />');
  };

  // --- LOGIQUE DOCUMENTS ---
  const isUrl = (string) => {
    if (!string) return false;
    return string.startsWith('http') || string.startsWith('www');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-600" />;
      case "accepted": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected": return <XCircle className="w-5 h-5 text-indigo-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">En cours</span>;
      case "accepted":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Acceptée</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">Refusée</span>;
      default:
        return null;
    }
  };

  const getFileExtension = (url) => {
      if (!url) return '';
      const parts = url.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Offre d'emploi introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour aux offres</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Détail de l'offre */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {stats.total} candidature{stats.total > 1 ? 's' : ''}
                      </span>
                      {stats.quickApply > 0 && (
                        <span className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {stats.quickApply} en 1 clic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 ml-12">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p>{job.location}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/jobs/edit/${jobId}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Modifier l'offre
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Salaire</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{job.salary_range}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Publiée le</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{format(toJSDate(job.created_at), "dd MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Candidatures</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{stats.total}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Description du poste</h3>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
              />
            </div>
          </div>
        </div>

        {/* Statistiques des candidatures améliorées */}
        {applications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Candidatures totales */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>Dont {stats.quickApply} en 1 clic</span>
              </div>
            </div>

            {/* En attente */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-yellow-600">
                {stats.pending > 0 ? 'À traiter' : 'À jour'}
              </div>
            </div>

            {/* Acceptées */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Acceptées</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600">
                {stats.total > 0 ? `${Math.round((stats.accepted / stats.total) * 100)}%` : '0%'}
              </div>
            </div>

            {/* Refusées */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Refusées</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-indigo-600">
                {stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        )}

        {/* Liste des candidatures améliorée */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Candidatures reçues</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {applications.length} candidat{applications.length > 1 ? 's' : ''} postulé{applications.length > 1 ? 's' : ''}
                  {stats.quickApply > 0 && (
                    <span className="ml-2 text-green-600 font-medium">
                      • {stats.quickApply} candidature{stats.quickApply > 1 ? 's' : ''} en 1 clic
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Trier par:</span>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Date récente</option>
                  <option>Date ancienne</option>
                  <option>Statut</option>
                  <option>Type de candidature</option>
                </select>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Aucune candidature pour le moment.</p>
              <p className="text-gray-400 text-sm mt-2">Les candidatures apparaitront ici une fois que les candidats auront postulé.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((app, index) => (
                <div
                  key={app.application_id}
                  onClick={() => openModal(app)}
                  className="p-6 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                          {app.candidate_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center">
                          {getStatusIcon(app.status)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-lg">{app.candidate_name}</p>
                          {app.is_quick_apply && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full">
                              <Zap className="w-3 h-3" />
                              En 1 clic
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Postulé le {format(toJSDate(app.submitted_at || app.applied_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                        </p>
                        {app.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.skills.split(',').slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {skill.trim()}
                              </span>
                            ))}
                            {app.skills.split(',').length > 3 && (
                              <span className="text-xs text-gray-500">+{app.skills.split(',').length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(app.status)}
                        {app.is_quick_apply && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Sparkles className="w-3 h-3" />
                            <span>Profil existant</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALE DÉTAILS CANDIDAT AMÉLIORÉE --- */}
      {modalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedCandidate.candidate_name.charAt(0).toUpperCase()}
                  </div>
                  {selectedCandidate.is_quick_apply && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.candidate_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedCandidate.status)}
                    {selectedCandidate.is_quick_apply && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Candidature en 1 clic
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* Section info candidature */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Date de candidature</p>
                    <p className="text-gray-900 font-semibold">
                      {format(toJSDate(selectedCandidate.submitted_at || selectedCandidate.applied_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Type de candidature</p>
                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                      {selectedCandidate.is_quick_apply ? (
                        <>
                          <span className="flex items-center gap-1 text-green-600">
                            <Zap className="w-4 h-4" />
                            En 1 clic
                          </span>
                          <span className="text-xs text-gray-500">(CV automatique)</span>
                        </>
                      ) : (
                        <span className="text-gray-600">Formulaire classique</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Coordonnées
                </h4>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="space-y-3">
                    {selectedCandidate.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Téléphone</p>
                          <p className="text-gray-900 font-medium">{selectedCandidate.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="text-gray-900 font-medium italic">
                          Email disponible via l'interface administrative
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Compétences</h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {selectedCandidate.skills ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-full">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Non spécifié</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Profil complet</h4>
                  </div>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/hr/talent/${selectedCandidate.candidate_id}`);
                    }}
                    className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir le profil complet du candidat
                  </button>
                  {selectedCandidate.is_quick_apply && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Ce candidat a utilisé son profil existant pour postuler rapidement
                    </p>
                  )}
                </div>
              </div>

              {/* DOCUMENTS (CV & Lettre) */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Documents
                </h4>
                <div className="flex flex-wrap gap-4">
                  {/* Bouton CV */}
                  {selectedCandidate.resume_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingDoc({
                          url: selectedCandidate.resume_url,
                          title: `CV de ${selectedCandidate.candidate_name}`,
                          type: getFileExtension(selectedCandidate.resume_url)
                        });
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Consulter le CV
                    </button>
                  )}

                  {/* Bouton Lettre de Motivation (Si URL) */}
                  {(selectedCandidate.cover_letter_url || isUrl(selectedCandidate.motivation)) && (
                    <button
                      onClick={() => setViewingDoc({
                        url: selectedCandidate.cover_letter_url || selectedCandidate.motivation,
                        title: `Lettre de motivation - ${selectedCandidate.candidate_name}`
                      })}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Consulter la lettre
                    </button>
                  )}
                </div>

                {/* Si la motivation est du TEXTE (pas une URL), on l'affiche ici */}
                {!isUrl(selectedCandidate.motivation) && selectedCandidate.motivation && (
                  <div className="mt-4">
                    <p className="font-semibold text-gray-900 mb-2 text-sm">Message du candidat</p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-700 leading-relaxed text-sm">
                      {selectedCandidate.motivation}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedCandidate.status === 'pending' && (
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate.application_id, 'accepted')}
                    disabled={updating === selectedCandidate.application_id}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {updating === selectedCandidate.application_id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Accepter la candidature
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedCandidate.application_id, 'rejected')}
                    disabled={updating === selectedCandidate.application_id}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {updating === selectedCandidate.application_id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Refuser la candidature
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Note informative */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {selectedCandidate.is_quick_apply
                    ? "Ce candidat a postulé en utilisant son profil existant. Vous pouvez consulter son profil complet pour plus d'informations."
                    : "Ce candidat a postulé via le formulaire traditionnel."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE DE PRÉVISUALISATION DOCUMENT (CV/LETTRE) --- */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header de la Modale Document */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{viewingDoc.title}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedCandidate?.candidate_name ? `Candidat: ${selectedCandidate.candidate_name}` : 'Document'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={viewingDoc.url}
                  download={`${viewingDoc.title.replace(/\s+/g, '_')}_${selectedCandidate?.candidate_name || 'document'}.${getFileExtension(viewingDoc.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Viewer amélioré */}
            <div className="flex-1 bg-gray-100 relative">
              {viewingDoc.url ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingDoc.url)}&embedded=true`}
                  title="Document Preview"
                  className="w-full h-full"
                  frameBorder="0"
                  onError={(e) => {
                    console.error("Erreur de chargement du document");
                    e.target.parentElement.innerHTML = `
                      <div class="flex flex-col items-center justify-center h-full p-8">
                        <FileText class="w-16 h-16 text-gray-400 mb-4" />
                        <p class="text-gray-600 text-lg font-medium mb-2">Document non prévisualisable</p>
                        <a href="${viewingDoc.url}" 
                           download 
                           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Télécharger pour voir le document
                        </a>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg font-medium">Document non disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}