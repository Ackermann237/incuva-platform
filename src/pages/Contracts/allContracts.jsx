// src/pages/contracts/allContracts.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  TrendingUp,
  FileText,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft
} from "lucide-react";
import contractsService from "../../services/contracts";

// Composant pour le badge de statut (réutilisé)
const StatusBadge = ({ status }) => {
  const styles = {
    accepted: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-blue-50 text-blue-600 border-blue-100",
    rejected: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const icons = {
    accepted: <CheckCircle className="w-4 h-4" />,
    pending: <Clock className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };
  const labels = {
    accepted: "Accepté",
    pending: "En attente",
    rejected: "Refusé",
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${styles[status] || styles.pending}`}>
      {icons[status] || icons.pending}
      {labels[status] || "Inconnu"}
    </span>
  );
};

export default function AllContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
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

  // Types de contrats uniques
  const contractTypes = [...new Set(contracts.map(contract => contract.contract_type))];

  // Formatage de la date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Formatage du salaire
  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    return `${salary.toLocaleString()} €`;
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* En-tête avec retour */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tous les contrats</h1>
            <p className="text-gray-600 mt-1">Liste complète de vos contrats d'embauche</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher un contrat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal size={16} />
            Filtres
          </button>
        </div>
      </div>

      {/* Filtres (dépliables) */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="accepted">Acceptés</option>
                <option value="pending">En attente</option>
                <option value="rejected">Refusés</option>
              </select>
            </div>

            {/* Filtre par type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                {contractTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des contrats */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg">Chargement des contrats...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-block p-6 bg-gray-50 rounded-3xl mb-6">
              <FileCheck className="w-20 h-20 text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">Aucun contrat trouvé</p>
            <p className="text-gray-500 mb-6">Aucun contrat ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Candidat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Poste</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Salaire</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredContracts.map((contract, index) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors duration-200"
                  >
                    {/* Candidat */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {contract.candidate_name?.charAt(0) || "?"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{contract.candidate_name || "Inconnu"}</p>
                          <p className="text-xs text-gray-500">Candidat</p>
                        </div>
                      </div>
                    </td>

                    {/* Poste */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="font-semibold text-gray-900">{contract.position || "N/A"}</p>
                      </div>
                    </td>

                    {/* Salaire */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <p className="font-bold text-gray-900">
                          {formatSalary(contract.salary)}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl text-xs font-bold shadow-sm">
                        {contract.contract_type || "N/A"}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-5">
                      <StatusBadge status={contract.status} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-medium">
                          {formatDate(contract.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <button
                        onClick={() => navigate(`/contracts/view/${contract.id}`)}
                        className="p-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 group/btn hover:shadow-lg"
                        title="Voir le contrat"
                      >
                        <Eye className="w-5 h-5 text-gray-600 group-hover/btn:text-white transition-colors duration-300" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}