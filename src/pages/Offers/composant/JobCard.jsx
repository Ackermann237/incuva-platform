import React from 'react';
import { Building2, MapPin, DollarSign, Clock } from 'lucide-react';

// Fonction utilitaire pour formater le texte (gras)
const formatDescription = (text) => {
  if (!text) return null;
  // Remplace **texte** par <strong>texte</strong>
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index}>{content}</strong>;
    }
    return part;
  });
};

export default function JobCard({ job, view, openJobModal }) {
  const isGrid = view === "grid";

  return (
    <div
      onClick={() => openJobModal(job)}
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden ${
        isGrid ? "col-span-1" : "col-span-full"
      }`}
    >
      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
            {job.title}
          </h3>
          {/* Indicateur de nouveau (simulé) */}
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>

        {/* Infos principales */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-gray-700">
            <Building2 className="w-5 h-5 text-purple-500" />
            <span className="font-medium">{job.company_name || "Entreprise non spécifiée"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>{job.location || "Localisation non spécifiée"}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <DollarSign className="w-5 h-5" />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>

        {/* Description - UTILISATION DE LA NOUVELLE FONCTION DE FORMATAGE */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-5 leading-relaxed">
          {formatDescription(job.description)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Publiée le {new Date(job.created_at).toLocaleDateString("fr-FR")}</span>
          </div>
          <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
            Voir les détails →
          </span>
        </div>
      </div>
    </div>
  );
}