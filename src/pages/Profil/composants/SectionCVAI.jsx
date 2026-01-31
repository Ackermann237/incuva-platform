// frontend/src/pages/profil/composant/SectionCVAI.jsx
import React, { useState } from 'react';
import {
  Brain, Wand2, AlertCircle, CheckCircle,
  Loader2, Sparkles, BookOpen, Briefcase,
  GraduationCap, FileText, Copy
} from 'lucide-react';

const SectionCVAI = ({
  formData,
  isEditing,
  handleChange,
  handleArrayChange,
  cvUrl,
  cvName,
  setFormData
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  const analyzeCVWithAI = async () => {
    if (!cvUrl) {
      setError('Veuillez d\'abord uploader votre CV');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAiResults(null);

    try {
      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_url: cvUrl })
      });

      const data = await response.json();

      if (data.success) {
        setAiResults(data.analysis);
      } else {
        setError(data.error || 'Erreur lors de l\'analyse du CV');
      }
    } catch (err) {
      setError('Erreur réseau lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAIAnalysis = () => {
    if (!aiResults || !isEditing) return;

    setApplying(true);

    try {
      // Mettre à jour les compétences
      if (aiResults.skills && aiResults.skills.length > 0) {
        const currentSkills = formData.skills || '';
        const aiSkills = aiResults.skills.join(', ');

        // Fusionner les compétences existantes avec celles de l'IA
        const mergedSkills = currentSkills
          ? `${currentSkills}, ${aiSkills}`
          : aiSkills;

        handleChange({
          target: { name: 'skills', value: mergedSkills }
        });
      }

      // Mettre à jour la bio si elle est vide ou presque
      if (aiResults.summary && (!formData.bio || formData.bio.length < 50)) {
        handleChange({
          target: { name: 'bio', value: aiResults.summary }
        });
      }

      // Ajouter les expériences
      if (aiResults.experience && aiResults.experience.length > 0) {
        const existingExp = formData.experience || [];

        // Filtrer pour éviter les doublons
        const newExperiences = aiResults.experience.filter(newExp =>
          !existingExp.some(existing =>
            existing.title === newExp.title &&
            existing.company === newExp.company
          )
        );

        if (newExperiences.length > 0) {
          const updatedExperience = [...existingExp, ...newExperiences];
          handleArrayChange('experience', updatedExperience.length - 1, 'title', newExperiences[0].title);
          // Note: On ne peut pas directement mettre à jour le tableau via handleArrayChange
          // On va plutôt mettre à jour formData directement
          setFormData(prev => ({
            ...prev,
            experience: updatedExperience
          }));
        }
      }

      // Ajouter les formations
      if (aiResults.education && aiResults.education.length > 0) {
        const existingEdu = formData.education || [];

        const newEducation = aiResults.education.filter(newEdu =>
          !existingEdu.some(existing =>
            existing.degree === newEdu.degree &&
            existing.school === newEdu.school
          )
        );

        if (newEducation.length > 0) {
          const updatedEducation = [...existingEdu, ...newEducation];
          setFormData(prev => ({
            ...prev,
            education: updatedEducation
          }));
        }
      }

      // Mettre à jour les résultats pour montrer ce qui a été appliqué
      setAiResults(prev => ({
        ...prev,
        applied: true
      }));

      setApplying(false);

    } catch (error) {
      console.error('Erreur lors de l\'application des données IA:', error);
      setError('Erreur lors de l\'application des données');
      setApplying(false);
    }
  };

  const applySpecificSection = (section, data) => {
    switch(section) {
      case 'skills':
        const currentSkills = formData.skills || '';
        const newSkills = data.join(', ');
        const mergedSkills = currentSkills
          ? `${currentSkills}, ${newSkills}`
          : newSkills;

        handleChange({
          target: { name: 'skills', value: mergedSkills }
        });
        break;

      case 'bio':
        handleChange({
          target: { name: 'bio', value: data }
        });
        break;

      case 'experience':
        const existingExp = formData.experience || [];
        const updatedExperience = [...existingExp, ...data];
        setFormData(prev => ({
          ...prev,
          experience: updatedExperience
        }));
        break;

      case 'education':
        const existingEdu = formData.education || [];
        const updatedEducation = [...existingEdu, ...data];
        setFormData(prev => ({
          ...prev,
          education: updatedEducation
        }));
        break;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-7 h-7 text-blue-600" />
            Analyse IA de votre CV
          </h2>
          <p className="text-gray-600">
            L'IA analyse votre CV pour extraire automatiquement vos compétences et expériences
          </p>
        </div>

        {cvUrl && !aiResults && (
          <button
            onClick={analyzeCVWithAI}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium flex items-center gap-3 disabled:opacity-70 transition-all"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyser le CV
              </>
            )}
          </button>
        )}
      </div>

      {analyzing && (
        <div className="mb-6 p-6 bg-white rounded-2xl border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Analyse du CV en cours</h3>
              <p className="text-sm text-gray-600">Extraction des informations de votre CV...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" /> {error}
        </div>
      )}

      {aiResults && (
        <div className="space-y-6">
          {/* Résumé des résultats */}
          <div className="bg-white rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Résultats de l'analyse
            </h3>

            {/* Cartes de résultats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Compétences */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">Compétences détectées</h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aiResults.skills?.slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-blue-300 text-blue-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <button
                    onClick={() => applySpecificSection('skills', aiResults.skills)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Ajouter aux compétences
                  </button>
                )}
              </div>

              {/* Expériences */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-800">Expériences détectées</h4>
                </div>
                <div className="space-y-2 mb-3">
                  {aiResults.experience?.slice(0, 2).map((exp, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium truncate">{exp.title}</div>
                      <div className="text-gray-600 text-xs truncate">{exp.company}</div>
                    </div>
                  ))}
                </div>
                {isEditing && aiResults.experience?.length > 0 && (
                  <button
                    onClick={() => applySpecificSection('experience', aiResults.experience)}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Ajouter aux expériences
                  </button>
                )}
              </div>

              {/* Formations */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-800">Formations détectées</h4>
                </div>
                <div className="space-y-2 mb-3">
                  {aiResults.education?.slice(0, 2).map((edu, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium truncate">{edu.degree}</div>
                      <div className="text-gray-600 text-xs truncate">{edu.school}</div>
                    </div>
                  ))}
                </div>
                {isEditing && aiResults.education?.length > 0 && (
                  <button
                    onClick={() => applySpecificSection('education', aiResults.education)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Ajouter aux formations
                  </button>
                )}
              </div>

              {/* Résumé */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-gray-800">Résumé professionnel</h4>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                  {aiResults.summary || "Aucun résumé extrait"}
                </p>
                {isEditing && aiResults.summary && (
                  <button
                    onClick={() => applySpecificSection('bio', aiResults.summary)}
                    className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Utiliser comme bio
                  </button>
                )}
              </div>
            </div>

            {/* Bouton pour appliquer tout */}
            {isEditing && (
              <button
                onClick={applyAIAnalysis}
                disabled={applying}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium flex items-center justify-center gap-3 disabled:opacity-70 transition-all"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Application en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Appliquer toutes les informations
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {!cvUrl && (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium mb-2">Aucun CV détecté</p>
          <p className="text-sm">Uploader votre CV pour activer l'analyse automatique</p>
        </div>
      )}
    </div>
  );
};

export default SectionCVAI;