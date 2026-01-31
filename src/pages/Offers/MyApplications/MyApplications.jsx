// src/pages/Offers/MyApplications/MyApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../../services/jobs';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import ChartComponent from './components/ChartComponent';
import ApplicationsList from './components/ApplicationsList';
import EmptyState from './components/EmptyState';
import InterviewSection from './components/InterviewSection';

export default function MyApplications() {
  const navigate = useNavigate();

  // États principaux
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAccepted, setShowOnlyAccepted] = useState(false);

  // États pour le graphique
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('month');

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    pending: 0
  });

  // Charger les candidatures
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtrer les candidatures
  useEffect(() => {
    filterApplications();
  }, [statusFilter, searchTerm, showOnlyAccepted, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getMyApplications();
      if (result.success) {
        const apps = result.applications || [];
        setApplications(apps);

        // Calculer les statistiques
        const statsData = {
          total: apps.length,
          accepted: apps.filter(app => app.status === 'accepted').length,
          rejected: apps.filter(app => app.status === 'rejected').length,
          pending: apps.filter(app => app.status === 'pending').length
        };
        setStats(statsData);
      } else {
        setError(result.error || 'Erreur lors du chargement des candidatures');
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filtre "Afficher uniquement les acceptées"
    if (showOnlyAccepted) {
      filtered = filtered.filter(app => app.status === 'accepted');
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.job_title?.toLowerCase().includes(term) ||
        app.company_name?.toLowerCase().includes(term) ||
        app.position?.toLowerCase().includes(term)
      );
    }

    // Trier par date
    filtered.sort((a, b) =>
      new Date(b.applied_at || b.submitted_at) - new Date(a.applied_at || a.submitted_at)
    );

    setFilteredApplications(filtered);
  };

  // Si chargement
  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <Header navigate={navigate} />

        <StatsCards stats={stats} />

        {applications.length > 0 && (
          <ChartComponent
            applications={applications}
            chartType={chartType}
            setChartType={setChartType}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            stats={stats}
          />
        )}

        <Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showOnlyAccepted={showOnlyAccepted}
          setShowOnlyAccepted={setShowOnlyAccepted}
        />

        {error ? (
          <EmptyState
            type="error"
            message={error}
            action={() => fetchApplications()}
            actionLabel="Réessayer"
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            type={applications.length === 0 ? "empty" : "noResults"}
            navigate={navigate}
          />
        ) : (
          <ApplicationsList
              applications={filteredApplications}
              loading={loading}
              navigate={navigate}
              fetchApplications={fetchApplications}
          />
        )}

        {stats.accepted > 0 && <InterviewSection stats={stats} navigate={navigate} />}
      </div>
    </div>
  );
}