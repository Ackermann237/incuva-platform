// src/pages/Jobs/Entreprises/TechnicalTestsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckSquare, Search, Brain, BarChart, Download, FileText, Plus } from 'lucide-react';
import {
    getCompanyJobs,
    getCompanyTechnicalTests, getTestStatistics
} from '../../../services/technical';
import HeaderTest from './TechnicalTestsDashboard/HeaderTest';
import TestRow from './TechnicalTestsDashboard/TestRow';
import TestDetailsModal from './TechnicalTestsDashboard/TestDetailsModal';
import TestStatisticsModal from './TechnicalTestsDashboard/TestStatisticsModal';
import JobsListModal from './JobsListModal';
import DeleteTestModal from './TechnicalTestsDashboard/DeleteTestModal';
import QuickActionCard from "./TechnicalTestsDashboard/QuickActionCard";

export default function TechnicalTestsDashboard() {
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Données
  const [allTests, setAllTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Modal et actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showJobsModal, setShowJobsModal] = useState(false);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchTerm, selectedJob, selectedStatus, sortBy, allTests]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les jobs de l'entreprise
      const jobsRes = await getCompanyJobs();
      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
      } else {
        setJobs([]);
      }

      // Charger les tests techniques de l'entreprise
      const testsRes = await getCompanyTechnicalTests();
      if (testsRes.success) {
        const companyTests = testsRes.data || [];
        setAllTests(companyTests);
        setFilteredTests(companyTests);
        calculateStatistics(companyTests);
      } else {
        setError(testsRes.error || 'Erreur lors du chargement des tests');
      }
    } catch (err) {
      console.error('Erreur chargement dashboard tests:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (tests) => {
    const stats = {
      totalTests: tests.length,
      activeTests: tests.filter(t => t.status === 'active').length,
      draftTests: tests.filter(t => t.status === 'draft').length,
      publicTests: tests.filter(t => t.is_public).length,
      totalCandidates: tests.reduce((sum, test) => sum + (test.candidate_count || 0), 0),
      averageScore: tests.length > 0 ?
        tests.reduce((sum, test) => sum + (test.average_score || 0), 0) / tests.length : 0,
      totalQuestions: tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0)
    };
    setStatistics(stats);
  };

  const filterTests = () => {
    let filtered = [...allTests];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par job
    if (selectedJob !== 'all') {
      filtered = filtered.filter(test => test.job_id === selectedJob);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(test => test.status === selectedStatus);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'candidates':
          return (b.candidate_count || 0) - (a.candidate_count || 0);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    setFilteredTests(filtered);
  };

  const handleDeleteTest = async (testId) => {
    try {
      const res = await deleteTechnicalTest(testId);
      if (res.success) {
        setAllTests(prev => prev.filter(t => t.id !== testId));
        setSuccess('Test supprimé avec succès');
        setShowDeleteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleViewStatistics = async (testId) => {
    try {
      const res = await getTestStatistics(testId);
      if (res.success) {
        setSelectedTest(res.data.test);
        setStatistics(res.data.statistics);
        setShowStatistics(true);
      }
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
    }
  };

  if (loading && allTests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Chargement des tests techniques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec statistiques */}
        <HeaderTest
          statistics={statistics}
          onCreateTest={() => setShowJobsModal(true)}
        />

        {/* Messages d'alerte */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckSquare className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un test, un job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les jobs</option>
                {jobs.map(job => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="draft">Brouillon</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} trouvé{filteredTests.length !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="recent">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="name">Nom (A-Z)</option>
                <option value="candidates">Nombre de candidats</option>
                <option value="duration">Durée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tests */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun test technique</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || selectedJob !== 'all' || selectedStatus !== 'all'
                  ? 'Aucun test ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier test technique pour évaluer vos candidats.'}
              </p>
              <button
                onClick={() => setShowJobsModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Créer votre premier test
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Test</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Job associé</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Statistiques</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTests.map(test => (
                    <TestRow
                      key={test.id}
                      test={test}
                      onViewDetails={() => handleLoadTestDetails(test.id)}
                      onViewStatistics={() => handleViewStatistics(test.id)}
                      onEdit={() => navigate(`/jobs/${test.job_id}/technical-test?testId=${test.id}`)}
                      onCopyLink={() => handleCopyLink(test.id)}
                      onDelete={() => {
                        setTestToDelete(test);
                        setShowDeleteModal(true);
                      }}
                      onDuplicate={() => handleDuplicateTest(test)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={Brain}
            title="Générer avec l'IA"
            description="Laissez l'IA créer un test personnalisé basé sur vos offres"
            buttonText="Essayer maintenant"
            onClick={() => navigate('/jobs')}
            gradientFrom="from-blue-50"
            gradientTo="to-indigo-50"
            borderColor="border-blue-200"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            buttonColor="text-blue-600"
          />

          <QuickActionCard
            icon={BarChart}
            title="Analyses détaillées"
            description="Consultez les performances de vos tests et des candidats"
            buttonText="Voir les analyses"
            onClick={() => {
              if (filteredTests.length > 0) {
                handleViewStatistics(filteredTests[0].id);
              }
            }}
            gradientFrom="from-green-50"
            gradientTo="to-emerald-50"
            borderColor="border-green-200"
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            buttonColor="text-green-600"
          />

          <QuickActionCard
            icon={Download}
            title="Exporter les résultats"
            description="Exportez les résultats des tests en PDF ou CSV"
            buttonText="Télécharger"
            onClick={() => {/* Fonction d'export */}}
            gradientFrom="from-purple-50"
            gradientTo="to-violet-50"
            borderColor="border-purple-200"
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            buttonColor="text-purple-600"
          />
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && testToDelete && (
        <DeleteTestModal
          test={testToDelete}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteTest(testToDelete.id)}
        />
      )}

      {/* Modal détails du test */}
      {showTestDetails && selectedTest && (
        <TestDetailsModal
          test={selectedTest}
          onClose={() => {
            setShowTestDetails(false);
            setSelectedTest(null);
          }}
          onEdit={() => {
            setShowTestDetails(false);
            navigate(`/jobs/${selectedTest.job_id}/technical-test?testId=${selectedTest.id}`);
          }}
        />
      )}

      {/* Modal statistiques */}
      {showStatistics && selectedTest && statistics && (
        <TestStatisticsModal
          test={selectedTest}
          statistics={statistics}
          onClose={() => {
            setShowStatistics(false);
            setSelectedTest(null);
          }}
        />
      )}

      {/* Modal de sélection de job */}
      {showJobsModal && (
        <JobsListModal
          onClose={() => setShowJobsModal(false)}
          onSelectJob={(job) => {
            setShowJobsModal(false);
            navigate(`/jobs/${job.job_id}/technical-test`);
          }}
        />
      )}
    </div>
  );
}