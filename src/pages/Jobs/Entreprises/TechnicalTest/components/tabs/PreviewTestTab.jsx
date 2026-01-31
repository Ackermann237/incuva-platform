// src/pages/Jobs/Entreprises/TechnicalTest/components/tabs/PreviewTestTab.jsx
import React, { useState } from 'react';
import {
  Save,
  Copy,
  Eye,
  ChevronLeft,
  Edit2,
  Clock,
  BarChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Code,
  CheckSquare,
  Printer,
  Download,
  Share2,
  Link
} from 'lucide-react';

const PreviewTestTab = ({ test, onBack, onEdit, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'answers'

  // Calculer les statistiques
  const totalPoints = test.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
  const totalDuration = test.duration || 60;
  const passingScore = test.passing_score || 70;

  // Compter les questions par type
  const questionTypeCounts = test.questions?.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Fonction pour copier le lien
  const handleCopyLink = () => {
    const link = `${window.location.origin}/technical-test/${test.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Fonction pour exporter en PDF (simulé)
  const handleExportPDF = () => {
    alert("L'export PDF sera implémenté prochainement !");
  };

  // Fonction pour imprimer
  const handlePrint = () => {
    window.print();
  };

  // Fonction pour partager
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: test.title,
        text: `Test technique: ${test.title}`,
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  // Fonction pour obtenir l'icône du type de question
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return <CheckSquare className="w-4 h-4" />;
      case 'coding': return <Code className="w-4 h-4" />;
      case 'open_ended': return <FileText className="w-4 h-4" />;
      case 'true_false': return <CheckSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir le libellé du type de question
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Question à choix multiple';
      case 'coding': return 'Exercice de code';
      case 'open_ended': return 'Réponse ouverte';
      case 'true_false': return 'Vrai ou Faux';
      default: return type;
    }
  };

  // Fonction pour obtenir la couleur du type de question
  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'mcq': return 'blue';
      case 'coding': return 'green';
      case 'open_ended': return 'purple';
      case 'true_false': return 'amber';
      default: return 'gray';
    }
  };

  // Rendu d'une question MCQ
  const renderMcqQuestion = (question, index) => {
    const correctCount = question.options?.filter(opt => opt.is_correct).length || 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600">
            {question.multiple_correct ? 'Réponses multiples' : 'Réponse unique'} •
            {correctCount} réponse(s) correcte(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options?.map((option, optIndex) => (
            <div
              key={optIndex}
              className={`p-3 border rounded-lg transition-all ${
                option.is_correct 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Lettre de l'option */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    option.is_correct 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}
                </div>

                {/* Texte de l'option */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    option.is_correct ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {option.text}
                  </p>

                  {/* Badge correct/faux */}
                  <div className="mt-2">
                    {option.is_correct ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Réponse correcte
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <XCircle className="w-3 h-3" />
                        Réponse fausse
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicateur visuel */}
                <div className={`w-3 h-3 rounded-full ${
                  option.is_correct ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Note pour le candidat */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> {question.multiple_correct
                ? `Plusieurs réponses peuvent être correctes. ${correctCount} réponse(s) correcte(s) dans cette question.`
                : 'Une seule réponse est correcte.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Rendu d'une question Vrai/Faux
  const renderTrueFalseQuestion = (question, index) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option Vrai */}
          <div className={`p-4 border rounded-lg ${
            question.correct_answer === true 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  question.correct_answer === true 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  <span className="font-bold">V</span>
                </div>
                <span className={`font-bold ${
                  question.correct_answer === true ? 'text-green-800' : 'text-gray-700'
                }`}>
                  Vrai
                </span>
              </div>
              {question.correct_answer === true && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Correct
                </span>
              )}
            </div>
          </div>

          {/* Option Faux */}
          <div className={`p-4 border rounded-lg ${
            question.correct_answer === false 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  question.correct_answer === false 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  <span className="font-bold">F</span>
                </div>
                <span className={`font-bold ${
                  question.correct_answer === false ? 'text-red-800' : 'text-gray-700'
                }`}>
                  Faux
                </span>
              </div>
              {question.correct_answer === false && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  <XCircle className="w-4 h-4" />
                  Correct
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu d'une question de code
  const renderCodingQuestion = (question, index) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Langage :</h5>
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-mono font-medium">{question.language || 'javascript'}</span>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Sortie attendue :</h5>
            <div className="p-3 bg-gray-100 rounded-lg font-mono">
              <code>{question.expected_output || 'Non spécifiée'}</code>
            </div>
          </div>
        </div>

        {question.code_template && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Template de code :</h5>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {question.code_template}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // Rendu d'une question ouverte
  const renderOpenEndedQuestion = (question, index) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Limite de caractères :</h5>
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">{question.max_length || 500} caractères</span>
            </div>
          </div>

          {question.expected_keywords?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Mots-clés attendus :</h5>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-wrap gap-1">
                  {question.expected_keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zone de réponse pour prévisualisation */}
        <div className="mt-3">
          <h5 className="text-sm font-medium text-gray-700 mb-1">Zone de réponse :</h5>
          <textarea
            disabled
            rows="4"
            placeholder="Le candidat écrira sa réponse ici..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>
    );
  };

  // Rendu d'une question individuelle
  const renderQuestion = (question, index) => {
    const typeColor = getQuestionTypeColor(question.type);
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      amber: 'bg-amber-100 text-amber-800 border-amber-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <div key={question.id || index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Numéro de question */}
            <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-md">
              {index + 1}
            </span>

            <div>
              {/* Type et difficulté */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[typeColor]}`}>
                  {getQuestionTypeIcon(question.type)}
                  {getQuestionTypeLabel(question.type)}
                </span>

                {question.difficulty && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Difficulté: {question.difficulty}
                  </span>
                )}

                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {question.points || 1} point(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Énoncé de la question */}
        <div className="mb-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-3">Énoncé :</h5>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{question.question}</p>
          </div>
        </div>

        {/* Contenu selon le type de question */}
        {question.type === 'mcq' && renderMcqQuestion(question, index)}
        {question.type === 'true_false' && renderTrueFalseQuestion(question, index)}
        {question.type === 'coding' && renderCodingQuestion(question, index)}
        {question.type === 'open_ended' && renderOpenEndedQuestion(question, index)}

        {/* Explication si disponible */}
        {question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Explication :
            </h5>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prévisualisation du test</h2>
          <p className="text-gray-600 text-sm mt-1">
            Visualisez comment le test apparaîtra aux candidats
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à l'édition
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* En-tête du test */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h3>
        {test.description && (
          <p className="text-gray-700 mb-4">{test.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{test.questions?.length || 0}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
              <FileText className="w-4 h-4" />
              Questions
            </div>
          </div>
          <div className="text-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalDuration}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
              <Clock className="w-4 h-4" />
              Minutes
            </div>
          </div>
          <div className="text-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{passingScore}%</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
              <BarChart className="w-4 h-4" />
              Score min.
            </div>
          </div>
          <div className="text-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="w-4 h-4" />
              Points total
            </div>
          </div>
        </div>

        {/* Répartition par type de questions */}
        {Object.keys(questionTypeCounts).length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition des questions :</h4>
            <div className="flex flex-wrap gap-2">
              {questionTypeCounts.mcq && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {questionTypeCounts.mcq} QCM
                </span>
              )}
              {questionTypeCounts.coding && (
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {questionTypeCounts.coding} Code
                </span>
              )}
              {questionTypeCounts.open_ended && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {questionTypeCounts.open_ended} Ouvertes
                </span>
              )}
              {questionTypeCounts.true_false && (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {questionTypeCounts.true_false} Vrai/Faux
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions pour les candidats */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-lg border border-amber-200">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Instructions pour les candidats :
        </h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
            <span>Vous avez <strong>{totalDuration} minutes</strong> pour compléter le test</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
            <span>Le score minimum pour réussir est de <strong>{passingScore}%</strong></span>
          </li>
          {test.allow_retake && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
              <span>Vous pouvez repasser le test une fois</span>
            </li>
          )}
          {test.show_results && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
              <span>Vous verrez vos résultats immédiatement après le test</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
            <span>Ne quittez pas cette page pendant le test</span>
          </li>
          {test.questions?.some(q => q.type === 'mcq') && (
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5"></div>
              <span>Pour les QCM : les questions indiquent si une ou plusieurs réponses sont attendues</span>
            </li>
          )}
        </ul>
      </div>

      {/* Mode de visualisation */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900">
            Questions ({test.questions?.length || 0})
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Prévisualisation
            </button>
            <button
              onClick={() => setViewMode('answers')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'answers'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Avec réponses
            </button>
          </div>
        </div>

        {/* Note sur le mode de visualisation */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Mode {viewMode === 'preview' ? 'Prévisualisation' : 'Avec réponses'} :</strong>
            {viewMode === 'preview'
              ? " Les candidats verront les questions sans les réponses correctes."
              : " Ceci montre toutes les réponses correctes (réservé aux administrateurs)."
            }
          </p>
        </div>

        {/* Questions en mode prévisualisation */}
        {test.questions?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucune question dans ce test</p>
            <p className="text-gray-500 text-sm">
              Retournez à l'édition pour ajouter des questions
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {test.questions?.map((question, index) => (
              viewMode === 'answers' || question.type !== 'mcq' && question.type !== 'true_false'
                ? renderQuestion(question, index)
                : (
                  <div key={question.id || index} className="border border-gray-200 rounded-xl p-6 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              getQuestionTypeColor(question.type) === 'blue' ? 'bg-blue-100 text-blue-800' :
                              getQuestionTypeColor(question.type) === 'green' ? 'bg-green-100 text-green-800' :
                              getQuestionTypeColor(question.type) === 'purple' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getQuestionTypeIcon(question.type)}
                              {getQuestionTypeLabel(question.type)}
                            </span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {question.points || 1} point(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Énoncé :</h5>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                        <p className="text-gray-800">{question.question}</p>
                      </div>
                    </div>

                    {/* Pour le mode preview, on montre juste les options sans réponses */}
                    {question.type === 'mcq' && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-2">
                          {question.multiple_correct
                            ? 'Sélectionnez toutes les réponses correctes :'
                            : 'Sélectionnez la réponse correcte :'
                          }
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border border-gray-400 rounded flex items-center justify-center">
                                  {question.multiple_correct ? (
                                    <div className="w-3 h-3 border border-gray-400 rounded-sm"></div>
                                  ) : (
                                    <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-gray-700">
                                  {String.fromCharCode(65 + optIndex)}. {option.text}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">Sélectionnez la réponse correcte :</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border border-gray-400 rounded-full flex items-center justify-center"></div>
                              <span className="font-medium text-gray-700">Vrai</span>
                            </div>
                          </div>
                          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border border-gray-400 rounded-full flex items-center justify-center"></div>
                              <span className="font-medium text-gray-700">Faux</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
            ))}
          </div>
        )}
      </div>

      {/* Actions de test */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-300">
        <h4 className="font-bold text-gray-900 mb-4">Actions du test</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleCopyLink}
            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </span>
          </button>

          <button
            onClick={handleExportPDF}
            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Exporter en PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Imprimer</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Partager</span>
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à l'édition
          </button>

          {test.is_public && (
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Lien copié !
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Copier le lien public
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            Publier le test
          </button>
        </div>
      </div>

      {/* Note finale */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">Test prêt à être publié !</p>
            <p className="text-sm text-green-700">
              Votre test contient {test.questions?.length || 0} questions pour un total de {totalPoints} points.
              Les candidats auront {totalDuration} minutes pour le compléter et devront obtenir {passingScore}% pour réussir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTestTab;