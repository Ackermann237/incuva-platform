// src/pages/Jobs/Entreprises/TestResultsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BarChart,
  CheckSquare,
  XSquare,
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Award,
  TrendingUp,
  AlertCircle,
  Brain,
  PenTool,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  User,
  Calendar,
  Percent
} from 'lucide-react';
import {
  getTestAttempts,
  getTechnicalTest,
  getCompanyTechnicalTests,
  evaluateTestWithAI,
  manuallyGradeAttempt,
  getCompanyJobs
} from '../../../services/technical';
import AttemptDetailsModal from "./TechnicalTest/components/AttemptDetailsModal.jsx";

export default function TestResultsDashboard() {
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewingAttemptDetails, setViewingAttemptDetails] = useState(null);

  // Créez une fonction pour gérer l'ouverture de la modale
  const handleViewCandidateDetails = (attempt) => {
    setViewingAttemptDetails(attempt);
  };


  // Données
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Filtres
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedTestId, setSelectedTestId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // État pour la notation manuelle
  const [gradingAttempt, setGradingAttempt] = useState(null);
  const [manualGrades, setManualGrades] = useState({});
  const [manualFeedback, setManualFeedback] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);

  // État pour l'évaluation IA
  const [evaluatingAI, setEvaluatingAI] = useState(false);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTestId !== 'all' && selectedTestId) {
      loadTestAttempts(selectedTestId);
    }
  }, [selectedTestId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les jobs
      const jobsRes = await getCompanyJobs();
      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
      }

      // Charger les tests
      const testsRes = await getCompanyTechnicalTests();
      if (testsRes.success) {
        setTests(testsRes.data || []);
        if (testsRes.data.length > 0) {
          setSelectedTestId(testsRes.data[0].id);
        }
      } else {
        setError(testsRes.error);
      }

    } catch (err) {
      console.error('Erreur chargement dashboard résultats:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadTestAttempts = async (testId) => {
    try {
      setLoading(true);

      // Charger le test sélectionné
      const testRes = await getTechnicalTest(testId);
      if (testRes.success) {
        setSelectedTest(testRes.data);
      }

      // Charger les tentatives
      const attemptsRes = await getTestAttempts(testId);
      if (attemptsRes.success) {
        setAttempts(attemptsRes.data.attempts || []);
      } else {
        setAttempts([]);
      }

    } catch (err) {
      console.error('Erreur chargement tentatives:', err);
      setError('Erreur lors du chargement des tentatives');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateWithAI = async (attemptId) => {
    try {
      setEvaluatingAI(true);
      setError('');

      const res = await evaluateTestWithAI(selectedTestId, attemptId);

      if (res.success) {
        setSuccess('Test évalué avec succès par l\'IA');

        // Recharger les tentatives
        await loadTestAttempts(selectedTestId);

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Erreur lors de l\'évaluation IA');
      }

    } catch (err) {
      setError('Erreur lors de l\'évaluation IA');
      console.error(err);
    } finally {
      setEvaluatingAI(false);
    }
  };

  const handleManualGrade = async () => {
    if (!gradingAttempt) return;

    try {
      setGradingLoading(true);
      setError('');

      const res = await manuallyGradeAttempt(
        selectedTestId,
        gradingAttempt.id,
        manualGrades,
        manualFeedback
      );

      if (res.success) {
        setSuccess('Test noté avec succès');
        setGradingAttempt(null);
        setManualGrades({});
        setManualFeedback('');

        // Recharger les tentatives
        await loadTestAttempts(selectedTestId);

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Erreur lors de la notation');
      }

    } catch (err) {
      setError('Erreur lors de la notation');
      console.error(err);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleViewAttemptDetails = (attempt) => {
    setGradingAttempt(attempt);

    // Pré-remplir les notes si elles existent
    if (attempt.grades) {
      setManualGrades(attempt.grades);
    }
    if (attempt.manual_feedback) {
      setManualFeedback(attempt.manual_feedback);
    }
  };

  const calculateStatistics = () => {
    if (!attempts.length) return null;

    const total = attempts.length;
    const passed = attempts.filter(a => {
      if (a.status === 'evaluated' && a.ai_passed !== undefined) {
        return a.ai_passed;
      }
      if (a.status === 'manually_graded' && a.manual_passed !== undefined) {
        return a.manual_passed;
      }
      return a.passed;
    }).length;

    const averageScore = attempts.reduce((sum, attempt) => {
      if (attempt.status === 'evaluated' && attempt.ai_percentage !== undefined) {
        return sum + attempt.ai_percentage;
      }
      if (attempt.status === 'manually_graded' && attempt.manual_percentage !== undefined) {
        return sum + attempt.manual_percentage;
      }
      return sum + (attempt.percentage || 0);
    }, 0) / total;

    const pending = attempts.filter(a =>
      a.status !== 'evaluated' &&
      a.status !== 'manually_graded'
    ).length;

    return {
      total,
      passed,
      failed: total - passed,
      averageScore,
      pending,
      passRate: (passed / total) * 100
    };
  };

  const getAttemptStatus = (attempt) => {
    if (attempt.status === 'evaluated') {
      return {
        label: 'Évalué par IA',
        color: 'bg-blue-100 text-blue-800',
        icon: <Brain className="w-4 h-4" />
      };
    }
    if (attempt.status === 'manually_graded') {
      return {
        label: 'Noté manuellement',
        color: 'bg-green-100 text-green-800',
        icon: <PenTool className="w-4 h-4" />
      };
    }
    if (selectedTest?.grading_mode === 'manual') {
      return {
        label: 'En attente de notation',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      };
    }
    if (selectedTest?.grading_mode === 'auto') {
      return {
        label: 'À évaluer par IA',
        color: 'bg-purple-100 text-purple-800',
        icon: <Brain className="w-4 h-4" />
      };
    }
    return {
      label: 'Soumis',
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="w-4 h-4" />
    };
  };

  const stats = calculateStatistics();

  if (loading && !attempts.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Résultats des Tests</h1>
              <p className="text-gray-600 mt-2">
                Consultez et évaluez les tests techniques de vos candidats
              </p>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tests soumis</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de réussite</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.passRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Score moyen</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckSquare className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les jobs</option>
                {jobs.map(job => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les tests</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="evaluated">Évalué par IA</option>
                <option value="manually_graded">Noté manuellement</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Liste des tentatives */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {attempts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun test soumis</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {selectedTest
                  ? 'Aucun candidat n\'a encore passé ce test.'
                  : 'Sélectionnez un test pour voir les tentatives.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Candidat</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Test</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Score</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map(attempt => {
                    const status = getAttemptStatus(attempt);
                    const score = attempt.status === 'evaluated'
                      ? attempt.ai_percentage
                      : attempt.status === 'manually_graded'
                      ? attempt.manual_percentage
                      : attempt.percentage;

                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {attempt.name || 'Candidat anonyme'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {attempt.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {selectedTest?.title || 'Test'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.duration} minutes
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {status.icon}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-gray-400" />
                            <span className={`font-bold ${
                              score >= 70 ? 'text-green-600' : 
                              score >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {score?.toFixed(1) || 'N/A'}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            {new Date(attempt.submitted_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(attempt.submitted_at).toLocaleTimeString('fr-FR')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCandidateDetails(attempt)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </button>

                            {selectedTest?.grading_mode === 'auto' && attempt.status !== 'evaluated' && (
                              <button
                                onClick={() => handleEvaluateWithAI(attempt.id)}
                                disabled={evaluatingAI}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                              >
                                {evaluatingAI ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Brain className="w-4 h-4" />
                                )}
                                Évaluer IA
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de notation manuelle */}
      {gradingAttempt && selectedTest && (
        <ManualGradingModal
          attempt={gradingAttempt}
          test={selectedTest}
          onClose={() => {
            setGradingAttempt(null);
            setManualGrades({});
            setManualFeedback('');
          }}
          onGrade={handleManualGrade}
          grades={manualGrades}
          setGrades={setManualGrades}
          feedback={manualFeedback}
          setFeedback={setManualFeedback}
          loading={gradingLoading}
        />
      )}

    {viewingAttemptDetails && selectedTest && (
      <AttemptDetailsModal
        attempt={viewingAttemptDetails}
        test={selectedTest}
        onClose={() => setViewingAttemptDetails(null)}
      />
    )}

    </div>
  );
}

// Composant Modal de notation manuelle
function ManualGradingModal({
  attempt,
  test,
  onClose,
  onGrade,
  grades,
  setGrades,
  feedback,
  setFeedback,
  loading
}) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const calculateTotalScore = () => {
    let total = 0;
    test.questions?.forEach(question => {
      const questionId = question.id;
      const maxPoints = question.points || 1;
      const givenPoints = parseFloat(grades[questionId] || 0);
      total += Math.min(givenPoints, maxPoints);
    });
    return total;
  };

  const calculatePercentage = () => {
    const totalScore = calculateTotalScore();
    const maxScore = test.total_points || 1;
    return (totalScore / maxScore) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Noter le test</h2>
              <p className="text-gray-600">
                Candidat: <span className="font-semibold">{attempt.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <button
              onClick={() => {
                // Fermer cette modal et ouvrir la modal de détails
                onClose();
                // Vous aurez besoin d'une fonction passée en prop pour ouvrir la modal de détails
                // Par exemple: onViewDetails?.()
              }}
              className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir les réponses détaillées
            </button>
          </div>

          {/* Résumé du score */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {calculateTotalScore().toFixed(1)}/{test.total_points || 0}
                </div>
                <div className="text-sm text-gray-600">Score total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {calculatePercentage().toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Pourcentage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  calculatePercentage() >= test.passing_score ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculatePercentage() >= test.passing_score ? 'Réussi' : 'Échoué'}
                </div>
                <div className="text-sm text-gray-600">Résultat (seuil: {test.passing_score}%)</div>
              </div>
            </div>
          </div>

          {/* Liste des questions */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notation par question</h3>
            <div className="space-y-3">
              {test.questions?.map((question, index) => {
                const questionId = question.id;
                const maxPoints = question.points || 1;
                const currentPoints = parseFloat(grades[questionId] || 0);
                const isExpanded = expandedQuestions[questionId];

                // Trouver la réponse du candidat
                const candidateAnswer = attempt.results?.find(
                  r => r.question_id === questionId
                );

                return (
                  <div key={questionId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleQuestion(questionId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{question.question}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-600">
                                Type: <span className="font-medium">{question.type}</span>
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">
                                Points max: <span className="font-medium">{maxPoints}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={maxPoints}
                            step="0.5"
                            value={currentPoints}
                            onChange={(e) => setGrades(prev => ({
                              ...prev,
                              [questionId]: e.target.value
                            }))}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-gray-500">/ {maxPoints}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        {/* Réponse du candidat */}
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Réponse du candidat:</h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {question.type === 'mcq' && candidateAnswer?.user_answer?.selected_options && (
                              <div>
                                <p className="text-gray-700">
                                  Options sélectionnées: {candidateAnswer.user_answer.selected_options.join(', ')}
                                </p>
                              </div>
                            )}
                            {question.type === 'open_ended' && (
                              <p className="text-gray-700 whitespace-pre-line">
                                {candidateAnswer?.user_answer?.answer || 'Aucune réponse'}
                              </p>
                            )}
                            {question.type === 'coding' && (
                              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                                {candidateAnswer?.user_answer?.code || '// Aucun code'}
                              </pre>
                            )}
                            {question.type === 'true_false' && (
                              <p className="text-gray-700">
                                Réponse: {candidateAnswer?.user_answer?.answer ? 'Vrai' : 'Faux'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Réponse attendue */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Réponse attendue:</h5>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            {question.type === 'mcq' && (
                              <div>
                                <p className="text-green-700 font-medium mb-1">Options correctes:</p>
                                <ul className="text-green-800">
                                  {question.options?.filter(opt => opt.is_correct).map(opt => (
                                    <li key={opt.id}>• {opt.text}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {question.type === 'open_ended' && (
                              <div>
                                <p className="text-green-700 font-medium mb-1">Mots-clés attendus:</p>
                                <div className="flex flex-wrap gap-2">
                                  {question.expected_keywords?.map((keyword, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {question.type === 'coding' && (
                              <div>
                                <p className="text-green-700 font-medium mb-1">Sortie attendue:</p>
                                <pre className="bg-green-900 text-green-100 p-3 rounded-lg text-sm overflow-x-auto">
                                  {question.expected_output}
                                </pre>
                              </div>
                            )}
                            {question.type === 'true_false' && (
                              <p className="text-green-700">
                                Réponse correcte: {question.correct_answer ? 'Vrai' : 'Faux'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback pour le candidat</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajoutez un feedback détaillé pour le candidat..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={onGrade}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Notation en cours...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4" />
                  Noter le test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ajoutez l'import manquant pour X
const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);