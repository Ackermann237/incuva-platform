// src/pages/Contracts/components/DetailContract.jsx
import React from 'react';
import { FileCheck, Loader2, Briefcase, MinusCircle, Send } from 'lucide-react';

export default function DetailContract({
  formData,
  jobOffers,
  selectedJobId,
  isManualMode,
  loadingJobs,
  generating,
  loading,
  preview,
  handleManualModeToggle,
  handleJobSelect,
  handleChange,
  handleGenerate,
  handleSendContract,
  aiMode = "auto"
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <FileCheck className="w-6 h-6 text-blue-600" />
        Détails du contrat
      </h2>

      <form className="space-y-6">
        {/* Choix du mode de saisie */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            Mode de saisie :
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleManualModeToggle(false)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${!isManualMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Sélectionner Offre
            </button>
            <button
              type="button"
              onClick={handleManualModeToggle}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${isManualMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              Saisie Libre
            </button>
          </div>
        </div>

        {/* 1. SÉLECTION DE L'OFFRE (Si non manuel) */}
        {!isManualMode ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sélectionnez une Offre publiée *
            </label>
            <select
              value={selectedJobId}
              onChange={handleJobSelect}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              disabled={loadingJobs}
            >
              <option value="">
                {loadingJobs ? "Chargement des offres..." : "Sélectionnez une offre..."}
              </option>
              {jobOffers.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title} ({job.contract_type} - {job.salary_range})
                </option>
              ))}
            </select>
            {selectedJobId && (
              <p className="mt-2 text-xs text-green-700 flex items-center gap-1">
                <Briefcase className="w-3 h-3"/> Les champs ci-dessous sont pré-remplis
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-1 p-2 bg-blue-50 rounded-lg">
            <MinusCircle className="w-4 h-4 text-blue-600"/> Contrat basé sur une saisie libre.
          </p>
        )}

        {/* 2. POSTE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Poste *</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
            placeholder="Développeur Full Stack"
            required
            disabled={selectedJobId && !isManualMode}
          />
        </div>

        {/* 3. SALAIRE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Salaire brut annuel (€) *</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
            placeholder="45000"
            min="0"
            required
            disabled={selectedJobId && !isManualMode}
          />
        </div>

        {/* 4. TYPE DE CONTRAT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de contrat *</label>
          <select
            name="contract_type"
            value={formData.contract_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
            required
            disabled={selectedJobId && !isManualMode}
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Freelance">Freelance</option>
            <option value="Stage">Stage</option>
            <option value="Alternance">Alternance</option>
          </select>
        </div>

        {/* 5. DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optionnel)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none"
            placeholder="Primes, avantages, télétravail..."
          />
        </div>

        {/* Bouton de génération conditionnel */}
        <div className="flex gap-4 pt-4">
          {aiMode !== "manual" && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || loadingJobs || !formData.position || !formData.salary}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération...
                </>
              ) : aiMode === "prompt" ? (
                "Générer avec Prompt"
              ) : (
                "Générer automatiquement"
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleSendContract}
            disabled={loading || !preview}
            className={`${aiMode === "manual" ? 'flex-1' : 'flex-1'} px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer à signer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}