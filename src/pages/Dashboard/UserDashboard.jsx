// src/pages/Dashboard/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { getUserDashboard } from "../../services/dashboard";
import {
  MapPin, Briefcase, User, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const res = await getUserDashboard();
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.error || "Impossible de charger le tableau de bord");
    }
    setLoading(false);
  };

  const statusConfig = {
    pending: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    accepted: { label: "Acceptée", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    rejected: { label: "Refusée", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-gray-700">{error || "Une erreur est survenue"}</p>
      </div>
    );
  }

  const user = data.user;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profil utilisateur */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName || user?.name || "Candidat"}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">
              Position :{" "}
              <span className={data.has_position ? "text-emerald-600" : "text-amber-600"}>
                {data.has_position ? "Activée" : "À configurer"}
              </span>
            </span>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Activité</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-purple-100 text-sm">Offres disponibles</p>
              <p className="text-4xl font-bold">{data.jobs.length}</p>
            </div>
            <div className="pt-4 border-t border-purple-400/30">
              <p className="text-purple-100 text-sm">Candidatures envoyées</p>
              <p className="text-4xl font-bold">{data.applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs recommandés */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Offres recommandées</h3>
              <p className="text-sm text-gray-500">Les plus adaptées à votre profil</p>
            </div>
          </div>
          {data.jobs.length > 0 && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {data.jobs.length} offre{data.jobs.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {data.jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune offre recommandée pour le moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data.jobs.map((job) => (
              <div
                key={job.job_id}
                className="group p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                  {job.title}
                </h4>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mes candidatures */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mes candidatures</h3>
              <p className="text-sm text-gray-500">Suivi de vos postulations</p>
            </div>
          </div>
          {data.applications.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {data.applications.length} active{data.applications.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {data.applications.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune candidature envoyée pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.applications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={app.application_id}
                  className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{app.job_title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Postulé le {new Date(app.submitted_at || app.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}