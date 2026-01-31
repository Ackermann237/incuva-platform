// src/components/MessageInput.jsx
import React, { useRef } from "react";
import {
  Send, Paperclip, Image as ImageIcon, Video, File, Mic, X, Smile
} from "lucide-react";

export default function MessageInput({
  input,
  setInput,
  selectedFile,
  setSelectedFile,
  isRecording,
  setIsRecording,
  recordingTime,
  setRecordingTime,
  showAttachMenu,
  setShowAttachMenu,
  uploading,
  handleSend,
  startRecording,
  stopRecording,
}) {
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    // Génère une URL temporaire pour l'aperçu
    const previewUrl = URL.createObjectURL(file);
        setSelectedFile({
          file,
          previewUrl,
          name: file.name,
          type: file.type
        });
    };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'Video';
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Document';
    if (['webm', 'mp3', 'wav'].includes(ext)) return 'Audio';
    return 'Fichier';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-2xl">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Aperçu du fichier sélectionné */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3">
              {/* Image */}
              {selectedFile.type.startsWith('image/') && (
                <img
                  src={selectedFile.previewUrl}
                  alt="Aperçu"
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
              )}

              {/* Vidéo */}
              {selectedFile.type.startsWith('video/') && (
                <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden shadow-md">
                  <video
                    src={selectedFile.previewUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7L8 5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Document / Autre */}
              {!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/') && (
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getFileIcon(selectedFile.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}

              {/* Bouton supprimer */}
              <button
                onClick={() => {
                  if (selectedFile.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
                  setSelectedFile(null);
                }}
                className="ml-auto p-2 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Indicateur enregistrement */}
        {isRecording && (
          <div className="mb-3 flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">Enregistrement...</span>
            </div>
            <span className="text-sm font-mono text-red-600 font-bold">{formatTime(recordingTime)}</span>
            <button onClick={stopRecording} className="ml-auto px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium">
              Terminer
            </button>
          </div>
        )}

        {/* Indicateur upload */}
        {uploading && (
          <div className="mb-3 flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-blue-700">Envoi en cours...</span>
          </div>
        )}

        {/* Zone d'input */}
        <div className="flex items-end gap-2">
          {/* Menu pièce jointe */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 hover:bg-purple-50 rounded-xl transition-all hover:scale-110"
              disabled={uploading || isRecording}
            >
              <Paperclip className={`w-5 h-5 text-gray-600 hover:text-purple-600 transition-all ${showAttachMenu ? 'rotate-45' : ''}`} />
            </button>
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 min-w-[200px] animate-in">
                <button onClick={() => { imageInputRef.current?.click(); setShowAttachMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 rounded-xl transition-colors text-left">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Image</span>
                </button>
                <button onClick={() => { videoInputRef.current?.click(); setShowAttachMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 rounded-xl transition-colors text-left">
                  <Video className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium">Vidéo</span>
                </button>
                <button onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 rounded-xl transition-colors text-left">
                  <File className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Fichier</span>
                </button>
              </div>
            )}
          </div>

          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileSelect} />

          {/* Champ texte */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !uploading && handleSend()}
              placeholder="Message..."
              disabled={uploading || isRecording}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 focus:border-purple-300 text-sm transition-all disabled:opacity-50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-purple-50 rounded-lg transition-all" disabled={uploading || isRecording}>
              <Smile className="w-5 h-5 text-gray-400 hover:text-purple-600" />
            </button>
          </div>

          {/* Bouton envoi ou micro */}
          {input.trim() || selectedFile ? (
            <button
              onClick={handleSend}
              disabled={uploading || isRecording}
              className={`p-3 rounded-2xl transition-all ${
                uploading || isRecording
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-110"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => isRecording ? stopRecording() : startRecording()}
              disabled={uploading}
              className={`p-3 rounded-2xl transition-all hover:scale-110 ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : uploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-purple-50 text-gray-600 hover:text-purple-600"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}