// src/pages/Employees/Absence/AbsenceList.jsx
import React from 'react';
import {
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit,
  MoreVertical,
  Download,
  FileText,
  ChevronRight
} from 'lucide-react';

const AbsenceList = ({
  absences,
  loading,
  error,
  onRefresh,
  onEdit,
  onApprove,
  getAbsenceTypeColor,
  getAbsenceTypeLabel,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  calculateDuration
}) => {
  const handleExport = () => {
    // Fonction d'export à implémenter
    console.log('Export des absences');
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  if (absences.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune absence trouvée</h3>
        <p className="text-gray-600">
          Aucune absence ne correspond aux critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des absences
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {absences.length} absence{absences.length > 1 ? 's' : ''} trouvée{absences.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            )}
            <button
              onClick={handleExport}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raison
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {absences.map((absence) => {
              const duration = calculateDuration(absence.start_date || absence.startDate, absence.end_date || absence.endDate);

              return (
                <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {absence.employeeName?.charAt(0) || '?'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {absence.employeeName || 'Employé inconnu'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {absence.position || 'Non spécifié'}
                          {absence.department && ` • ${absence.department}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAbsenceTypeColor(absence.type)}`}>
                      {getAbsenceTypeLabel(absence.type)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(absence.start_date || absence.startDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      au {new Date(absence.end_date || absence.endDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {duration} jour{duration > 1 ? 's' : ''}
                      </div>
                      {absence.created_at && (
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(absence.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(absence.status)}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(absence.status)}`}>
                        {getStatusLabel(absence.status)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {absence.reason}
                    </div>
                    {absence.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {absence.notes.substring(0, 50)}...
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {absence.status === 'pending' && (
                        <button
                          onClick={() => onApprove(absence.id)}
                          className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all"
                        >
                          Approuver
                        </button>
                      )}

                      <button
                        onClick={() => onEdit(absence)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Plus d'options">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">1</span> à <span className="font-medium">{Math.min(absences.length, 10)}</span> sur <span className="font-medium">{absences.length}</span> résultats
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Précédent
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceList;