// src/components/MessageList.jsx
import React, { useState, useRef } from "react";
import Modal from "./Modal";
import ViewContract from "../pages/Contracts/ViewContract";
import SignContract from "../pages/Contracts/SignContract";
import { Link } from "react-router-dom";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";

export default function MessageList({
  messages,
  senderId,
  otherName,
  loading,
  isTyping,
  messagesEndRef,
  currentUserName,
}) {
  const getInitialsColor = (name) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-pink-500 to-rose-600",
      "from-green-500 to-emerald-600",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const currentUserInitial = otherName.charAt(0).toUpperCase(); // ou passer le nom via props

  const openContractModal = (contractId) => {
    console.log("Ouvrir contrat ID:", contractId);
    setSelectedContractId(contractId);
    setContractModalOpen(true);
  };

  const openSignModal = () => {
    setContractModalOpen(false);
    setSignModalOpen(true);
  };

  const handleReject = async () => {
    if (!window.confirm("Voulez-vous vraiment refuser ce contrat ?")) return;
    try {
      const res = await fetch(`/api/contracts/view/${selectedContractId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Contrat refusé.");
        setContractModalOpen(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Erreur réseau");
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "Photo";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "Video";
    if (["pdf"].includes(ext)) return "PDF";
    if (["doc", "docx"].includes(ext)) return "Document";
    if (["webm", "mp3", "wav", "ogg", "m4a"].includes(ext)) return "Microphone";
    return "Fichier";
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const AudioMessage = ({ audioUrl, isCurrentUser }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    const togglePlayPause = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    const formatTime = (time) => {
      if (!time || isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl max-w-xs ${
          isCurrentUser ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-all shadow-md"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1 relative">
          <div className="flex items-center gap-0.5 h-9">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className={`w-0.5 ${isCurrentUser ? "bg-white/50" : "bg-gray-400/50"} rounded-full transition-all ${
                  isPlaying ? "animate-pulse" : ""
                }`}
                style={{
                  height: isPlaying
                    ? `${12 + Math.sin(i * 0.3 + Date.now() / 200) * 12}px`
                    : "10px",
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <span className={`text-xs ${isCurrentUser ? "text-white/80" : "text-gray-500"} font-medium tabular-nums`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="text-xl opacity-80">Microphone</div>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
          playsInline
          type="audio/webm"
        />
      </div>
    );
  };

  const renderMessageContent = (msg) => {
    const isCurrentUser = msg.senderId === senderId;
    if (msg.type === "image" && msg.imageUrl) {
      return (
        <div className="rounded-xl overflow-hidden max-w-xs cursor-pointer hover:opacity-90 transition-opacity">
          <img
            src={msg.imageUrl}
            alt="Image"
            className="w-full h-auto"
            onClick={() => window.open(msg.imageUrl, "_blank")}
          />
        </div>
      );
    }
    if (msg.type === 'interview' && msg.interview_details) {
      const { interview_id, type } = msg.interview_details;
      return (
        <div className="prose prose-sm max-w-none">
          <p><strong>Entretien planifié</strong></p>
          <p><strong>Date et heure :</strong> {new Date(msg.interview_details.datetime).toLocaleString('fr-FR')}</p>
          <p><strong>Type :</strong> {type === 'video' ? 'Visioconférence' : type === 'presentiel' ? 'Présentiel' : 'Téléphone'}</p>
          <p><strong>Documents :</strong> {msg.interview_details.documents_to_bring?.join(', ') || 'Aucun'}</p>
          {type === 'video' && (
            <p>
              <strong>Lien :</strong>{" "}
              <Link
                to={`/messaging/video_room/${interview_id}`}
                className="text-blue-600 underline hover:text-blue-800 font-medium"
              >
                Rejoindre la visioconférence
              </Link>
            </p>
          )}
        </div>
      );
    }
    if (msg.type === "video" && msg.videoUrl) {
      return (
        <div className="rounded-xl overflow-hidden max-w-xs">
          <video src={msg.videoUrl} controls className="w-full" playsInline />
        </div>
      );
    }
    if (msg.type === "document" && msg.documentUrl && !msg.audioUrl) {
      return (
        <a
          href={msg.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-opacity ${
            isCurrentUser ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          <div className="text-2xl">{getFileIcon(msg.documentName)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {msg.documentName || "Document"}
            </p>
            <p className="text-xs opacity-70">Cliquez pour télécharger</p>
          </div>
          <Download className="w-5 h-5 flex-shrink-0" />
        </a>
      );
    }
    if (msg.type === "document" && msg.documentUrl && msg.documentName?.includes("A_Signer")) {
      return (
        <div className={`rounded-xl p-4 max-w-sm ${
          isCurrentUser ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300" : "bg-white text-gray-900 border border-gray-200"
        }`}>
          <a
            href={msg.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:bg-blue-100 transition-colors rounded-lg p-2"
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">{msg.documentName}</p>
              <p className="text-xs text-blue-600">Cliquez pour signer</p>
            </div>
          </a>
        </div>
      );
    }
    if (msg.type === "contract" && msg.contract_link) {
      const contractId = msg.contract_link.split("/").pop();
      return (
        <div className={`rounded-xl p-4 max-w-sm ${
          isCurrentUser ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-300" : "bg-white text-gray-900 border border-gray-200"
        }`}>
          <p className="font-semibold mb-2">Contrat à signer</p>
          <p className="text-sm mb-2">
            Poste : <span className="font-medium">{msg.position}</span>
          </p>
          <button
            onClick={() => openContractModal(contractId)}
            className="inline-flex items-center gap-2 text-blue-600 underline hover:text-blue-800 text-sm font-medium"
          >
            Ouvrir le contrat
          </button>
        </div>
      );
    }
    if (msg.type === "audio" || (msg.type === "document" && msg.audioUrl)) {
      return <AudioMessage audioUrl={msg.audioUrl} isCurrentUser={isCurrentUser} />;
    }
    return <p className={`text-sm leading-relaxed break-words ${isCurrentUser ? "text-white" : "text-gray-900"}`}>{msg.content}</p>;
  };

  return (
    <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-3 border-purple-200 rounded-full"></div>
              <div className="w-16 h-16 border-3 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm">Chargement...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              Commencez la conversation
            </h3>
            <p className="text-sm text-gray-500">
              Envoyez votre premier message à {otherName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === senderId;
              const showAvatar =
                index === 0 || messages[index - 1]?.senderId !== msg.senderId;
              return (
                <div
                  key={msg.messageId}
                  className={`flex gap-2 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } animate-in`}
                >
                  {!isCurrentUser && (
                    <div className="flex-shrink-0 w-8">
                      {showAvatar && (
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${getInitialsColor(
                            otherName
                          )} rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow`}
                        >
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-col ${
                      isCurrentUser ? "items-end" : "items-start"
                    } max-w-md`}
                  >
                    <div
                      className={`group relative px-4 py-2.5 rounded-2xl shadow-lg transition-all max-w-md ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-bl-xl rounded-tr-xl rounded-br-sm"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm rounded-br-xl rounded-tl-xl"
                      }`}
                    >
                      {renderMessageContent(msg)}
                      <div
                        className={`flex items-center gap-1.5 mt-1 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <p
                          className={`text-xs ${
                            isCurrentUser ? "text-white/70" : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </p>
                        {isCurrentUser && (
                          msg.isRead ? (
                            <CheckCheck className="w-3 h-3 text-green-300" />
                          ) : (
                            <Check className="w-3 h-3 text-white/50" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {isCurrentUser && (
                    <div className="flex-shrink-0 w-8">
                      {showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow">
                          {currentUserName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {isTyping && (
              <div className="flex gap-2 items-center justify-start">
                <div
                  className={`w-8 h-8 bg-gradient-to-br ${getInitialsColor(
                    otherName
                  )} rounded-lg flex items-center justify-center text-white text-xs font-semibold`}
                >
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm rounded-br-xl rounded-tl-xl px-4 py-2.5 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <Modal
      isOpen={contractModalOpen}
      onClose={() => setContractModalOpen(false)}
      title="Contrat de travail"
      maxWidth="max-w-5xl"
      hideHeader={true} // Ajoutez cette prop
      noPadding={true} // Ajoutez cette prop
      transparentBackground={true} // Ajoutez cette prop
    >
      {selectedContractId && (
        <ViewContract
          contractId={selectedContractId}
          onSign={openSignModal}
          onReject={handleReject}
          onClose={() => setContractModalOpen(false)}
        />
      )}
    </Modal>

    <Modal
      isOpen={signModalOpen}
      onClose={() => setSignModalOpen(false)}
      title="Signature du contrat"
      maxWidth="max-w-4xl"
      hideHeader={true} // Ajoutez cette prop
      noPadding={true} // Ajoutez cette prop
      transparentBackground={true} // Ajoutez cette prop
    >
      {selectedContractId && (
        <SignContract
          contractId={selectedContractId}
          onSuccess={() => {
            setSignModalOpen(false);
            setContractModalOpen(false);
            alert("Contrat signé avec succès !");
          }}
        />
      )}
</Modal>
    </div>
  );
}
