// src/pages/HR/RecruitmentManagement.jsx
import React, { useState } from "react";
import {
  Users, Briefcase, Clock, CheckCircle,
  XCircle, Search, Filter, ChevronRight,
  Star, TrendingUp, FileText, MapPin,
  Calendar, Eye, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecruitmentManagement({ data, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [hoveredJob, setHoveredJob] = useState(null);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Les données de recrutement n'ont pas pu être chargées.
          Veuillez réessayer ou contacter le support.
        </p>
      </div>
    );
  }

  const { metrics, jobs, applications, favorite_count, job_applications } = data;

  const filteredJobs = job_applications.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "open" && job.application_count > 0) ||
      (filterStatus === "empty" && job.application_count === 0);
    return matchesSearch && matchesFilter;
  });

  const statusStats = {
    all: job_applications.length,
    open: job_applications.filter(j => j.application_count > 0).length,
    empty: job_applications.filter(j => j.application_count === 0).length
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header avec effet de verre */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              Gestion du Recrutement
            </h1>
            <p className="text-blue-100 opacity-90">
              Gérez vos offres d'emploi et suivez les candidatures en temps réel
            </p>
          </div>
          <button
            onClick={() => navigate("/create-job")}
            className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Nouvelle Offre
          </button>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un poste, une localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none appearance-none bg-white pr-10 cursor-pointer"
              >
                <option value="all">Tous les postes ({statusStats.all})</option>
                <option value="open">Avec candidatures ({statusStats.open})</option>
                <option value="empty">Sans candidatures ({statusStats.empty})</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-1">{jobs.length}</p>
            <p className="text-sm text-blue-700 font-medium">Offres publiées</p>
            <div className="mt-3 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-3/4"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-1">{applications.length}</p>
            <p className="text-sm text-blue-700 font-medium">Candidatures</p>
            <div className="mt-3 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-2/3"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-1">{metrics?.pending || 0}</p>
            <p className="text-sm text-blue-700 font-medium">En attente</p>
            <div className="mt-3 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-1/2"></div>
            </div>
          </div>

          <div
            onClick={() => navigate("/favorites")}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <ExternalLink className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-1">{favorite_count}</p>
            <p className="text-sm text-blue-700 font-medium">Favoris</p>
            <div className="mt-3 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>

        {/* Jobs List Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Offres d'emploi ({filteredJobs.length})
          </h3>
          <span className="text-sm text-gray-500">
            {searchTerm && `Résultats pour "${searchTerm}"`}
          </span>
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucun poste trouvé</h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Aucune offre ne correspond à votre recherche. Essayez d'autres termes ou créez une nouvelle offre.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.job_id}
                onMouseEnter={() => setHoveredJob(job.job_id)}
                onMouseLeave={() => setHoveredJob(null)}
                onClick={() => navigate(`/jobs/${job.job_id}`)}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Hover effect line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 transition-transform duration-300 ${hoveredJob === job.job_id ? 'translate-x-0' : '-translate-x-full'}`}></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {job.application_count > 0 && (
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.application_count > 5 ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                          {job.application_count} candidature{job.application_count > 1 ? 's' : ''}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {job.application_count} en attente
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${job.application_count === 0 ? 'text-gray-300' : 'text-blue-600'}`}>
                        {job.application_count}
                      </div>
                      <p className="text-xs text-gray-500">candidatures</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all ${hoveredJob === job.job_id ? 'scale-110' : ''}`}>
                      <ChevronRight className={`w-5 h-5 text-blue-600 transition-transform ${hoveredJob === job.job_id ? 'translate-x-1' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}