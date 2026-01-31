// src/pages/contracts/Contracts.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  TrendingUp,
  FileText,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  Mail,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  BarChart3,
  Sparkles,
  MoreVertical,
  FileSignature,
  ShieldCheck,
  Clock3
} from "lucide-react";
import contractsService from "../../services/contracts";

// Composant pour les cartes de statistiques améliorées
const StatCard = ({ title, value, icon, color, bgColor, trend, onClick }) => {
  const Icon = icon;
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br ${bgColor} p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden backdrop-blur-sm`}
    >
      {/* Effet de fond décoratif */}
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-white"></div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${color} uppercase tracking-wider`}>{title}</p>
          <p className="text-3xl font-bold text-white drop-shadow-lg">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <ArrowRight className={`w-4 h-4 ${trend > 0 ? 'text-green-300' : 'text-red-300'}`} />
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
      </div>

      {/* Barre de progression subtile */}
      <div className="relative z-10 mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${Math.min(value * 10, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// Composant pour le badge de statut amélioré
const StatusBadge = ({ status }) => {
  const styles = {
    accepted: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    pending: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    rejected: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
  };
  const icons = {
    accepted: <CheckCircle className="w-4 h-4" />,
    pending: <Clock3 className="w-4 h-4 animate-pulse" />,
    rejected: <XCircle className="w-4 h-4" />,
  };
  const labels = {
    accepted: "Accepté",
    pending: "En attente",
    rejected: "Refusé",
  };

  return (
    <div className="relative group">
      <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg ${styles[status] || styles.pending} hover:shadow-xl transition-all duration-300 cursor-pointer`}>
        {icons[status] || icons.pending}
        {labels[status] || "Inconnu"}
      </span>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Cliquez pour filtrer
      </div>
    </div>
  );
};

// Composant pour la carte de contrat
const ContractCard = ({ contract, index }) => {
  const navigate = useNavigate();

  const statusColors = {
    accepted: "border-l-blue-500 hover:border-l-blue-600",
    pending: "border-l-blue-400 hover:border-l-blue-500",
    rejected: "border-l-gray-500 hover:border-l-gray-600",
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    return `${salary.toLocaleString()} €`;
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-l-4 ${statusColors[contract.status] || statusColors.pending} border-t border-r border-b border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer animate-fadeIn`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => navigate(`/contracts/view/${contract.id}`)}
    >
      <div className="p-6">
        {/* En-tête de la carte */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {contract.candidate_name?.charAt(0) || "?"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                {contract.candidate_name || "Inconnu"}
              </h3>
              <p className="text-sm text-gray-500">Candidat</p>
            </div>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        {/* Informations du contrat */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Poste</p>
                <p className="font-semibold text-gray-900">{contract.position || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Salaire</p>
                <p className="font-bold text-gray-900">{formatSalary(contract.salary)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileSignature className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold text-gray-900">{contract.contract_type || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(contract.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Eye className="w-5 h-5 text-gray-600" />
            </div>
            <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <Download className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Voir détails</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // "cards" ou "table"

  // Filtres
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
  });

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await contractsService.getCompanyContracts();
        if (res.success) {
          setContracts(res.contracts);
        } else {
          setError(res.error || "Impossible de charger les contrats");
        }
      } catch (err) {
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  // Filtrer les contrats
  const filteredContracts = contracts.filter(contract => {
    // Filtre par recherche
    if (searchTerm && !(
      contract.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }

    // Filtre par statut
    if (filters.status !== "all" && contract.status !== filters.status) {
      return false;
    }

    // Filtre par type
    if (filters.type !== "all" && contract.contract_type !== filters.type) {
      return false;
    }

    return true;
  });

  // Statistiques
  const stats = {
    total: contracts.length,
    accepted: contracts.filter(c => c.status === "accepted").length,
    pending: contracts.filter(c => c.status === "pending").length,
    rejected: contracts.filter(c => c.status === "rejected").length,
  };

  // Types de contrats uniques
  const contractTypes = [...new Set(contracts.map(contract => contract.contract_type))];

  // Limiter à 6 contrats pour la vue initiale
  const displayedContracts = filteredContracts.slice(0, 6);
  const hasMoreContracts = filteredContracts.length > 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 md:p-8 space-y-8">
      {/* En-tête avec effet glassmorphism */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Effets décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestion des Contrats</h1>
                  <p className="text-blue-100 mt-2 text-lg">Suivez et gérez tous vos contrats d'embauche en temps réel</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-semibold">{stats.total} contrats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">{stats.accepted} signés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="w-5 h-5" />
                  <span className="font-semibold">{stats.pending} en attente</span>
                </div>
              </div>
            </div>
            {/* Bouton ou élément à insérer ici*/}
            <div className="flex flex-col sm:flex-row gap-4">

            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un contrat, un candidat ou un poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3.5 rounded-xl font-medium flex items-center gap-2 transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>

            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "cards" ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "table" ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
              >
                Tableau
              </button>
            </div>
          </div>
        </div>

        {/* Filtres détaillés */}
        {showFilters && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-100 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="accepted">Acceptés</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Refusés</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de contrat</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  {contractTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Période</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toute période</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: "all", type: "all", dateRange: "all" });
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contrats"
          value={stats.total}
          icon={FileCheck}
          color="text-blue-300"
          bgColor="from-blue-600 to-blue-700"
          trend={12}
          onClick={() => setFilters({ ...filters, status: "all" })}
        />
        <StatCard
          title="Acceptés"
          value={stats.accepted}
          icon={CheckCircle}
          color="text-blue-300"
          bgColor="from-blue-600 to-blue-700"
          trend={8}
          onClick={() => setFilters({ ...filters, status: "accepted" })}
        />
        <StatCard
          title="En Attente"
          value={stats.pending}
          icon={Clock}
          color="text-blue-300"
          bgColor="from-blue-500 to-blue-600"
          trend={-3}
          onClick={() => setFilters({ ...filters, status: "pending" })}
        />
        <StatCard
          title="Refusés"
          value={stats.rejected}
          icon={XCircle}
          color="text-gray-300"
          bgColor="from-gray-600 to-gray-700"
          trend={2}
          onClick={() => setFilters({ ...filters, status: "rejected" })}
        />
      </div>

      {/* Section principale des contrats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Contrats récents <span className="text-blue-600">({filteredContracts.length})</span>
          </h2>
          <div className="text-sm text-gray-500">
            {searchTerm && `Résultats pour "${searchTerm}"`}
          </div>
        </div>

        {/* Vue cartes */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedContracts.map((contract, index) => (
              <ContractCard key={contract.id} contract={contract} index={index} />
            ))}
          </div>
        ) : (
          /* Vue tableau */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Candidat</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Poste</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Salaire</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedContracts.map((contract, index) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-blue-50/50 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {contract.candidate_name?.charAt(0) || "?"}
                          </div>
                          <span className="font-semibold">{contract.candidate_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-medium">{contract.position}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                          {contract.contract_type}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-900">
                        {contract.salary?.toLocaleString()} €
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bouton Voir plus */}
        {hasMoreContracts && (
          <div className="text-center pt-8">
            <button
              onClick={() => navigate("/contracts/all")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-3 group"
            >
              <span>Voir tous les contrats ({filteredContracts.length})</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* État vide */}
        {!loading && filteredContracts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl mb-6">
              <FileCheck className="w-24 h-24 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun contrat trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchTerm ? "Aucun résultat pour votre recherche." : "Consultez les talents et créer leurs un contrat."}
            </p>
            <button
              onClick={() => navigate("/hr/talent-market")}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Voir le marché des talents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}