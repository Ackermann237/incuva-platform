// src/pages/HR/TalentMarket.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Briefcase,
  Sparkles,
  FileText,
  UserCheck,
  Loader2,
  MessageSquare,
  User // Icône User importée
} from "lucide-react";
import { FaComments } from "react-icons/fa";
import { getTalentMarket, initiateChat, addFavorite, removeFavorite } from "../../services/hr";

export default function TalentMarket() {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  // Utilisation de useCallback pour la fonction de chargement
  const loadTalents = useCallback(async () => {
    setLoading(true);
    // Timeout pour éviter de surcharger l'API pendant la frappe
    const delayDebounceFn = setTimeout(async () => {
      const res = await getTalentMarket(search);
      if (res.success) {
        setTalents(res.talents || []);
        setFavorites(res.favorite_ids || []);
      }
      setLoading(false);
    }, 500); // Délais de 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [search]); // Dépend de la valeur de recherche

  useEffect(() => {
    loadTalents();
  }, [loadTalents]);

  const toggleFavorite = async (talentId) => {
    const isFavorite = favorites.includes(talentId);

    // Optimistic update
    setFavorites(prev =>
        isFavorite ? prev.filter(id => id !== talentId) : [...prev, talentId]
    );

    const res = isFavorite
      ? await removeFavorite(talentId)
      : await addFavorite(talentId);

    if (!res.success) {
        // Revert if API call fails
        setFavorites(prev =>
            !isFavorite ? prev.filter(id => id !== talentId) : [...prev, talentId]
        );
        // Vous pouvez ajouter ici une gestion d'erreur utilisateur (toast, alerte, etc.)
    }
  };

  const handleInitiateChat = async (talentId, userUid) => {
    const res = await initiateChat(talentId, userUid);
    if (res.success && res.chat_id) {
      navigate(`/messaging/conversation/${res.chat_id}`);
    }
  };

  return (
    // FOND BLANC appliqué ici
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Marché des Talents</h1>
              <p className="text-gray-600 mt-1">Découvrez les meilleurs candidats actifs sur INCUVA</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/ai-talent-recommendation")}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition font-medium transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            Recommandations IA
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="bg-gray-50 rounded-2xl shadow-inner p-4 mb-8 border border-gray-200">
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-blue-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, compétence, ville..."
              className="flex-1 text-lg outline-none bg-gray-50"
            />
          </div>
        </div>

        {/* Grille des talents */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Recherche de talents...</p>
          </div>
        ) : talents.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <UserCheck className="w-20 h-20 mx-auto text-blue-300 mb-4" />
            <p className="text-xl text-gray-600 font-semibold">Aucun candidat trouvé</p>
            <p className="text-gray-500 mt-2">Essayez d'élargir votre recherche ou utilisez la recommandation IA.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {talents.map((talent) => {
              const isFavorite = favorites.includes(talent.id);

              return (
                <div
                  key={talent.id}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {/* Avatar avec icône User par défaut */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-blue-200 shadow-md overflow-hidden bg-blue-50 flex items-center justify-center">
                          {talent.profileImageUrl ? (
                            <img
                              src={talent.profileImageUrl}
                              alt={talent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-blue-400" />
                          )}
                        </div>
                        <button
                          onClick={() => toggleFavorite(talent.id)}
                          className="absolute -top-1 -right-1 p-2 bg-white rounded-full shadow-lg ring-2 ring-gray-100 hover:ring-pink-300 transition-all"
                        >
                          <Heart
                            className={`w-5 h-5 transition-all duration-300 ${
                              isFavorite
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-xl text-gray-900">{talent.name}</h3>
                    <p className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                      {talent.userRole === 'job_seeker' ? 'Chercheur d\'emploi' : 'Particulier'}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-gray-600 border-t pt-4">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {talent.location}
                      </p>
                      {talent.rating && (
                         <p className="flex items-center gap-2">
                           <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                           <span className="font-semibold">{talent.rating}/5</span> ({talent.reviewCount || 0} avis)
                         </p>
                      )}
                    </div>

                    {/* Compétences (Badges) */}
                    {talent.skills?.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                        {talent.skills.slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {talent.skills.length > 4 && (
                           <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                            +{talent.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="p-6 pt-0 flex gap-4">
                    {/* Bouton Voir Profil (nouvel ajout pour UX) */}
                     <button
                      onClick={() => navigate(`/hr/talent/${talent.id}`)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"
                    >
                      <UserCheck className="w-5 h-5" />
                      Voir Profil
                    </button>

                    {/* Bouton Contacter */}
                    <button
                      onClick={() => handleInitiateChat(talent.id, talent.userUid)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Contacter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}