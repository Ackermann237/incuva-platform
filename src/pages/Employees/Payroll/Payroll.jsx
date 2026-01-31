// src/pages/Employees/Payroll/Payroll.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Users, FileText, CheckCircle, Clock,
  TrendingUp, Download, Filter, Plus, Eye, Edit,
  Trash2, Sparkles, BarChart3, RefreshCw, Loader2,
  Calendar, CreditCard, AlertCircle, CheckSquare
} from 'lucide-react';
import PayslipModal from './components/PayslipModal';
import PayrollStats from './components/PayrollStats';
import PayrollFilters from './components/PayrollFilters';
import AIPayrollAssistant from './components/PayrollAssistant/AIPayrollAssistant.jsx';
import Bulletins from './components/bulletins'; // Import du composant de visualisation
import {
  getEmployeesForPayroll,
  getPayslips,
  getPayrollStats,
  approvePayslip,
  markPayslipAsPaid
} from '../../../services/payroll';

export default function Payroll() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États séparés pour les deux modales
  const [showPayslipModal, setShowPayslipModal] = useState(false); // Modal d'édition/création
  const [showBulletinsModal, setShowBulletinsModal] = useState(false); // Modal de visualisation
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // États pour les filtres
  const [filters, setFilters] = useState({
    employee_id: 'all',
    period_start: '',
    period_end: '',
    status: 'all',
    search: ''
  });

  // Charger les données
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [employeesRes, payslipsRes, statsRes] = await Promise.all([
        getEmployeesForPayroll(),
        getPayslips(filters),
        getPayrollStats()
      ]);

      if (employeesRes.success) {
        setEmployees(employeesRes.employees);
      }

      if (payslipsRes.success) {
        setPayslips(payslipsRes.payslips);
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayslip = async (payslipId) => {
    if (confirm('Êtes-vous sûr de vouloir approuver ce bulletin ?')) {
      const result = await approvePayslip(payslipId);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error);
      }
    }
  };

  const handleMarkAsPaid = async (payslipId) => {
    if (confirm('Marquer ce bulletin comme payé ?')) {
      const result = await markPayslipAsPaid(payslipId);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error);
      }
    }
  };

  // Fonction pour visualiser un bulletin (ouvre Bulletins.jsx)
  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowBulletinsModal(true);
  };

  // Fonction pour éditer un bulletin (ouvre PayslipModal.jsx)
  const handleEditPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowPayslipModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <CreditCard className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading && !payslips.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la paie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="w-10 h-10 text-blue-600" />
                Gestion de la Paie
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les bulletins de paie et suivez les paiements
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Assistant IA
              </button>

              <button
                onClick={() => {
                  setSelectedPayslip(null); // Réinitialiser pour une nouvelle création
                  setShowPayslipModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouveau bulletin
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Statistiques */}
        <PayrollStats stats={stats} />

        {/* Filtres */}
        <div className="mb-6">
          <PayrollFilters filters={filters} setFilters={setFilters} employees={employees} />
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulletins de paie ({payslips.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gérez et suivez tous les bulletins de paie
                </p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {payslips.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bulletin de paie</h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre premier bulletin de paie
              </p>
              <button
                onClick={() => {
                  setSelectedPayslip(null);
                  setShowPayslipModal(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Créer un bulletin
              </button>
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
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salaire Brut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salaire Net
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payslips.map((payslip) => (
                    <tr key={payslip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payslip.employee_name || 'Employé inconnu'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payslip.position || 'Poste inconnu'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(payslip.period_start).toLocaleDateString('fr-FR')} - {new Date(payslip.period_end).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payslip.gross_salary?.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-green-600">
                          {payslip.net_salary?.toLocaleString('fr-FR')} €
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payslip.status)}`}>
                          {getStatusIcon(payslip.status)}
                          {payslip.status === 'draft' ? 'Brouillon' :
                           payslip.status === 'approved' ? 'Approuvé' :
                           payslip.status === 'paid' ? 'Payé' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString('fr-FR') : 'Non défini'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Bouton Voir (Bulletins.jsx) */}
                          <button
                            onClick={() => handleViewPayslip(payslip)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Voir le bulletin"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Bouton Modifier (PayslipModal.jsx) */}
                          <button
                            onClick={() => handleEditPayslip(payslip)}
                            className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Actions selon le statut */}
                          {payslip.status === 'draft' && (
                            <button
                              onClick={() => handleApprovePayslip(payslip.id)}
                              className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                              title="Approuver"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {payslip.status === 'approved' && (
                            <button
                              onClick={() => handleMarkAsPaid(payslip.id)}
                              className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                              title="Marquer comme payé"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* Bouton Supprimer (optionnel) */}
                          <button
                            onClick={() => {/* Navigation vers la suppression */}}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Modales */}

        {/* Modal de visualisation (Bulletins.jsx) */}
        {showBulletinsModal && (
          <Bulletins
            isOpen={showBulletinsModal}
            onClose={() => {
              setShowBulletinsModal(false);
              setSelectedPayslip(null);
            }}
            payslip={selectedPayslip}
            payslipId={selectedPayslip?.id}
          />
        )}

        {/* Modal d'édition/création (PayslipModal.jsx) */}
        {showPayslipModal && (
          <PayslipModal
            isOpen={showPayslipModal}
            onClose={() => {
              setShowPayslipModal(false);
              setSelectedPayslip(null);
            }}
            employees={employees}
            payslip={selectedPayslip}
            onSave={() => {
              fetchData();
              setShowPayslipModal(false);
              setSelectedPayslip(null);
            }}
          />
        )}

        {/* Assistant IA */}
        {showAIAssistant && (
          <AIPayrollAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            payrollData={{ payslips, stats, employees }}
          />
        )}
      </div>
    </div>
  );
}