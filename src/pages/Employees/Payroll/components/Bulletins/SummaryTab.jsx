// src/pages/Employees/Payroll/components/Bulletins/SummaryTab.jsx
import React from 'react';
import { TrendingUp, Percent, Banknote, Layers, Briefcase, Clock, AlertCircle } from 'lucide-react';
import EmployeeInfo from './EmployeeInfo';
import PayPeriodInfo from './PayPeriodInfo';
import PaymentMethodInfo from './PaymentMethodInfo';

const SummaryTab = ({ payslip, employee, formatCurrency, formatDate }) => {
  return (
    <div className="space-y-6">
      {/* Informations générales - SEULEMENT dans l'onglet Synthèse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <EmployeeInfo employee={employee} />
        <PayPeriodInfo payslip={payslip} employee={employee} formatDate={formatDate} />
        <PaymentMethodInfo payslip={payslip} employee={employee} />
      </div>

      {/* Synthèse des salaires */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Salaire Brut */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-blue-100 text-sm">Brut</span>
            </div>
            <p className="text-3xl font-bold mb-2">{formatCurrency(payslip.gross_salary)}</p>
            <p className="text-blue-100">Salaire brut mensuel</p>
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <p className="text-sm opacity-90">{payslip.hours_worked || 151.67}h à {formatCurrency(payslip.hourly_rate || 0)}/h</p>
            </div>
          </div>

          {/* Cotisations */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Percent className="w-6 h-6" />
              </div>
              <span className="text-amber-100 text-sm">Retenues</span>
            </div>
            <p className="text-3xl font-bold mb-2">-{formatCurrency(payslip.total_employee_contributions)}</p>
            <p className="text-amber-100">Cotisations salariales</p>
            <div className="mt-4 pt-4 border-t border-amber-400/30">
              <p className="text-sm opacity-90">Taux: {Math.round((payslip.total_employee_contributions / payslip.gross_salary) * 100)}%</p>
            </div>
          </div>

          {/* Salaire Net */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Banknote className="w-6 h-6" />
              </div>
              <span className="text-emerald-100 text-sm">Net</span>
            </div>
            <p className="text-3xl font-bold mb-2">{formatCurrency(payslip.net_salary)}</p>
            <p className="text-emerald-100">Salaire net à payer</p>
            <div className="mt-4 pt-4 border-t border-emerald-400/30">
              <p className="text-sm opacity-90">Net/Brut: {Math.round((payslip.net_salary / payslip.gross_salary) * 100)}%</p>
            </div>
          </div>
        </div>

        {/* Détails des gains */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Détails des gains et avantages
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Salaire de base</p>
                    <p className="text-sm text-gray-600">{payslip.hours_worked || 151.67}h à {formatCurrency(payslip.hourly_rate || 0)}/h</p>
                  </div>
                </div>
                <p className="font-medium text-blue-600">{formatCurrency(payslip.gross_salary)}</p>
              </div>

              {payslip.overtime_hours > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-amber-50/50 rounded-lg px-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Heures supplémentaires</p>
                      <p className="text-sm text-gray-600">{payslip.overtime_hours}h à taux majoré</p>
                    </div>
                  </div>
                  <p className="font-medium text-green-600 flex items-center gap-1">
                    <span className="text-sm">+</span>
                    {formatCurrency(payslip.overtime_pay)}
                  </p>
                </div>
              )}

              {payslip.bonuses > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-purple-50/50 rounded-lg px-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Primes et bonus</p>
                      <p className="text-sm text-gray-600">Performance et résultats</p>
                    </div>
                  </div>
                  <p className="font-medium text-green-600 flex items-center gap-1">
                    <span className="text-sm">+</span>
                    {formatCurrency(payslip.bonuses)}
                  </p>
                </div>
              )}

              {payslip.deductions > 0 && (
                <div className="flex justify-between items-center py-3 hover:bg-red-50/50 rounded-lg px-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Retenues diverses</p>
                      <p className="text-sm text-gray-600">Avantages, absences, avances</p>
                    </div>
                  </div>
                  <p className="font-medium text-red-600 flex items-center gap-1">
                    <span className="text-sm">-</span>
                    {formatCurrency(payslip.deductions)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;