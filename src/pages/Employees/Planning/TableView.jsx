// src/pages/Employees/Planning/TableView.jsx
import React from 'react';
import { Edit, Trash2, Clock, User, Calendar } from 'lucide-react';
import { getShiftTypeColor, getShiftTypeLabel, formatDate, calculateDuration } from './utils';

export default function TableView({
  planning,
  viewMode,
  onEditShift,
  onDeleteShift
}) {
  const getFilteredPlanning = () => {
    if (viewMode === 'day') {
      const today = new Date().toISOString().split('T')[0];
      return planning.filter(shift => shift.date === today);
    }
    return planning;
  };

  const filteredPlanning = getFilteredPlanning();

  if (filteredPlanning.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun shift planifié</h3>
        <p className="text-gray-600">
          Ajoutez des shifts pour voir votre planning
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'day' ? "Planning du jour" :
             viewMode === 'week' ? "Planning de la semaine" :
             "Planning du mois"} ({filteredPlanning.length} shifts)
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horaires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Département
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPlanning.map((shift) => {
              // CORRECTION ICI : Utiliser start_time et end_time
              const startTime = shift.start_time || shift.startTime || '00:00';
              const endTime = shift.end_time || shift.endTime || '00:00';
              const duration = calculateDuration(startTime, endTime);

              return (
                <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {shift.employee_name || shift.employeeName || 'Employé inconnu'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shift.position || 'Poste inconnu'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(shift.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {/* CORRECTION ICI */}
                        {startTime} - {endTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getShiftTypeColor(shift.type)}`}>
                      {getShiftTypeLabel(shift.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {duration.toFixed(1)} heures
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {shift.department || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditShift(shift)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteShift(shift.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}