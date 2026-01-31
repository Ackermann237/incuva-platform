import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Search, Filter, ChevronRight, ChevronLeft,
  Star, MapPin, Briefcase, Mail, Phone, MessageSquare, Trash2, AlertCircle
} from "lucide-react";
import { getFavorites, removeFavorite, initiateChat } from "../../services/hr";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState([]);

  // Charger les favoris
  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);
      try {
        const res = await getFavorites();
        if (res.success) {
          setFavorites(res.favorites);
          setFilteredFavorites(res.favorites);
        } else {
          setError(res.error || "Erreur lors du chargement des favoris.");
        }
      } catch (err) {
        setError(err.message || "Erreur réseau.");
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  // Filtrer les favoris en fonction de la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFavorites(favorites);
    } else {
      const filtered = favorites.filter(talent =>
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFavorites(filtered);
    }
  }, [searchQuery, favorites]);

  // Supprimer un talent des favoris
  const handleRemoveFavorite = async (talentId) => {
    try {
      const res = await removeFavorite(talentId);
      if (res.success) {
        setFavorites(favorites.filter(talent => talent.id !== talentId));
        setFilteredFavorites(filteredFavorites.filter(talent => talent.id !== talentId));
      } else {
        setError(res.error || "Erreur lors de la suppression.");
      }
    } catch (err) {
      setError(err.message || "Erreur réseau.");
    }
  };

  // Démarrer une conversation avec un talent
  const handleStartChat = async (talentId, talentUserUid) => {
    try {
      const res = await initiateChat(talentId, talentUserUid);
      if (res.success) {
        navigate(`/messaging/conversation/${res.chat_id}`);
      } else {
        setError(res.error || "Erreur lors de l'initialisation de la conversation.");
      }
    } catch (err) {
      setError(err.message || "Erreur réseau.");
    }
  };

  // Afficher un message d'erreur
  const renderError = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    </div>
  );

  // Afficher un état de chargement
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-medium">Chargement des favoris...</p>
    </div>
  );

  // Afficher un état vide
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
      <Heart className="w-16 h-16 text-gray-200 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun talent en favoris</h3>
      <p className="text-gray-600 max-w-md">
        Ajoutez des talents à vos favoris pour les retrouver facilement et les contacter rapidement.
      </p>
      <button
        onClick={() => navigate("/hr/talent-market")}
        className="mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Explorer les talents
      </button>
    </div>
  );

  // Afficher la liste des favoris
  const renderFavorites = () => (
    <div className="space-y-4">
      {filteredFavorites.map((talent) => (
        <div
          key={talent.id}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {/* Image et infos principales */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {talent.profileImageUrl ? (
                  <img
                    src={talent.profileImageUrl}
                    alt={talent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {talent.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{talent.name}</h3>
                  <Heart className="w-5 h-5 text-red-500 fill-red-100" />
                </div>
                <p className="text-sm text-gray-600 truncate">{talent.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{talent.location || "Localisation inconnue"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{talent.originalTitle || "Poste non spécifié"}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={() => handleStartChat(talent.id, talent.user_uid)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-md transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                Contacter
              </button>
              <button
                onClick={() => handleRemoveFavorite(talent.id)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Retirer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Talents favoris
            </h1>
            <p className="text-gray-600 mt-1">
              Retrouvez ici tous les talents que vous avez ajoutés à vos favoris.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/hr/talent-market")}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 hover:shadow-sm"
            >
              <Search className="w-4 h-4" />
              Explorer
            </button>
          </div>
        </div>
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un talent..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {error && renderError()}
        {loading ? (
          renderLoading()
        ) : filteredFavorites.length === 0 ? (
          renderEmptyState()
        ) : (
          renderFavorites()
        )}
      </div>
    </div>
  );
}
