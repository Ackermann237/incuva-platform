// src/components/SidebarUser.jsx
import React, { useState } from "react";
import { MessageSquare, Briefcase, FileText, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const navItems = [
      { name: "Tableau de bord", icon: Layers, path: "/user_dashboard" },
      { name: "Offres d'emploi", icon: Briefcase, path: "/jobs/offers" },
      { name: "Mes candidatures", icon: FileText, path: "/jobs/my-applications" },
      { name: "Messagerie", icon: MessageSquare, path: "/messaging/inbox" },
  ];
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-sm h-screen overflow-y-auto transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            {isExpanded && (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
            )}
            {isExpanded && <h1 className="text-xl font-bold text-gray-900">Mon Espace</h1>}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-600 ${
                  !isExpanded ? "justify-center" : ""
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                {isExpanded && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
