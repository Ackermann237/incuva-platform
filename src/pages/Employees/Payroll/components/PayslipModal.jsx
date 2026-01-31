// src/pages/Employees/Payroll/components/PayslipModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calculator, Save, Loader2, Calendar, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { generatePayslip, updatePayslip } from '../../../../services/payroll';

export default function PayslipModal({ isOpen, onClose, employees, payslip, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    period_start: '',
    period_end: '',
    gross_salary: '',
    hours_worked: '151.67',
    overtime_hours: '0',
    overtime_pay: '0',
    bonuses: '0',
    deductions: '0',
    payment_method: 'bank_transfer',
    payment_date: '',
    notes: ''
  });

  const [calculations, setCalculations] = useState({
    employee_contributions: {},
    employer_contributions: {},
    total_employee_contributions: 0,
    total_employer_contributions: 0,
    income_tax: 0,
    net_salary: 0,
    total_cost: 0,
    hourly_rate: 0
  });

  // Initialiser les données si on édite un bulletin existant
  useEffect(() => {
    if (payslip) {
      setFormData({
        employee_id: payslip.employee_id || '',
        period_start: payslip.period_start || '',
        period_end: payslip.period_end || '',
        gross_salary: payslip.gross_salary || '',
        hours_worked: payslip.hours_worked || '151.67',
        overtime_hours: payslip.overtime_hours || '0',
        overtime_pay: payslip.overtime_pay || '0',
        bonuses: payslip.bonuses || '0',
        deductions: payslip.deductions || '0',
        payment_method: payslip.payment_method || 'bank_transfer',
        payment_date: payslip.payment_date || '',
        notes: payslip.notes || ''
      });

      setCalculations({
        employee_contributions: payslip.employee_contributions || {},
        employer_contributions: payslip.employer_contributions || {},
        total_employee_contributions: payslip.total_employee_contributions || 0,
        total_employer_contributions: payslip.total_employer_contributions || 0,
        income_tax: payslip.income_tax || 0,
        net_salary: payslip.net_salary || 0,
        total_cost: payslip.total_cost || 0,
        hourly_rate: payslip.hourly_rate || 0
      });
    } else {
      // Réinitialiser pour une nouvelle création
      setFormData({
        employee_id: '',
        period_start: '',
        period_end: '',
        gross_salary: '',
        hours_worked: '151.67',
        overtime_hours: '0',
        overtime_pay: '0',
        bonuses: '0',
        deductions: '0',
        payment_method: 'bank_transfer',
        payment_date: '',
        notes: ''
      });
      setCalculations({
        employee_contributions: {},
        employer_contributions: {},
        total_employee_contributions: 0,
        total_employer_contributions: 0,
        income_tax: 0,
        net_salary: 0,
        total_cost: 0,
        hourly_rate: 0
      });
    }
  }, [payslip]);

  // Calculer automatiquement quand le salaire brut change
  useEffect(() => {
    if (formData.gross_salary && !isNaN(parseFloat(formData.gross_salary))) {
      calculateContributions(parseFloat(formData.gross_salary));
    }
  }, [formData.gross_salary]);

  const calculateContributions = (grossSalary) => {
    if (!grossSalary) return;

    // Cotisations salariales (environ 23%)
    const employeeContributions = {
      social_security: round(grossSalary * 0.068),
      health_insurance: round(grossSalary * 0.077),
      pension: round(grossSalary * 0.083),
      unemployment: round(grossSalary * 0.024)
    };

    // Cotisations patronales (environ 42%)
    const employerContributions = {
      social_security: round(grossSalary * 0.13),
      health_insurance: round(grossSalary * 0.128),
      pension: round(grossSalary * 0.162)
    };

    const totalEmployeeContributions = Object.values(employeeContributions).reduce((a, b) => a + b, 0);
    const totalEmployerContributions = Object.values(employerContributions).reduce((a, b) => a + b, 0);

    // Impôt sur le revenu (estimation)
    const incomeTax = round(grossSalary * 0.15);

    // Salaire net
    const netSalary = round(grossSalary - totalEmployeeContributions - incomeTax);

    // Coût total pour l'employeur
    const totalCost = round(grossSalary + totalEmployerContributions);

    // Taux horaire
    const hoursWorked = parseFloat(formData.hours_worked) || 151.67;
    const hourlyRate = round(grossSalary / hoursWorked);

    setCalculations({
      employee_contributions: employeeContributions,
      employer_contributions: employerContributions,
      total_employee_contributions: totalEmployeeContributions,
      total_employer_contributions: totalEmployerContributions,
      income_tax: incomeTax,
      net_salary: netSalary,
      total_cost: totalCost,
      hourly_rate: hourlyRate
    });
  };

  const round = (value) => Math.round(value * 100) / 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.employee_id) {
        throw new Error('Veuillez sélectionner un employé');
      }
      if (!formData.period_start || !formData.period_end) {
        throw new Error('Veuillez spécifier la période');
      }
      if (!formData.gross_salary) {
        throw new Error('Veuillez saisir le salaire brut');
      }

      const payslipData = {
        ...formData,
        gross_salary: parseFloat(formData.gross_salary),
        hours_worked: parseFloat(formData.hours_worked) || 151.67,
        overtime_hours: parseFloat(formData.overtime_hours) || 0,
        overtime_pay: parseFloat(formData.overtime_pay) || 0,
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        // Ajouter les calculs générés
        ...calculations
      };

      let result;
      if (payslip) {
        // Mise à jour
        result = await updatePayslip(payslip.id, payslipData);
      } else {
        // Création
        result = await generatePayslip(payslipData);
      }

      if (result.success) {
        setSuccess(payslip ? 'Bulletin mis à jour avec succès' : 'Bulletin généré avec succès');
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.candidate_name || 'Employé sans nom' : 'Sélectionner un employé';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {payslip ? 'Modifier le bulletin' : 'Nouveau bulletin de paie'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <AlertCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Informations de base
              </h3>

              {/* Employé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employé *
                </label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!!payslip}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.candidate_name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Période */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début *
                  </label>
                  <input
                    type="date"
                    name="period_start"
                    value={formData.period_start}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    name="period_end"
                    value={formData.period_end}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Salaires et heures */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire brut (€) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="gross_salary"
                    value={formData.gross_salary}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heures travaillées
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="hours_worked"
                    value={formData.hours_worked}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="151.67"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Détails additionnels */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails additionnels</h3>

              {/* Heures supplémentaires */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heures supplémentaires
                  </label>
                  <input
                    type="number"
                    name="overtime_hours"
                    value={formData.overtime_hours}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prime heures supp (€)
                  </label>
                  <input
                    type="number"
                    name="overtime_pay"
                    value={formData.overtime_pay}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Bonus et déductions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus (€)
                  </label>
                  <input
                    type="number"
                    name="bonuses"
                    value={formData.bonuses}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Déductions (€)
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="check">Chèque</option>
                  <option value="cash">Espèces</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de paiement
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>
          </div>

          {/* Résumé des calculs */}
          {formData.gross_salary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Résumé des calculs
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Salaire net</div>
                  <div className="text-xl font-bold text-green-600">
                    {calculations.net_salary.toFixed(2)} €
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Coût total</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculations.total_cost.toFixed(2)} €
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Taux horaire</div>
                  <div className="text-xl font-bold text-purple-600">
                    {calculations.hourly_rate.toFixed(2)} €/h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Impôt</div>
                  <div className="text-xl font-bold text-orange-600">
                    {calculations.income_tax.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {payslip ? 'Mise à jour...' : 'Génération...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {payslip ? 'Mettre à jour' : 'Générer le bulletin'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}