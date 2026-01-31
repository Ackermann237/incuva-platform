import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, DollarSign, Briefcase, X } from 'lucide-react';

// Fonction utilitaire pour formater le texte (gras)
const formatDescription = (text) => {
  if (!text) return null;
  // Remplace **texte** par <strong>texte</strong>
  // Utilise également \n pour gérer les retours à la ligne si le whitespace-pre-wrap n'est pas suffisant
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index}>{content}</strong>;
    }
    return part;
  });
};


export default function JobDetailModalContent({ selectedJob, setModalOpen }) {
  const navigate = useNavigate();

  const goToApply = (jobId) => {
    setModalOpen(false);
    navigate(`/jobs/apply/${jobId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Détails de l'offre</h2>
        <button
          onClick={() => setModalOpen(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={24} />
        </button>
      </div>

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-8 h-8 text-purple-600" />
          <h3 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedJob.company_name || "Entreprise non spécifiée"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>{selectedJob.location || "Localisation non spécifiée"}</span>
          </div>
          {selectedJob.salary_range && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <DollarSign className="w-6 h-6" />
              <span>{selectedJob.salary_range}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description complète - UTILISATION DE LA NOUVELLE FONCTION DE FORMATAGE */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Description du poste</h4>
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {/* L'utilisation de formatDescription dans un élément <pre-wrap> permet de gérer le gras tout en conservant les sauts de ligne */}
          {formatDescription(selectedJob.description)}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h5 className="font-semibold text-gray-800 mb-3">Compétences requises</h5>
          <div className="flex flex-wrap gap-2">
            {selectedJob.skills?.length > 0 ? (
              selectedJob.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Non spécifiées</p>
            )}
          </div>
        </div>
        <div>
          <h5 className="font-semibold text-gray-800 mb-3">Type de contrat</h5>
          <p className="text-gray-700">
            {selectedJob.contract_type || "Non spécifié"}
          </p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setModalOpen(false)}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Fermer
        </button>
        <button
          onClick={() => goToApply(selectedJob.job_id)}
          className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-sm flex items-center gap-2"
        >
          <Briefcase className="w-5 h-5" />
          Postuler maintenant
        </button>
      </div>
    </div>
  );
}