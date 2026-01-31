// src/pages/Jobs/users/TrainingInterview/components/JobDetailsPanel.jsx
import React, { useState } from 'react';
import { Video, ChevronRight, X, Briefcase, MapPin, DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react';
import JobDetailsModal from './JobDetailsModal';

export default function JobDetailsPanel({ jobDetails, applicationId, navigate }) {
  const [showModal, setShowModal] = useState(false);
  const [jobFullDetails, setJobFullDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  if (!jobDetails) return null;

  const handleViewOffer = async () => {
    setLoadingDetails(true);
    try {
      // Récupérer les détails complets de l'offre
      const response = await fetch(`/api/jobs/api/job_detail/${jobDetails.jobId}`);
      const data = await response.json();

      if (data.success) {
        setJobFullDetails(data.job);
        setShowModal(true);
      } else {
        console.error('Erreur lors du chargement des détails:', data.error);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          Détails du poste
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">{jobDetails.title}</h4>
            <p className="text-gray-600 text-sm">{jobDetails.company}</p>
          </div>
          {jobDetails.description && (
            <div>
              <p className="text-sm text-gray-700 line-clamp-4">
                {jobDetails.description.substring(0, 200)}...
              </p>
            </div>
          )}
          <button
            onClick={handleViewOffer}
            disabled={loadingDetails}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {loadingDetails ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Chargement...
              </>
            ) : (
              <>
                Voir l'offre complète
                <ChevronRight className="w-3 h-3 inline ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {showModal && jobFullDetails && (
        <JobDetailsModal
          job={jobFullDetails}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}