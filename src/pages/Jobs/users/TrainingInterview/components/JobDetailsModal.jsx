// src/pages/Jobs/users/TrainingInterview/components/JobDetailsModal.jsx
import React from 'react';
import {
  X, Briefcase, MapPin, DollarSign, Calendar, FileText,
  CheckCircle, Users, Building, Globe, Award, Clock
} from 'lucide-react';

export default function JobDetailsModal({ job, onClose }) {

  // Nettoie le texte de tout marquage Markdown (principalement les **)
  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').trim();
  };

  // Fonction de formatage du texte pour la description principale
  const formatDescription = (content) => {
    if (!content) return "";

    // 1. Supprimer les **
    let formatted = content.replace(/\*\*/g, '');

    // 2. Remplacer les tirets par des listes stylisées si nécessaire (optionnel ici car on a extractSections)
    // 3. Gérer les retours à la ligne
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
  };

  // Extraire les sections de la description et nettoyer les symboles
  const extractSections = (description) => {
    if (!description) return { description: '', missions: [], skills: [], details: [] };

    const sections = {
      description: '',
      missions: [],
      skills: [],
      details: []
    };

    // Nettoyage global initial des doubles astérisques pour faciliter le découpage
    const cleanRaw = description.replace(/\*\*/g, '');

    // Extraire la description principale (avant "Missions principales")
    const missionsIndex = cleanRaw.indexOf('Missions principales:');
    if (missionsIndex > -1) {
      sections.description = cleanRaw.substring(0, missionsIndex).trim();
    } else {
      sections.description = cleanRaw;
    }

    // Extraire les missions
    const missionsMatch = cleanRaw.match(/Missions principales:(.*?)(?=Compétences requises:|Type de contrat:|$)/s);
    if (missionsMatch && missionsMatch[1]) {
      sections.missions = missionsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.length > 5) // Garde les lignes de contenu
        .map(line => line.replace(/^- /, '').trim());
    }

    // Extraire les compétences
    const skillsMatch = cleanRaw.match(/Compétences requises:(.*?)(?=Type de contrat:|$)/s);
    if (skillsMatch && skillsMatch[1]) {
      sections.skills = skillsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.length > 2)
        .map(line => line.replace(/^- /, '').trim());
    }

    // Extraire les détails additionnels
    const detailsMatch = cleanRaw.match(/Type de contrat:(.*?)(?=Lieu:|$)/s);
    if (detailsMatch) {
      sections.details.push(`Type de contrat: ${detailsMatch[1].trim()}`);
    }

    const locationMatch = cleanRaw.match(/Lieu:(.*?)$/s);
    if (locationMatch) {
      sections.details.push(`Lieu: ${locationMatch[1].trim()}`);
    }

    return sections;
  };

  const sections = extractSections(job.description || job.full_description || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header de la modale */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{cleanText(job.title)}</h3>
              <p className="text-sm text-gray-600">{cleanText(job.company_name) || 'Entreprise'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Informations rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {job.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <MapPin className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Localisation</p>
                  <p className="font-medium text-gray-900">{cleanText(job.location)}</p>
                </div>
              </div>
            )}

            {job.salary_range && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <DollarSign className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Salaire</p>
                  <p className="font-medium text-gray-900">{cleanText(job.salary_range)}</p>
                </div>
              </div>
            )}

            {job.contract_type && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <FileText className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Contrat</p>
                  <p className="font-medium text-gray-900">{cleanText(job.contract_type)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description principale */}
          {sections.description && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Description du poste
              </h4>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatDescription(sections.description) }}
                />
              </div>
            </div>
          )}

          {/* Missions principales */}
          {sections.missions.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Missions principales
              </h4>
              <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                <ul className="space-y-3">
                  {sections.missions.map((mission, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{mission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Compétences requises */}
          {sections.skills.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Compétences requises
              </h4>
              <div className="flex flex-wrap gap-2">
                {sections.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold border border-purple-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Détails additionnels */}
          {sections.details.length > 0 && (
            <div className="pb-4">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Informations complémentaires
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 font-medium">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métadonnées de l'offre */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 italic">
              {job.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Publiée le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {(job.city || job.country) && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>{job.city}{job.city && job.country ? ', ' : ''}{job.country}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer de la modale */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-500 hover:text-gray-800 font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}