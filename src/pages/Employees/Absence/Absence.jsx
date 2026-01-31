// src/pages/Employees/Absence/Absence.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  getAbsences,
  updateAbsence,
  getAbsenceStats,
  approveAbsence
} from "../../../services/absence";
import {getEmployees} from "../../../services/employees";
import Header from './Header';
import Filters from './Filters';
import StatsCard from './StatsCard';
import Charts from './Charts';
import AbsenceList from './AbsenceList';
import AbsenceModal from './AbsenceModal';
import {
  getAbsenceTypeColor,
  getAbsenceTypeLabel,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  calculateDuration
} from './utils';

export default function Absence() {
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [newAbsence, setNewAbsence] = useState({
    employee_id: '',
    type: 'vacation',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    emergency_contact: '',
    documents: []
  });

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Charger les données
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAbsences();
  }, [searchTerm, selectedType, selectedStatus, selectedPeriod, selectedDepartment, absences]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [absencesRes, statsRes, employeesRes] = await Promise.all([
        getAbsences(),
        getAbsenceStats(),
        getEmployees()
      ]);

      if (absencesRes.success) {
        setAbsences(absencesRes.absences || []);
        setFilteredAbsences(absencesRes.absences || []);
      } else {
        setError(absencesRes.error || 'Erreur lors du chargement des absences');
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      if (employeesRes.success) {
        setEmployees(employeesRes.employees || []);
      }
    } catch (err) {
      setError('Erreur réseau lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAbsences = () => {
    let filtered = [...absences];

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(absence =>
        absence.employeeName?.toLowerCase().includes(term) ||
        absence.position?.toLowerCase().includes(term) ||
        absence.reason?.toLowerCase().includes(term) ||
        absence.notes?.toLowerCase().includes(term)
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(absence => absence.type === selectedType);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(absence => absence.status === selectedStatus);
    }

    // Filtre par département
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(absence => absence.department === selectedDepartment);
    }

    // Filtre par période
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case 'this_week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'this_month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'last_3_months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'last_6_months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case 'this_year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      filtered = filtered.filter(absence => {
        const absenceDate = new Date(absence.start_date || absence.startDate);
        return absenceDate >= startDate;
      });
    }

    setFilteredAbsences(filtered);
  };

  const handleApproveAbsence = async (absenceId) => {
    try {
      const res = await approveAbsence(absenceId);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error || 'Erreur lors de l\'approbation');
      }
    } catch (err) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleSaveAbsence = async () => {
    try {
      // S'assurer que les noms de champs correspondent au backend
      const absenceData = {
        employee_id: newAbsence.employee_id,
        type: newAbsence.type,
        start_date: newAbsence.start_date,
        end_date: newAbsence.end_date,
        reason: newAbsence.reason,
        notes: newAbsence.notes,
        emergency_contact: newAbsence.emergency_contact,
        documents: newAbsence.documents
      };

      const res = await updateAbsence(editingAbsence ? editingAbsence.id : null, absenceData);
      if (res.success) {
        fetchData();
        setShowAbsenceModal(false);
        setEditingAbsence(null);
        resetNewAbsence();
      } else {
        alert(res.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEditAbsence = (absence) => {
    setEditingAbsence(absence);
    setNewAbsence({
      employee_id: absence.employee_id,
      type: absence.type,
      start_date: absence.start_date || absence.startDate,
      end_date: absence.end_date || absence.endDate,
      reason: absence.reason,
      notes: absence.notes || '',
      emergency_contact: absence.emergency_contact || '',
      documents: absence.documents || []
    });
    setShowAbsenceModal(true);
  };

  const resetNewAbsence = () => {
    setNewAbsence({
      employee_id: '',
      type: 'vacation',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: '',
      notes: '',
      emergency_contact: '',
      documents: []
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedPeriod('this_month');
    setSelectedDepartment('all');
  };

  if (loading && !absences.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des absences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <Header
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          setShowAbsenceModal={setShowAbsenceModal}
          setEditingAbsence={setEditingAbsence}
          resetNewAbsence={resetNewAbsence}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {showFilters && (
          <Filters
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            resetFilters={resetFilters}
            absences={absences}
          />
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Absences ce mois"
              value={stats.this_month || 0}
              icon="calendar"
              color="blue"
              trend={stats.month_trend}
            />
            <StatsCard
              title="En attente"
              value={stats.pending || 0}
              icon="clock"
              color="yellow"
              percentage={stats.total ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}
            />
            <StatsCard
              title="Taux d'approbation"
              value={`${stats.approval_rate || 0}%`}
              icon="check"
              color="green"
              trend={stats.approval_trend}
            />
            <StatsCard
              title="Jours moyens"
              value={stats.average_days ? stats.average_days.toFixed(1) : '0'}
              icon="trend"
              color="purple"
              unit="jours"
            />
          </div>
        )}

        {stats && (
          <Charts
            stats={stats}
            absences={absences}
            filteredAbsences={filteredAbsences}
          />
        )}

        <AbsenceList
          absences={filteredAbsences}
          loading={loading}
          error={error}
          onRefresh={fetchData}
          onEdit={handleEditAbsence}
          onApprove={handleApproveAbsence}
          getAbsenceTypeColor={getAbsenceTypeColor}
          getAbsenceTypeLabel={getAbsenceTypeLabel}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getStatusLabel={getStatusLabel}
          calculateDuration={calculateDuration}
        />

        {showAbsenceModal && (
          <AbsenceModal
            editingAbsence={editingAbsence}
            newAbsence={newAbsence}
            setNewAbsence={setNewAbsence}
            employees={employees}
            onSave={handleSaveAbsence}
            onClose={() => {
              setShowAbsenceModal(false);
              setEditingAbsence(null);
              resetNewAbsence();
            }}
          />
        )}
      </div>
    </div>
  );
}