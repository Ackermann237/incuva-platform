// src/layouts/UserLayout.jsx
import React, {useState, Suspense, lazy, useEffect} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layers, Briefcase, FileText, MessageSquare, ChevronLeft, ChevronRight, Users, FileUp } from "lucide-react";

// Lazy loading des vraies pages
const UserDashboard = lazy(() => import("../pages/Dashboard/UserDashboard"));
const OffersAvailable = lazy(() => import("../pages/Offers/OffersAvailable"));
const MyApplications = lazy(() => import("../pages/Offers/MyApplications/MyApplications.jsx"));
const NewService = lazy(() => import("../pages/Jobs/users/NewService"));
const UserProfil = lazy(() => import("../pages/Profil/UserProfil"));

const navItems = [
  { id: "dashboard", name: "Tableau de bord", icon: Layers, component: UserDashboard },
  { id: "offers", name: "Offres d'emploi", icon: Briefcase, component: OffersAvailable },
  { id: "applications", name: "Mes candidatures", icon: FileText, component: MyApplications },
  { id: "talents", name: "Ajouter un service", icon: FileUp, component: NewService }, // NOUVEAU
  { id: "profile", name: "Mon profil", icon: Users, component: UserProfil },     // NOUVEAU
  { id: "messaging", name: "Messagerie", icon: MessageSquare, path: "/messaging/inbox" },
];

export default function UserLayout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  // Détecter si on est sur une route externe (ex: /jobs/apply/123)
  const isExternalRoute = !navItems.some(item => item.id && location.pathname.includes(item.id));

  // Trouver le titre actif
  const activeItem = navItems.find(item => item.id === activeTab) || navItems[0];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
    }
  };

  // Composant de chargement élégant
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
      {/* Sidebar fixe */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-lg transition-all duration-300 ${isExpanded ? "w-64" : "w-20"}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
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
                className="p-2 rounded-full hover:bg-purple-100 transition-colors"
              >
                {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id || item.path}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-purple-100 text-purple-700 shadow-sm font-semibold"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  } ${!isExpanded ? "justify-center" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && <span>{item.name}</span>}
                  {isActive && isExpanded && <div className="ml-auto w-1 h-8 bg-purple-600 rounded-full"></div>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className={`flex-1 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"}`}>
        {/* Header fixe */}
        {!isExternalRoute && (
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
            <div className="px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                      <ActiveIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{activeItem.name}</h1>
                    <p className="text-sm text-gray-500">Espace candidat • {new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-700">En ligne</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Contenu avec lazy loading */}
        <main className="p-8">
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === "dashboard" && <UserDashboard />}
            {activeTab === "offers" && <OffersAvailable />}
            {activeTab === "applications" && <MyApplications />}
            {activeTab === "talents" && <NewService />}
            {activeTab === "profile" && <UserProfil />}
            {activeTab === "messaging" && location.pathname.includes("messaging") && <Outlet />}

            {/* Si on est sur une route externe (ex: postuler), on affiche Outlet */}
            {isExternalRoute && <Outlet />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}