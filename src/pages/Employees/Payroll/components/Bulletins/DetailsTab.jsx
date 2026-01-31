// src/pages/Employees/Payroll/components/Bulletins/DetailsTab.jsx
import React from 'react';
import { Eye, Heart, AlertCircle, Shield, Home, Briefcase } from 'lucide-react';

const DetailsTab = ({ payslip, formatCurrency, formatDate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Informations administratives
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
              <span className="text-gray-600">Numéro du bulletin</span>
              <span className="font-medium font-mono text-blue-700">{payslip.payslip_number}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
              <span className="text-gray-600">Heures travaillées</span>
              <span className="font-medium">{payslip.hours_worked || 151.67}h</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
              <span className="text-gray-600">Taux horaire</span>
              <span className="font-medium text-green-600">{formatCurrency(payslip.hourly_rate || 0)}/h</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
              <span className="text-gray-600">Généré le</span>
              <span className="font-medium">{formatDate(payslip.generated_at)}</span>
            </div>
            {payslip.approved_at && (
              <div className="flex justify-between py-3 hover:bg-blue-50/50 rounded-lg px-3 transition-colors">
                <span className="text-gray-600">Approuvé le</span>
                <span className="font-medium">{formatDate(payslip.approved_at)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Avantages Sociaux
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Sécurité Sociale</p>
                  <p className="text-sm text-gray-600">Couverture santé complète</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formatCurrency(payslip.employee_contributions?.social_security || 0)} cotisé ce mois
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Retraite</p>
                  <p className="text-sm text-gray-600">Épargne retraite complémentaire</p>
                  <p className="text-xs text-green-600 mt-1">
                    {formatCurrency(payslip.employee_contributions?.pension || 0)} cotisé ce mois-ci
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Assurance chômage</p>
                  <p className="text-sm text-gray-600">Protection contre le chômage</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {formatCurrency(payslip.employee_contributions?.unemployment || 0)} cotisé ce mois-ci
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {payslip.notes && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Notes et Observations
          </h4>
          <div className="bg-white/50 rounded-lg p-4 border border-yellow-100">
            <p className="text-gray-700 whitespace-pre-line">{payslip.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsTab;