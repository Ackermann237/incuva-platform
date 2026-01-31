// src/pages/Employees/Payroll/components/Bulletins/EmployeeInfo.jsx
import React from 'react';
import { User } from 'lucide-react';

const EmployeeInfo = ({ employee }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-blue-100 rounded-lg">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Informations Employé</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Nom</p>
          <p className="font-medium">{employee?.candidate_name || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Poste</p>
          <p className="font-medium">{employee?.position || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Type de contrat</p>
          <p className="font-medium">{employee?.contract_type || 'CDI'}</p>
        </div>
        {employee?.personal_info?.email && (
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-sm">{employee.personal_info.email}</p>
          </div>
        )}
        {employee?.personal_info?.phone && (
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="font-medium">{employee.personal_info.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeInfo;