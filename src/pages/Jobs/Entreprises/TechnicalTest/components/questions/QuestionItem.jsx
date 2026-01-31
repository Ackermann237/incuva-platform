// src/pages/Jobs/Entreprises/TechnicalTest/components/questions/QuestionItem.jsx
import React from 'react';
import { Plus, X, Trash2, CheckSquare, Code, FileText, AlertCircle } from 'lucide-react';

const QuestionItem = ({
  question,
  index,
  updateQuestion,
  removeQuestion,
  addMcqOption,
  updateMcqOption,
  removeMcqOption
}) => {
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'coding': return <Code className="w-4 h-4 text-green-600" />;
      case 'open_ended': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'true_false': return <CheckSquare className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Question à choix multiple';
      case 'coding': return 'Exercice de code';
      case 'open_ended': return 'Réponse ouverte';
      case 'true_false': return 'Vrai ou Faux';
      default: return type;
    }
  };

  // Valider les options MCQ
  const validateMcqOptions = () => {
    if (question.type !== 'mcq' || !question.options) return { valid: true };

    const correctOptions = question.options.filter(opt => opt.is_correct).length;
    const falseOptions = question.options.filter(opt => !opt.is_correct).length;

    if (correctOptions === 0) {
      return { valid: false, message: "⚠️ Au moins une option doit être correcte" };
    }

    if (falseOptions === 0) {
      return { valid: false, message: "⚠️ Au moins une option doit être fausse" };
    }

    if (!question.multiple_correct && correctOptions > 1) {
      return { valid: false, message: "⚠️ Une seule réponse possible pour ce type de question" };
    }

    // Vérifier les options vides
    const emptyOptions = question.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      return { valid: false, message: "⚠️ Toutes les options doivent avoir du texte" };
    }

    return { valid: true };
  };

  const validation = validateMcqOptions();

  // Calculer le nombre de réponses correctes
  const correctCount = question.type === 'mcq'
    ? question.options?.filter(opt => opt.is_correct).length || 0
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center font-semibold shadow-sm">
            {index + 1}
          </span>
          <div className="flex items-center gap-2">
            {getQuestionTypeIcon(question.type)}
            <div>
              <span className="text-sm font-medium text-gray-700">
                {getQuestionTypeLabel(question.type)}
              </span>
              {question.type === 'mcq' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {question.multiple_correct ? 'Réponses multiples' : 'Réponse unique'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {correctCount} correcte(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Points:</span>
            <input
              type="number"
              value={question.points}
              onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => removeQuestion(question.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Supprimer cette question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Énoncé de la question */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Énoncé de la question *
        </label>
        <textarea
          value={question.question}
          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          placeholder="Écrivez votre question ici..."
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
        />
      </div>

      {/* Contenu spécifique au type de question */}
      {question.type === 'mcq' && (
        <div className="space-y-4">
          {!validation.valid && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{validation.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={question.multiple_correct}
                    onChange={(e) => {
                      const newMultipleCorrect = e.target.checked;
                      let updatedOptions = [...question.options];

                      // Si on passe à une seule réponse, ne garder que la première réponse correcte
                      if (!newMultipleCorrect) {
                        const correctOptions = updatedOptions.filter(opt => opt.is_correct);
                        if (correctOptions.length > 1) {
                          // Garder seulement la première réponse correcte
                          updatedOptions = updatedOptions.map(opt => ({
                            ...opt,
                            is_correct: opt.id === correctOptions[0].id
                          }));
                        }
                      }

                      updateQuestion(question.id, {
                        multiple_correct: newMultipleCorrect,
                        options: updatedOptions
                      });
                    }}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    question.multiple_correct ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      question.multiple_correct ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {question.multiple_correct ? 'Plusieurs réponses possibles' : 'Une seule réponse possible'}
                </span>
              </label>

              <div className="text-sm">
                <span className="text-green-600 font-medium">{correctCount}</span>
                <span className="text-gray-500"> correcte(s) • </span>
                <span className="text-red-600 font-medium">{question.options?.length - correctCount}</span>
                <span className="text-gray-500"> fausse(s)</span>
              </div>
            </div>

            <button
              onClick={() => addMcqOption(question.id)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une option
            </button>
          </div>

          <div className="space-y-2">
            {question.options?.map((option, optIndex) => (
              <div key={option.id} className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${
                option.is_correct ? 'border-green-300' : 'border-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  {/* Input checkbox/radio */}
                  <div className="flex items-center">
                    <input
                      type={question.multiple_correct ? 'checkbox' : 'radio'}
                      checked={option.is_correct}
                      onChange={(e) => {
                        const isCorrect = e.target.checked;

                        if (!question.multiple_correct && isCorrect) {
                          // Pour une seule réponse, désélectionner toutes les autres
                          const newOptions = question.options.map(opt => ({
                            ...opt,
                            is_correct: opt.id === option.id
                          }));
                          updateQuestion(question.id, { options: newOptions });
                        } else {
                          // Pour plusieurs réponses, juste mettre à jour cette option
                          updateMcqOption(question.id, option.id, { is_correct: isCorrect });
                        }
                      }}
                      name={`question-${question.id}`}
                      id={`option-${question.id}-${option.id}`}
                      className={question.multiple_correct
                        ? 'w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        : 'w-4 h-4 text-blue-600 focus:ring-blue-500'
                      }
                    />
                  </div>

                  {/* Lettre de l'option */}
                  <label
                    htmlFor={`option-${question.id}-${option.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full border font-medium cursor-pointer select-none"
                    style={{
                      backgroundColor: option.is_correct ? '#dcfce7' : '#fef2f2',
                      borderColor: option.is_correct ? '#86efac' : '#fecaca',
                      color: option.is_correct ? '#065f46' : '#991b1b'
                    }}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </label>
                </div>

                {/* Champ de texte */}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateMcqOption(question.id, option.id, { text: e.target.value })}
                  placeholder={`Texte de l'option ${String.fromCharCode(65 + optIndex)}`}
                  className="flex-1 px-3 py-2 border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent"
                />

                {/* Badge et bouton de suppression */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    option.is_correct 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {option.is_correct ? 'Correcte' : 'Fausse'}
                  </span>

                  {question.options.length > 2 && (
                    <button
                      onClick={() => removeMcqOption(question.id, option.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer cette option"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conseils pour créer de bonnes questions MCQ */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Conseils pour des questions MCQ efficaces :
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 3-4 options par question idéalement</li>
                  <li>• Les réponses fausses doivent être plausibles mais incorrectes</li>
                  <li>• Les options doivent être de longueur similaire</li>
                  <li>• Éviter les indices grammaticales évidents</li>
                  <li>• Distribuer les bonnes réponses aléatoirement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {question.type === 'coding' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Langage de programmation
            </label>
            <select
              value={question.language}
              onChange={(e) => updateQuestion(question.id, { language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template de code (optionnel)
            </label>
            <textarea
              value={question.code_template}
              onChange={(e) => updateQuestion(question.id, { code_template: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="function solve() {↵  // Votre code ici↵}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sortie attendue *
            </label>
            <input
              type="text"
              value={question.expected_output}
              onChange={(e) => updateQuestion(question.id, { expected_output: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: 'Hello World' ou 42 ou [1, 2, 3]"
            />
          </div>
        </div>
      )}

      {question.type === 'open_ended' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mots-clés attendus (séparés par des virgules)
            </label>
            <input
              type="text"
              value={question.expected_keywords?.join(', ') || ''}
              onChange={(e) => {
                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                updateQuestion(question.id, { expected_keywords: keywords });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: React, State, Hooks, Components, Props"
            />
            <p className="text-xs text-gray-500 mt-1">
              Les mots-clés sont utilisés pour l'évaluation automatique
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite de caractères
            </label>
            <input
              type="number"
              value={question.max_length}
              onChange={(e) => updateQuestion(question.id, { max_length: parseInt(e.target.value) || 500 })}
              min="50"
              max="5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Sélectionnez la réponse correcte :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
              question.correct_answer === true 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                checked={question.correct_answer === true}
                onChange={() => updateQuestion(question.id, { correct_answer: true })}
                name={`tf-${question.id}`}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-medium">
                  V
                </div>
                <span className={`font-medium ${
                  question.correct_answer === true ? 'text-green-700' : 'text-gray-700'
                }`}>
                  Vrai
                </span>
                {question.correct_answer === true && (
                  <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Correct
                  </span>
                )}
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
              question.correct_answer === false 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                checked={question.correct_answer === false}
                onChange={() => updateQuestion(question.id, { correct_answer: false })}
                name={`tf-${question.id}`}
                className="w-4 h-4 text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center font-medium">
                  F
                </div>
                <span className={`font-medium ${
                  question.correct_answer === false ? 'text-red-700' : 'text-gray-700'
                }`}>
                  Faux
                </span>
                {question.correct_answer === false && (
                  <span className="ml-auto text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    Correct
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;