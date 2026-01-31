// src/pages/Employees/Employees.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, Download, UserPlus, MoreVertical,
  CheckCircle, XCircle, Clock, TrendingUp, DollarSign,
  Building, MapPin, Phone, Mail, Calendar, Briefcase,
  BarChart3, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { getEmployees, getEmployeeStats, searchEmployees, exportEmployeesToCSV } from '../../services/employees';

export default function Employees() {
  const navigate = useNavigate();

  // États principaux
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedContractType, setSelectedContractType] = useState('all');

  // États pour le détail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filtrer les employés lorsque les critères changent
  useEffect(() => {
    filterEmployees();
  }, [searchTerm, selectedStatus, selectedPosition, selectedContractType, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      // Récupérer la liste des employés
      const employeesRes = await getEmployees();
      if (employeesRes.success) {
        setEmployees(employeesRes.employees || []);
        setFilteredEmployees(employeesRes.employees || []);
        setStats(employeesRes.stats || {});
      } else {
        setError(employeesRes.error || 'Erreur lors du chargement des employés');
      }

      // Récupérer les statistiques détaillées
      const statsRes = await getEmployeeStats();
      if (statsRes.success) {
        setStats(prev => ({ ...prev, ...statsRes.stats }));
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.candidate_name?.toLowerCase().includes(term) ||
        employee.position?.toLowerCase().includes(term) ||
        employee.email?.toLowerCase().includes(term) ||
        employee.location?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(employee => employee.status === selectedStatus);
    }

    // Filtre par position
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(employee => employee.position === selectedPosition);
    }

    // Filtre par type de contrat
    if (selectedContractType !== 'all') {
      filtered = filtered.filter(employee => employee.contract_type === selectedContractType);
    }

    setFilteredEmployees(filtered);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchCriteria = {};
      if (selectedStatus !== 'all') searchCriteria.status = selectedStatus;
      if (selectedPosition !== 'all') searchCriteria.position = selectedPosition;
      if (selectedContractType !== 'all') searchCriteria.contract_type = selectedContractType;

      const res = await searchEmployees(searchCriteria);
      if (res.success) {
        setFilteredEmployees(res.employees);
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportEmployeesToCSV(filteredEmployees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employés_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on_leave': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'on_leave': return 'En congé';
      default: return 'Inconnu';
    }
  };

  const openEmployeeDetail = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const getUniquePositions = () => {
    const positions = employees.map(e => e.position).filter(p => p);
    return ['all', ...new Set(positions)];
  };

  const getUniqueContractTypes = () => {
    const types = employees.map(e => e.contract_type).filter(t => t);
    return ['all', ...new Set(types)];
  };

  if (loading && !employees.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-10 h-10 text-blue-600" />
                Gestion des employés
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos employés et suivez vos effectifs
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              <button
                onClick={handleExportCSV}
                disabled={filteredEmployees.length === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Rechercher un employé par nom, poste, email..."
            />
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="on_leave">En congé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poste
                  </label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les postes</option>
                    {getUniquePositions().filter(p => p !== 'all').map((position, index) => (
                      <option key={index} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de contrat
                  </label>
                  <select
                    value={selectedContractType}
                    onChange={(e) => setSelectedContractType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    {getUniqueContractTypes().filter(t => t !== 'all').map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedPosition('all');
                    setSelectedContractType('all');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total employés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Employés actifs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.by_status?.active || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Salaire moyen</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.salary_stats?.average
                        ? `${Math.round(stats.salary_stats.average).toLocaleString()} €`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de rotation</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.total > 0
                        ? `${Math.round((stats.by_status?.inactive || 0) / stats.total * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des employés */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Liste des employés ({filteredEmployees.length})
              </h2>
              {loading && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              )}
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchEmployees}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
              <p className="text-gray-600">
                {employees.length === 0
                  ? "Commencez par signer des contrats avec vos candidats"
                  : "Aucun employé ne correspond aux critères de recherche"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'embauche
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {employee.profile_image_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={employee.profile_image_url}
                                alt={employee.candidate_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {employee.candidate_name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.candidate_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email || 'Email non fourni'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{employee.position}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{employee.contract_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.salary ? `${Number(employee.salary).toLocaleString()} €` : 'Non spécifié'}
                        </div>
                        <div className="text-xs text-gray-500">Brut annuel</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                          {getStatusIcon(employee.status)}
                          {getStatusLabel(employee.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {employee.hire_date
                            ? new Date(employee.hire_date).toLocaleDateString('fr-FR')
                            : 'Non spécifiée'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEmployeeDetail(employee)}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Détails
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détail */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedEmployee.profile_image_url ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={selectedEmployee.profile_image_url}
                    alt={selectedEmployee.candidate_name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {selectedEmployee.candidate_name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.candidate_name}</h3>
                  <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Informations personnelles
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedEmployee.email || 'Non fourni'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium">{selectedEmployee.phone || 'Non fourni'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Localisation</p>
                        <p className="font-medium">
                          {selectedEmployee.location
                            ? `${selectedEmployee.location}, ${selectedEmployee.country || ''}`
                            : 'Non fournie'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Informations professionnelles
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Poste</p>
                      <p className="font-medium">{selectedEmployee.position}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Salaire annuel brut</p>
                      <p className="font-medium text-lg text-green-600">
                        {selectedEmployee.salary
                          ? `${Number(selectedEmployee.salary).toLocaleString()} €`
                          : 'Non spécifié'
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Type de contrat</p>
                      <p className="font-medium">{selectedEmployee.contract_type}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedEmployee.status)}`}>
                        {getStatusIcon(selectedEmployee.status)}
                        {getStatusLabel(selectedEmployee.status)}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Date d'embauche</p>
                      <p className="font-medium">
                        {selectedEmployee.hire_date
                          ? new Date(selectedEmployee.hire_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Non spécifiée'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compétences et langues */}
              {(selectedEmployee.skills?.length > 0 || selectedEmployee.languages?.length > 0) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Compétences et langues</h4>

                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Langues parlées:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.languages?.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {typeof lang === 'string' ? lang : `${lang.language} (${lang.level})`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  // Action de modification
                  console.log('Modifier employé', selectedEmployee.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}