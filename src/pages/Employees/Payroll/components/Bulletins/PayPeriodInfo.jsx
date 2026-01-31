// src/pages/Employees/Payroll/components/Bulletins/PayPeriodInfo.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

const PayPeriodInfo = ({ payslip, employee, formatDate }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-green-100 rounded-lg">
          <Calendar className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Période de Paie</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Date de début</p>
          <p className="font-medium">{formatDate(payslip.period_start)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date de fin</p>
          <p className="font-medium">{formatDate(payslip.period_end)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date de paiement</p>
          <p className="font-medium">{formatDate(payslip.payment_date)}</p>
        </div>
        {employee?.hire_date && (
          <div>
            <p className="text-sm text-gray-600">Date d'embauche</p>
            <p className="font-medium">{formatDate(employee.hire_date)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPeriodInfo;