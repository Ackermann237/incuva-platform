// src/pages/Jobs/Entreprises/JobsListModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  CheckSquare,
  Users,
  Eye,
  ChevronRight,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';

import { getCompanyJobs } from '../../../services/technical';

export default function JobsListModal({ onClose, onSelectJob }) {
  const navigate = useNavigate();

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Charger les jobs de l'entreprise
  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, selectedType, selectedStatus, jobs]);

  const loadJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getCompanyJobs();
        if (res.success) {
          setJobs(res.data || []);
          setFilteredJobs(res.data || []);
        } else {
          setError(res.error || 'Aucune offre trouvée');
          setJobs([]);
          setFilteredJobs([]);
        }
      } catch (err) {
        console.error('Erreur chargement jobs:', err);
        setError('Impossible de charger les offres. Vérifiez votre connexion.');
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills?.some(skill =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtre par type de contrat
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.contract_type === selectedType);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    setFilteredJobs(filtered);
  };

  const handleSelectJob = (job) => {
    if (onSelectJob) {
      onSelectJob(job);
    } else {
      // Redirection par défaut vers la page de création de test
      navigate(`/jobs/${job.job_id}/technical-test`);
    }
  };

  const handleCreateNewJob = () => {
    navigate('/jobs/create');
  };

  const getContractTypeLabel = (type) => {
    const types = {
      'cdi': 'CDI',
      'cdd': 'CDD',
      'freelance': 'Freelance',
      'stage': 'Stage',
      'alternance': 'Alternance'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'active': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'closed': 'bg-gray-100 text-gray-800',
      'archived': 'bg-gray-100 text-gray-800'
    };

    const labels = {
      'active': 'Active',
      'draft': 'Brouillon',
      'closed': 'Fermée',
      'archived': 'Archivée'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sélectionner une offre d'emploi</h2>
                <p className="text-gray-600">Choisissez une offre pour créer un test technique associé</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Filtres et recherche */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une offre par titre, compétences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les contrats</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="freelance">Freelance</option>
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Active</option>
                  <option value="draft">Brouillon</option>
                  <option value="closed">Fermée</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
              </div>

            </div>
          </div>

          {/* Contenu - Liste des jobs */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement de vos offres d'emploi...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Aucune offre ne correspond à vos critères'
                  : 'Aucune offre d\'emploi créée'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre première offre d\'emploi pour pouvoir y associer un test technique.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div
                  key={job.job_id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-blue-300 cursor-pointer group"
                  onClick={() => handleSelectJob(job)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        {getStatusBadge(job.status || 'active')}
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3">
                        {job.contract_type && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>{getContractTypeLabel(job.contract_type)}</span>
                          </div>
                        )}

                        {job.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        )}

                        {job.salary_range && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}

                        {job.created_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(job.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-gray-700 line-clamp-2 mb-3">
                          {job.description.replace(/\*\*/g, '').substring(0, 150)}...
                        </p>
                      )}

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              +{job.required_skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{job.candidate_count || 0}</span>
                        </div>

                        {job.has_technical_test && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <CheckSquare className="w-4 h-4" />
                            <span>Test créé</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                        {/* ID: {job.job_id} */}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.job_id}/technical-test`);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium text-sm flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Créer un test
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/details/${job.job_id}`);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer avec actions */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>

            <div className="flex gap-3">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

