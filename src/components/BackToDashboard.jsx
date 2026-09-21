// src/components/BackToDashboard.jsx
// Barre de navigation flottante affichée sur toutes les pages connectées :
//   - flèche "Retour" (page précédente de l'historique)
//   - bouton "Accueil" vers le tableau de bord de la session (candidat ou entreprise)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Home, Settings } from "lucide-react";
import NotificationsButton from "./NotificationsButton";

// Pages publiques ou déjà « à la maison » : rien à afficher
const HIDDEN_ROUTES = [
  /^\/$/,
  /^\/about/,
  /^\/login/,
  /^\/select_account_type/,
  /^\/register_/,
  /^\/verify_email/,
  /^\/reset_password/,
  /^\/(user_dashboard|content_user_dashboard|company_dashboard|home_company)\/?$/,
  // Écrans plein écran où quitter par mégarde serait pénalisant (visio, test en cours)
  /^\/messaging\/video_room\//,
  /^\/visio-training/,
  /^\/technical-test\//,
  /^\/api\/technical-test\//,
];

const PUBLIC_ROUTES = [/^\/$/, /^\/about/, /^\/login/, /^\/select_account_type/, /^\/register_/, /^\/verify_email/, /^\/reset_password/];

const matches = (list, path) => list.some((re) => re.test(path));

const dashboardFor = (accountType) => (accountType === "company" ? "/company_dashboard" : "/user_dashboard");

export default function BackToDashboard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [accountType, setAccountType] = useState(null);

  // Détermine le type de compte depuis la session serveur (une seule fois par connexion)
  useEffect(() => {
    if (matches(PUBLIC_ROUTES, pathname)) {
      setAccountType(null); // déconnexion / page publique : on oublie la session précédente
      return;
    }
    if (accountType) return;

    let cancelled = false;
    fetch("/api/auth/profile_info", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.success) {
          setAccountType(data.profile?.account_type || "individual");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname, accountType]);

  if (!accountType || matches(HIDDEN_ROUTES, pathname)) return null;

  const goBack = () => {
    // idx > 0 : il existe une page précédente dans l'application ; sinon on va au tableau de bord
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate(dashboardFor(accountType), { replace: true });
    }
  };

  const buttonClass =
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium text-gray-700 " +
    "hover:bg-purple-50 hover:text-purple-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500";

  return (
    // Barre dans le flux de la page (elle pousse le contenu vers le bas au lieu de le recouvrir).
    // Collante sous les en-têtes propres aux pages (z-30 < z-40) pour rester accessible au défilement.
    <nav aria-label="Navigation rapide" className="sticky top-0 z-30 flex items-center gap-1 bg-white border-b border-gray-200 px-3 py-1.5">
      <button type="button" onClick={goBack} title="Page précédente" aria-label="Retour" className={buttonClass}>
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Retour</span>
      </button>
      <span className="w-px h-5 bg-gray-200" aria-hidden="true" />
      <button
        type="button"
        onClick={() => navigate(dashboardFor(accountType))}
        title="Revenir à mon tableau de bord"
        aria-label="Tableau de bord"
        className={buttonClass}
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Tableau de bord</span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton
          renderTrigger={({ onClick, unread }) => (
            <button type="button" onClick={onClick} title="Notifications" aria-label="Notifications" className={`${buttonClass} relative`}>
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[10px] font-bold leading-4 text-center rounded-full">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          )}
        />
        <button type="button" onClick={() => navigate("/settings")} title="Paramètres" aria-label="Paramètres" className={buttonClass}>
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
