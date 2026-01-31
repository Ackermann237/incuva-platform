// frontend/src/components/SidebarMessaging.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Archive,
  Star,
  Settings,
  Search,
  Bell,
  CheckCheck,
  Clock,
  TrendingUp,
  Filter,
  X,
  ChevronDown,
  Circle
} from "lucide-react";

export default function SidebarMessaging({ chats = [], onFilterChange, activeFilter = "all" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  const archivedCount = 0; // À implémenter selon votre logique
  const starredCount = chats.filter(chat => chat.starred).length;

  const filters = [
    {
      id: "all",
      label: "Toutes",
      icon: MessageCircle,
      count: chats.length,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: "unread",
      label: "Non lues",
      icon: Bell,
      count: totalUnread,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      id: "starred",
      label: "Favoris",
      icon: Star,
      count: starredCount,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      id: "archived",
      label: "Archivées",
      icon: Archive,
      count: archivedCount,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    },
  ];

  const quickActions = [
    { id: "mark-read", label: "Tout marquer lu", icon: CheckCheck },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const isActive = (filterId) => activeFilter === filterId;

  return (
    <div className={`relative h-screen bg-white border-r-2 border-gray-100 transition-all duration-300 ${
      isCollapsed ? "w-20" : "w-80"
    }`}>
      {/* Header */}
      <div className="p-6 border-b-2 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Messagerie
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {chats.length} conversation{chats.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${
              isCollapsed ? "rotate-90" : "rotate-0"
            }`} />
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {!isCollapsed && totalUnread > 0 && (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Bell className="w-5 h-5" />
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold mb-1">{totalUnread}</p>
              <p className="text-sm text-purple-100">
                Message{totalUnread !== 1 ? 's' : ''} non lu{totalUnread !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filtres
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              {showFilters ? "Masquer" : "Afficher"}
            </button>
          </div>
        )}

        <div className={`space-y-1 ${!showFilters && !isCollapsed ? "hidden" : ""}`}>
          {filters.map((filter) => {
            const Icon = filter.icon;
            const active = isActive(filter.id);

            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? `${filter.bgColor} ${filter.borderColor} border-2 shadow-sm`
                    : "hover:bg-gray-50"
                }`}
              >
                <div className={`flex-shrink-0 ${active ? filter.color : "text-gray-500"}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {!isCollapsed && (
                  <>
                    <span className={`flex-1 text-left font-medium ${
                      active ? filter.color : "text-gray-700"
                    }`}>
                      {filter.label}
                    </span>

                    {filter.count > 0 && (
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        active
                          ? `${filter.color} ${filter.bgColor}`
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {filter.count > 99 ? "99+" : filter.count}
                      </span>
                    )}
                  </>
                )}

                {isCollapsed && filter.count > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-t-2 border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Actions rapides
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Circle className="w-3 h-3 text-green-500 fill-current" />
                <span className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">En ligne</p>
                <p className="text-xs text-green-600">Prêt à recevoir des messages</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}