// src/components/Visio/VideoChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";

export default function VideoChat({ interviewId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les messages de l'entretien
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messaging/interview_chat/${interviewId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Erreur chargement chat entretien:", err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [interviewId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput("");

    try {
      await fetch("/api/messaging/send_interview_chat_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          interview_id: interviewId,
          content,
        }),
      });
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Début de la conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${isMe ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrivez un message..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}