// src/pages/Jobs/JobList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getJobList, getDashboardStats } from "../../services/jobs";
import CandidateView from "./CandidateView";
import { Briefcase, Users, BarChart3, Plus, ChevronRight, Loader2, AlertCircle, Calendar, Edit3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InsightsAssistant from "../../components/insights/InsightsAssistant";

export default function JobList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("offers");
  const [insightsOpen, setInsightsOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/jobs/candidates")) setActiveTab("candidates");
    else if (path.includes("/jobs/details")) setActiveTab("details");
    else setActiveTab("offers");
  }, [location]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [jobsRes, statsRes] = await Promise.all([
      getJobList(),
      getDashboardStats()
    ]);

    if (jobsRes.success) {
      const jobsWithCount = (jobsRes.data || []).map(job => ({
        ...job,
        applicationCount: statsRes.success ? (statsRes.data.applications_per_job[job.job_id] || 0) : 0
      }));
      setJobs(jobsWithCount);
    } else {
      setError(jobsRes.error || "Impossible de charger les offres");
    }

    if (statsRes.success) {
      setStats(statsRes.data);
    }

    setLoading(false);
  };

  // --- FONCTION DE FORMATAGE POUR LA CARTE ---
  const formatDescription = (content) => {
    if (!content) return "";
    // 1. Convertir le Markdown Gras en HTML
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    // 2. Supprimer les ** restants
    formatted = formatted.replace(/\*\*/g, '');
    return formatted;
  };

  const sidebarItems = [
    { id: "offers", label: "Nos offres", icon: Briefcase, path: "/jobs", count: jobs.length },
    { id: "candidates", label: "Candidatures", icon: Users, path: "/jobs/candidates", count: stats?.total_applications || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r-2 border-blue-100 h-screen sticky top-0 shadow-xl">
          <div className="p-6 border-b-2 border-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Gestion des offres
            </h2>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.count}
                    </span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-6 border-t-2 border-blue-50">
            <h3 className="text-sm font-bold text-gray-600 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taux de réponse</span>
                <span className="font-bold text-green-600">68%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Temps moyen</span>
                <span className="font-bold text-blue-600">4.2 jours</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeTab === "offers" ? "Nos offres d'emploi" : "Candidatures"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === "offers"
                    ? "Gérez vos postes ouverts et suivez les candidatures"
                    : "Consultez et gérez toutes les candidatures"}
                </p>
              </div>
              <div className="flex gap-4">
                {activeTab === "offers" && (
                  <button
                    onClick={() => navigate("/jobs/create")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Nouvelle offre
                  </button>
                )}
                <button
                  onClick={() => setInsightsOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Insights IA
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {activeTab === "offers" && (
              <>
                {/* Graphiques */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Candidatures par mois</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats?.applications_by_month || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6, fill: '#059669' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Statut des candidatures</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats?.status_distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Liste des offres */}
                {jobs.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-xl border-2 border-blue-50">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="w-12 h-12 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune offre publiée</h3>
                    <button
                      onClick={() => navigate("/jobs/create")}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Publier une offre
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {jobs.map((job) => (
                      <div
                        key={job.job_id}
                        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-50 hover:border-blue-200 transition-all hover:shadow-xl group cursor-pointer"
                        onClick={() => navigate(`/jobs/details/${job.job_id}`)}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                Active
                              </span>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-600" />
                                {job.applicationCount} candidature{job.applicationCount > 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                {format(new Date(job.created_at), "dd MMM yyyy", { locale: fr })}
                              </div>
                            </div>

                            {/* DESCRIPTION FORMATÉE SANS ** */}
                            <div
                              className="text-gray-700 line-clamp-2 text-sm prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                            />
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/edit/${job.job_id}`);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all hover:scale-110"
                              title="Modifier"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "candidates" && <CandidateView />}
            {insightsOpen && <InsightsAssistant isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />}
          </div>
        </main>
      </div>
    </div>
  );
}