import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Phone, Users, MessageSquare, Settings, User } from "lucide-react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function VideoRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [callData, setCallData] = useState(null);

  const localVideoRef = useRef();
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);


  useEffect(() => {
      if (isConnected && localVideoTrackRef.current && localVideoRef.current) {
        console.log("Lecture de la vidéo locale après rendu DOM...");
        localVideoTrackRef.current.play(localVideoRef.current);
      }
 }, [isConnected]);

  // Récupérer les informations de l'appel
  useEffect(() => {
    let isMounted = true;
    const fetchCallInfo = async () => {
      try {
        const res = await fetch(`/api/messaging/get_video_token/${interviewId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;
        if (data.success) {
          setCallData({
            interviewId,
            channelId: data.channel_id,
            token: data.token,
            userId: data.uid,
            appId: data.app_id || import.meta.env.VITE_AGORA_APP_ID,
          });
        } else {
          throw new Error(data.error || "Token non généré");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erreur fetch token:", err);
          setError(err.message);
          alert("Impossible de rejoindre l'appel : " + err.message);
          navigate(-1);
        }
      }
    };
    fetchCallInfo();
    return () => { isMounted = false; };
  }, [interviewId, navigate]);

  // Rejoindre l'appel
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

      console.log("Audio track:", audioTrack);
      console.log("Video track:", videoTrack);

      if (localVideoRef.current) {
        console.log("Jouer la vidéo locale...");
        videoTrack.play(localVideoRef.current);
      } else {
        console.error("localVideoRef.current est null");
      }

      await client.publish([audioTrack, videoTrack]);

      setIsConnected(true);
      setIsHost(true);
      console.log("Connecté et publié avec succès");
    } catch (err) {
      console.error("Erreur joinCall:", err);
      setError(`Connexion échouée : ${err.message || err}`);
    }
  }, [callData]);

  // Quitter l'appel
  const leaveCall = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsConnected(false);
    } catch (err) {
      console.error("Erreur leaveCall:", err);
    }
  }, []);

  // Gestion des utilisateurs distants
  useEffect(() => {
    if (!clientRef.current || !isConnected) return;

    const handleUserPublished = async (user, mediaType) => {
      if (!clientRef.current) return;
      try {
        await clientRef.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
          setTimeout(() => {
            const container = document.getElementById("remote-video-container");
            if (container && user.videoTrack) {
              user.videoTrack.play(container);
            }
          }, 500);
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (err) {
        console.error("Erreur handleUserPublished:", err);
      }
    };

    const handleUserUnpublished = (user) => {
      setRemoteUsers(prev => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
    };

    const handleUserLeft = (user) => {
      setRemoteUsers(prev => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
    };

    clientRef.current.on("user-published", handleUserPublished);
    clientRef.current.on("user-unpublished", handleUserUnpublished);
    clientRef.current.on("user-left", handleUserLeft);

    return () => {
      if (clientRef.current) {
        clientRef.current.off("user-published", handleUserPublished);
        clientRef.current.off("user-unpublished", handleUserUnpublished);
        clientRef.current.off("user-left", handleUserLeft);
      }
    };
  }, [isConnected]);

  // Timer
  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnected]);

  // Montage / Démontage
  useEffect(() => {
    isMountedRef.current = true;
    if (callData) {
      joinCall();
    }
    return () => {
      isMountedRef.current = false;
      leaveCall();
    };
  }, [callData, joinCall, leaveCall]);

  // Contrôles
  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const enabled = !isMuted;
      localAudioTrackRef.current.setEnabled(enabled);
      setIsMuted(!enabled);
      console.log(`Micro ${enabled ? 'activé' : 'désactivé'}`);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      const enabled = !isVideoOn;
      localVideoTrackRef.current.setEnabled(enabled);
      setIsVideoOn(enabled);
      console.log(`Vidéo ${enabled ? 'activée' : 'désactivée'}`);
    }
  };

  const handleHangUp = async () => {
    await leaveCall();
    navigate("/messaging/inbox");
  };

  const formatDuration = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // État d'erreur
  if (error) {
    return (
      <div className="h-screen bg-red-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-red-600 rotate-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Impossible de rejoindre l'appel</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Écran de connexion
  if (!isConnected && callData) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-full shadow-2xl">
              <Video className="w-16 h-16 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connexion en cours...</h2>
          <p className="text-blue-200">Rejoint le canal {callData.channelId}</p>
        </div>
      </div>
    );
  }

  // Interface principale
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">Entretien en cours</span>
          </div>
          <div className="px-3 py-1 bg-gray-700 rounded-full">
            <span className="text-blue-400 font-mono text-sm">{formatDuration(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Remote Video */}
        <div
          id="remote-video-container"
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
        >
          {Object.keys(remoteUsers).length === 0 && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-white text-xl font-semibold">Participant</h3>
              <p className="text-gray-400 text-sm mt-1">En attente de vidéo...</p>
            </div>
          )}
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-700">
          <div ref={localVideoRef} className="w-full h-full bg-black"></div>
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-sm font-medium">Vous</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-md font-medium">
              Vous
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-t border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all shadow-lg ${
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all shadow-lg ${
              !isVideoOn ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isVideoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={handleHangUp}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full transition-all shadow-lg flex items-center gap-2 ml-4"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
            <span className="text-white font-semibold">Raccrocher</span>
          </button>
        </div>
      </div>
    </div>
  );
}