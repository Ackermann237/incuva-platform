// src/pages/Jobs/users/TrainingInterview/TrainingInterview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getInterviewQuestions, submitInterviewAnswer, getInterviewFeedback } from '../../../../services/TrainingInterview';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import InputPanel from './components/InputPanel';
import ProgressPanel from './components/ProgressPanel';
import JobDetailsPanel from './components/JobDetailsPanel';
import TipsPanel from './components/TipsPanel';
import CompletionPanel from './components/CompletionPanel';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { Loader2, AlertCircle } from 'lucide-react';
import JobDetailsModal from "./components/JobDetailsModal";

export default function TrainingInterview() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const location = useLocation();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFullDetails, setJobFullDetails] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);

  // Hook pour la reconnaissance vocale
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useSpeechRecognition({
    onResult: (text) => setUserAnswer(text),
    onError: (error) => console.error('Erreur reconnaissance:', error)
  });

  // Fonction pour charger les détails complets
const loadJobFullDetails = async (jobId) => {
  if (!jobId) return;

  setLoadingJobDetails(true);
  try {
    const response = await fetch(`/api/jobs/api/job_detail/${jobId}`);
    const data = await response.json();

    if (data.success) {
      setJobFullDetails(data.job);
      setShowJobModal(true);
    } else {
      console.error('Erreur lors du chargement des détails:', data.error);
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
  } finally {
    setLoadingJobDetails(false);
  }
};

  // Charger les données de l'entretien
  useEffect(() => {
    loadInterviewData();
  }, [applicationId]);

  // Synchroniser la transcription avec la réponse
  useEffect(() => {
    if (transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript]);

  const loadInterviewData = async () => {
    try {
      setLoading(true);

      let application = location.state?.application;

      // Si pas dans state → charger depuis l'API
      if (!application && applicationId) {
        const res = await fetch(`/api/applications/${applicationId}`);
        const data = await res.json();
        if (data.success) {
          application = data.application;
        } else {
          throw new Error('Impossible de charger les détails de la candidature');
        }
      }

      if (!application) {
        throw new Error('Informations de candidature manquantes');
      }

      setJobDetails({
        title: application.job_title || application.position,
        company: application.company_name,
        description: application.description,
        jobId: application.job_id
      });

      const questionsRes = await getInterviewQuestions(applicationId, application);

      if (questionsRes.success) {
        setInterviewData(questionsRes.data);
        setSessionId(questionsRes.data.session_id);

        // Initialiser la conversation
        const initialConversation = [
          {
            type: 'ai',
            content: (
              <>
                Bonjour ! Je suis votre coach d'entretien IA. Je vais vous aider à vous préparer pour le poste de <strong>{application.job_title}</strong> chez <strong>{application.company_name}</strong>.
                <br /><br />
                Je vais vous poser {questionsRes.data.questions.length} questions typiques pour ce type de poste. Prenez votre temps pour répondre, et je vous donnerai des retours personnalisés après chaque réponse.
              </>
            ),
            timestamp: new Date().toISOString()
          },
          {
            type: 'ai',
            content: questionsRes.data.questions[0].text,
            questionId: questionsRes.data.questions[0].id,
            timestamp: new Date().toISOString()
          }
        ];

        setConversation(initialConversation);
      } else {
        throw new Error(questionsRes.error || 'Erreur lors du chargement des questions');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de la simulation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    const currentQuestion = interviewData.questions[currentQuestionIndex];

    // Ajouter la réponse de l'utilisateur à la conversation
    const userMessage = {
      type: 'user',
      content: userAnswer,
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      // Soumettre la réponse pour évaluation
      const feedbackRes = await submitInterviewAnswer(
        sessionId,
        currentQuestion.id,
        userAnswer,
        interviewData.job_context
      );

      if (feedbackRes.success) {
        // Ajouter le feedback à la conversation
        const feedbackMessage = {
          type: 'ai',
          content: (
            <>
              <div className="font-semibold text-gray-900 mb-2">Feedback sur votre réponse :</div>
              <div className="mb-3">{feedbackRes.data.feedback}</div>
              <div className="mb-3">
                <span className="font-medium">Score : </span>
                <span className="font-bold">{feedbackRes.data.score}/10</span>
              </div>
              {feedbackRes.data.improvement_tips && (
                <>
                  <div className="font-semibold text-gray-900 mb-2">Conseils d'amélioration :</div>
                  <div>{feedbackRes.data.improvement_tips}</div>
                </>
              )}
            </>
          ),
          timestamp: new Date().toISOString()
        };
        setConversation(prev => [...prev, feedbackMessage]);

        // Mettre à jour les scores
        setFeedback(prev => ({
          ...prev,
          [currentQuestion.id]: feedbackRes.data.score,
          totalQuestions: interviewData.questions.length,
          completedQuestions: currentQuestionIndex + 1
        }));

        // Passer à la question suivante ou terminer
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < interviewData.questions.length) {
          setTimeout(() => {
            const nextQuestionMessage = {
              type: 'ai',
              content: interviewData.questions[nextIndex].text,
              questionId: interviewData.questions[nextIndex].id,
              timestamp: new Date().toISOString()
            };
            setConversation(prev => [...prev, nextQuestionMessage]);
            setCurrentQuestionIndex(nextIndex);
            setUserAnswer('');
            resetTranscript();
          }, 1000);
        } else {
          // Terminer l'entretien
          await completeInterview();
        }
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur lors de l\'évaluation de votre réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeInterview = async () => {
    try {
      const feedbackRes = await getInterviewFeedback(sessionId);
      if (feedbackRes.success) {
        const finalMessage = {
          type: 'ai',
          content: (
            <>
              <div className="text-center mb-4">
                <span className="text-2xl">🎉</span>
                <div className="text-xl font-bold text-gray-900 mt-2">Entretien terminé !</div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Résumé de votre performance :</div>
                  <div>{feedbackRes.data.summary}</div>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">Score moyen :</div>
                  <div className="text-lg font-bold text-blue-600">{feedbackRes.data.average_score}/10</div>
                </div>

                <div>
                  <div className="font-semibold text-green-700 mb-1">Points forts :</div>
                  <div className="text-gray-700">{feedbackRes.data.strengths}</div>
                </div>

                <div>
                  <div className="font-semibold text-amber-600 mb-1">Points à améliorer :</div>
                  <div className="text-gray-700">{feedbackRes.data.areas_for_improvement}</div>
                </div>

                <div>
                  <div className="font-semibold text-blue-700 mb-1">Recommandations :</div>
                  <div className="text-gray-700">{feedbackRes.data.recommendations}</div>
                </div>
              </div>
            </>
          ),
          timestamp: new Date().toISOString()
        };
        setConversation(prev => [...prev, finalMessage]);
        setInterviewCompleted(true);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du feedback:', err);
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < interviewData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const skipMessage = {
        type: 'user',
        content: 'Question passée',
        timestamp: new Date().toISOString()
      };
      const nextQuestionMessage = {
        type: 'ai',
        content: interviewData.questions[nextIndex].text,
        questionId: interviewData.questions[nextIndex].id,
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, skipMessage, nextQuestionMessage]);
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer('');
      resetTranscript();
    } else {
      completeInterview();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearAnswer = () => {
    setUserAnswer('');
    resetTranscript();
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Préparation de votre simulation d'entretien...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/my-applications')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <div className="bg-white rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/my-applications')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retour aux candidatures
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        <Header
          navigate={navigate}
          jobDetails={jobDetails}
          feedback={feedback}
        />

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne principale - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

              <ChatPanel
                conversation={conversation}
                isSubmitting={isSubmitting}
              />

              {/* Zone de saisie ou message de fin */}
              {!interviewCompleted ? (
                <InputPanel
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  isRecording={isRecording}
                  toggleRecording={toggleRecording}
                  handleSubmitAnswer={handleSubmitAnswer}
                  clearAnswer={clearAnswer}
                  skipQuestion={skipQuestion}
                  isSubmitting={isSubmitting}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={interviewData?.questions.length}
                />
              ) : (
                <CompletionPanel navigate={navigate} />
              )}
            </div>
          </div>

          {/* Colonne latérale - Informations */}
          <div className="space-y-6">
            <JobDetailsPanel
              jobDetails={jobDetails}
              applicationId={applicationId}
              navigate={navigate}
            />

            {showJobModal && jobFullDetails && (
              <JobDetailsModal
                job={jobFullDetails}
                onClose={() => {
                  setShowJobModal(false);
                  setJobFullDetails(null);
                }}
              />
            )}

            <ProgressPanel
              interviewData={interviewData}
              feedback={feedback}
              currentQuestionIndex={currentQuestionIndex}
            />

            <TipsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}