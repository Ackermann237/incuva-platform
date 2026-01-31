// src/pages/Employees/Payroll/components/Bulletins/bulletins.jsx
import React, { useState, useEffect } from 'react';
import Header from './Bulletins/Header.jsx';
import StatusBadge from './Bulletins/StatusBadge.jsx';
import Tabs from './Bulletins/Tabs.jsx';
import SummaryTab from './Bulletins/SummaryTab.jsx';
import ContributionsTab from './Bulletins/ContributionsTab.jsx';
import DetailsTab from './Bulletins/DetailsTab.jsx';
import CompanyTab from './Bulletins/CompanyTab.jsx';
import Footer from './Bulletins/Footer.jsx';
import { AlertCircle } from 'lucide-react';
import { getPayslipDetail, getCompanyInfo, getEmployeeCompleteInfo } from '../../../../services/payroll.js';
import ModernPayslip from './ModernPayslip.jsx';

const Bulletins = ({ isOpen, onClose, payslip: initialPayslip, payslipId }) => {
  const [payslip, setPayslip] = useState(initialPayslip);
  const [company, setCompany] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(!initialPayslip);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [viewMode, setViewMode] = useState('classic');

  useEffect(() => {
    if (isOpen && !initialPayslip && payslipId) {
      fetchPayslipDetail();
    } else if (isOpen && initialPayslip) {
      fetchAdditionalData(initialPayslip);
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
      const companyResult = await getCompanyInfo();
      if (companyResult.success) {
        setCompany(companyResult.company);
      }

      const employeeResult = await getEmployeeCompleteInfo(payslipData.employee_id);
      if (employeeResult.success) {
        setEmployee(employeeResult.employee);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données supplémentaires:', err);
    }
  };

  const handleSwitchView = (mode) => {
    setViewMode(mode);
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

  if (!isOpen) return null;

  if (viewMode === 'modern') {
    return (
      <ModernPayslip
        isOpen={isOpen}
        onClose={onClose}
        payslip={payslip}
        payslipId={payslipId}
        onSwitchView={handleSwitchView}
      />
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-pulse">
          <div className="p-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">{error || 'Bulletin non trouvé'}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        <Header
          payslip={payslip}
          employee={employee}
          onSwitchView={handleSwitchView}
          onClose={onClose}
        />

        <div className="px-6 pt-4 pb-2">
          <StatusBadge payslip={payslip} formatDate={formatDate} />
        </div>

        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {activeTab === 'summary' && (
              <SummaryTab
                payslip={payslip}
                employee={employee}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'contributions' && (
              <ContributionsTab
                payslip={payslip}
                formatCurrency={formatCurrency}
              />
            )}

            {activeTab === 'details' && (
              <DetailsTab
                payslip={payslip}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'company' && company && (
              <CompanyTab
                company={company}
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        </div>

        <Footer
          onClose={onClose}
          company={company}
        />
      </div>
    </div>
  );
};

export default Bulletins;