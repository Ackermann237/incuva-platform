// src/components/MessagingHeader.jsx
import React from "react";
import { ArrowLeft, Calendar, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MessagingHeader({ otherName, chatId, currentAccountType, candidateId }) {
  const navigate = useNavigate();

  const getInitialsColor = (name) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-indigo-600',
      'from-pink-500 to-rose-600',
      'from-green-500 to-emerald-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const isCompany = currentAccountType === "company";

  return (
    <div className="relative z-10 bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/messaging/inbox")}
              className="p-2 hover:bg-purple-50 rounded-lg transition-all hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <div className={`w-10 h-10 bg-gradient-to-br ${getInitialsColor(otherName)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {otherName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                {otherName}
                <Circle className="w-1.5 h-1.5 text-green-500 fill-current" />
              </h2>
              <p className="text-xs text-gray-500">En ligne</p>
            </div>
          </div>

          {/* Boutons pour l'entreprise */}
          {isCompany && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/messaging/schedule/${chatId}`)}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Entretien</span>
              </button>

              <button
                onClick={() => navigate(`/contracts/create/${chatId}/${candidateId}`)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-105"
              >
                Proposer un contrat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}