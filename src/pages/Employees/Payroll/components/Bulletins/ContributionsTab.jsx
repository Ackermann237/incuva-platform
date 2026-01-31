// src/pages/Employees/Payroll/components/Bulletins/ContributionsTab.jsx
import React from 'react';
import { Shield, Building, Zap, Euro, DollarSign, Percent } from 'lucide-react';

const ContributionsTab = ({ payslip, formatCurrency }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cotisations salariales */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Cotisations Salariales
              <span className="ml-auto text-sm font-normal text-blue-700">
                {Math.round((payslip.total_employee_contributions / payslip.gross_salary) * 100)}%
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {payslip.employee_contributions && Object.entries(payslip.employee_contributions).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">Cotisation salariale</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-{formatCurrency(value)}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((value / payslip.gross_salary) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">Total des cotisations salariales</p>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-{formatCurrency(payslip.total_employee_contributions)}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round((payslip.total_employee_contributions / payslip.gross_salary) * 100)}% du brut
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cotisations patronales */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Cotisations Patronales
              <span className="ml-auto text-sm font-normal text-purple-700">
                {Math.round((payslip.total_employer_contributions / payslip.gross_salary) * 100)}%
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {payslip.employer_contributions && Object.entries(payslip.employer_contributions).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-purple-50/50 rounded-lg px-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">Cotisation patronale</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-600">+{formatCurrency(value)}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((value / payslip.gross_salary) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">Total des cotisations patronales</p>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">+{formatCurrency(payslip.total_employer_contributions)}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round((payslip.total_employer_contributions / payslip.gross_salary) * 100)}% du brut
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé fiscal amélioré */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Synthèse des Charges
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Impôt sur le revenu</h4>
                <p className="text-sm text-gray-600">Prélevé à la source</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(payslip.income_tax)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                style={{ width: `${Math.min((payslip.income_tax / payslip.gross_salary) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((payslip.income_tax / payslip.gross_salary) * 100)}% du salaire brut
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Coût total employeur</h4>
                <p className="text-sm text-gray-600">Salaire + charges patronales</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(payslip.total_cost)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                style={{ width: `${Math.min((payslip.total_cost / (payslip.gross_salary * 2)) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((payslip.total_cost / payslip.gross_salary - 1) * 100)}% supplémentaire
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Percent className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Taux de charge</h4>
                <p className="text-sm text-gray-600">Ratio employeur / salaire</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {payslip.gross_salary ? Math.round((payslip.total_cost / payslip.gross_salary - 1) * 100) : 0}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(payslip.gross_salary ? ((payslip.total_cost / payslip.gross_salary - 1) * 100) : 0, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Pour 1€ de salaire brut
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsTab;