// src/pages/Employees/Planning/Planning.jsx
import React, { useState, useEffect, useRef } from 'react';
import LottieLoader from '../../../components/lottie/LottieLoader';
import OptimizerModal from './OptimizerModal';
import Header from './Header';
import Filters from './Filters';
import CalendarView from './CalendarView';
import TableView from './TableView';
import StatsCard from './StatsCard';
import ShiftModal from './ShiftModal';
import { getPlanning, getEmployeesForPlanning } from '../../../services/planning';

export default function Planning() {
  const [planning, setPlanning] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notice, setNotice] = useState('');
  const [showOptimizer, setShowOptimizer] = useState(false);
  const hasLoaded = useRef(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  // CHANGEMENT ICI : 'calendar' par défaut au lieu de 'week'
  const [viewMode, setViewMode] = useState('calendar');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // États pour les filtres
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    search: ''
  });

  // Charger le planning et les employés
  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode, filters]);

  // `manual` : clic sur « Actualiser » (confirmation affichée à la fin)
  const fetchData = async (manual = false) => {
      // Le grand écran de chargement n'apparaît qu'à la première ouverture ; ensuite on garde la page affichée
      if (hasLoaded.current) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        // Charger les employés
        const employeesRes = await getEmployeesForPlanning();
        if (employeesRes.success) {
          console.log('Employés chargés:', employeesRes.employees);
          setEmployees(employeesRes.employees || []);
        }

        // Charger le planning
        const params = {
          startDate: getStartDate(),
          endDate: getEndDate(),
          ...filters
        };

        console.log('Paramètres de requête:', params);

        const planningRes = await getPlanning(params);
        if (planningRes.success) {
          console.log('Planning chargé:', planningRes.planning);
          setPlanning(planningRes.planning || []);
        } else {
          setError(planningRes.error || 'Erreur lors du chargement du planning');
        }
        if (manual === true) showNotice('Planning actualisé.');
      } catch (err) {
        setError('Erreur réseau lors du chargement des données');
        console.error(err);
      } finally {
        hasLoaded.current = true;
        setLastUpdated(new Date());
        setLoading(false);
        setRefreshing(false);
      }
  };

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3000);
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'week') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
    } else if (viewMode === 'month') {
      date.setDate(1);
    } else if (viewMode === 'calendar') {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const day = firstDay.getDay();
      const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
      firstDay.setDate(diff);
      return firstDay.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'week') {
      date.setDate(date.getDate() + 6);
    } else if (viewMode === 'month') {
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return lastDay.toISOString().split('T')[0];
    } else if (viewMode === 'calendar') {
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const day = lastDay.getDay();
      const diff = lastDay.getDate() + (6 - day);
      lastDay.setDate(diff);
      return lastDay.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShowShiftModal(true);
  };

  const handleDeleteShift = async (shiftId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce shift ?')) {
      try {
        // Appel API pour supprimer le shift
        await fetch(`/api/planning/${shiftId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        fetchData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDateSelect = (date, employee = null) => {
    setSelectedDate(date);
    setSelectedEmployee(employee);
    setEditingShift(null);
    setShowShiftModal(true);
  };

  const handleShiftSave = () => {
    fetchData();
    setShowShiftModal(false);
    setEditingShift(null);
    setSelectedDate(null);
    setSelectedEmployee(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LottieLoader label="Chargement du planning..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          getStartDate={getStartDate}
          getEndDate={getEndDate}
          onAddShift={() => {
            setEditingShift(null);
            setShowShiftModal(true);
          }}
          onRefresh={() => fetchData(true)}
          onOptimize={() => setShowOptimizer(true)}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
        />

        {notice && (
          <div role="status" className="fixed bottom-6 right-6 z-[9998] rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {notice}
          </div>
        )}

        {/* CHANGEMENT ICI : Espace ajouté entre les filtres et les statistiques */}
        <div className="space-y-6">
            {/* Statistiques */}
          <StatsCard planning={planning} employees={employees} />
          {/* Filtres */}
          <Filters filters={filters} setFilters={setFilters} />

        </div>

        {/* Contenu principal */}
        <div className="mt-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : viewMode === 'calendar' ? (
            <CalendarView
              planning={planning}
              employees={employees}
              currentDate={currentDate}
              onEditShift={handleEditShift}
              onDeleteShift={handleDeleteShift}
              onDateSelect={handleDateSelect}
            />
          ) : (
            <TableView
              planning={planning}
              viewMode={viewMode}
              onEditShift={handleEditShift}
              onDeleteShift={handleDeleteShift}
            />
          )}
        </div>

        {/* Optimiseur IA : après application, on affiche la semaine planifiée */}
        <OptimizerModal
          isOpen={showOptimizer}
          onClose={() => setShowOptimizer(false)}
          onApplied={(monday) => {
            setCurrentDate(new Date(monday));
            fetchData();
          }}
        />

        {/* Modal pour les shifts */}
        <ShiftModal
          isOpen={showShiftModal}
          onClose={() => {
            setShowShiftModal(false);
            setEditingShift(null);
            setSelectedDate(null);
            setSelectedEmployee(null);
          }}
          shift={editingShift}
          employees={employees}
          selectedDate={selectedDate}
          selectedEmployee={selectedEmployee}
          onSave={handleShiftSave}
        />
      </div>
    </div>
  );
}