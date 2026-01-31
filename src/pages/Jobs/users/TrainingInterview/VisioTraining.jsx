// src/pages/Jobs/users/TrainingInterview/VisioTraining.jsx
import React, {useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Mic, MicOff, Video, VideoOff, Phone, MessageSquare, User, Sparkles, X, Settings, Headphones, Share2, Volume2, VolumeX, Download, Clock, AlertCircle, Send, Loader2, SkipForward, CheckCircle, Star, Zap, ZapOff, Pause, Play } from 'lucide-react';
import { getInterviewQuestions } from '../../../../services/TrainingInterview';
import { startVisioInterview, submitVisioAnswer, endVisioSession } from '../../../../services/VisioTraining';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import Webcam from 'react-webcam';

export default function VisioTraining() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewData, setInterviewData] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [visioSessionId, setVisioSessionId] = useState(null);

  // États de la visio
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [timer, setTimer] = useState(0);

  // États de l'entretien
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [scores, setScores] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [finalReport, setFinalReport] = useState(null);

  // États vocaux
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(true);
  const [isAutoSubmit, setIsAutoSubmit] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerTime, setAnswerTime] = useState(0);
  const [maxAnswerTime, setMaxAnswerTime] = useState(120);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.1,
    volume: 1.0,
    lang: 'fr-FR',
    voice: null
  });

  // Références
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const answerTimerRef = useRef(null);
  const feedbackRef = useRef(null);
  const conversationEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Hooks vocaux
  const {
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: true,
    lang: 'fr-FR',
    onResult: (text) => {
      setUserAnswer(text);
    },
    onError: (error) => {
      console.error('Erreur reconnaissance vocale:', error);
    }
  });

  const {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    error: speechSynthError,
    speak,
    pause,
    resume,
    cancel,
    changeVoice
  } = useSpeechSynthesis(voiceSettings);

  // Charger les données de l'entretien
  useEffect(() => {
    loadInterviewData();
    return () => {
      cleanup();
    };
  }, [applicationId]);

  // Détection de silence pour auto-soumission (5 secondes après arrêt)
  useEffect(() => {
    if (!isAutoSubmit || !isAnswering) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      return;
    }

    let lastTranscript = transcript;

    const checkSilence = () => {
      if (transcript !== lastTranscript) {
        lastTranscript = transcript;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Démarrer un nouveau timer de silence (5 secondes)
        silenceTimerRef.current = setTimeout(() => {
          if (isAnswering && isAutoSubmit && userAnswer.trim().length > 10) {
            console.log('Silence de 5 secondes détecté, soumission automatique');
            handleAutoSubmit();
          }
        }, 5000);
      }
    };

    const silenceCheckInterval = setInterval(checkSilence, 1000);

    return () => {
      clearInterval(silenceCheckInterval);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isAnswering, isAutoSubmit, transcript, userAnswer]);

  // Timer pour auto-soumission à la fin du temps
  useEffect(() => {
    if (!isAutoSubmit || !isAnswering || maxAnswerTime <= 0) return;

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
    }

    autoSubmitTimerRef.current = setTimeout(() => {
      if (isAnswering && userAnswer.trim()) {
        console.log('Temps écoulé, soumission automatique');
        handleAutoSubmit();
      } else if (isAnswering) {
        console.log('Aucune réponse, passage à la question suivante');
        handleSkipQuestion();
      }
    }, maxAnswerTime * 1000);

    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, [isAnswering, isAutoSubmit, maxAnswerTime, userAnswer]);

  const cleanup = () => {
    console.log('🧹 Nettoyage en cours...');
    if (timerRef.current) {
      console.log('⏰ Timer nettoyé');
      clearInterval(timerRef.current);
    }
    if (answerTimerRef.current) {
      console.log('⏱️ Timer réponse nettoyé');
      clearInterval(answerTimerRef.current);
    }
    if (silenceTimerRef.current) {
      console.log('🔇 Timer silence nettoyé');
      clearTimeout(silenceTimerRef.current);
    }
    if (autoSubmitTimerRef.current) {
      console.log('⚡ Timer auto-soumission nettoyé');
      clearTimeout(autoSubmitTimerRef.current);
    }
    if (mediaRecorderRef.current) {
      console.log('🎥 Enregistrement arrêté');
      mediaRecorderRef.current.stop();
    }

    console.log('🗣️ Annulation synthèse vocale');
    cancel();

    console.log('🎤 Arrêt reconnaissance vocale');
    stopListening();

    isProcessingRef.current = false;
    console.log('✅ Nettoyage terminé');
  };

  const loadInterviewData = async () => {
    try {
      setLoading(true);
      isProcessingRef.current = false;

      // Simuler des données de candidature
      const mockApplication = {
        job_id: 'job123',
        job_title: 'Développeur Full Stack',
        company_name: 'TechCorp',
        description: 'Nous recherchons un développeur full stack expérimenté...'
      };

      setJobDetails({
        title: mockApplication.job_title,
        company: mockApplication.company_name,
        description: mockApplication.description
      });

      // Démarrer la session visio
      const visioRes = await startVisioInterview(applicationId || 'mock', mockApplication);

      if (visioRes.success) {
        setInterviewData(visioRes.data);
        setVisioSessionId(visioRes.data.visio_session_id);
        setMaxAnswerTime(visioRes.data.questions[0]?.time_limit || 120);

        // Initialiser la conversation
        const welcomeMessage = `Bonjour ! Je suis votre assistant d'entretien virtuel. Je vais vous poser ${visioRes.data.questions.length} questions pour le poste de ${mockApplication.job_title}. Préparez-vous !`;

        setConversation([
          {
            id: 1,
            type: 'ai',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          }
        ]);

        // Parler le message de bienvenue SI activé
        if (isAutoSpeaking) {
          try {
            await speak(welcomeMessage, {
              rate: 0.85,
              pitch: 1.15,
              onEnd: () => {
                console.log('✅ Message de bienvenue terminé');
                // Démarrer la première question immédiatement
                setTimeout(() => {
                  startQuestion(0);
                }, 500);
              },
              onError: (error) => {
                console.error('❌ Erreur lors du message de bienvenue:', error);
                // Continuer même en cas d'erreur
                setTimeout(() => {
                  startQuestion(0);
                }, 500);
              }
            });
          } catch (error) {
            console.error('Erreur lors du speak:', error);
            setTimeout(() => {
              startQuestion(0);
            }, 500);
          }
        } else {
          setTimeout(() => {
            startQuestion(0);
          }, 1000);
        }

        // Simuler la connexion
        setTimeout(() => {
          setConnectionStatus('connected');
          startTimer();
        }, 2000);
      } else {
        throw new Error(visioRes.error || 'Erreur lors du démarrage de la visio');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuestion = async (index) => {
    if (!interviewData || index >= interviewData.questions.length) {
      await completeInterview();
      return;
    }

    // Réinitialiser l'état
    setUserAnswer('');
    resetTranscript();
    setFeedback(null);
    setIsAnswering(false);
    stopAnswerTimer();

    // Définir la question actuelle
    const question = interviewData.questions[index];
    setCurrentQuestion(question);
    setQuestionIndex(index);
    setMaxAnswerTime(question.time_limit || 120);

    console.log('📝 Question chargée:', question.text.substring(0, 50) + '...');

    // Ajouter la question à la conversation
    const questionMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Question ${index + 1}: ${question.text}`,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, questionMessage]);

    // Parler la question si activé
    if (isAutoSpeaking) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const formattedText = `Question ${index + 1}. ${question.text}`;

      try {
        await speak(formattedText, {
          rate: 0.85,
          pitch: 1.15,
          onEnd: () => {
            console.log('✅ Question lue avec succès');
            // Indiquer que l'utilisateur peut répondre
            setTimeout(() => {
              const answeringMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "🎤 Je vous écoute. Vous pouvez maintenant répondre.",
                timestamp: new Date().toISOString()
              };
              setConversation(prev => [...prev, answeringMessage]);

              if (isAutoSpeaking) {
                speak("Je vous écoute. Vous pouvez maintenant répondre.", {
                  rate: 0.9,
                  pitch: 1.1,
                  onEnd: () => {
                    // Activer automatiquement le microphone pour la réponse
                    if (!isAnswering && !interviewCompleted) {
                      setTimeout(() => {
                        startAnswering();
                      }, 300);
                    }
                  }
                });
              } else {
                // Sans voix, juste activer le microphone
                setTimeout(() => {
                  startAnswering();
                }, 500);
              }
            }, 800);
          },
          onError: (error) => {
            console.error('❌ Erreur lors de la lecture de la question:', error);
            const answeringMessage = {
              id: Date.now(),
              type: 'ai',
              content: "🎤 Vous pouvez maintenant répondre à la question.",
              timestamp: new Date().toISOString()
            };
            setConversation(prev => [...prev, answeringMessage]);
            setTimeout(() => {
              startAnswering();
            }, 500);
          }
        });
      } catch (error) {
        console.error('Erreur lors du speak:', error);
        const answeringMessage = {
          id: Date.now(),
          type: 'ai',
          content: "🎤 Vous pouvez maintenant répondre à la question.",
          timestamp: new Date().toISOString()
        };
        setConversation(prev => [...prev, answeringMessage]);
        setTimeout(() => {
          startAnswering();
        }, 500);
      }
    } else {
      const answeringMessage = {
        id: Date.now(),
        type: 'ai',
        content: "🎤 Vous pouvez maintenant répondre à la question.",
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, answeringMessage]);
      setTimeout(() => {
        startAnswering();
      }, 500);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const startAnswerTimer = () => {
    setAnswerTime(0);
    if (answerTimerRef.current) clearInterval(answerTimerRef.current);

    answerTimerRef.current = setInterval(() => {
      setAnswerTime(prev => prev + 1);
    }, 1000);
  };

  const stopAnswerTimer = () => {
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAnswering = () => {
    if (isAnswering || isThinking || interviewCompleted) return;

    setIsAnswering(true);
    startListening();
    startAnswerTimer();

    // Nettoyer les timers précédents
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopAnswering = () => {
    if (!isAnswering) return;

    setIsAnswering(false);
    stopListening();
    stopAnswerTimer();

    // Nettoyer les timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const handleAutoSubmit = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    stopAnswering();

    if (userAnswer.trim()) {
      submitAnswer();
    } else {
      if (isAutoSpeaking) {
        speak("Je n'ai pas entendu de réponse. Passons à la question suivante.", {
          rate: 0.9,
          pitch: 1.1,
          onEnd: () => {
            handleSkipQuestion();
            isProcessingRef.current = false;
          }
        });
      } else {
        handleSkipQuestion();
        isProcessingRef.current = false;
      }
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim() || isProcessingRef.current) return;

    isProcessingRef.current = true;
    stopAnswering();

    // Ajouter la réponse de l'utilisateur à la conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userAnswer,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);

    setIsThinking(true);

    try {
      // Soumettre la réponse pour évaluation
      const feedbackRes = await submitVisioAnswer(
        visioSessionId,
        currentQuestion.id,
        userAnswer
      );

      if (feedbackRes.success) {
        const evaluation = feedbackRes.data.evaluation;

        // Mettre à jour les scores
        const newScore = {
          questionId: currentQuestion.id,
          score: evaluation.score,
          feedback: evaluation.feedback
        };

        setScores(prev => [...prev, newScore]);
        setFeedback(evaluation);

        // Calculer le score moyen
        const newScores = [...scores, newScore];
        const avg = newScores.reduce((sum, item) => sum + item.score, 0) / newScores.length;
        setAverageScore(avg);

        // Ajouter le feedback à la conversation
        const feedbackMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: (
            <div className="space-y-2">
              <div className="font-semibold text-blue-600">Feedback :</div>
              <div>{evaluation.feedback}</div>
              <div className="font-semibold">Score : {evaluation.score}/10</div>
              {evaluation.video_feedback && (
                <div className="text-sm text-gray-600 mt-2">
                  <div className="font-semibold">Feedback vidéo :</div>
                  <ul className="list-disc pl-4">
                    {evaluation.video_feedback.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
          timestamp: new Date().toISOString()
        };

        setConversation(prev => [...prev, feedbackMessage]);

        // Parler le feedback avant de passer à la question suivante
        if (isAutoSpeaking) {
          const feedbackText = `Merci pour votre réponse. Votre score est de ${evaluation.score} sur 10. ${evaluation.feedback}`;

          await speak(feedbackText, {
            rate: 0.9,
            pitch: 1.1,
            onEnd: () => {
              // Attendre un moment avant de passer à la question suivante
              setTimeout(() => {
                moveToNextQuestion();
              }, 1500);
            }
          });
        } else {
          // Sans voix, attendre un moment avant de passer à la suivante
          setTimeout(() => {
            moveToNextQuestion();
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "❌ Désolé, une erreur s'est produite lors de l'évaluation de votre réponse.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      setConversation(prev => [...prev, errorMessage]);

      if (isAutoSpeaking) {
        speak("Désolé, une erreur s'est produite lors de l'évaluation de votre réponse.", {
          rate: 0.9,
          pitch: 1.1,
          onEnd: () => {
            setTimeout(() => {
              moveToNextQuestion();
            }, 2000);
          }
        });
      } else {
        setTimeout(() => {
          moveToNextQuestion();
        }, 3000);
      }
    } finally {
      setIsThinking(false);
      setUserAnswer('');
      resetTranscript();
    }
  };

  const moveToNextQuestion = () => {
    console.log('🔄 Passage à la question suivante, index actuel:', questionIndex);

    const nextIndex = questionIndex + 1;
    console.log('Prochaine question index:', nextIndex, 'Total questions:', interviewData?.questions.length);

    if (nextIndex < interviewData.questions.length) {
      console.log('📝 Passage à la question', nextIndex);
      // Réinitialiser le flag de traitement avant de passer à la question suivante
      isProcessingRef.current = false;
      setTimeout(() => {
        startQuestion(nextIndex);
      }, 1000);
    } else {
      console.log('🏁 Fin de l\'entretien, plus de questions');
      isProcessingRef.current = false;
      completeInterview();
    }
  };

  const handleSkipQuestion = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    stopAnswering();

    const skipMessage = {
      id: Date.now(),
      type: 'user',
      content: "Question passée",
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, skipMessage]);
    setUserAnswer('');
    resetTranscript();

    if (isAutoSpeaking) {
      speak("Question passée. Passons à la suivante.", {
        rate: 0.9,
        pitch: 1.1,
        onEnd: () => {
          moveToNextQuestion();
          isProcessingRef.current = false;
        }
      });
    } else {
      moveToNextQuestion();
      isProcessingRef.current = false;
    }
  };

  const completeInterview = async () => {
    console.log('🏁 Début de la fin de l\'entretien');

    if (interviewCompleted) {
      console.log('⚠️ Entretien déjà terminé, ignorer');
      return;
    }

    cleanup();
    setIsRecording(false);
    setInterviewCompleted(true);
    isProcessingRef.current = false;

    try {
      console.log('📤 Envoie de la requête de fin de session');

      // Terminer la session visio
      const endRes = await endVisioSession(visioSessionId);

      if (endRes.success) {
        console.log('✅ Session terminée avec succès');
        setFinalReport(endRes.data.report);

        // Ajouter le message de fin
        const finalMessage = {
          id: Date.now(),
          type: 'ai',
          content: (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-xl font-bold text-gray-900">Entretien terminé !</div>
              <div className="text-gray-600 mt-2">
                Durée totale : {formatTime(timer)}
              </div>
              <div className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent text-2xl font-bold">
                Score final : {averageScore.toFixed(1)}/10
              </div>
            </div>
          ),
          timestamp: new Date().toISOString()
        };

        setConversation(prev => [...prev, finalMessage]);

        // Parler le message de fin
        if (isAutoSpeaking) {
          const finalText = `Félicitations ! L'entretien est terminé. Votre score moyen est de ${averageScore.toFixed(1)} sur 10.`;
          await speak(finalText, {
            rate: 0.85,
            pitch: 1.15,
            onError: (error) => {
              console.error('Erreur lors du message final:', error);
            }
          });
        }
      } else {
        console.error('❌ Erreur lors de la fin de session:', endRes.error);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la fin de session:', err);
    }

    console.log('🏁 Fin de l\'entretien complète');
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Démarrer l'enregistrement
      const stream = webcamRef.current?.video?.srcObject;
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    } else {
      // Arrêter l'enregistrement
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Simuler le téléchargement
        setTimeout(() => {
          alert('Enregistrement sauvegardé dans votre espace personnel');
        }, 500);
      }
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleScreenShare = () => {
    setScreenShare(!screenShare);
  };

  const toggleAutoSpeaking = () => {
    setIsAutoSpeaking(!isAutoSpeaking);
    if (!isAutoSpeaking) {
      cancel();
    }
  };

  const toggleAutoSubmit = () => {
    setIsAutoSubmit(!isAutoSubmit);
  };

  const testVoice = () => {
    const testText = "Bonjour, je suis votre assistant vocal. Je vais vous guider pendant cet entretien.";
    speak(testText, voiceSettings);
  };

  // Scroll vers le bas de la conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Préparation de votre visio-entretien...</p>
          <p className="text-blue-600 text-sm mt-2">Connexion à l'assistant virtuel</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center border border-blue-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h3>
            <p className="text-blue-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/my-applications')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux candidatures
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/my-applications')}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-gray-900 font-bold">Entretien Visio Vocal</h1>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span>{connectionStatus === 'connected' ? 'Connecté' : 'Connexion...'}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(timer)}</span>
                  {isSpeaking && (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                        <span className="text-xs">L'IA parle</span>
                      </div>
                    </>
                  )}
                  {isAutoSubmit && (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Auto-soumission</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-gray-900 font-semibold">{jobDetails?.title}</div>
                <div className="text-blue-600 text-sm">{jobDetails?.company}</div>
                <div className="text-green-600 text-xs mt-1">
                  Question {questionIndex + 1}/{interviewData?.questions.length}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne de gauche - Webcam et contrôles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Zone webcam */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 overflow-hidden relative">
              {isCameraOn ? (
                <Webcam
                  ref={webcamRef}
                  audio={isMicOn}
                  className="w-full h-full max-h-[500px] object-cover"
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center bg-gray-100">
                  <VideoOff className="w-20 h-20 text-gray-400" />
                </div>
              )}

              {/* Overlay de l'assistant */}
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 border border-blue-100">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">Assistant IA</div>
                    <div className="text-blue-600 text-sm">En ligne</div>
                    {isSpeaking && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                        <span className="text-xs text-blue-600">Parle</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicateur d'enregistrement */}
              {isRecording && (
                <div className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm font-medium">ENREGISTREMENT</span>
                </div>
              )}

              {/* Indicateur de réponse vocale */}
              {isAnswering && (
                <div className="absolute top-20 right-6 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">🎤 JE VOUS ÉCOUTE</span>
                  <span className="text-xs">{formatTime(answerTime)}</span>
                  {isAutoSubmit && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Auto</span>
                  )}
                </div>
              )}
            </div>

            {/* Contrôles de la visio */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-4">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Contrôles audio/vidéo */}
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all ${
                    isCameraOn 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all ${
                    isMicOn 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Contrôles vocaux */}
                <button
                  onClick={toggleAutoSpeaking}
                  className={`p-4 rounded-full transition-all ${
                    isAutoSpeaking
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  title={isAutoSpeaking ? "Désactiver la voix IA" : "Activer la voix IA"}
                >
                  {isAutoSpeaking ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>

                {/* Contrôle auto-soumission */}
                <button
                  onClick={toggleAutoSubmit}
                  className={`p-4 rounded-full transition-all ${
                    isAutoSubmit
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  title={isAutoSubmit ? "Désactiver auto-soumission" : "Activer auto-soumission"}
                >
                  {isAutoSubmit ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
                </button>

                {isSpeaking && !isPaused && (
                  <button
                    onClick={pause}
                    className="p-4 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-all"
                    title="Pause"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                )}

                {isPaused && (
                  <button
                    onClick={resume}
                    className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
                    title="Reprendre"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}

                {/* Contrôle réponse */}
                {!interviewCompleted && !isAnswering && !isThinking && currentQuestion && (
                  <button
                    onClick={startAnswering}
                    className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
                    title="Répondre vocalement"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                )}

                {isAnswering && (
                  <button
                    onClick={stopAnswering}
                    className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                    title="Arrêter la réponse"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">⏹️</div>
                  </button>
                )}

                {/* Autres contrôles */}
                <button
                  onClick={toggleRecording}
                  className={`p-4 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title="Enregistrer"
                >
                  <div className="w-6 h-6">●</div>
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`p-4 rounded-full transition-all ${
                    screenShare
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Share2 className="w-6 h-6" />
                </button>

                <button
                  onClick={completeInterview}
                  className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Zone de réponse vocale */}
            {!interviewCompleted && currentQuestion && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-900 font-semibold">
                      {isAnswering ? '🎤 Répondez maintenant...' : 'Votre réponse'}
                      {isAutoSubmit && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Auto-soumission activée (5s silence)
                        </span>
                      )}
                    </div>
                    <div className="text-blue-600 text-sm">
                      Temps: {formatTime(answerTime)} / {formatTime(maxAnswerTime)}
                      {isAutoSubmit && answerTime > maxAnswerTime * 0.8 && (
                        <span className="ml-2 text-yellow-600 animate-pulse">
                          (Fin bientôt!)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={isAnswering ? "Parlez maintenant... Votre réponse s'affichera ici automatiquement." : "Cliquez sur 'Répondre vocalement' ou tapez votre réponse..."}
                      className="w-full h-32 px-4 py-3 bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none resize-none placeholder-blue-400"
                      disabled={isAnswering || isThinking}
                    />

                    {isAnswering && (
                      <div className="absolute bottom-3 right-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-300"></div>
                          <span className="text-xs text-red-600">
                            {isAutoSubmit ? "Auto-détection active" : "Enregistrement en cours"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-600">
                      {transcript && (
                        <span>Reconnaissance: {transcript.substring(0, 100)}...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSkipQuestion}
                        disabled={isThinking || isProcessingRef.current}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <SkipForward className="w-4 h-4" />
                        Passer
                      </button>

                      <button
                        onClick={submitAnswer}
                        disabled={!userAnswer.trim() || isThinking || isAnswering || isProcessingRef.current}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                      >
                        {isThinking ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Évaluation...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Soumettre
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne de droite - Questions, feedback, chat et configuration */}
          <div className="space-y-6">
            {/* Question en cours */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <MessageSquare className="w-5 h-5" />
                <span className="font-semibold">Question en cours</span>
                <span className="ml-auto text-sm">
                  {questionIndex + 1} / {interviewData?.questions.length}
                </span>
              </div>

              {currentQuestion && (
                <div className="space-y-4">
                  <div className="text-gray-900 text-lg font-medium">
                    {currentQuestion.text}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {currentQuestion.type || 'Général'}
                    </span>
                    <span className="text-blue-600">
                      Temps: {formatTime(currentQuestion.time_limit || 120)}
                    </span>
                    <span className="text-blue-600">
                      Difficulté: {currentQuestion.difficulty}
                    </span>
                  </div>

                  {currentQuestion.tips && currentQuestion.tips.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-green-600 text-sm font-medium">Conseils :</div>
                      <div className="flex flex-wrap gap-1">
                        {currentQuestion.tips.map((tip, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {tip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progression */}
              <div className="mt-6 pt-4 border-t border-blue-100">
                <div className="flex justify-between text-sm text-blue-600 mb-2">
                  <span>Progression</span>
                  <span>{questionIndex + 1}/{interviewData?.questions.length}</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((questionIndex + 1) / interviewData?.questions.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Configuration vocale */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Configuration vocale</span>
              </div>

              <div className="space-y-4">
                {/* Mode auto-soumission */}
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm">Soumission automatique</div>
                  <button
                    onClick={toggleAutoSubmit}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      isAutoSubmit ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        isAutoSubmit ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Mode voix IA */}
                <div className="flex items-center justify-between">
                  <div className="text-gray-700 text-sm">Voix IA activée</div>
                  <button
                    onClick={toggleAutoSpeaking}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      isAutoSpeaking ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        isAutoSpeaking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sélection de voix */}
                {voices.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-gray-700 text-sm">Voix disponibles</div>
                    <select
                      onChange={(e) => {
                        const selected = voices.find(v => v.name === e.target.value);
                        if (selected) {
                          changeVoice(selected);
                          setVoiceSettings(prev => ({ ...prev, voice: selected }));
                        }
                      }}
                      className="w-full p-2 bg-blue-50 text-gray-900 rounded-lg border border-blue-200"
                      value={selectedVoice?.name || ''}
                    >
                      <option value="">Voix système par défaut</option>
                      {voices
                        .filter(voice => voice.lang.includes('fr') || voice.lang.includes('FR'))
                        .map((voice, index) => (
                          <option key={index} value={voice.name}>
                            {voice.name.replace('Microsoft ', '').replace('Google ', '')}
                            ({voice.lang.split('-')[0]})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Vitesse de parole */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-gray-700 text-sm">Vitesse de parole</div>
                    <div className="text-blue-600 text-sm">{voiceSettings.rate.toFixed(1)}x</div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      rate: parseFloat(e.target.value)
                    }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Ton de voix */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-gray-700 text-sm">Ton de voix</div>
                    <div className="text-blue-600 text-sm">
                      {voiceSettings.pitch < 1 ? 'Grave' :
                       voiceSettings.pitch > 1.1 ? 'Aigu' : 'Normal'}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      pitch: parseFloat(e.target.value)
                    }))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Prévisualisation */}
                <button
                  onClick={testVoice}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-4 h-4" />
                  Tester la voix
                </button>
              </div>
            </div>

            {/* Scores et feedback */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 p-6">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Performances</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 font-semibold">Score moyen</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                    {scores.length > 0 ? averageScore.toFixed(1) : '0.0'}/10
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-blue-600 text-sm font-medium">Questions répondues :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {scores.map((scoreItem, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-xs">Q{idx + 1}</span>
                          <span className={`text-sm font-bold ${
                            scoreItem.score >= 8 ? 'text-green-600' :
                            scoreItem.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {scoreItem.score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {feedback && (
                  <div ref={feedbackRef} className="mt-4 pt-4 border-t border-blue-100">
                    <div className="text-blue-600 text-sm font-medium mb-2">Dernier feedback :</div>
                    <div className="text-gray-700 text-sm">{feedback.feedback}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-blue-100 overflow-hidden">
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-semibold">Conversation</span>
                </div>
              </div>

              <div className="p-4 h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.type === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : msg.isError
                              ? 'bg-red-100 text-red-700 rounded-bl-none border border-red-200'
                              : 'bg-blue-50 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {typeof msg.content === 'string' ? msg.content : msg.content}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {msg.type === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={conversationEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-blue-100 mt-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-blue-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>Qualité audio: {isMicOn ? 'Excellente' : 'Désactivée'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>{isCameraOn ? '720p • 30 FPS' : 'Caméra désactivée'}</span>
              </div>
              {isAutoSubmit && (
                <div className="flex items-center gap-2 text-green-600">
                  <Zap className="w-4 h-4" />
                  <span>Auto-soumission activée</span>
                </div>
              )}
              {speechError && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Erreur vocale</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Télécharger l'enregistrement
              </button>
              {interviewCompleted && finalReport && (
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                  Voir le rapport complet
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}