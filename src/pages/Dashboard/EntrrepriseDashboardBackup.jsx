// src/pages/Dashboard/EntrepriseDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDashboard, getDataAnalysis } from "../../services/dashboard";
import { getRecruitmentManagement } from "../../services/hr";
import RecruitmentManagement from "../../pages/HR/RecruitmentManagement";
import DataAnalysis from "../../pages/HR/DataAnalysis";
import Contracts from "../../pages/Contracts/Contracts";
import Employees from "../../pages/Employees/Employees";
import Planning from "../Employees/Planning/Planning.jsx";
import Absence from "../Employees/Absence/Absence.jsx";
import Payroll from "../Employees/Payroll/Payroll.jsx"; // IMPORT AJOUTÉ
import {
  Layers, BarChart2, Users, Briefcase, FileCheck, TrendingUp,
  Calendar, Award, Target, Building2, MapPin, DollarSign,
  Clock, CheckCircle, AlertCircle, Search, Filter, ChevronRight,
  Sparkles, Activity, UserCheck, Eye, MessageSquare, Menu, X,
  Home, Settings, LogOut, Bell, ChevronLeft, UserCircle, ClipboardCheck,
  ChevronsLeft, ChevronsRight, CalendarDays, Clock3
} from "lucide-react";

export default function EntrepriseDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recruitmentData, setRecruitmentData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Détection mobile et resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarCollapsed(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Chargement initial du dashboard et des données d'activité récente
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getUserDashboard();
        if (res.success) {
          setData(res.data);
          // Récupérer les données d'analyse pour l'activité récente
          const analysisRes = await getDataAnalysis();
          if (analysisRes.success) {
            const transformedActivity = transformActivityData(analysisRes);
            setRecentActivity(transformedActivity);
          }
        } else {
          setError(res.error || "Erreur lors du chargement.");
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Chargement des données de recrutement
  useEffect(() => {
    if (activeTab === "recruitment" && !recruitmentData) {
      async function loadRecruitment() {
        setLoading(true);
        const res = await getRecruitmentManagement();
        if (res.success) {
          setRecruitmentData(res);
        } else {
          setError(res.error || "Erreur lors du chargement des données de recrutement.");
        }
        setLoading(false);
      }
      loadRecruitment();
    }
  }, [activeTab, recruitmentData]);

  // Chargement des données d'analyse
  useEffect(() => {
    if (activeTab === "analytics" && !analysisData) {
      async function loadAnalysis() {
        setLoading(true);
        const res = await getDataAnalysis(timeRange);
        if (res.success) {
          setAnalysisData(res);
        } else {
          setError(res.error || "Erreur lors du chargement des analyses.");
        }
        setLoading(false);
      }
      loadAnalysis();
    }
  }, [activeTab, analysisData, timeRange]);

  // Recharger les données quand timeRange change
  useEffect(() => {
    if (activeTab === "analytics" && analysisData) {
      async function reloadAnalysis() {
        setLoading(true);
        const res = await getDataAnalysis(timeRange);
        if (res.success) {
          setAnalysisData(res);
        } else {
          setError(res.error || "Erreur lors du rechargement des analyses.");
        }
        setLoading(false);
      }
      reloadAnalysis();
    }
  }, [timeRange, activeTab]);

  // Fonction pour transformer les données d'activité
  function transformActivityData(analysisData) {
    const { applications, interviews, contracts } = analysisData;
    const activity = [];

    // Ajouter la dernière candidature
    if (applications && applications.length > 0) {
      const latestApplication = applications.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))[0];
      activity.push({
        id: latestApplication.application_id,
        type: "application",
        title: "Nouvelle candidature reçue",
        candidate: latestApplication.candidate_name,
        time: formatTime(latestApplication.applied_at),
        icon: <UserCheck className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50"
      });
    }

    // Ajouter le dernier entretien
    if (interviews && interviews.length > 0) {
      const latestInterview = interviews.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
      activity.push({
        id: latestInterview.interview_id,
        type: "interview",
        title: "Entretien programmé",
        candidate: latestInterview.candidate_name,
        time: formatTime(latestInterview.datetime),
        icon: <Calendar className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50"
      });
    }

    // Ajouter le dernier contrat
    if (contracts && contracts.length > 0) {
      const latestContract = contracts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      activity.push({
        id: latestContract.contract_id,
        type: "contract",
        title: "Contrat signé",
        candidate: latestContract.candidate_name,
        time: formatTime(latestContract.created_at),
        icon: <CheckCircle className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50"
      });
    }

    return activity;
  }

  // Fonction pour formater le temps
  function formatTime(dateString) {
    if (!dateString) return "Il y a quelques instants";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 24) {
      return `Il y a ${diffInHours} ${diffInHours === 1 ? "heure" : "heures"}`;
    } else if (diffInHours < 48) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl flex items-center gap-4 max-w-md shadow-xl opacity-0 animate-fade-in">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="text-gray-600 font-medium text-lg">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  const company = data.user;
  const stats = {
    applications: data.metrics?.applications || 0,
    favorites: data.favorite_count || 0,
    interviews: data.interviews?.length || 0,
    contracts: data.agreements?.length || 0
  };

  // Mise à jour des éléments de navigation pour inclure Payroll
  const navigationItems = [
    { id: "overview", label: "Vue d'ensemble", icon: Home, path: null },
    { id: "recruitment", label: "Recrutement", icon: Users, path: null },
    { id: "employees", label: "Employés", icon: UserCircle, path: null },
    {
      id: "planning",
      label: "Planning",
      icon: CalendarDays,
      path: null,
      badge: null
    },
    {
      id: "absences",
      label: "Absences",
      icon: Clock3,
      path: null,
      badge: null
    },
    // NOUVEL ONGLET AJOUTÉ
    {
      id: "payroll",
      label: "Paie",
      icon: DollarSign,
      path: null,
      badge: null
    },
    { id: "messaging", label: "Messagerie", icon: MessageSquare, path: "/messaging/inbox", badge: 5 },
    { id: "jobs", label: "Offres d'emploi", icon: Briefcase, path: "/jobs" },
    { id: "technical-tests", label: "Tests Techniques", icon: ClipboardCheck, path: "/technical-tests" },
    { id: "contracts", label: "Contrats", icon: FileCheck, path: null },
    { id: "analytics", label: "Analytique", icon: TrendingUp, path: null }
  ];

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
    }
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarWidth = isSidebarCollapsed ? "lg:w-20" : "lg:w-64";
  const isSidebarExpanded = !isSidebarCollapsed;

  return (
    <div className="flex min-h-screen bg-white">
      {/* ==================== SIDEBAR MODERNE ==================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          ${sidebarWidth}
        `}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header avec bouton de collapse */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {isSidebarExpanded ? (
              <div className="flex items-center gap-3 animate-fade-in w-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-gray-900 text-lg truncate">{company.companyName}</h2>
                  <p className="text-xs text-gray-500 truncate">{company.city} • {company.industry}</p>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
            )}

            {/* Bouton de collapse */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110 absolute -right-3 top-6 bg-white border border-gray-200 shadow-md ${
                  isSidebarExpanded ? '' : 'rotate-180'
                }`}
              >
                <ChevronsLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path ? false : activeTab === item.id;
                const showLabel = !isSidebarCollapsed;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center ${showLabel ? 'justify-start' : 'justify-center'} gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    title={!showLabel ? item.label : ""}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                      {!showLabel && item.badge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>

                    {showLabel && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-white text-blue-600'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {showLabel && isActive && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="my-6 border-t border-gray-200"></div>

            {/* Secondary Actions */}
            <div className="space-y-2">
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-3' : 'justify-center px-0'} py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group relative overflow-hidden`}
                title="Paramètres"
              >
                <div className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 flex items-center justify-center`}>
                  <Settings className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} group-hover:rotate-90 transition-transform duration-300`} />
                </div>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium ml-3 whitespace-nowrap">
                    Paramètres
                  </span>
                )}
              </button>

              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-3' : 'justify-center px-0'} py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all group relative overflow-hidden`}
                title="Notifications"
              >
                <div className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 flex items-center justify-center relative`}>
                  <Bell className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} group-hover:scale-110 transition-transform`} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </div>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium ml-3 whitespace-nowrap">
                    Notifications
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-100">
              <button
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-3' : 'justify-center px-0'} py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all group overflow-hidden`}
                title="Déconnexion"
              >
                <div className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 flex items-center justify-center`}>
                  <LogOut className={`${isSidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'} group-hover:translate-x-1 transition-transform`} />
                </div>
                {!isSidebarCollapsed  && (
                  <span className="text-sm font-medium ml-3 whitespace-nowrap">
                    Déconnexion
                  </span>
                )}
              </button>
            </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        ></div>
      )}

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 overflow-x-hidden transition-all duration-300 ease-in-out">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Title & Mobile Menu Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {!isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
                    title={isSidebarCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
                  >
                    {isSidebarCollapsed ? (
                      <ChevronsRight className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronsLeft className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                )}

                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Tableau de bord'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gérez votre activité RH en temps réel
                  </p>
                </div>
              </div>

              {/* Time Range Selector & AI Button */}
              <div className="flex items-center gap-3">
                {/* Sélecteur de période seulement pour l'analytique */}
                {activeTab === "analytics" && (
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-medium hover:border-gray-300 transition-all"
                  >
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="quarter">Ce trimestre</option>
                    <option value="year">Cette année</option>
                  </select>
                )}

                {/* Bouton IA seulement pour le planning, les absences et la paie */}
                {(activeTab === "planning" || activeTab === "absences" || activeTab === "payroll") && (
                  <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {activeTab === "planning" ? "Optimiser IA" :
                       activeTab === "absences" ? "Analyser IA" :
                       "Assistant Paie IA"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 md:p-6">
          {/* Vue d'ensemble */}
          {activeTab === "overview" && (
            <div className="transition-all duration-300 animate-fade-in">
              <OverviewContent
                company={company}
                stats={stats}
                recentActivity={recentActivity}
                data={data}
                navigate={navigate}
                setActiveTab={setActiveTab} // AJOUTÉ POUR LA NAVIGATION
              />
            </div>
          )}

          {/* Recrutement */}
          {activeTab === "recruitment" && (
            <div className="transition-all duration-300 animate-fade-in">
              <RecruitmentManagement data={recruitmentData} loading={loading} />
            </div>
          )}

          {/* Employés */}
          {activeTab === "employees" && (
            <div className="transition-all duration-300 animate-fade-in">
              <Employees />
            </div>
          )}

          {/* Planning */}
          {activeTab === "planning" && (
            <div className="transition-all duration-300 animate-fade-in">
              <Planning />
            </div>
          )}

          {/* Absences */}
          {activeTab === "absences" && (
            <div className="transition-all duration-300 animate-fade-in">
              <Absence />
            </div>
          )}

          {/* Paie - NOUVELLE SECTION */}
          {activeTab === "payroll" && (
            <div className="transition-all duration-300 animate-fade-in">
              <Payroll />
            </div>
          )}

          {/* Contrats */}
          {activeTab === "contracts" && (
            <div className="transition-all duration-300 animate-fade-in">
              <Contracts />
            </div>
          )}

          {/* Analytique */}
          {activeTab === "analytics" && (
            <div className="transition-all duration-300 animate-fade-in">
              <DataAnalysis data={analysisData} loading={loading} timeRange={timeRange} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Composant séparé pour la vue d'ensemble
function OverviewContent({ company, stats, recentActivity, data, navigate, setActiveTab }) {
  return (
    <div className="space-y-6">
      {/* COMPANY INFO BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="relative z-10 grid md:grid-cols-3 gap-6">
          {[
            { icon: <Users className="w-8 h-8" />, label: "Taille entreprise", value: company.companySize },
            { icon: <Target className="w-8 h-8" />, label: "Secteur d'activité", value: company.industry },
            { icon: <Award className="w-8 h-8" />, label: "Note entreprise", value: "4.8/5" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 hover:scale-102 transition-transform">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105">
                {item.icon}
              </div>
              <div>
                <p className="text-white/80 text-sm">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid md:grid-cols-4 gap-6 animate-fade-in animation-delay-200">
        {[
          {
            title: "Candidatures",
            value: stats.applications,
            change: "+12%",
            icon: <BarChart2 className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50"
          },
          {
            title: "Talents favoris",
            value: stats.favorites,
            change: "+8%",
            icon: <Users className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50"
          },
          {
            title: "Entretiens",
            value: stats.interviews,
            change: "+15%",
            icon: <Calendar className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50"
          },
          {
            title: "Contrats signés",
            value: stats.contracts,
            change: "+5%",
            icon: <FileCheck className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50"
          }
        ].map((metric, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200 group ${metric.bgColor} hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {metric.icon}
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {metric.change}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.title}</h3>
            <p className="text-4xl font-bold text-gray-900 transition-all">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-in animation-delay-400">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Activité récente
              </h3>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-all hover:translate-x-1">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.candidate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 transition-all hover:shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              {[
                {
                  label: "Publier une offre",
                  icon: <Briefcase className="w-5 h-5" />,
                  color: "from-blue-500 to-blue-600",
                  onClick: () => navigate("/jobs/create")
                },
                {
                  label: "Rechercher talents",
                  icon: <Search className="w-5 h-5" />,
                  color: "from-blue-500 to-blue-600",
                  onClick: () => navigate("/hr/talent-market")
                },
                {
                  label: "Gérer le planning",
                  icon: <CalendarDays className="w-5 h-5" />,
                  color: "from-blue-500 to-blue-600",
                  onClick: () => setActiveTab("planning")
                },
                // NOUVELLE ACTION AJOUTÉE
                {
                  label: "Gérer la paie",
                  icon: <DollarSign className="w-5 h-5" />,
                  color: "from-blue-500 to-blue-600",
                  onClick: () => setActiveTab("payroll")
                },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`w-full p-4 bg-gradient-to-r ${action.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transition-all hover:shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Score Performance RH</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-bold">87</span>
              <span className="text-2xl mb-2">/100</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
              <div className="bg-white rounded-full h-3 w-[87%] transition-all duration-1000"></div>
            </div>
            <p className="text-white/80 text-sm">
              Excellent ! Vous êtes dans le top 15% des entreprises
            </p>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:rotate-6">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Conseil IA du jour</h4>
                <p className="text-sm text-gray-700">
                  Utilisez l'optimisation IA du planning pour réduire de 25% vos coûts de main d'œuvre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}