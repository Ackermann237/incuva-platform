// src/pages/Employees/Payroll/components/Bulletins/PaymentMethodInfo.jsx
import React from 'react';
import { CreditCard } from 'lucide-react';

const PaymentMethodInfo = ({ payslip, employee }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-purple-100 rounded-lg">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Méthode de Paiement</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Mode</p>
          <p className="font-medium capitalize">{payslip.payment_method || 'Virement bancaire'}</p>
        </div>
        {employee?.personal_info?.bank_details?.iban && (
          <div>
            <p className="text-sm text-gray-600">IBAN</p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {employee.personal_info.bank_details.iban}
            </p>
          </div>
        )}
        {employee?.personal_info?.bank_details?.bic && (
          <div>
            <p className="text-sm text-gray-600">BIC</p>
            <p className="font-mono text-sm bg-gray-50 p-2 rounded">
              {employee.personal_info.bank_details.bic}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodInfo;