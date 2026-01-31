// src/pages/Candidate/TechnicalTestPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Save,
  CheckSquare,
  Code,
  FileText,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Brain,
  Award,
  Calendar,
  User
} from 'lucide-react';
import {
  getTechnicalTest,
  submitTechnicalTest,
  canAccessTest
} from "../../../../../services/technical.js";

export default function TechnicalTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger le test
  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
      if (test?.duration && !submitted) {
        const seconds = Math.max(60, test.duration * 60); // au moins 60s si duration = 0
        setTimeLeft(seconds);
      }
  }, [test, submitted]);



    // Timer - VERSION CORRIGÉE
    useEffect(() => {
      if (!test || submitted || timeLeft <= 0) {
        return;
      }
    
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // On déclenche la soumission automatique seulement quand on passe de 1 à 0
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    
      return () => clearInterval(timer);
    }, [timeLeft, submitted, test]); // dépendances correctes

  const loadTest = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await getTechnicalTest(testId);
      if (res.success) {
        setTest(res.data);

        // Initialiser les réponses
        const initialAnswers = {};
        res.data.questions?.forEach(question => {
          if (question.type === 'mcq') {
            initialAnswers[question.id] = { selected_options: [] };
          } else if (question.type === 'true_false') {
            initialAnswers[question.id] = { answer: true };
          } else {
            initialAnswers[question.id] = { answer: '' };
          }
        });
        setAnswers(initialAnswers);

      } else {
        setError(res.error || 'Test non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement du test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
      if (submitted || submitting || !test) {
        return;
      }

      console.log('Temps écoulé → soumission automatique');
      setError('Temps écoulé ! Votre test est soumis automatiquement.');
      await handleSubmit();
  };

      const handleAnswerChange = (questionId, value, optionId = null) => {
        const question = test.questions.find(q => q.id === questionId);

        if (!question) return;

        let newAnswer;

        if (question.type === 'mcq') {
          const currentAnswer = answers[questionId] || { selected_options: [] };
          let selectedOptions = [...(currentAnswer.selected_options || [])];

          if (question.multiple_correct) {
            // Pour les QCM à réponses multiples
            const index = selectedOptions.indexOf(optionId);
            if (index > -1) {
              selectedOptions.splice(index, 1);
            } else {
              selectedOptions.push(optionId);
            }
          } else {
            // Pour les QCM à réponse unique
            selectedOptions = [optionId];
          }

          newAnswer = { selected_options: selectedOptions };
        } else if (question.type === 'true_false') {
          newAnswer = { answer: value === 'true' };
        } else if (question.type === 'coding') {
          newAnswer = { code: value };
        } else {
          newAnswer = { answer: value };
        }

        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));
      };

      const handleSubmit = async () => {
      try {
        setSubmitting(true);
        setError('');

        // Vérifier que tout est prêt
        if (!test) {
          throw new Error('Les données du test ne sont pas disponibles.');
        }

        if (!test.duration) {
          console.warn('duration manquant dans test:', test);
        }

        // Préparer les réponses
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          ...answer
        }));

        // Calculer la durée utilisée avec une valeur par défaut
        const durationUsed = test.duration
          ? test.duration - (timeLeft / 60)
          : Math.floor((test.duration || 60) * 0.8); // Fallback: 80% du temps alloué

        console.log('Soumission avec:', {
          testId,
          answersCount: formattedAnswers.length,
          durationUsed,
          testDuration: test.duration,
          timeLeft
        });

        const res = await submitTechnicalTest(
          testId,
          formattedAnswers,
          Math.max(1, Math.floor(durationUsed))
        );

        if (res.success) {
          setSubmitted(true);
          setResults(res.data);

          // Message selon le mode de notation
          const message = test.grading_mode === 'manual'
            ? 'Votre test a été soumis. Il sera noté manuellement par l\'entreprise.'
            : 'Test soumis avec succès !';

          setError(message);
        } else {
          setError(res.error || 'Erreur lors de la soumission');
        }
      } catch (err) {
        console.error('Erreur dans handleSubmit:', err);
        setError(err.message || 'Erreur lors de la soumission du test');
      } finally {
        setSubmitting(false);
      }
  };

  const formatTime = (seconds) => {
      if (!seconds && seconds !== 0) return "00:00"; // Ajouter cette vérification

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!test || loading) { // Modifier cette condition
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (error && !submitted && !test) { // Ajouter && !test
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Soumis !</h1>
              <p className="text-gray-600">Merci d'avoir complété le test technique</p>
            </div>

            {test.grading_mode === 'manual' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Notation en attente</h3>
                    <p className="text-gray-700">
                      Votre test sera noté manuellement par l'entreprise.
                      Vous recevrez vos résultats par email une fois la notation terminée.
                    </p>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>✓ Test correctement enregistré</p>
                      <p>✓ En attente de notation par un recruteur</p>
                      <p>✓ Vous serez notifié des résultats</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {results.percentage?.toFixed(1)}%
                      </div>
                      <div className="text-blue-700 font-medium">Score final</div>
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl border ${
                    results.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {results.passed ? 'Réussi' : 'Échoué'}
                      </div>
                      <div className={results.passed ? 'text-green-700' : 'text-red-700'}>
                        Seuil: {test.passing_score}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {results.score}/{results.max_score}
                      </div>
                      <div className="text-purple-700 font-medium">Points</div>
                    </div>
                  </div>
                </div>

                {/* Résultats par question */}
                {results.results && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Détails par question</h3>
                    <div className="space-y-4">
                      {results.results.map((result, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-900">
                                Question {index + 1}
                              </span>
                            </div>
                            <span className={`font-bold ${
                              result.score_obtained > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.score_obtained}/{result.points} pts
                            </span>
                          </div>
                          {result.is_correct && (
                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                              ✓ Réponse correcte
                            </div>
                          )}
                          {!result.is_correct && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              ✗ Réponse incorrecte
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test non disponible</h2>
          <p className="text-gray-600">Ce test n'existe pas ou n'est plus accessible.</p>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec timer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600 mt-1">{test.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Temps restant</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {currentQuestion + 1}/{test.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation des questions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                {test.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                      currentQuestion === index
                        ? 'bg-blue-100 border border-blue-300'
                        : answers[question.id] && 
                          ((question.type === 'mcq' && answers[question.id].selected_options?.length > 0) ||
                           (question.type !== 'mcq' && answers[question.id].answer))
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{index + 1}</span>
                    {question.type === 'mcq' && (
                      <CheckSquare className="w-3 h-3 mt-1" />
                    )}
                    {question.type === 'coding' && (
                      <Code className="w-3 h-3 mt-1" />
                    )}
                    {question.type === 'open_ended' && (
                      <FileText className="w-3 h-3 mt-1" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Soumettre le test
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {test.grading_mode === 'manual'
                    ? 'Notation manuelle par l\'entreprise'
                    : 'Notation automatique par IA'}
                </p>
              </div>
            </div>
          </div>

          {/* Question actuelle */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">{currentQuestion + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Question {currentQuestion + 1}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {currentQ.type === 'mcq' ? 'Choix multiple' :
                         currentQ.type === 'coding' ? 'Exercice de code' :
                         currentQ.type === 'open_ended' ? 'Réponse ouverte' : 'Vrai/Faux'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{currentQ.points || 1} point(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Énoncé */}
              <div className="mb-8">
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-800 whitespace-pre-line">{currentQ.question}</p>
                </div>
              </div>

              {/* Réponse selon le type */}
              {currentQ.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        answers[currentQ.id]?.selected_options?.includes(option.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleAnswerChange(currentQ.id, null, option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          answers[currentQ.id]?.selected_options?.includes(option.id)
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}>
                          {answers[currentQ.id]?.selected_options?.includes(option.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{option.text}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {currentQ.multiple_correct && (
                    <p className="text-sm text-gray-500 mt-2">
                      ⓘ Plusieurs réponses peuvent être correctes
                    </p>
                  )}
                </div>
              )}

              {currentQ.type === 'true_false' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswerChange(currentQ.id, 'true')}
                    className={`p-6 border rounded-xl text-center transition-all ${
                      answers[currentQ.id]?.answer === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-2">VRAI</div>
                    <div className="text-gray-600">Cette affirmation est correcte</div>
                  </button>
                  <button
                    onClick={() => handleAnswerChange(currentQ.id, 'false')}
                    className={`p-6 border rounded-xl text-center transition-all ${
                      answers[currentQ.id]?.answer === false
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-2">FAUX</div>
                    <div className="text-gray-600">Cette affirmation est incorrecte</div>
                  </button>
                </div>
              )}

              {currentQ.type === 'open_ended' && (
                <div>
                  <textarea
                    value={answers[currentQ.id]?.answer || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    maxLength={currentQ.max_length || 500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {currentQ.max_length || 500} caractères maximum
                    </span>
                    <span className="text-sm text-gray-500">
                      {(answers[currentQ.id]?.answer || '').length}/{(currentQ.max_length || 500)}
                    </span>
                  </div>
                </div>
              )}

              {currentQ.type === 'coding' && (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Langage: {currentQ.language}</span>
                      {currentQ.expected_output && (
                        <span className="text-sm text-gray-600">
                          Sortie attendue: {currentQ.expected_output}
                        </span>
                      )}
                    </div>
                    {currentQ.code_template && (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm mb-4 overflow-x-auto">
                        {currentQ.code_template}
                      </pre>
                    )}
                  </div>
                  <textarea
                    value={answers[currentQ.id]?.code || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder={`Écrivez votre code ${currentQ.language} ici...`}
                    className="w-full h-64 px-4 py-3 font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    spellCheck="false"
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <div className="text-sm text-gray-600">
                  Question {currentQuestion + 1} sur {test.questions.length}
                </div>
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(test.questions.length - 1, prev + 1))}
                  disabled={currentQuestion === test.questions.length - 1}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="fixed bottom-4 right-4 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2 text-red-700 shadow-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erreur</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}