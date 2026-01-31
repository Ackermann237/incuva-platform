import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Search,
  Clock,
  Star,
  Archive,
  MoreVertical,
  Pin,
  Trash2,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Video,
  Bell,
  Settings,
  Filter,
  ChevronDown,
  Circle,
  Zap,
  Menu,
  X
} from "lucide-react";
import { getInbox } from "../../services/messaging";

// Composant Badge de notification
const NotificationBadge = ({ count, className = "" }) => {
  if (count === 0) return null;
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
};

// Composant Avatar
const Avatar = ({ name, size = "md", hasNotification = false }) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-xl",
    lg: "w-16 h-16 text-2xl"
  };

  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
  ];

  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className="relative flex-shrink-0">
      <div className={`bg-gradient-to-br ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${sizeClasses[size]}`}>
        {name.charAt(0).toUpperCase()}
      </div>
      {hasNotification && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
};

// Composant Item de Chat
const ChatItem = ({ chat, isSelected, onSelect, onNavigate, onShowActions }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getMessageTypeIcon = (type) => {
    const icons = {
      image: <ImageIcon className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      document: <FileText className="w-4 h-4" />
    };
    return icons[type] || null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000 || Date.now());
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "maintenant";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 rounded-2xl blur-lg transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />

      <div className={`relative bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200 ${
        isHovered ? 'border-purple-300 shadow-lg -translate-y-0.5' : 'border-gray-100'
      } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(chat.chatId);
            }}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
              isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </button>

          <div onClick={() => onNavigate(chat.chatId)} className="cursor-pointer">
            <Avatar
              name={chat.otherParticipantName}
              size="sm"
              hasNotification={chat.unreadCount > 0}
            />
          </div>

          <div
            onClick={() => onNavigate(chat.chatId)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-sm truncate ${
                chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {chat.otherParticipantName}
              </h3>
              {chat.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              {getMessageTypeIcon(chat.lastMessageType)}
              <p className={`text-xs truncate ${
                chat.unreadCount > 0 ? 'font-semibold text-gray-800' : ''
              }`}>
                {chat.lastMessage || "Aucun message"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(chat.lastMessageTime)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowActions(chat.chatId);
                }}
                className="p-1.5 hover:bg-purple-50 rounded-lg transition-opacity opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {chat.unreadCount > 0 && (
              <NotificationBadge
                count={chat.unreadCount}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Filtre
const FilterButton = ({ filter, isActive, onClick, isCollapsed }) => {
  const Icon = filter.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isActive
          ? `${filter.bgColor} ${filter.borderColor} border-2 shadow-md`
          : "hover:bg-gray-50 border-2 border-transparent"
      }`}
      title={isCollapsed ? filter.label : ""}
    >
      <Icon className={`w-5 h-5 ${isActive ? filter.color : "text-gray-500"}`} />
      {!isCollapsed && (
        <>
          <span className={`flex-1 text-left text-sm font-semibold ${
            isActive ? filter.color : "text-gray-700"
          }`}>
            {filter.label}
          </span>
          {filter.count > 0 && (
            <NotificationBadge
              count={filter.count}
              className={isActive ? `${filter.color} bg-white` : "bg-gray-100 text-gray-600"}
            />
          )}
        </>
      )}
    </button>
  );
};

export default function Inbox() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedChats, setSelectedChats] = useState([]);
  const [showActions, setShowActions] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [ws, setWs] = useState(null);

  // WebSocket Setup
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/messaging`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connecté');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat.chatId === data.chatId) {
              return {
                ...chat,
                lastMessage: data.content,
                lastMessageTime: { seconds: Date.now() / 1000 },
                lastMessageType: data.messageType,
                unreadCount: chat.unreadCount + 1
              };
            }
            return chat;
          });
          return updatedChats.sort((a, b) =>
            b.lastMessageTime.seconds - a.lastMessageTime.seconds
          );
        });
      } else if (data.type === 'message_read') {
        setChats(prevChats => prevChats.map(chat =>
          chat.chatId === data.chatId
            ? { ...chat, unreadCount: 0 }
            : chat
        ));
      }
    };

    websocket.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket déconnecté');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    async function loadInbox() {
      const res = await getInbox();
      if (res.success) {
        setChats(res.chats || []);
      }
      setLoading(false);
    }
    loadInbox();
  }, []);

  const filteredChats = useMemo(() => {
    let filtered = chats.filter(chat =>
      chat.otherParticipantName.toLowerCase().includes(search.toLowerCase())
    );

    switch(activeFilter) {
      case "unread":
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case "starred":
        filtered = filtered.filter(chat => chat.starred);
        break;
      case "archived":
        filtered = filtered.filter(chat => chat.archived);
        break;
      default:
        break;
    }

    return filtered;
  }, [chats, search, activeFilter]);

  const totalUnread = useMemo(() =>
    chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats]
  );

  const starredCount = chats.filter(chat => chat.starred).length;

  const handleMarkAllRead = useCallback(() => {
    // Envoyer via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'mark_all_read' }));
    }
    setChats(prevChats => prevChats.map(chat => ({ ...chat, unreadCount: 0 })));
  }, [ws]);

  const filters = [
    {
      id: "all",
      label: "Toutes",
      icon: MessageCircle,
      count: chats.length,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300"
    },
    {
      id: "unread",
      label: "Non lues",
      icon: Bell,
      count: totalUnread,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300"
    },
    {
      id: "starred",
      label: "Favoris",
      icon: Star,
      count: starredCount,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300"
    },
    {
      id: "archived",
      label: "Archivées",
      icon: Archive,
      count: 0,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300"
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          {!isSidebarCollapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Messagerie
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {chats.length} conversation{chats.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed);
              setIsMobileSidebarOpen(false);
            }}
            className="p-2 hover:bg-purple-50 rounded-lg transition-all lg:block hidden"
          >
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${
              isSidebarCollapsed ? "rotate-90" : "rotate-0"
            }`} />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {!isSidebarCollapsed && totalUnread > 0 && (
        <div className="px-4 py-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-5 h-5" />
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-3xl font-bold mb-1">{totalUnread}</p>
            <p className="text-sm text-purple-100">
              Message{totalUnread !== 1 ? 's' : ''} non lu{totalUnread !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 space-y-1.5">
        {!isSidebarCollapsed && (
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5" />
            Filtres
          </h3>
        )}
        {filters.map((filter) => (
          <FilterButton
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
            isCollapsed={isSidebarCollapsed}
          />
        ))}
      </div>

      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-t border-gray-100 mt-auto space-y-1.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Actions
          </h3>
          <button
            onClick={handleMarkAllRead}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-all text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout marquer lu</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-all text-sm">
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
        </div>
      )}

      {!isSidebarCollapsed && (
        <div className="p-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Circle className="w-2.5 h-2.5 text-green-500 fill-current animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-800">En ligne</p>
                <p className="text-xs text-green-600">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        h-screen bg-white/90 backdrop-blur-xl border-r border-gray-100 shadow-xl
        transition-all duration-300 flex flex-col
        ${isSidebarCollapsed ? "w-20" : "w-80"}
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="px-4 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {activeFilter === "all" && "Toutes les conversations"}
                  {activeFilter === "unread" && "Messages non lus"}
                  {activeFilter === "starred" && "Favoris"}
                  {activeFilter === "archived" && "Archivées"}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">
                  {filteredChats.length} résultat{filteredChats.length > 1 ? 's' : ''}
                </p>
              </div>

              {selectedChats.length > 0 && (
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-sm font-bold text-purple-700">
                    {selectedChats.length} sélectionné{selectedChats.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-purple-100 rounded-lg" title="Marquer lu">
                      <CheckCheck className="w-4 h-4 text-purple-600" />
                    </button>
                    <button className="p-1.5 hover:bg-purple-100 rounded-lg" title="Archiver">
                      <Archive className="w-4 h-4 text-purple-600" />
                    </button>
                    <button className="p-1.5 hover:bg-red-100 rounded-lg" title="Supprimer">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-6 text-gray-600 font-semibold">Chargement...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {search ? "Aucun résultat" : "Aucune conversation"}
              </h3>
              <p className="text-gray-500">
                {search ? "Essayez un autre terme" : "Commencez une nouvelle conversation"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl mx-auto">
              {filteredChats.map((chat) => (
                <ChatItem
                  key={chat.chatId}
                  chat={chat}
                  isSelected={selectedChats.includes(chat.chatId)}
                  onSelect={(id) => setSelectedChats(prev =>
                    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                  )}
                  onNavigate={(id) => navigate(`/messaging/conversation/${id}`)}
                  onShowActions={(id) => setShowActions(showActions === id ? null : id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .ml-12 { margin-left: 3rem; }
        }
      `}</style>
    </div>
  );
}