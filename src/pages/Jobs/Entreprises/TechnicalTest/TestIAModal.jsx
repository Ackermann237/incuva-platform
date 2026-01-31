// src/pages/Jobs/Entreprises/TechnicalTest/TestIAModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Code,
  FileText,
  Brain,
  Save,
  Edit2,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  Clock,
  BarChart,
  PenTool,
  CheckCircle,
  XCircle,
  Settings,
  HelpCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
  Filter,
  Download,
  Copy,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';

export default function TestIAModal({
  testData,
  jobTitle,
  onClose,
  onSave,
  onEdit,
  onUpdateTest
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [localTestData, setLocalTestData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [validationIssues, setValidationIssues] = useState([]);
  const [showValidation, setShowValidation] = useState(false);

  // Initialiser les données locales
  useEffect(() => {
      if (testData) {
        const processedData = {
          ...testData,
          grading_mode: testData.grading_mode || 'auto'
        };

        // CORRIGER AUTOMATIQUEMENT LES PROBLÈMES COURANTS
        const questions = processedData.questions || [];
        const hasMcqIssues = questions.some(q => {
          if (q.type === 'mcq' && q.options) {
            const correctCount = q.options.filter(opt => opt.is_correct).length;
            return correctCount === 0 || correctCount === q.options.length;
          }
          return false;
        });

        if (hasMcqIssues) {
          // Appliquer la correction automatique
          const fixedTest = { ...processedData };
          fixedTest.questions = questions.map(q => {
            if (q.type === 'mcq' && q.options) {
              const correctCount = q.options.filter(opt => opt.is_correct).length;
              const optionCount = q.options.length;

              // Si aucun correct, mettre le premier
              if (correctCount === 0) {
                q.options.forEach((opt, idx) => {
                  opt.is_correct = (idx === 0);
                });
              }
              // Si tous corrects, garder seulement le premier
              else if (correctCount === optionCount) {
                q.options.forEach((opt, idx) => {
                  opt.is_correct = (idx === 0);
                });
              }
            }
            return q;
          });

          setLocalTestData(fixedTest);
          setValidationIssues(validateQuestions(fixedTest.questions));
        } else {
          setLocalTestData(processedData);
          setValidationIssues(validateQuestions(processedData.questions || []));
        }
      }
    }, [testData]);

  // Fonction de validation des questions
  const validateQuestions = (questions) => {
      const issues = [];

      questions.forEach((question, index) => {
        if (question.type === 'mcq') {
          const correctCount = question.options?.filter(opt => opt.is_correct).length || 0;
          const optionCount = question.options?.length || 0;

          // 1. Vérifier qu'il y a au moins une réponse correcte
          if (correctCount === 0) {
            issues.push({
              type: 'error',
              message: `Question ${index + 1} : Aucune réponse correcte définie`,
              questionIndex: index
            });
          }

          // 2. Vérifier qu'il n'y a pas trop de réponses correctes
          if (correctCount === optionCount) {
            issues.push({
              type: 'error',
              message: `Question ${index + 1} : TOUTES les options sont marquées correctes - impossible!`,
              questionIndex: index
            });
          }

          // 3. Vérifier la cohérence avec multiple_correct
          if (!question.multiple_correct && correctCount > 1) {
            issues.push({
              type: 'warning',
              message: `Question ${index + 1} : ${correctCount} réponses correctes dans un QCM à réponse unique`,
              questionIndex: index
            });
          }

          // 4. Vérifier qu'il y a au moins 1 réponse incorrecte
          const incorrectCount = optionCount - correctCount;
          if (incorrectCount === 0) {
            issues.push({
              type: 'error',
              message: `Question ${index + 1} : Pas de réponse incorrecte définie`,
              questionIndex: index
            });
          }
        }
      });

      return issues;
    };

  if (!localTestData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fade-in text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = localTestData.questions?.[currentQuestionIndex] || null;
  const totalQuestions = localTestData.questions?.length || 0;

  // Fonction pour calculer le total des points
  const calculateTotalPoints = (questions) => {
    if (!questions || !Array.isArray(questions)) return 0;

    return questions.reduce((total, question) => {
      const points = Number(question.points) || 1;
      return total + points;
    }, 0);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckSquare className="w-5 h-5 text-blue-600" />;
      case 'coding': return <Code className="w-5 h-5 text-green-600" />;
      case 'open_ended': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'true_false': return <CheckSquare className="w-5 h-5 text-amber-600" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // Fonction pour corriger automatiquement les questions problématiques
    const fixCommonMcqIssues = () => {
      const updatedTestData = { ...localTestData };
      let fixedCount = 0;

      updatedTestData.questions.forEach((question) => {
        if (question.type === 'mcq' && question.options) {
          const correctCount = question.options.filter(opt => opt.is_correct).length;
          const optionCount = question.options.length;

          // Problème 1: Aucune réponse correcte
          if (correctCount === 0) {
            // Marquer aléatoirement une option comme correcte
            const randomIndex = Math.floor(Math.random() * optionCount);
            question.options.forEach((opt, idx) => {
              opt.is_correct = (idx === randomIndex);
            });
            fixedCount++;
          }

          // Problème 2: Toutes les réponses sont correctes
          if (correctCount === optionCount && optionCount > 1) {
            // Garder seulement la première comme correcte
            question.options.forEach((opt, idx) => {
              opt.is_correct = (idx === 0);
            });
            fixedCount++;
          }

          // Problème 3: QCM simple avec plusieurs bonnes réponses
          if (!question.multiple_correct && correctCount > 1) {
            // Garder seulement la première bonne réponse
            let firstCorrectFound = false;
            question.options.forEach((opt) => {
              if (opt.is_correct && !firstCorrectFound) {
                firstCorrectFound = true;
              } else {
                opt.is_correct = false;
              }
            });
            fixedCount++;
          }
        }
      });

      if (fixedCount > 0) {
        setLocalTestData(updatedTestData);
        const issues = validateQuestions(updatedTestData.questions);
        setValidationIssues(issues);

        if (onUpdateTest) {
          onUpdateTest(updatedTestData);
        }

        return fixedCount;
      }

      return 0;
    };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Question à choix multiple';
      case 'coding': return 'Exercice de code';
      case 'open_ended': return 'Réponse ouverte';
      case 'true_false': return 'Vrai ou Faux';
      default: return type;
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Fonction pour marquer une réponse MCQ comme correcte
  const handleMarkMcqCorrect = (questionId, optionId, isCorrect) => {
    const updatedTestData = { ...localTestData };
    const questionIndex = updatedTestData.questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1 && updatedTestData.questions[questionIndex].type === 'mcq') {
      const question = updatedTestData.questions[questionIndex];

      if (question.options) {
        // Pour les QCM à réponse unique
        if (!question.multiple_correct && isCorrect) {
          // Désélectionner toutes les autres options
          question.options = question.options.map(opt => ({
            ...opt,
            is_correct: opt.id === optionId
          }));
        } else {
          // Pour les QCM à réponses multiples, toggle l'état
          question.options = question.options.map(opt =>
            opt.id === optionId
              ? { ...opt, is_correct: !opt.is_correct }
              : opt
          );
        }

        // Mettre à jour l'état local
        setLocalTestData(updatedTestData);

        // Mettre à jour la validation
        const issues = validateQuestions(updatedTestData.questions);
        setValidationIssues(issues);

        // Notifier le parent si nécessaire
        if (onUpdateTest) {
          onUpdateTest(updatedTestData);
        }
      }
    }
  };

  // Fonction pour marquer spécifiquement une réponse comme incorrecte
  const handleMarkMcqIncorrect = (questionId, optionId) => {
    const updatedTestData = { ...localTestData };
    const questionIndex = updatedTestData.questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1 && updatedTestData.questions[questionIndex].type === 'mcq') {
      const question = updatedTestData.questions[questionIndex];

      if (question.options) {
        // Marquer spécifiquement comme incorrect
        question.options = question.options.map(opt =>
          opt.id === optionId
            ? { ...opt, is_correct: false }
            : opt
        );

        // Mettre à jour l'état local
        setLocalTestData(updatedTestData);

        // Mettre à jour la validation
        const issues = validateQuestions(updatedTestData.questions);
        setValidationIssues(issues);

        // Notifier le parent si nécessaire
        if (onUpdateTest) {
          onUpdateTest(updatedTestData);
        }
      }
    }
  };

  // Fonction pour forcer une option à être correcte
  const handleForceCorrectAnswer = (questionId, optionId) => {
    const updatedTestData = { ...localTestData };
    const questionIndex = updatedTestData.questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1 && updatedTestData.questions[questionIndex].type === 'mcq') {
      const question = updatedTestData.questions[questionIndex];

      if (question.options) {
        // Si question à réponse unique, désélectionner les autres
        if (!question.multiple_correct) {
          question.options = question.options.map(opt => ({
            ...opt,
            is_correct: opt.id === optionId
          }));
        } else {
          // Si question à réponses multiples, ajouter cette option comme correcte
          question.options = question.options.map(opt =>
            opt.id === optionId
              ? { ...opt, is_correct: true }
              : opt
          );
        }

        // Mettre à jour l'état local
        setLocalTestData(updatedTestData);

        // Mettre à jour la validation
        const issues = validateQuestions(updatedTestData.questions);
        setValidationIssues(issues);

        // Notifier le parent si nécessaire
        if (onUpdateTest) {
          onUpdateTest(updatedTestData);
        }
      }
    }
  };

  // Fonction pour basculer entre QCM à réponse unique/multiple
  const handleToggleMcqType = (questionId) => {
    const updatedTestData = { ...localTestData };
    const questionIndex = updatedTestData.questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1 && updatedTestData.questions[questionIndex].type === 'mcq') {
      const question = updatedTestData.questions[questionIndex];

      // Basculer le type
      const newMultipleCorrect = !question.multiple_correct;

      // Si on passe de multiple à single, ne garder que la première réponse correcte
      if (newMultipleCorrect === false && question.options) {
        const correctOptions = question.options.filter(opt => opt.is_correct);
        if (correctOptions.length > 1) {
          // Garder seulement la première réponse correcte
          const firstCorrectId = correctOptions[0].id;
          question.options = question.options.map(opt => ({
            ...opt,
            is_correct: opt.id === firstCorrectId
          }));
        }
      }

      question.multiple_correct = newMultipleCorrect;
      question.mcq_type = newMultipleCorrect ? 'multiple' : 'single';

      // Mettre à jour l'état local
      setLocalTestData(updatedTestData);

      // Mettre à jour la validation
      const issues = validateQuestions(updatedTestData.questions);
      setValidationIssues(issues);

      // Notifier le parent si nécessaire
      if (onUpdateTest) {
        onUpdateTest(updatedTestData);
      }
    }
  };

  // Fonction pour mettre à jour une question Vrai/Faux
  const handleUpdateTrueFalse = (questionId, correctAnswer) => {
    const updatedTestData = { ...localTestData };
    const questionIndex = updatedTestData.questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1) {
      updatedTestData.questions[questionIndex].correct_answer = correctAnswer;
      setLocalTestData(updatedTestData);

      // Mettre à jour la validation
      const issues = validateQuestions(updatedTestData.questions);
      setValidationIssues(issues);

      if (onUpdateTest) {
        onUpdateTest(updatedTestData);
      }
    }
  };

  // Fonction pour fixer toutes les questions sans réponse correcte
  const handleFixAllNoCorrectAnswer = () => {
    const updatedTestData = { ...localTestData };
    let fixedCount = 0;

    updatedTestData.questions.forEach((question, index) => {
      if (question.type === 'mcq') {
        const correctCount = question.options?.filter(opt => opt.is_correct).length || 0;

        if (correctCount === 0 && question.options && question.options.length > 0) {
          // Marquer la première option comme correcte
          question.options[0].is_correct = true;
          fixedCount++;
        }
      }
    });

    if (fixedCount > 0) {
      setLocalTestData(updatedTestData);

      // Mettre à jour la validation
      const issues = validateQuestions(updatedTestData.questions);
      setValidationIssues(issues);

      if (onUpdateTest) {
        onUpdateTest(updatedTestData);
      }

      setSuccess(`${fixedCount} question(s) corrigée(s) : réponse correcte ajoutée`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSaveTest = async () => {
    // Vérifier la validation
    const errorIssues = validationIssues.filter(issue => issue.type === 'error');
    if (errorIssues.length > 0) {
      setError(`Corrigez les erreurs avant de sauvegarder :\n${errorIssues.map(i => i.message).join('\n')}`);
      setShowValidation(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave();
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Rendu d'une question en mode édition
  const renderQuestionInEditMode = (question) => {
    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">{currentQuestionIndex + 1}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {getQuestionTypeIcon(question.type)}
                <h4 className="font-bold text-gray-900">
                  {getQuestionTypeLabel(question.type)}
                </h4>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">
                  Difficulté: <span className="font-medium">{question.difficulty || 'medium'}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  Points: <span className="font-medium">{Number(question.points) || 1}</span>
                </span>
                {question.type === 'mcq' && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      Type: <span className="font-medium">{question.multiple_correct ? 'Multiple' : 'Unique'}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Énoncé de la question */}
        <div className="mb-6">
          <h5 className="text-lg font-medium text-gray-900 mb-3">Énoncé :</h5>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <p className="text-gray-800 whitespace-pre-line">{question.question}</p>
          </div>
        </div>

        {/* Contenu selon le type de question */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-lg font-medium text-gray-900">Options de réponse :</h5>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">
                    {question.options.filter(opt => opt.is_correct).length} correcte(s)
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {question.options.filter(opt => !opt.is_correct).length} incorrecte(s)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleMcqType(question.id)}
                className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2"
              >
                <Zap className="w-3 h-3" />
                {question.multiple_correct ? 'Passer à réponse unique' : 'Passer à réponses multiples'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <div
                  key={option.id || index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    option.is_correct
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100'
                      : 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                  } hover:shadow-md`}
                  onClick={() => handleMarkMcqCorrect(question.id, option.id, !option.is_correct)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      option.is_correct
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-red-400 text-white border-red-500'
                    }`}>
                      <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                    </div>

                    <div className="flex-1">
                      <p className={`font-medium ${
                        option.is_correct ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {option.text}
                      </p>
                    </div>

                    {option.is_correct ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-xs text-green-700 font-medium hidden md:inline">Correcte</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-xs text-red-700 font-medium hidden md:inline">Incorrecte</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.is_correct ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkMcqIncorrect(question.id, option.id);
                        }}
                        className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Marquer comme incorrecte
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleForceCorrectAnswer(question.id, option.id);
                        }}
                        className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Marquer comme correcte
                      </button>
                    )}
                  </div>

                  {option.explanation && (
                    <div className={`mt-3 p-2 rounded text-xs ${
                      option.is_correct 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className="font-medium">Note :</span> {option.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Aide et instructions */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h6 className="font-medium text-blue-900 mb-2">Comment modifier les réponses :</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Cliquez sur une réponse <span className="font-medium text-green-700">verte</span> pour la marquer comme incorrecte</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Cliquez sur une réponse <span className="font-medium text-red-700">rouge</span> pour la marquer comme correcte</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Utilisez "Marquer comme correcte" pour forcer une réponse</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span>Utilisez "Marquer comme incorrecte" pour forcer une réponse fausse</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Type de QCM */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  {question.multiple_correct
                    ? '📋 Ce QCM accepte plusieurs réponses correctes. Le candidat doit sélectionner toutes les bonnes réponses.'
                    : '📋 Ce QCM n\'accepte qu\'une seule réponse correcte. Le candidat doit choisir la meilleure réponse.'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-4">
            <h5 className="text-lg font-medium text-gray-900">Sélectionnez la réponse correcte :</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdateTrueFalse(question.id, true)}
                className={`p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                  question.correct_answer === true
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    question.correct_answer === true
                      ? 'bg-green-500 text-white border-green-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    <span className="font-bold">V</span>
                  </div>
                  <div>
                    <span className={`font-bold text-lg ${
                      question.correct_answer === true ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      Vrai
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Cette affirmation est correcte</p>
                  </div>
                </div>
                {question.correct_answer === true && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">Correct</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleUpdateTrueFalse(question.id, false)}
                className={`p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                  question.correct_answer === false
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    question.correct_answer === false
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    <span className="font-bold">F</span>
                  </div>
                  <div>
                    <span className={`font-bold text-lg ${
                      question.correct_answer === false ? 'text-red-800' : 'text-gray-700'
                    }`}>
                      Faux
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Cette affirmation est incorrecte</p>
                  </div>
                </div>
                {question.correct_answer === false && (
                  <div className="flex items-center gap-1">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">Correct</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Explication si disponible */}
        {question.explanation && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Explication de la réponse :
            </h5>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  // Rendu d'une question en mode prévisualisation
  const renderQuestionInPreviewMode = (question) => {
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-lg font-bold text-gray-900">{currentQuestionIndex + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              {getQuestionTypeIcon(question.type)}
              <div>
                <h4 className="font-bold text-gray-900">
                  {getQuestionTypeLabel(question.type)}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">
                    Difficulté: <span className="font-medium">{question.difficulty || 'medium'}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    Points: <span className="font-medium">{Number(question.points) || 1}</span>
                  </span>
                  {question.type === 'mcq' && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Type: <span className="font-medium">{question.multiple_correct ? 'Multiple' : 'Unique'}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Énoncé de la question */}
        <div className="mb-6">
          <h5 className="text-lg font-medium text-gray-900 mb-3">Énoncé :</h5>
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <p className="text-gray-800 whitespace-pre-line">{question.question}</p>
          </div>
        </div>

        {/* Contenu selon le type de question */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-lg font-medium text-gray-900">Options :</h5>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{question.options.filter(opt => opt.is_correct).length} correcte(s)</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>{question.options.filter(opt => !opt.is_correct).length} incorrecte(s)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <div
                  key={option.id || index}
                  className={`bg-white p-4 rounded-lg border-2 shadow-sm ${
                    option.is_correct
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100'
                      : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      option.is_correct
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-red-400 text-white border-red-500'
                    }`}>
                      <span className="text-xs font-bold">{String.fromCharCode(65 + index)}</span>
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${
                        option.is_correct ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {option.text}
                      </span>
                    </div>
                    {option.is_correct ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-700 font-medium">Correcte</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-700 font-medium">Incorrecte</span>
                      </div>
                    )}
                  </div>

                  {/* Explication de l'option */}
                  {option.explanation && (
                    <div className={`mt-2 text-xs p-2 rounded ${
                      option.is_correct 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <span className="font-medium">Note :</span> {option.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Résumé des bonnes réponses */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h6 className="font-medium text-blue-900">Réponses correctes attendues :</h6>
              </div>
              <div className="flex flex-wrap gap-2">
                {question.options
                  .filter(opt => opt.is_correct)
                  .map((opt, idx) => {
                    const optionIndex = question.options.findIndex(o => o.id === opt.id);
                    return (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg border border-blue-300">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          Option {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="text-xs opacity-75">- {opt.text.substring(0, 30)}...</span>
                      </div>
                    );
                  })}
                {question.options.filter(opt => opt.is_correct).length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg border border-red-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-sm">⚠️ Aucune réponse correcte définie</span>
                  </div>
                )}
              </div>
            </div>

            {/* Avertissement si plusieurs réponses correctes dans un QCM à réponse unique */}
            {!question.multiple_correct && question.options.filter(opt => opt.is_correct).length > 1 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    ⚠️ Attention : Plusieurs réponses sont marquées comme correctes, mais ce QCM est configuré pour n'accepter qu'une seule réponse.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {question.type === 'coding' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Langage :
                </h5>
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <span className="font-medium text-gray-800">{question.language || 'python'}</span>
                </div>
              </div>
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Sortie attendue :
                </h5>
                <div className="bg-white p-3 rounded-lg border border-gray-300 font-mono">
                  <code>{question.expected_output || 'Non spécifiée'}</code>
                </div>
              </div>
            </div>

            {question.code_template && (
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Template de code :
                </h5>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto border-2 border-gray-700">
                  {question.code_template}
                </pre>
              </div>
            )}
          </div>
        )}

        {question.type === 'open_ended' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2">Limite de caractères :</h5>
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <span className="font-medium text-gray-800">{question.max_length || 500} caractères</span>
                </div>
              </div>
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2">Points disponibles :</h5>
                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <span className="font-medium text-gray-800">{question.points || 3} points</span>
                </div>
              </div>
            </div>

            {question.expected_keywords && question.expected_keywords.length > 0 && (
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Mots-clés attendus :
                </h5>
                <div className="flex flex-wrap gap-2">
                  {question.expected_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg border border-blue-300 text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {question.explanation && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Explication :
            </h5>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const totalPoints = calculateTotalPoints(localTestData.questions);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Test généré par l'IA</h2>
                <p className="text-gray-600">
                  Pour l'offre: <span className="font-semibold">{jobTitle}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Validation des questions */}
          {validationIssues.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900">Validation du test</h3>
                </div>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showValidation ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              {showValidation && (
                <div className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-center gap-3 ${
                        issue.type === 'error'
                          ? 'bg-red-50 border-red-300'
                          : 'bg-amber-50 border-amber-300'
                      }`}
                    >
                      {issue.type === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          issue.type === 'error' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {issue.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentQuestionIndex(issue.questionIndex)}
                        className="text-sm px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        Voir
                      </button>
                    </div>
                  ))}

                  {/* Bouton pour corriger automatiquement */}
                  {validationIssues.some(issue => issue.type === 'error' && issue.message.includes('Aucune réponse correcte')) && (
                    <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Certaines questions n'ont pas de réponse correcte définie
                          </span>
                        </div>
                        <button
                          onClick={handleFixAllNoCorrectAnswer}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Corriger automatiquement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Indicateur de qualité */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-900 mb-1">Vérification des réponses</h4>
                <div className="text-sm text-amber-800">
                  <p>L'IA a généré ce test, mais vous devez vérifier et corriger les réponses :</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Les réponses <span className="font-medium text-green-700">vertes</span> sont correctes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Les réponses <span className="font-medium text-red-700">rouges</span> sont incorrectes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Passez en mode édition pour modifier les réponses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span>Assurez-vous que chaque question ait au moins une réponse correcte</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres */}
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Paramètres du test</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de notation
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="grading_mode"
                        value="auto"
                        checked={localTestData.grading_mode === 'auto'}
                        onChange={(e) => {
                          const updated = { ...localTestData, grading_mode: e.target.value };
                          setLocalTestData(updated);
                          if (onUpdateTest) onUpdateTest(updated);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Automatique (IA)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="grading_mode"
                        value="manual"
                        checked={localTestData.grading_mode === 'manual'}
                        onChange={(e) => {
                          const updated = { ...localTestData, grading_mode: e.target.value };
                          setLocalTestData(updated);
                          if (onUpdateTest) onUpdateTest(updated);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Manuel</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score de passage (%)
                  </label>
                  <input
                    type="number"
                    value={localTestData.passing_score || 70}
                    onChange={(e) => {
                      const updated = { ...localTestData, passing_score: parseInt(e.target.value) || 70 };
                      setLocalTestData(updated);
                      if (onUpdateTest) onUpdateTest(updated);
                    }}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-300">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{localTestData.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{localTestData.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{localTestData.duration || 60}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{localTestData.passing_score || 70}%</div>
                  <div className="text-sm text-gray-600">Score min.</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Points total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode d'édition */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    !editMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Prévisualisation
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    editMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  Modifier les réponses
                </button>
              </div>

              {editMode && (
                <div className="text-sm text-green-700 font-medium flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <AlertCircle className="w-4 h-4" />
                  Mode édition activé - Cliquez sur les réponses pour modifier
                </div>
              )}
            </div>
          </div>

          {/* Navigation des questions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editMode ? 'Modification de la question' : 'Question'} {currentQuestionIndex + 1} sur {totalQuestions}
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalQuestions }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all border ${
                        index === currentQuestionIndex
                          ? editMode
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 shadow-lg'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner">
              <div
                className={`h-full transition-all duration-300 ${
                  editMode 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Affichage de la question actuelle */}
          {currentQuestion && (
            editMode
              ? renderQuestionInEditMode(currentQuestion)
              : renderQuestionInPreviewMode(currentQuestion)
          )}

          {/* Résumé des types de questions */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé des questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['mcq', 'coding', 'open_ended'].map((type) => {
                const count = localTestData.questions?.filter(q => q.type === type).length || 0;
                if (count === 0) return null;

                const questionsOfType = localTestData.questions?.filter(q => q.type === type);
                const totalPoints = questionsOfType?.reduce((sum, q) => sum + (Number(q.points) || 1), 0) || 0;

                return (
                  <div key={type} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {getQuestionTypeIcon(type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {type === 'mcq' ? 'QCM' :
                           type === 'coding' ? 'Code' : 'Ouverte'}
                        </div>
                        <div className="text-sm text-gray-600">{count} question(s) • {totalPoints} points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Succès</p>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={onEdit}
                className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier complètement
              </button>

              {/* Bouton pour télécharger/dupliquer */}
              <button
                onClick={() => {
                  // Fonction pour dupliquer le test
                  const duplicatedTest = JSON.parse(JSON.stringify(localTestData));
                  duplicatedTest.title = `${duplicatedTest.title} (Copie)`;
                  setLocalTestData(duplicatedTest);
                  setSuccess('Test dupliqué - vous pouvez maintenant le modifier');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Dupliquer
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTest}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sauvegarder le test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}