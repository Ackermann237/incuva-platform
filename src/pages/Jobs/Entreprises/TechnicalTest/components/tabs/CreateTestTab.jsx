// src/pages/Jobs/Entreprises/TechnicalTest/components/tabs/CreateTestTab.jsx
import React from 'react';
import { Plus, Save, Eye, Loader2, CheckSquare, Code, FileText, Trash2, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import QuestionItem from '../questions/QuestionItem';
import MCQTips from '../questions/MCQTips';

const CreateTestTab = ({
  manualTest,
  setManualTest,
  addQuestion,
  updateQuestion,
  removeQuestion,
  addMcqOption,
  updateMcqOption,
  removeMcqOption,
  handleMcqTypeChange,
  handleSaveTest,
  loading,
  navigate,
  setActiveTab,
  job
}) => {
  // Validation spécifique pour les questions MCQ
  const validateMcqQuestion = (question) => {
    if (question.type !== 'mcq') return { valid: true, errors: [] };

    const errors = [];

    if (!question.options || question.options.length < 2) {
      errors.push(`La question ${question.order} (QCM) doit avoir au moins 2 options`);
    }

    if (question.options) {
      const correctOptions = question.options.filter(opt => opt.is_correct).length;
      const falseOptions = question.options.filter(opt => !opt.is_correct).length;

      if (correctOptions === 0) {
        errors.push(`La question ${question.order} (QCM) doit avoir au moins une réponse correcte`);
      }

      if (falseOptions === 0) {
        errors.push(`La question ${question.order} (QCM) doit avoir au moins une réponse fausse`);
      }

      if (!question.multiple_correct && correctOptions > 1) {
        errors.push(`La question ${question.order} (QCM à réponse unique) doit avoir exactement une réponse correcte`);
      }

      // Vérifier les options vides
      question.options.forEach((opt, idx) => {
        if (!opt.text.trim()) {
          errors.push(`L'option ${String.fromCharCode(65 + idx)} de la question ${question.order} est vide`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  // Validation complète du test avant sauvegarde
  const validateTestBeforeSave = () => {
    const errors = [];

    // Validation de base
    if (!manualTest.title.trim()) {
      errors.push('Le titre du test est requis');
    }

    if (manualTest.questions.length === 0) {
      errors.push('Ajoutez au moins une question');
    }

    if (manualTest.duration < 10 || manualTest.duration > 300) {
      errors.push('La durée doit être entre 10 et 300 minutes');
    }

    if (manualTest.passing_score < 0 || manualTest.passing_score > 100) {
      errors.push('Le score de passage doit être entre 0% et 100%');
    }

    // Validation de chaque question
    manualTest.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push(`La question ${index + 1} est vide`);
      }

      if (question.points < 0) {
        errors.push(`La question ${index + 1} ne peut pas avoir de points négatifs`);
      }

      // Validation spécifique au type
      const mcqValidation = validateMcqQuestion(question);
      if (!mcqValidation.valid) {
        errors.push(...mcqValidation.errors);
      }

      if (question.type === 'coding' && !question.expected_output?.trim()) {
        errors.push(`La question ${index + 1} (Code) doit avoir une sortie attendue`);
      }

      if (question.type === 'true_false' && question.correct_answer === undefined) {
        errors.push(`La question ${index + 1} (Vrai/Faux) doit avoir une réponse correcte définie`);
      }
    });

    return errors;
  };

  // Fonction de sauvegarde améliorée avec validation
  const handleSaveWithValidation = async () => {
    const errors = validateTestBeforeSave();

    if (errors.length > 0) {
      // Afficher la première erreur
      alert(`Erreur de validation :\n\n• ${errors[0]}${errors.length > 1 ? '\n• ' + errors.slice(1).join('\n• ') : ''}`);
      return;
    }

    await handleSaveTest();
  };

  // Compter les questions par type
  const questionTypeCounts = manualTest.questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  // Calculer le total des points
  const totalPoints = manualTest.questions.reduce((total, q) => {
    return total + (q.points || 1);
  }, 0);

  // Réorganiser les questions
  const moveQuestion = (fromIndex, toIndex) => {
    const newQuestions = [...manualTest.questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);

    // Mettre à jour les ordres
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));

    setManualTest(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Créer un test technique</h2>

        {/* Configuration générale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du test *
            </label>
            <input
              type="text"
              value={manualTest.title}
              onChange={(e) => setManualTest(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Test technique Développeur Full Stack"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (minutes) *
            </label>
            <input
              type="number"
              value={manualTest.duration}
              onChange={(e) => setManualTest(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              min="10"
              max="180"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score de passage (%) *
            </label>
            <input
              type="number"
              value={manualTest.passing_score}
              onChange={(e) => setManualTest(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 70 }))}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={manualTest.is_public}
                onChange={(e) => setManualTest(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Test public (accessible par lien)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={manualTest.allow_retake}
                onChange={(e) => setManualTest(prev => ({ ...prev, allow_retake: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Autoriser une nouvelle tentative</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={manualTest.show_results}
                onChange={(e) => setManualTest(prev => ({ ...prev, show_results: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Afficher les résultats après le test</span>
            </label>
          </div>
        </div>

        {/* Mode de notation */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mode de notation
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
              manualTest.grading_mode === 'auto' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="grading_mode"
                  value="auto"
                  checked={manualTest.grading_mode === 'auto'}
                  onChange={(e) => setManualTest(prev => ({ ...prev, grading_mode: e.target.value }))}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Notation automatique</div>
                  <div className="text-sm text-gray-600 mt-1">
                    L'IA évalue automatiquement les réponses
                  </div>
                </div>
              </div>
            </label>

            <label className={`p-4 border rounded-lg cursor-pointer transition-all ${
              manualTest.grading_mode === 'manual' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="grading_mode"
                  value="manual"
                  checked={manualTest.grading_mode === 'manual'}
                  onChange={(e) => setManualTest(prev => ({ ...prev, grading_mode: e.target.value }))}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Notation manuelle</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Vous notez vous-même les réponses
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnelle)
          </label>
          <textarea
            value={manualTest.description}
            onChange={(e) => setManualTest(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Instructions pour les candidats..."
          />
        </div>
      </div>

      {/* Statistiques du test */}
      {manualTest.questions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Résumé du test</h3>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{manualTest.questions.length}</div>
                  <div className="text-sm text-blue-800">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                  <div className="text-sm text-blue-800">Points total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{manualTest.duration}</div>
                  <div className="text-sm text-blue-800">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{manualTest.passing_score}%</div>
                  <div className="text-sm text-blue-800">Score min</div>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="text-sm text-blue-900 font-medium mb-2">Répartition par type :</div>
              <div className="flex flex-wrap gap-2">
                {questionTypeCounts.mcq && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {questionTypeCounts.mcq} QCM
                  </span>
                )}
                {questionTypeCounts.coding && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {questionTypeCounts.coding} Code
                  </span>
                )}
                {questionTypeCounts.open_ended && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {questionTypeCounts.open_ended} Ouvertes
                  </span>
                )}
                {questionTypeCounts.true_false && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                    {questionTypeCounts.true_false} Vrai/Faux
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Questions ({manualTest.questions.length})
          </h3>
        </div>

        {/* Conseils pour les QCM */}
        {manualTest.questions.some(q => q.type === 'mcq') && <MCQTips />}

        {manualTest.questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucune question ajoutée</p>
            <p className="text-gray-500 text-sm mb-4">
              Commencez par ajouter votre première question en cliquant sur les boutons ci-dessous
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {manualTest.questions.map((question, index) => (
              <div key={question.id} className="relative">
                {/* Boutons de réorganisation */}
                <div className="absolute -left-12 top-4 flex flex-col gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => moveQuestion(index, index - 1)}
                      className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      title="Déplacer vers le haut"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < manualTest.questions.length - 1 && (
                    <button
                      onClick={() => moveQuestion(index, index + 1)}
                      className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      title="Déplacer vers le bas"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <QuestionItem
                  question={question}
                  index={index}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                  addMcqOption={addMcqOption}
                  updateMcqOption={updateMcqOption}
                  removeMcqOption={removeMcqOption}
                  handleMcqTypeChange={handleMcqTypeChange}
                />
              </div>
            ))}
          </div>
        )}

        {/* Conseils de fin */}
        {manualTest.questions.length > 0 && manualTest.questions.length < 5 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>Conseil :</strong> Pour un test complet, nous recommandons d'ajouter au moins 5-10 questions.
                Cela permet d'évaluer plus précisément les compétences des candidats.
              </p>
            </div>
          </div>
        )}

        {/* ZONE D'AJOUT DE QUESTIONS EN BAS */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 mt-6">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-3">
              Ajouter une nouvelle question
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => addQuestion('mcq')}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-colors"
                title="Question à choix multiple"
              >
                <CheckSquare className="w-4 h-4" />
                <span>QCM</span>
              </button>
              <button
                onClick={() => addQuestion('coding')}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 transition-colors"
                title="Exercice de programmation"
              >
                <Code className="w-4 h-4" />
                <span>Code</span>
              </button>
              <button
                onClick={() => addQuestion('open_ended')}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors"
                title="Question à réponse ouverte"
              >
                <FileText className="w-4 h-4" />
                <span>Réponse ouverte</span>
              </button>
              <button
                onClick={() => addQuestion('true_false')}
                className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 flex items-center gap-2 transition-colors"
                title="Question Vrai/Faux"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Vrai/Faux</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Annuler
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (manualTest.questions.length > 0) {
                setActiveTab('preview');
              }
            }}
            disabled={manualTest.questions.length === 0}
            className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="w-4 h-4" />
            Prévisualiser
          </button>

          <button
            onClick={handleSaveWithValidation}
            disabled={loading || manualTest.questions.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer le test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestTab;