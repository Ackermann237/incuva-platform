// src/pages/HR/ProfilDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  UserCheck,
} from "lucide-react";
import { initiateChat, addFavorite, removeFavorite } from "../../services/hr";

// IMPORTS DES NOUVEAUX COMPOSANTS MODULAIRES
import HeaderProfil from "../HR/ProfilDetail/composants/HeaderProfil.jsx";
import CvPreviewModal from "../HR/ProfilDetail/composants/CvPreviewModal";
import SectionBio from "../HR/ProfilDetail/composants/SectionBio";
import SectionCompetences from "../HR/ProfilDetail/composants/SectionCompetences";
import SectionExperience from "../HR/ProfilDetail/composants/SectionExperience";
import SectionFormation from "../HR/ProfilDetail/composants/SectionFormation";
import SectionPortfolio from "../HR/ProfilDetail/composants/SectionPortfolio";
import SectionCV from "../HR/ProfilDetail/composants/SectionCV";
import SidebarContact from "../HR/ProfilDetail/composants/SidebarContact";
import SidebarLanguages from "../HR/ProfilDetail/composants/SidebarLanguages";


export default function ProfilDetail() {
  const { talentId } = useParams();
  const navigate = useNavigate();

  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);

  useEffect(() => {
    const fetchTalentDetail = async () => {
      try {
        // L'API est supposée renvoyer toutes les données (talent, isFavorite, userUid)
        const res = await fetch(`/api/hr/talent_detail/${talentId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setTalent(data.talent);
          setIsFavorite(data.talent.isFavorite);
        } else {
          setError(data.error || "Impossible de charger le profil");
        }
      } catch (err) {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    fetchTalentDetail();
  }, [talentId]);

  const toggleFavorite = async () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    const res = newFavoriteState
      ? await addFavorite(talentId)
      : await removeFavorite(talentId);

    if (!res.success) {
      setIsFavorite(!newFavoriteState);
    }
  };

  const handleInitiateChat = async () => {
    if (talent && talent.userUid) {
        const res = await initiateChat(talentId, talent.userUid);
        if (res.success && res.chat_id) {
            navigate(`/messaging/conversation/${res.chat_id}`);
        }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-20">
          <UserCheck className="w-20 h-20 mx-auto text-indigo-300 mb-4" />
          <p className="text-xl text-gray-600 font-semibold">{error || "Profil non trouvé"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 text-indigo-600 hover:underline"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const hasProfileImage = !!talent.profileImageUrl;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 mb-8 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au marché des talents
        </button>

        {/* HEADER DU PROFIL */}
        <HeaderProfil
            talent={talent}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            handleInitiateChat={handleInitiateChat}
            hasProfileImage={hasProfileImage}
        />

        {/* Grille principale */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Colonne principale (Contenu) */}
          <div className="lg:col-span-2 space-y-10">

            <SectionBio bio={talent.bio} />

            <SectionCompetences skills={talent.skills} />

            <SectionExperience experience={talent.experience} />

            <SectionFormation education={talent.education} />

            <SectionPortfolio portfolio={talent.portfolio} />

            <SectionCV
                cvUrl={talent.cvUrl}
                cvName={talent.cvName}
                setShowCvModal={setShowCvModal} // Passer le setter d'état
            />
          </div>

          {/* Colonne latérale */}
          <div className="space-y-10">

            <SidebarContact talent={talent} />

            <SidebarLanguages languages={talent.languages} />

          </div>
        </div>
      </div>

      {/* MODALE DE PRÉVISUALISATION DU CV */}
      {showCvModal && (
        <CvPreviewModal
          cvUrl={talent.cvUrl}
          cvName={talent.cvName}
          onClose={() => setShowCvModal(false)}
        />
      )}
    </div>
  );
}