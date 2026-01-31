// src/pages/Jobs/Entreprises/components/AttemptDetailsModal.jsx
import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  MessageSquare,
  Award,
  AlertCircle,
  Copy,
  Download,
  Printer,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Percent,
  BarChart,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AttemptDetailsModal({
  attempt,
  test,
  onClose
}) {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showCodeOnly, setShowCodeOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'correct', 'incorrect', 'needs_review'

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const expandAllQuestions = () => {
    const allExpanded = {};
    test.questions?.forEach(q => {
      allExpanded[q.id] = true;
    });
    setExpandedQuestions(allExpanded);
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions({});
  };

  const getQuestionStatus = (questionResult) => {
    if (questionResult.needs_review) {
      return {
        label: 'À revoir',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }

    if (questionResult.is_correct) {
      return {
        label: 'Correct',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      };
    } else {
      return {
        label: 'Incorrect',
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />
      };
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'coding': return <Code className="w-4 h-4 text-green-600" />;
      case 'open_ended': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'true_false': return <FileText className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'QCM';
      case 'coding': return 'Code';
      case 'open_ended': return 'Réponse ouverte';
      case 'true_false': return 'Vrai/Faux';
      default: return type;
    }
  };

  // Filtrer les questions selon l'onglet actif
  const filteredQuestions = test.questions?.filter(question => {
    const result = attempt.results?.find(r => r.question_id === question.id);
    if (!result) return false;

    switch (activeTab) {
      case 'correct':
        return result.is_correct;
      case 'incorrect':
        return !result.is_correct && !result.needs_review;
      case 'needs_review':
        return result.needs_review;
      default:
        return true;
    }
  });

  // Calculer les statistiques
  const calculateStats = () => {
    const stats = {
      total: test.questions?.length || 0,
      correct: 0,
      incorrect: 0,
      needsReview: 0,
      totalScore: 0,
      maxScore: test.total_points || 0
    };

    test.questions?.forEach(question => {
      const result = attempt.results?.find(r => r.question_id === question.id);
      if (result) {
        stats.totalScore += result.score_obtained || 0;

        if (result.needs_review) {
          stats.needsReview++;
        } else if (result.is_correct) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      }
    });

    stats.percentage = stats.maxScore > 0 ? (stats.totalScore / stats.maxScore * 100) : 0;

    return stats;
  };

  const stats = calculateStats();

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Vous pourriez ajouter une notification ici
    });
  };

  const handleExportToPDF = () => {
    // Implémenter l'export PDF ici
    console.log('Export PDF à implémenter');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Détails des réponses</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm text-gray-600">
                  Candidat: <span className="font-semibold">{attempt.candidate_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Email: <span className="font-semibold">{attempt.candidate_email}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Date: <span className="font-semibold">
                    {new Date(attempt.submitted_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Statistiques globales */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.totalScore.toFixed(1)}/{stats.maxScore}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pourcentage</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Réponses correctes</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.correct}/{stats.total}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Temps passé</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {attempt.duration || 0} min
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{stats.correct}/{stats.total} correctes</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions globales */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={expandAllQuestions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Déplier tout
              </button>
              <button
                onClick={collapseAllQuestions}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium flex items-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                Replier tout
              </button>
              {test.questions?.some(q => q.type === 'coding') && (
                <button
                  onClick={() => setShowCodeOnly(!showCodeOnly)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium flex items-center gap-2"
                >
                  {showCodeOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCodeOnly ? 'Tout afficher' : 'Code seulement'}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportToPDF}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>

          {/* Filtres par onglet */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('correct')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'correct'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Correctes ({stats.correct})
              </button>
              <button
                onClick={() => setActiveTab('incorrect')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'incorrect'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Incorrectes ({stats.incorrect})
              </button>
              {stats.needsReview > 0 && (
                <button
                  onClick={() => setActiveTab('needs_review')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'needs_review'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  À revoir ({stats.needsReview})
                </button>
              )}
            </div>
          </div>

          {/* Liste des questions */}
          <div className="space-y-4">
            {filteredQuestions?.map((question, index) => {
              const result = attempt.results?.find(r => r.question_id === question.id);
              const isExpanded = expandedQuestions[question.id];
              const status = result ? getQuestionStatus(result) : null;

              if (!result) return null;

              // Si on montre seulement le code et que ce n'est pas une question de code, on saute
              if (showCodeOnly && question.type !== 'coding') {
                return null;
              }

              return (
                <div key={question.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* En-tête de la question */}
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-900">{index + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getQuestionTypeIcon(question.type)}
                          <span className="text-sm text-gray-600">
                            {getQuestionTypeLabel(question.type)}
                          </span>
                        </div>

                        <div className="ml-4">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {question.question}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">
                              Points: <span className="font-medium">{question.points}</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              Score obtenu: <span className="font-medium">{result.score_obtained || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {status && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </div>
                        )}

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenu détaillé (si déplié) */}
                  {isExpanded && (
                    <div className="p-6 bg-white">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Réponse du candidat */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-gray-900 text-lg">Réponse du candidat</h5>
                            {question.type === 'open_ended' && result.user_answer?.answer && (
                              <button
                                onClick={() => handleCopyToClipboard(result.user_answer.answer)}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                Copier
                              </button>
                            )}
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {question.type === 'mcq' && result.user_answer?.selected_options && (
                              <div className="space-y-3">
                                <p className="font-medium text-gray-700">Options sélectionnées:</p>
                                {question.options?.map((option, optIndex) => {
                                  const isSelected = result.user_answer.selected_options.includes(option.id);
                                  const isCorrect = option.is_correct;

                                  return (
                                    <div
                                      key={option.id}
                                      className={`p-3 rounded-lg border ${
                                        isSelected
                                          ? isCorrect
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-red-300 bg-red-50'
                                          : 'border-gray-200 bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          isSelected
                                            ? isCorrect
                                              ? 'bg-green-500 text-white'
                                              : 'bg-red-500 text-white'
                                            : 'bg-gray-200'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`font-medium ${
                                            isSelected
                                              ? isCorrect ? 'text-green-700' : 'text-red-700'
                                              : 'text-gray-700'
                                          }`}>
                                            {option.text}
                                          </p>
                                        </div>
                                        {isSelected && isCorrect && (
                                          <CheckCircle className="w-5 h-5 text-green-500" />
                                        )}
                                        {isSelected && !isCorrect && (
                                          <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {question.type === 'open_ended' && (
                              <div>
                                <p className="text-gray-700 whitespace-pre-line mb-3">
                                  {result.user_answer?.answer || 'Aucune réponse fournie'}
                                </p>

                                {result.user_answer?.answer && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Analyse:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {question.expected_keywords?.map((keyword, idx) => {
                                        const found = result.user_answer?.answer?.toLowerCase().includes(keyword.toLowerCase());
                                        return (
                                          <span
                                            key={idx}
                                            className={`px-3 py-1 rounded-full text-sm ${
                                              found
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}
                                          >
                                            {keyword}
                                            {found ? ' ✓' : ' ✗'}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {question.type === 'coding' && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">
                                    Langage: <span className="font-medium">{question.language}</span>
                                  </span>
                                  <button
                                    onClick={() => handleCopyToClipboard(result.user_answer?.code || '')}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copier le code
                                  </button>
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                  {result.user_answer?.code || '// Aucun code fourni'}
                                </pre>

                                {result.user_answer?.output && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-600 mb-2">Sortie obtenue:</p>
                                    <div className="bg-gray-800 text-green-100 p-3 rounded-lg font-mono text-sm">
                                      {result.user_answer.output}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {question.type === 'true_false' && (
                              <div className="text-center py-4">
                                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                                  result.user_answer?.answer === question.correct_answer
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  <span className="text-2xl font-bold">
                                    {result.user_answer?.answer ? 'VRAI' : 'FAUX'}
                                  </span>
                                  {result.user_answer?.answer === question.correct_answer ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Réponse attendue et explication */}
                        <div>
                          <h5 className="font-bold text-gray-900 text-lg mb-3">Réponse attendue</h5>

                          <div className="space-y-4">
                            {question.type === 'mcq' && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="font-medium text-green-800 mb-2">Options correctes:</p>
                                {question.options?.filter(opt => opt.is_correct).map((opt, idx) => {
                                  const optionIndex = question.options.findIndex(o => o.id === opt.id);
                                  return (
                                    <div key={opt.id} className="flex items-center gap-3 p-3 bg-green-100 rounded-lg mb-2">
                                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-medium">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-green-800">{opt.text}</p>
                                      </div>
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {question.type === 'open_ended' && question.expected_keywords?.length > 0 && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="font-medium text-green-800 mb-2">Mots-clés attendus:</p>
                                <div className="flex flex-wrap gap-2">
                                  {question.expected_keywords.map((keyword, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {question.type === 'coding' && (
                              <div className="space-y-4">
                                {question.expected_output && (
                                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="font-medium text-green-800 mb-2">Sortie attendue:</p>
                                    <pre className="bg-green-900 text-green-100 p-3 rounded-lg text-sm overflow-x-auto">
                                      {question.expected_output}
                                    </pre>
                                  </div>
                                )}

                                {question.test_cases?.length > 0 && (
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="font-medium text-blue-800 mb-2">Cas de test:</p>
                                    <div className="space-y-2">
                                      {question.test_cases.map((testCase, idx) => (
                                        <div key={idx} className="bg-blue-100 p-2 rounded">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="text-blue-700 font-medium">Input:</span>
                                              <pre className="mt-1">{testCase.input}</pre>
                                            </div>
                                            <div>
                                              <span className="text-green-700 font-medium">Expected:</span>
                                              <pre className="mt-1">{testCase.expected}</pre>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {question.type === 'true_false' && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="font-medium text-green-800 mb-2">Réponse correcte:</p>
                                <div className="text-center">
                                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                                    <span className="text-2xl font-bold">
                                      {question.correct_answer ? 'VRAI' : 'FAUX'}
                                    </span>
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Explication */}
                            {question.explanation && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600" />
                                  <p className="font-medium text-blue-800">Explication:</p>
                                </div>
                                <p className="text-blue-700">{question.explanation}</p>
                              </div>
                            )}

                            {/* Feedback IA si disponible */}
                            {attempt.ai_evaluation?.question_evaluations?.find(e => e.question_id === question.id) && (
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart className="w-4 h-4 text-purple-600" />
                                  <p className="font-medium text-purple-800">Évaluation IA:</p>
                                </div>
                                <p className="text-purple-700">
                                  {attempt.ai_evaluation.question_evaluations.find(e => e.question_id === question.id)?.ai_feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Feedback manuel */}
                      {attempt.grades?.[question.id] !== undefined && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h6 className="font-medium text-gray-900 mb-2">Notation manuelle:</h6>
                          <div className="flex items-center gap-4">
                            <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                              <span className="text-sm text-yellow-800">
                                Note: <span className="font-bold">{attempt.grades[question.id]}</span>/{question.points}
                              </span>
                            </div>
                            {attempt.manual_feedback && (
                              <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-700 text-sm">{attempt.manual_feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Aucune question pour le filtre */}
          {filteredQuestions?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune question ne correspond au filtre
              </h3>
              <p className="text-gray-600">
                Modifiez les filtres pour voir les questions
              </p>
            </div>
          )}

          {/* Actions finales */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Fermer
            </button>

            <div className="flex gap-3">
              {stats.percentage >= test.passing_score ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">Test réussi</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="font-medium">Test échoué</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}