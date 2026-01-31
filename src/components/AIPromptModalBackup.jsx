// src/components/AIPromptModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2 } from "lucide-react";
import { askAI } from "../services/aiAssistant";

const parseMarkdown = (text) => {
  if (!text) return null;

  return text
    .replace(/^\# (.*$)/gim, '<h1 class="text-2xl font-bold text-purple-900 mb-3">$1</h1>')
    .replace(/^\## (.*$)/gim, '<h2 class="text-xl font-bold text-purple-800 mb-2">$1</h2>')
    .replace(/^\### (.*$)/gim, '<h3 class="text-lg font-bold text-purple-700 mb-2">$1</h3>')
    .replace(/\*\*\*(.*)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*)\*/g, '<em class="italic">$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-5 list-decimal">$1</li>')
    .replace(/\n/g, '<br>');
};

export default function AIPromptModal({ isOpen, onClose, contextData = {}, onInsightsGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = { role: "user", content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    const res = await askAI(prompt, contextData);
    setLoading(false);

    if (res.response) {
      const aiMessage = { role: "assistant", content: res.response };
      setMessages(prev => [...prev, aiMessage]);
      if (onInsightsGenerated) onInsightsGenerated(res.response);
    }
  };

  const generateAutoInsights = async () => {
    const autoPrompt = `Analyse les données RH suivantes et fournis des insights stratégiques :
    - Candidatures : ${contextData.applications?.length || 0}
    - Entretiens : ${contextData.interviews?.length || 0}
    - Contrats signés : ${contextData.contracts?.length || 0}
    - Période : ${contextData.timeRange || "mois"}
    Fournis des recommandations concrètes pour optimiser le recrutement.`;

    setMessages([{ role: "user", content: autoPrompt }]);
    setLoading(true);
    const res = await askAI(autoPrompt, contextData);
    setLoading(false);
    if (res.response) {
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
      if (onInsightsGenerated) onInsightsGenerated(res.response);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Assistant IA RH</h3>
              <p className="text-sm text-gray-600">Posez vos questions ou générez des insights</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <p>Posez une question ou cliquez sur "Générer des insights"</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyse en cours...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t-2 border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Quelles sont les tendances de recrutement ?"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </button>
          </div>
          {messages.length === 0 && (
            <button
              type="button"
              onClick={generateAutoInsights}
              className="mt-3 w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Générer des insights automatiques
            </button>
          )}
        </form>
      </div>
    </div>
  );
}