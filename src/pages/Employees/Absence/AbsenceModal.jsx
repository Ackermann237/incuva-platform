// src/pages/Employees/Absence/AbsenceModal.jsx
import React, { useState } from 'react';
import { User, Calendar, FileText, AlertCircle, Upload } from 'lucide-react';

const AbsenceModal = ({
  editingAbsence,
  newAbsence,
  setNewAbsence,
  employees,
  onSave,
  onClose
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
          <h3 className="text-xl font-bold text-gray-900">
            {editingAbsence ? 'Modifier l\'absence' : 'Nouvelle absence'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sélection de l'employé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Employé
            </label>
            <select
              value={newAbsence.employee_id}
              onChange={(e) => setNewAbsence({ ...newAbsence, employee_id: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            >
              <option value="">Sélectionner un employé</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.candidate_name || employee.name}
                  {employee.position && ` (${employee.position})`}
                  {employee.department && ` - ${employee.department}`}
                </option>
              ))}
            </select>
          </div>

          {/* Type d'absence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'absence
            </label>
            <select
              value={newAbsence.type}
              onChange={(e) => setNewAbsence({ ...newAbsence, type: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vacation">Congés payés</option>
              <option value="sick">Maladie</option>
              <option value="maternity">Maternité</option>
              <option value="paternity">Paternité</option>
              <option value="training">Formation</option>
              <option value="personal">Personnel</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date de début
              </label>
              <input
                type="date"
                value={newAbsence.start_date}
                onChange={(e) => setNewAbsence({ ...newAbsence, start_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={newAbsence.end_date}
                onChange={(e) => setNewAbsence({ ...newAbsence, end_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Calcul de durée */}
          {newAbsence.start_date && newAbsence.end_date && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                Durée: {Math.ceil((new Date(newAbsence.end_date) - new Date(newAbsence.start_date)) / (1000 * 60 * 60 * 24)) + 1} jours
              </div>
            </div>
          )}

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de l'absence
            </label>
            <input
              type="text"
              value={newAbsence.reason}
              onChange={(e) => setNewAbsence({ ...newAbsence, reason: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Raison de l'absence..."
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes supplémentaires
            </label>
            <textarea
              value={newAbsence.notes}
              onChange={(e) => setNewAbsence({ ...newAbsence, notes: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Informations supplémentaires, détails..."
            />
          </div>

          {/* Contact d'urgence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Contact d'urgence
            </label>
            <input
              type="text"
              value={newAbsence.emergency_contact}
              onChange={(e) => setNewAbsence({ ...newAbsence, emergency_contact: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom et téléphone..."
            />
          </div>

          {/* Upload de documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents joints
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Glissez-déposez vos fichiers ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer inline-block"
              >
                Choisir des fichiers
              </label>
            </div>

            {/* Liste des fichiers uploadés */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium transition-all"
          >
            {editingAbsence ? 'Mettre à jour' : 'Enregistrer l\'absence'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceModal;