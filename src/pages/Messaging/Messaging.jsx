// src/pages/Messaging/Messaging.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MessagingHeader from "../../components/MessagingHeader";
import MessageList from "../../components/MessageList";
import MessageInput from "../../components/MessageInput";
import { getConversation, sendMessage, sendFile } from "../../services/messaging";

export default function Messaging() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [otherName, setOtherName] = useState("");
  const [currentUserName, setCurrentUserName] = useState("Moi"); // ← NOUVEAU
  const [senderId, setSenderId] = useState(""); // ← CORRIGÉ
  const [receiverId, setReceiverId] = useState("");
  const [currentAccountType, setCurrentAccountType] = useState("individual");
  const [candidateId, setCandidateId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // === CHARGEMENT DE LA CONVERSATION ===
  useEffect(() => {
    if (chatId) loadConversation();
    const interval = setInterval(loadConversation, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // === SCROLL AUTO ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === TIMER ENREGISTREMENT AUDIO ===
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // === CHARGER LA CONVERSATION ===
  async function loadConversation() {
    try {
      const res = await getConversation(chatId);
      if (res.success) {
        setMessages(res.messages || []);
        setOtherName(res.otherParticipantName || "Inconnu");
        setCurrentUserName(res.current_user_name || "Moi"); // ← NOM DU CONNECTÉ
        setSenderId(res.current_user_id); // ← UID DU CONNECTÉ
        setCandidateId(res.other_participant_id || "");
        if (res.other_participant_id) setReceiverId(res.other_participant_id);
        setCurrentAccountType(res.current_account_type || "individual");
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
      setLoading(false);
    }
  }

  // === ENVOI DE MESSAGE OU FICHIER ===
  async function handleSend() {
    if (!input.trim() && !selectedFile) return;
    if (selectedFile && !receiverId) {
      alert("Erreur : destinataire non chargé. Réessayez dans quelques secondes.");
      setUploading(false);
      return;
    }

    try {
      // Envoi de fichier
      if (selectedFile) {
        setUploading(true);
        const fileType = selectedFile.type.startsWith('image/') ? 'image'
                       : selectedFile.type.startsWith('video/') ? 'video'
                       : 'document';

        const res = await sendFile(chatId, receiverId, selectedFile.file, fileType);
        if (res.success) {
          if (selectedFile.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
          setSelectedFile(null);
          loadConversation();
        }
        setUploading(false);
      }

      // Envoi de texte
      if (input.trim()) {
        const res = await sendMessage(chatId, input, receiverId);
        if (res.success) {
          setInput("");
          loadConversation();
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setUploading(false);
    }
  }

  // === ENREGISTREMENT AUDIO ===
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm;codecs=opus' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `audio_${Date.now()}.webm`;
        const audioFile = new File([blob], fileName, { type: 'audio/webm' });

        setUploading(true);
        try {
          const res = await sendFile(chatId, receiverId, audioFile, 'document');
          if (res.success) loadConversation();
        } catch (error) {
          console.error("Erreur envoi audio:", error);
        }
        setUploading(false);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Erreur microphone:", err);
      alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30 flex flex-col overflow-hidden">
      {/* Fond animé */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <MessagingHeader
        otherName={otherName}
        chatId={chatId}
        currentAccountType={currentAccountType}
        candidateId={candidateId}
      />

      {/* Liste des messages */}
      <MessageList
        messages={messages}
        senderId={senderId}
        otherName={otherName}
        currentUserName={currentUserName} // ← PASSÉ ICI
        loading={loading}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      {/* Zone d'input */}
      <MessageInput
        input={input}
        setInput={setInput}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        recordingTime={recordingTime}
        setRecordingTime={setRecordingTime}
        showAttachMenu={showAttachMenu}
        setShowAttachMenu={setShowAttachMenu}
        uploading={uploading}
        handleSend={handleSend}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />

      {/* Scrollbar personnalisée */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #6366f1);
          border-radius: 10px;
        }
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: animate-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}