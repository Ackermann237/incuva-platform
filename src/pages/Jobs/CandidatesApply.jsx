// src/pages/Jobs/CandidatesApply.jsx
import React, { useState, useEffect } from "react";
import { getJobList, getJobApplications } from "../../services/jobs";
import { Users, Clock, CheckCircle, XCircle, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CandidatesApply() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllApplications();
  }, []);

  const loadAllApplications = async () => {
    setLoading(true);
    const jobRes = await getJobList();
    if (jobRes.success) {
      setJobs(jobRes.data);
      const apps = await Promise.all(
        jobRes.data.map(job => getJobApplications(job.job_id))
      );
      const allApps = apps.flatMap(res => res.success ? res.data : []);
      setApplications(allApps);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-600" />;
      case "accepted": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Chargement des candidatures...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Toutes les candidatures ({applications.length})</h3>
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune candidature reçue pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const job = jobs.find(j => j.job_id === app.job_id);
              return (
                <div key={app.application_id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {app.candidate_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{app.candidate_name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {job?.title || 'Offre inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(app.applied_at), "dd MMM yyyy", { locale: fr })}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className="font-medium capitalize">
                          {app.status === 'pending' ? 'En cours' : app.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                      </div>
                    </div>
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