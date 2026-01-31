// src/pages/Employees/Payroll/components/Bulletins/StatusBadge.jsx
import React from 'react';
import { CheckCircle, FileCheck, Clock, AlertCircle } from 'lucide-react';

const StatusBadge = ({ payslip, formatDate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border border-green-200';
      case 'approved':
        return 'bg-gradient-to-r from-blue-100 to-cyan-50 text-blue-800 border border-blue-200';
      case 'draft':
        return 'bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-50 text-gray-800 border border-gray-200';
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

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(payslip.status)}`}>
      {getStatusIcon(payslip.status)}
      <span>{getStatusText(payslip.status)}</span>
      {payslip.paid_at && (
        <span className="text-sm">
          • Payé le {formatDate(payslip.paid_at)}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;