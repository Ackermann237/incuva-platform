// src/pages/Jobs/OffersAvailable.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../../services/jobs";
import { Briefcase } from "lucide-react";

// Import des components modulaires
import Header from "./Composant/Header";
import Filters from "./Composant/Filters";
import ChartSection from "./Composant/ChartSection";
import JobCard from "./Composant/JobCard";
import Modal from "./Composant/Modal";
import JobDetailModalContent from "./Composant/JobDetailModalContent";

// Configuration des filtres par défaut (exporté pour être utilisé dans Filters.jsx)
export const DEFAULT_FILTERS = {
  search: "",
  location: "",
  salaryMin: 0,
  salaryMax: 200000,
  date: "all",
  view: "grid",
  sectors: [],
};

export default function OffersAvailable() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  // Liste des secteurs pour les filtres
  const [sectors] = useState(["Tech", "Santé", "Finance", "Marketing", "Autre"]);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = async () => {
    setLoading(true);
    const res = await getAllJobs();
    if (res.success) {
      setJobs(res.jobs || []);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...jobs];

    // --- LOGIQUE DE FILTRAGE ---
    const { search, location, date, salaryMin, salaryMax, sectors: selectedSectors } = filters;

    // Filtre par recherche
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(lowerSearch) ||
        job.company_name.toLowerCase().includes(lowerSearch) ||
        job.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Filtre par localisation
    if (location) {
      const lowerLocation = location.toLowerCase();
      result = result.filter(job =>
        job.location.toLowerCase().includes(lowerLocation)
      );
    }

    // Filtre par date
    if (date !== "all") {
      const now = new Date();
      const days = date === "week" ? 7 : date === "month" ? 30 : 90;
      const cutoff = new Date(now.setDate(now.getDate() - days));

      result = result.filter(job => {
        // Assurez-vous que job.created_at est valide
        const jobDate = new Date(job.created_at);
        return !isNaN(jobDate.getTime()) && jobDate >= cutoff;
      });
    }

    // Filtre par secteurs (basé sur le titre/description)
    if (selectedSectors.length > 0) {
      result = result.filter(job =>
        selectedSectors.some(sector =>
          job.title.toLowerCase().includes(sector.toLowerCase()) ||
          job.description.toLowerCase().includes(sector.toLowerCase())
        )
      );
    }

    // NOTE: Le filtre par salaire (salaryMin/salaryMax) n'était pas implémenté dans le code initial,
    // car le salaire est stocké sous forme de *plage* de texte (`salary_range`).
    // Il faudrait convertir `job.salary_range` en nombres (e.g., "50k-70k") pour que les filtres min/max fonctionnent.
    // Pour l'instant, on laisse la logique de `RangeSlider` sans effet direct sur `filteredJobs`.

    setFilteredJobs(result);
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSectorToggle = (sector) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Rendu de l'état de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Chargement des offres...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <Header />

        <Filters
          filters={filters}
          handleFilterChange={handleFilterChange}
          sectors={sectors}
          handleSectorToggle={handleSectorToggle}
          resetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          jobs={jobs}
        />

        {/* Graphique */}
        {jobs.length > 0 && <ChartSection jobs={jobs} />}

        {/* Cartes des offres */}
        <div>
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Briefcase className="w-14 h-14 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Aucune offre ne correspond à vos critères</h3>
              <p className="text-gray-500 text-lg mb-6">
                Essayez d'élargir vos filtres ou revenez plus tard pour de nouvelles opportunités.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className={`grid ${filters.view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  view={filters.view}
                  openJobModal={openJobModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de détails */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {selectedJob && (
            <JobDetailModalContent
              selectedJob={selectedJob}
              setModalOpen={setModalOpen}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}