// src/pages/Employees/Payroll/components/AutoPayrollSetup.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { setupAutoPayroll } from '../../../../services/payroll';

const AutoPayrollSetup = ({ employee, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    payment_method: 'bank_transfer',
    payment_frequency: 'monthly',
    auto_generate: true
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await setupAutoPayroll(employee.id, config);
      if (result.success) {
        onSuccess?.();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Configuration automatique de la paie</h3>
              <p className="text-gray-600 text-sm">Pour {employee.candidate_name}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                value={config.payment_method}
                onChange={(e) => setConfig({...config, payment_method: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bank_transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
                <option value="cash">Espèces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence de paiement
              </label>
              <select
                value={config.payment_frequency}
                onChange={(e) => setConfig({...config, payment_frequency: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Mensuel</option>
                <option value="biweekly">Bimensuel</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="auto_generate"
                checked={config.auto_generate}
                onChange={(e) => setConfig({...config, auto_generate: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto_generate" className="text-sm text-gray-700">
                Générer automatiquement les bulletins chaque mois
              </label>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">Salaire brut:</span>
                <span className="font-bold text-green-800">{employee.salary?.toLocaleString('fr-FR')} €</span>
              </div>
              <p className="text-xs text-green-600">
                Le premier bulletin sera généré automatiquement pour le mois en cours.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Configuration...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Configurer la paie
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoPayrollSetup;