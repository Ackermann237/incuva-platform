// src/pages/Employees/Payroll/components/ModernPayslip.jsx
import React, { useState, useEffect } from 'react';
import {
  X, Download, Printer, Mail, FileText, Calendar,
  User, CreditCard, Building, MapPin, Phone, Mail as MailIcon,
  Euro, TrendingUp, Percent, DollarSign, FileCheck,
  CheckCircle, AlertCircle, Clock, Eye, ChevronRight,
  Banknote, Shield, Heart, Briefcase, Home, Smartphone,
  Globe, Hash, Layers, Target, Award, Star, Sparkles,
  ArrowRight, ChevronLeft, ChevronRight as RightChevron,
  PieChart, BarChart, LineChart, RefreshCw, Settings,
  Bell, ShieldCheck, Trophy, Crown, Zap, Coffee,
  Gift, Package, Users, Wallet, CreditCard as Card,
  Info, ExternalLink
} from 'lucide-react';
import { getPayslipDetail, getCompanyInfo, getEmployeeCompleteInfo } from '../../../../services/payroll';

const ModernPayslip = ({ isOpen, onClose, payslip: initialPayslip, payslipId, onSwitchView }) => {
  const [payslip, setPayslip] = useState(initialPayslip);
  const [company, setCompany] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(!initialPayslip);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      if (!initialPayslip && payslipId) {
        fetchPayslipDetail();
      } else if (initialPayslip) {
        setPayslip(initialPayslip);
        fetchAdditionalData(initialPayslip);
      }
    }
  }, [isOpen, payslipId]);

  const fetchPayslipDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getPayslipDetail(payslipId);
      if (result.success) {
        setPayslip(result.payslip);
        fetchAdditionalData(result.payslip);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement du bulletin');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async (payslipData) => {
    try {
      // Récupérer les informations de l'entreprise
      const companyResult = await getCompanyInfo();
      if (companyResult.success) {
        setCompany(companyResult.company);
      }

      // Récupérer les informations complètes de l'employé
      const employeeResult = await getEmployeeCompleteInfo(payslipData.employee_id);
      if (employeeResult.success) {
        setEmployee(employeeResult.employee);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données supplémentaires:', err);
    }
  };

  const handleDownload = () => {
    // Implémenter la logique de téléchargement
    console.log('Télécharger le bulletin', payslip.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    // Implémenter l'envoi par email
    console.log('Envoyer par email', payslip.id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md';
      case 'approved':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md';
      case 'draft':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-md';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5" />;
      case 'approved':
        return <FileCheck className="w-5 h-5" />;
      case 'draft':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'approved': return 'Approuvé';
      case 'draft': return 'Brouillon';
      default: return 'Inconnu';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-4xl overflow-hidden">
          <div className="p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Chargement du bulletin</h3>
            <p className="text-blue-600">Préparation de votre fiche de paie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="fixed inset-0 bg-white backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md">
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 mb-6">{error || 'Bulletin non trouvé'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-md"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen">
        {/* Header avec navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-blue-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="group flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Retour</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSwitchView('classic')}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Vue Classique
                </button>

                <div className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(payslip.status)} flex items-center gap-2`}>
                  {getStatusIcon(payslip.status)}
                  <span>{getStatusText(payslip.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Payslip Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-6 md:p-8 mb-8 border border-blue-200 shadow-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    Bulletin de Paie <span className="text-blue-700">#{payslip.payslip_number}</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{employee?.candidate_name || payslip.employee_name || 'Employé'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{employee?.position || payslip.position || 'Poste'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                  title="Imprimer"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendEmail}
                  className="p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                  title="Envoyer par email"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Banknote className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-blue-700 text-sm font-medium">Salaire Brut</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(payslip.gross_salary)}</p>
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{payslip.hours_worked || 151.67}h travaillées</span>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Percent className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-blue-700 text-sm font-medium">Cotisations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">-{formatCurrency(payslip.total_employee_contributions)}</p>
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Protections sociales incluses</span>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-blue-700 text-sm font-medium">Salaire Net</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(payslip.net_salary)}</p>
              <div className="flex items-center gap-2 text-blue-600">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">À payer le {formatDate(payslip.payment_date)}</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Employee & Company Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Employee Card */}
              <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  Informations Employé
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-medium text-gray-900">{employee?.candidate_name || 'Non spécifié'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Poste</p>
                      <p className="font-medium text-gray-900">{employee?.position || 'Non spécifié'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <Hash className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Matricule</p>
                      <p className="font-medium text-gray-900">{employee?.employee_id?.slice(-6) || 'N/A'}</p>
                    </div>
                  </div>

                  {employee?.personal_info?.email && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <MailIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 text-sm">{employee.personal_info.email}</p>
                      </div>
                    </div>
                  )}

                  {employee?.personal_info?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900">{employee.personal_info.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Card */}
              {company && (
                <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    Informations Entreprise
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Raison sociale</p>
                        <p className="font-medium text-gray-900">{company.company_name}</p>
                      </div>
                    </div>

                    {company.siret && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <div className="p-1.5 bg-blue-100 rounded">
                          <Hash className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">SIRET</p>
                          <p className="font-medium text-gray-900 font-mono text-sm">{company.siret}</p>
                        </div>
                      </div>
                    )}

                    {company.address && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <div className="p-1.5 bg-blue-100 rounded">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Adresse</p>
                          <p className="font-medium text-gray-900">{company.address.street}, {company.address.postal_code} {company.address.city}</p>
                        </div>
                      </div>
                    )}

                    {company.industry && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <div className="p-1.5 bg-blue-100 rounded">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Secteur</p>
                          <p className="font-medium text-gray-900">{company.industry}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1 p-1 bg-blue-50 rounded-xl border border-blue-100">
                {['overview', 'earnings', 'deductions', 'benefits', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50'
                    }`}
                  >
                    {tab === 'overview' && 'Aperçu'}
                    {tab === 'earnings' && 'Gains'}
                    {tab === 'deductions' && 'Retenues'}
                    {tab === 'benefits' && 'Avantages'}
                    {tab === 'analytics' && 'Analytique'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Synthèse du mois</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Période</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(payslip.period_start)} → {formatDate(payslip.period_end)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Paiement</p>
                            <p className="font-medium text-gray-900">{formatDate(payslip.payment_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-lg p-5 border border-blue-100">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Répartition des coûts</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Salaire brut</span>
                          <span className="text-lg font-bold text-blue-700">{formatCurrency(payslip.gross_salary)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Cotisations salariales</span>
                          <span className="font-medium text-red-600">-{formatCurrency(payslip.total_employee_contributions)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Cotisations patronales</span>
                          <span className="font-medium text-blue-600">+{formatCurrency(payslip.total_employer_contributions)}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">Coût total employeur</span>
                            <span className="text-xl font-bold text-emerald-700">{formatCurrency(payslip.total_cost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'earnings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Détail des gains</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Salaire de base</p>
                            <p className="text-sm text-gray-600">{payslip.hours_worked || 151.67}h travaillées</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-700">{formatCurrency(payslip.gross_salary)}</span>
                      </div>

                      {payslip.overtime_hours > 0 && (
                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Heures supplémentaires</p>
                              <p className="text-sm text-gray-600">{payslip.overtime_hours}h supplémentaires</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-emerald-700">+{formatCurrency(payslip.overtime_pay)}</span>
                        </div>
                      )}

                      {payslip.bonuses > 0 && (
                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Trophy className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Primes et bonus</p>
                              <p className="text-sm text-gray-600">Performance et résultats</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-emerald-700">+{formatCurrency(payslip.bonuses)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'deductions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Détail des retenues</h3>
                    <div className="space-y-3">
                      {payslip.employee_contributions && Object.entries(payslip.employee_contributions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">Cotisation sociale</p>
                            </div>
                          </div>
                          <span className="font-medium text-red-600">-{formatCurrency(value)}</span>
                        </div>
                      ))}

                      {payslip.income_tax > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Euro className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Impôt sur le revenu</p>
                              <p className="text-sm text-gray-600">Prélèvement à la source</p>
                            </div>
                          </div>
                          <span className="font-medium text-orange-600">-{formatCurrency(payslip.income_tax)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Analyses et statistiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Percent className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Taux de charge</p>
                            <p className="text-sm text-blue-700">Coût employeur</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {payslip.gross_salary ? Math.round((payslip.total_cost / payslip.gross_salary - 1) * 100) : 0}%
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ratio net/brut</p>
                            <p className="text-sm text-blue-700">Part conservée</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round((payslip.net_salary / payslip.gross_salary) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-blue-100 bg-white">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-gray-600">
                    Ce bulletin de paie est un document légal à conserver pendant 5 ans.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Pour toute question, contactez votre service RH.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Fermer
                </button>
                <button
                  onClick={handleDownload}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPayslip;