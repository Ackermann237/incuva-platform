import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Star, Heart, Brain, Sparkles, User, Zap, X, ChevronLeft
} from "lucide-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import VideoChat from "../../components/Visio/VideoChat";
import EvaluationModal from "../../components/Visio/EvaluationModal";
import { askAI } from "../../services/aiAssistant";
import { startSpeechAnalysis, stopSpeechAnalysis } from "../../services/SpeechAnalyzer";

export default function VideoRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState(null);

  const [showChat, setShowChat] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [candidateName, setCandidateName] = useState("Participant");
  const [chatId, setChatId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [isCoupDeCoeur, setIsCoupDeCoeur] = useState(false);
  const [iaThinking, setIaThinking] = useState(false);
  const [iaSuggestion, setIaSuggestion] = useState("");
  const [iaScore, setIaScore] = useState(null);
  const [speechAnalysis, setSpeechAnalysis] = useState([]);


  const localVideoRef = useRef();
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const intervalRef = useRef(null);

  // === COUP DE CŒUR ===
  const handleCoupDeCoeur = async () => {
    setIsCoupDeCoeur(true);
    setTimeout(() => setIsCoupDeCoeur(false), 3000);

    await fetch("/api/messaging/send_message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        chat_id: chatId,
        content: "COUP DE CŒUR ! Le recruteur est bluffé !",
        receiver_id: candidateId,
      }),
    });
  };

  // === IA EN TEMPS RÉEL ===
  useEffect(() => {
    if (!isRecruiter || !isConnected) return;

    const analyze = async () => {
      setIaThinking(true);
      try {
        const res = await askAI("Analyse cet entretien RH en cours. Donne un score global sur 100 et 3 suggestions de questions.", {
          candidate_name: candidateName,
          duration: formatDuration(duration),
        });
        if (res.response) {
          const match = res.response.match(/(\d+)\/100/i);
          const score = match ? parseInt(match[1]) : null;
          setIaScore(score);
          setIaSuggestion(res.response);
        }
      } catch (err) {
        console.error("Erreur IA:", err);
      } finally {
        setIaThinking(false);
      }
    };

    const interval = setInterval(analyze, 45000);
    return () => clearInterval(interval);
  }, [isConnected, isRecruiter, duration, candidateName]);

  useEffect(() => {
      if (isConnected && isRecruiter) {
        startSpeechAnalysis({
          onSpeechDetected: (transcript, questions) => {
            setSuggestedQuestions(questions);
            // Auto-hide après 20s
            setTimeout(() => setSuggestedQuestions([]), 20000);
          },
          onAnalysisUpdate: (analysisLines) => {
            setSpeechAnalysis(analysisLines);
            setTimeout(() => setSpeechAnalysis([]), 15000);
          }
        });
  }

  return () => {
    stopSpeechAnalysis();
  };
}, [isConnected, isRecruiter]);

  // === Chargement données + connexion Agora ===
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tokenRes, interviewRes, profileRes] = await Promise.all([
          fetch(`/api/messaging/get_video_token/${interviewId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          }),
          fetch(`/api/messaging/interview_details/${interviewId}`, { credentials: "include" }),
          fetch("/api/auth/profile_info", { credentials: "include" }),
        ]);

        if (!tokenRes.ok || !interviewRes.ok || !profileRes.ok) throw new Error("Erreur");

        const tokenData = await tokenRes.json();
        const interviewData = await interviewRes.json();
        const profileData = await profileRes.json();

        if (!tokenData.success || !interviewData.success || !profileData.success) throw new Error("Données invalides");

        setCallData({
          interviewId,
          channelId: tokenData.channel_id,
          token: tokenData.token,
          userId: tokenData.uid,
          appId: tokenData.app_id || import.meta.env.VITE_AGORA_APP_ID,
        });

        const currentProfile = profileData.profile;
        setCurrentUserId(currentProfile.uid);
        setIsRecruiter(currentProfile.account_type === "company");

        const interview = interviewData.interview;
        setChatId(interview.chat_id || "");
        setCandidateId(interview.candidate_id || interview.company_id);

        const otherUid = currentProfile.account_type === "company" ? interview.candidate_id : interview.company_id;
        if (otherUid) {
          const otherRes = await fetch(`/api/auth/profile_info?uid=${otherUid}`, { credentials: "include" });
          if (otherRes.ok) {
            const other = await otherRes.json();
            if (other.success) {
              const name = currentProfile.account_type === "company"
                ? `${other.profile.first_name || ""} ${other.profile.name || ""}`.trim() || ""
                : other.profile.company_name || "Recruteur";
              setCandidateName(name);
            }
          }
        }
      } catch (err) {
        setError("Impossible de charger l'entretien");
      }
    };

    fetchAllData();
  }, [interviewId]);

  const joinCall = useCallback(async () => {
    if (!callData) return;
    const { appId, channelId, token, userId } = callData;

    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      await client.join(appId, channelId, token, userId);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;
      videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);
      setIsConnected(true);
    } catch (err) {
      setError(err.code === "UID_CONFLICT" ? "Connexion déjà active" : `Connexion échouée: ${err.message}`);
    }
  }, [callData]);

  useEffect(() => {
    if (callData) joinCall();
  }, [callData, joinCall]);

  useEffect(() => {
    if (!clientRef.current || !isConnected) return;
    const handleUserPublished = async (user, mediaType) => {
      await clientRef.current.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
        setTimeout(() => {
          const container = document.getElementById("remote-video-container");
          if (container && user.videoTrack) user.videoTrack.play(container);
        }, 300);
      }
      if (mediaType === "audio" && user.audioTrack) user.audioTrack.play();
    };
    const handleUserLeft = (user) => {
      setRemoteUsers(prev => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
    };
    clientRef.current.on("user-published", handleUserPublished);
    clientRef.current.on("user-left", handleUserLeft);
    return () => {
      clientRef.current?.off("user-published", handleUserPublished);
      clientRef.current?.off("user-left", handleUserLeft);
    };
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isConnected]);

  const toggleMute = () => {
    localAudioTrackRef.current?.setEnabled(isMuted);
    setIsMuted(!isMuted);
  };
  const toggleVideo = () => {
    localVideoTrackRef.current?.setEnabled(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };
  const handleHangUp = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    navigate("/messaging/inbox");
  };
  const formatDuration = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-12 text-center border border-white/20 shadow-2xl max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-12 h-12 text-red-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Connexion impossible</h2>
          <p className="text-red-200 text-base mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-red-500/50"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-ping absolute opacity-40"></div>
            <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full relative flex items-center justify-center shadow-2xl">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Connexion en cours...</h2>
          <p className="text-purple-300 text-lg">Préparation de l'entretien vidéo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Zone vidéo principale - PLEIN ÉCRAN */}
      <div id="remote-video-container" className="absolute inset-0 w-full h-full">
        {Object.keys(remoteUsers).length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-indigo-900/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10 mb-8">
                <User className="w-24 h-24 text-white/70" />
              </div>
              <p className="text-white text-3xl font-bold mb-2">{candidateName}</p>
              <p className="text-gray-400 text-xl">En attente de connexion...</p>
            </div>
          </div>
        )}
      </div>

      {/* Header flottant en haut */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl px-6 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-white text-lg font-semibold">{candidateName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl font-mono text-lg text-white shadow-lg">
                  {formatDuration(duration)}
                </div>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`p-3 rounded-2xl transition-all ${
                    showChat 
                      ? "bg-purple-600 shadow-lg shadow-purple-500/50" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </button>

                {isRecruiter && (
                  <>
                    <button
                      onClick={handleCoupDeCoeur}
                      className={`p-3 rounded-2xl transition-all ${
                        isCoupDeCoeur 
                          ? "bg-red-600 animate-pulse scale-110 shadow-xl shadow-red-500/50" 
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isCoupDeCoeur ? "fill-white text-white" : "text-white"}`} />
                    </button>
                    <button
                      onClick={() => setShowEvaluation(true)}
                      className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl hover:shadow-xl hover:shadow-amber-500/50 transition-all"
                    >
                      <Star className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge IA flottant */}
      {isRecruiter && (iaThinking || iaSuggestion) && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full px-6">
          <div className={`bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 shadow-2xl ${
            iaThinking ? "animate-pulse" : "animate-in fade-in slide-in-from-top duration-500"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                iaThinking ? "from-purple-600 to-pink-600" : "from-amber-500 to-orange-600"
              } flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {iaThinking ? (
                  <Brain className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 text-white">
                {iaThinking ? (
                  <p className="text-base font-semibold">Jarvis analyse l'entretien en temps réel...</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lg">Score IA : {iaScore !== null ? `${iaScore}/100` : "Calcul..."}</p>
                      {iaScore !== null && iaScore >= 80 && (
                        <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-400">Excellent</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-purple-100">{iaSuggestion}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    {/* Questions intelligentes générées */}
      {isRecruiter && suggestedQuestions.length > 0 && (
        <div className="absolute top-56 left-1/2 -translate-x-1/2 z-30 max-w-3xl w-full px-6 animate-in slide-in-from-top fade-in duration-500">
          <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <p className="font-bold text-lg mb-3">Questions suggérées par Jarvis :</p>
                <ul className="space-y-2 text-sm">
                  {suggestedQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyse du ton et du discours */}
      {isRecruiter && speechAnalysis.length > 0 && (
        <div className="absolute top-96 left-1/2 -translate-x-1/2 z-30 max-w-xl w-full px-6 animate-in fade-in duration-500">
          <div className="bg-black/80 backdrop-blur-2xl border border-orange-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex flex-col gap-2">
              {speechAnalysis.map((line, i) => (
                <p key={i} className="text-sm text-orange-200 flex items-center gap-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vidéo locale en picture-in-picture */}
      <div className="absolute bottom-32 right-6 z-30 w-80 h-56 bg-black/60 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
        <div ref={localVideoRef} className="w-full h-full" />
        {!isVideoOn && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl mb-3">
                <User className="w-12 h-12 text-white" />
              </div>
              <p className="text-white font-semibold">Caméra désactivée</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-medium border border-white/20">
          Vous
        </div>
      </div>

      {/* Barre de contrôle flottante en bas */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-5 shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full transition-all transform hover:scale-110 ${
                isMuted 
                  ? "bg-red-600 shadow-lg shadow-red-500/50" 
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6 text-white mx-auto" /> : <Mic className="w-6 h-6 text-white mx-auto" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full transition-all transform hover:scale-110 ${
                !isVideoOn 
                  ? "bg-red-600 shadow-lg shadow-red-500/50" 
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6 text-white mx-auto" /> : <VideoOff className="w-6 h-6 text-white mx-auto" />}
            </button>

            <div className="w-px h-10 bg-white/20 mx-2"></div>

            <button
              onClick={handleHangUp}
              className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-full font-bold text-white shadow-2xl hover:shadow-red-600/50 transition-all flex items-center gap-3 hover:scale-105 transform"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
              Terminer
            </button>
          </div>
        </div>
      </div>

      {/* Panel de chat coulissant */}
      {showChat && chatId && (
        <div className="absolute top-0 right-0 bottom-0 w-96 z-40 animate-in slide-in-from-right duration-300">
          <div className="h-full bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <VideoChat chatId={chatId} currentUserId={currentUserId} candidateId={candidateId} />
            </div>
          </div>
        </div>
      )}

      {/* Modal d'évaluation */}
      {showEvaluation && isRecruiter && (
        <EvaluationModal
          interviewId={interviewId}
          candidateName={candidateName}
          onClose={() => setShowEvaluation(false)}
        />
      )}

      {/* Animation coup de coeur */}
      {isCoupDeCoeur && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-in zoom-in duration-500">
            <Heart className="w-64 h-64 text-red-500 fill-red-500 drop-shadow-2xl animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}