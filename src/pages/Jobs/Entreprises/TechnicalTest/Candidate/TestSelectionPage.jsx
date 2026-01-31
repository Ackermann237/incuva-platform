// src/pages/Jobs/Entreprise/TechnicalTest/Candidate/TestSelectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Code,
  Clock,
  FileText,
  CheckSquare,
  Users,
  Award,
  AlertCircle,
  Loader2,
  ChevronRight,
  Target,
  Brain
} from 'lucide-react';
import { getAvailableTestsForJob } from '../../../../../services/technical';
import { getJobDetail } from '../../../../../services/jobs';

export default function TestSelectionPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const application = location.state?.application;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les détails du job
      const jobRes = await getJobDetail(jobId);
      if (jobRes.success) {
        setJob(jobRes.data);
      }

      // Charger les tests disponibles
      const testsRes = await getAvailableTestsForJob(jobId);
      if (testsRes.success) {
        setTests(testsRes.data || []);
      } else {
        setError(testsRes.error || 'Erreur lors du chargement des tests');
      }
    } catch (err) {
      console.error('Erreur chargement page sélection test:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTest = (testId) => {
    navigate(`/technical-test/${testId}`, {
      state: {
        job,
        application,
        testId
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Chargement des tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tests Techniques</h1>
                <p className="text-blue-100">
                  {job?.company_name} • {job?.title}
                </p>
                <p className="text-blue-100 mt-2">
                  Sélectionnez un test pour continuer votre processus de recrutement
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Award className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Liste des tests */}
        {tests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun test disponible</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Aucun test technique n'est requis pour cette offre. Vous pouvez passer directement à l'étape suivante.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Retour aux candidatures
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tests disponibles ({tests.length})
              </h2>
              <div className="text-sm text-gray-600">
                Sélectionnez un test pour commencer
              </div>
            </div>

            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      {test.questions?.some(q => q.type === 'coding') ? (
                        <Code className="w-6 h-6 text-blue-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{test.title}</h3>
                      <p className="text-gray-600">{test.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTakeTest(test.id)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2"
                  >
                    Commencer
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{test.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-gray-500" />
                    <span>{test.questions?.length || 0} questions</span>
                  </div>
                  {test.passing_score && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>Score minimum: {test.passing_score}%</span>
                    </div>
                  )}
                  {test.average_score > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Score moyen: {test.average_score.toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {/* Types de questions */}
                {test.questions && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Types de questions :</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(test.questions.map(q => q.type))).map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {type === 'mcq' ? 'Choix multiple' :
                           type === 'coding' ? 'Exercice de code' :
                           type === 'open_ended' ? 'Réponse ouverte' :
                           type === 'true_false' ? 'Vrai/Faux' : type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Instructions importantes</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span>Chaque test est chronométré. Vous ne pourrez pas le reprendre si vous quittez la page.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span>Assurez-vous d'avoir une connexion Internet stable pendant le test.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span>Les résultats seront transmis automatiquement à l'entreprise.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <span>Préparez-vous dans un environnement calme avant de commencer.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}