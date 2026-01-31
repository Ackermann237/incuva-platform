// src/pages/Offers/MyApplications/components/ApplicationItem.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Video,
  Eye,
  MessageSquare,
  ChevronRight,
  Award,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  Brain,
  AlertCircle
} from 'lucide-react';
import { getAvailableTestsForJob, handleTakeTest as handleTakeTestService } from '../../../../services/technical';

export default function ApplicationItem({ application, navigate }) {
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [showTestMenu, setShowTestMenu] = useState(false);

  // Charger les tests disponibles lorsque la candidature est acceptée
  useEffect(() => {
    if (application.status === 'accepted' && application.job_id) {
      loadAvailableTests();
    }
  }, [application]);

  const loadAvailableTests = async () => {
    try {
      setLoadingTests(true);
      const res = await getAvailableTestsForJob(application.job_id);
      if (res.success) {
        setAvailableTests(res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement tests:', err);
    } finally {
      setLoadingTests(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const prepareInterview = () => {
    navigate(`/interview/training/${application.application_id || application.id}`, {
      state: { application }
    });
  };

  const viewJobDetails = () => {
    navigate(`/jobs/${application.job_id}`);
  };

  const viewApplicationDetails = () => {
    navigate(`/applications/${application.application_id}`);
  };

  const handleTakeTest = (testId) => {
      handleTakeTestService(testId, navigate);
  };

  const handleViewTestList = () => {
      if (availableTests.length === 1) {
        // Si un seul test, aller directement dessus
        handleTakeTest(availableTests[0].id);
      } else {
        // Sinon afficher le menu
        setShowTestMenu(!showTestMenu);
      }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Informations de base */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {application.job_title || application.position}
              </h3>
              <div className="flex items-center gap-3 text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {application.company_name || 'Entreprise non spécifiée'}
                </span>
                {application.location && (
                  <>
                    <span>•</span>
                    <span>{application.location}</span>
                  </>
                )}
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              {getStatusLabel(application.status)}
            </div>
          </div>

          {/* Description */}
          {application.description && (
            <p className="text-gray-700 line-clamp-2 mb-4">
              {application.description}
            </p>
          )}

          {/* Détails supplémentaires */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {application.salary_range && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {application.salary_range}
              </span>
            )}
            {application.contract_type && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {application.contract_type}
              </span>
            )}
            {application.applied_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Postulé le {new Date(application.applied_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          {application.status === 'accepted' && (
            <>
              {/* Bouton pour les tests techniques */}
              {availableTests.length > 0 && (
                <div className="relative">
                  <button
                    onClick={handleViewTestList}
                    disabled={loadingTests}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingTests ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4" />
                        <span>Test technique</span>
                        {availableTests.length > 1 && (
                          <ChevronRight className={`w-4 h-4 transform transition-transform ${showTestMenu ? 'rotate-90' : ''}`} />
                        )}
                      </>
                    )}
                  </button>

                  {/* Menu déroulant des tests (si plusieurs) */}
                  {showTestMenu && availableTests.length > 1 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                          {availableTests.length} test(s) disponible(s)
                        </div>
                        {availableTests.map((test) => (
                          <button
                            key={test.id}
                            onClick={() => handleTakeTest(test.id)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-start gap-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium truncate">{test.title}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {test.duration} min • {test.questions?.length || 0} questions
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={prepareInterview}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                Préparer l'entretien
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={viewJobDetails}
            className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir l'offre
          </button>

          {application.status === 'accepted' && (
            <button
              onClick={viewApplicationDetails}
              className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contacter l'entreprise
            </button>
          )}
        </div>
      </div>

      {/* Conseils pour les candidatures acceptées */}
      {application.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-green-100 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-1">Félicitations ! Vous avez été sélectionné</p>
              <p className="text-sm text-green-700 mb-3">
                L'entreprise souhaite vous rencontrer. Préparez-vous pour votre entretien.
              </p>

              {/* Section des tests techniques */}
              {availableTests.length > 0 ? (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Tests techniques disponibles :</span>
                  </div>
                  <div className="space-y-2">
                    {availableTests.slice(0, 2).map((test) => (
                      <div key={test.id} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 truncate">{test.title}</span>
                          <button
                            onClick={() => handleTakeTest(test.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Commencer →
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {test.questions?.length || 0} questions
                          </span>
                          {test.passing_score && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Score: {test.passing_score}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {availableTests.length > 2 && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowTestMenu(!showTestMenu)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          + {availableTests.length - 2} autre(s) test(s) disponible(s)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : loadingTests ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  Recherche de tests techniques...
                </div>
              ) : (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Aucun test technique n'est requis pour cette offre
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-white text-green-700 rounded-full text-xs font-medium">
                  Conseils d'entretien
                </span>
                <span className="px-3 py-1 bg-white text-green-700 rounded-full text-xs font-medium">
                  Questions fréquentes
                </span>
                <span className="px-3 py-1 bg-white text-green-700 rounded-full text-xs font-medium">
                  Simulation vidéo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message pour les candidatures refusées */}
      {application.status === 'rejected' && (
        <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Candidature non retenue</p>
              <p className="text-sm text-red-700">
                Ne vous découragez pas ! Continuez à postuler à d'autres offres qui correspondent à votre profil.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}