// src/pages/Jobs/Entreprises/TechnicalTest/TechnicalTest.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createTechnicalTest,
  generateAITest,
  getJobDetails,
  getTechnicalTests,
  deleteTechnicalTest
} from '../../../../services/technical';
import TestIAModal from "./TestIAModal";
import Header from './components/Header';
import AlertMessages from './components/AlertMessages';
import TabNavigation from './components/TabNavigation';
import CreateTestTab from './components/tabs/CreateTestTab';
import AITestTab from './components/tabs/AITestTab';
import TestListTab from './components/tabs/TestListTab';
import PreviewTestTab from './components/tabs/PreviewTestTab';

export default function TechnicalTest() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [job, setJob] = useState(null);
  const [tests, setTests] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'ai', 'list', 'preview'
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showIAModal, setShowIAModal] = useState(false);
  const [aiGeneratedTest, setAiGeneratedTest] = useState(null);

  // État pour le test manuel
  const [manualTest, setManualTest] = useState({
    title: '',
    description: '',
    duration: 60,
    passing_score: 70,
    questions: [],
    is_public: false,
    allow_retake: false,
    show_results: true,
    grading_mode: 'auto'
  });

  // État pour la configuration IA avancée
  const [aiPromptConfig, setAiPromptConfig] = useState({
    difficulty: 'medium',
    question_types: ['mcq', 'coding', 'open_ended'],
    number_of_questions: 10,
    include_explanations: true,
    include_code_exercises: true,
    customPrompt: '',
    focusAreas: [],
    specificTopics: '',
    excludeTopics: '',
    experienceLevel: 'intermediate',
    testStyle: 'practical',
    timeLimitPerQuestion: null,
    questionDistribution: {
      mcq: { percentage: 40, difficulty: 'medium' },
      coding: { percentage: 30, difficulty: 'medium' },
      open_ended: { percentage: 30, difficulty: 'medium' }
    },
    evaluationCriteria: {
      includeComplexityAnalysis: false,
      includeBestPractices: true,
      includeErrorHandling: true,
      includeOptimization: false
    }
  });

  // Charger les données
  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const loadData = async () => {
  try {
    setLoading(true);

    // CORRECTION : Utiliser getJobDetails et getTechnicalTests du service
    const jobRes = await getJobDetails(jobId);
    if (jobRes.success) {
      setJob(jobRes.data);

      // Initialiser le titre du test
      setManualTest(prev => ({
        ...prev,
        title: `Test technique - ${jobRes.data.title}`
      }));

      // Pré-remplir les focus areas
      if (jobRes.data.required_skills) {
        setAiPromptConfig(prev => ({
          ...prev,
          focusAreas: jobRes.data.required_skills.slice(0, 5),
          specificTopics: jobRes.data.required_skills.join(', '),
          experienceLevel: determineExperienceLevel(jobRes.data.title)
        }));
      }
    }

    // Charger les tests existants
    const testsRes = await getTechnicalTests(jobId);
    if (testsRes.success) {
      setTests(testsRes.data);
    }

  } catch (err) {
    setError('Erreur lors du chargement des données');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // Déterminer le niveau d'expérience basé sur le titre
  const determineExperienceLevel = (title) => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('junior') || titleLower.includes('débutant') || titleLower.includes('stagiaire')) {
      return 'junior';
    } else if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('chef')) {
      return 'senior';
    } else if (titleLower.includes('expert') || titleLower.includes('architect') || titleLower.includes('principal')) {
      return 'expert';
    }
    return 'intermediate';
  };

  // Gestion des questions manuelles
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: '',
      points: 1,
      order: manualTest.questions.length + 1,
      difficulty: 'medium'
    };

    switch (type) {
      case 'mcq':
        newQuestion.options = [
          { id: 1, text: '', is_correct: false },
          { id: 2, text: '', is_correct: false },
          { id: 3, text: '', is_correct: false },
          { id: 4, text: '', is_correct: false }
        ];
        newQuestion.multiple_correct = false;
        newQuestion.mcq_type = 'single'; // 'single' ou 'multiple'
        break;
      case 'coding':
        newQuestion.language = 'javascript';
        newQuestion.code_template = '';
        newQuestion.test_cases = [];
        newQuestion.expected_output = '';
        newQuestion.explanation = '';
        break;
      case 'open_ended':
        newQuestion.max_length = 500;
        newQuestion.expected_keywords = [];
        newQuestion.explanation = '';
        break;
      case 'true_false':
        newQuestion.correct_answer = true;
        newQuestion.explanation = '';
        break;
    }

    setManualTest(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, updates) => {
    setManualTest(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setManualTest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const addMcqOption = (questionId) => {
    const question = manualTest.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOption = {
        id: question.options.length + 1,
        text: '',
        is_correct: false
      };

      updateQuestion(questionId, {
        options: [...question.options, newOption]
      });
    }
  };

  const updateMcqOption = (questionId, optionId, updates) => {
    const question = manualTest.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      );

      // Si c'est une question à réponse unique, désélectionner les autres
      if (updates.is_correct && !question.multiple_correct) {
        newOptions.forEach(opt => {
          if (opt.id !== optionId) opt.is_correct = false;
        });
      }

      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeMcqOption = (questionId, optionId) => {
    const question = manualTest.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter(opt => opt.id !== optionId);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  // Gestion du type de QCM
  const handleMcqTypeChange = (questionId, mcqType) => {
    const question = manualTest.questions.find(q => q.id === questionId);
    if (question && question.type === 'mcq') {
      const updatedQuestion = { ...question, mcq_type: mcqType };

      if (mcqType === 'single' && question.multiple_correct) {
        // Si on passe de multiple à single, ne garder qu'une seule réponse correcte
        updatedQuestion.multiple_correct = false;
        const correctOptions = question.options.filter(opt => opt.is_correct);
        if (correctOptions.length > 0) {
          // Garder seulement la première réponse correcte
          const firstCorrectId = correctOptions[0].id;
          updatedQuestion.options = question.options.map(opt => ({
            ...opt,
            is_correct: opt.id === firstCorrectId
          }));
        }
      } else if (mcqType === 'multiple' && !question.multiple_correct) {
        updatedQuestion.multiple_correct = true;
      }

      updateQuestion(questionId, updatedQuestion);
    }
  };

  // Générer un test avec l'IA
  const handleGenerateAITest = async () => {
    try {
      setGeneratingAI(true);
      setError('');

      // Préparer la configuration avec le prompt personnalisé
      const config = {
        ...aiPromptConfig,
        job_details: job,
        // Assurer que la difficulté correspond au niveau d'expérience
        difficulty: mapExperienceToDifficulty(aiPromptConfig.experienceLevel)
      };

      const res = await generateAITest(jobId, config);

      if (res.success) {
        // Traiter le test généré pour s'assurer que les options MCQ ont les bonnes propriétés
        const processedTest = processAIGeneratedTest(res.data);
        setAiGeneratedTest(processedTest);
        setShowIAModal(true);
        setSuccess('Test généré avec succès !');
      } else {
        setError(res.error || 'Erreur lors de la génération du test');
      }
    } catch (err) {
      setError('Erreur lors de la génération du test');
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Mapper l'expérience à la difficulté
  const mapExperienceToDifficulty = (experienceLevel) => {
    const mapping = {
      'junior': 'easy',
      'intermediate': 'medium',
      'senior': 'hard',
      'expert': 'very_hard'
    };
    return mapping[experienceLevel] || 'medium';
  };

  // Traiter le test généré par l'IA
  const processAIGeneratedTest = (testData) => {
    if (!testData.questions) return testData;

    const processedQuestions = testData.questions.map((question, index) => {
      const processedQuestion = { ...question };

      // S'assurer que chaque question a un ID
      if (!processedQuestion.id) {
        processedQuestion.id = `q${index + 1}`;
      }

      // S'assurer que chaque question a un ordre
      if (!processedQuestion.order) {
        processedQuestion.order = index + 1;
      }

      // Traiter les questions MCQ
      if (processedQuestion.type === 'mcq' && processedQuestion.options) {
        // S'assurer que chaque option a les bonnes propriétés
        processedQuestion.options = processedQuestion.options.map((option, optIndex) => ({
          ...option,
          id: option.id || optIndex + 1,
          text: option.text || `Option ${optIndex + 1}`,
          is_correct: option.is_correct || false
        }));

        // Déterminer le type de QCM
        const correctCount = processedQuestion.options.filter(opt => opt.is_correct).length;
        processedQuestion.multiple_correct = correctCount > 1;
        processedQuestion.mcq_type = correctCount > 1 ? 'multiple' : 'single';
      }

      return processedQuestion;
    });

    return {
      ...testData,
      questions: processedQuestions,
      // Assurer que le mode de notation est défini
      grading_mode: testData.grading_mode || 'auto'
    };
  };

  const handleSaveFromModal = async (testData) => {
    try {
      setLoading(true);
      setError('');

      const res = await createTechnicalTest(jobId, testData);

      if (res.success) {
        setSuccess('Test technique créé avec succès !');
        setTests(prev => [...prev, res.data]);
        setShowIAModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Erreur lors de la création du test');
      }
    } catch (err) {
      setError('Erreur lors de la création du test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder le test
  const handleSaveTest = async () => {
    // Validation
    if (!manualTest.title.trim()) {
      setError('Le titre du test est requis');
      return;
    }

    if (manualTest.questions.length === 0) {
      setError('Ajoutez au moins une question');
      return;
    }

    // Valider les questions
    for (const q of manualTest.questions) {
      if (!q.question.trim()) {
        setError(`La question ${q.order} est vide`);
        return;
      }

      if (q.type === 'mcq') {
        const hasCorrect = q.options?.some(opt => opt.is_correct);
        if (!hasCorrect) {
          setError(`La question ${q.order} (QCM) doit avoir au moins une réponse correcte`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setError('');

      const res = await createTechnicalTest(jobId, manualTest);

      if (res.success) {
        setSuccess('Test technique créé avec succès !');
        setTests(prev => [...prev, res.data]);

        // Réinitialiser le formulaire
        setManualTest({
          title: `Test technique - ${job?.title || 'Nouveau test'}`,
          description: '',
          duration: 60,
          passing_score: 70,
          questions: [],
          is_public: false,
          allow_retake: false,
          show_results: true,
          grading_mode: 'auto'
        });

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Erreur lors de la création du test');
      }
    } catch (err) {
      setError('Erreur lors de la création du test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des tests existants
  const handlePreviewTest = (test) => {
    setManualTest(test);
    setActiveTab('preview');
  };

  const handleEditTest = (test) => {
    setManualTest(test);
    setActiveTab('create');
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) return;

    try {
      const res = await deleteTechnicalTest(testId);
      if (res.success) {
        setTests(prev => prev.filter(t => t.id !== testId));
        setSuccess('Test supprimé avec succès');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  // Gestion des focus areas
  const handleAddFocusArea = (area) => {
    if (area.trim() && !aiPromptConfig.focusAreas.includes(area.trim())) {
      setAiPromptConfig(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, area.trim()]
      }));
    }
  };

  const handleRemoveFocusArea = (index) => {
    setAiPromptConfig(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, i) => i !== index)
    }));
  };

  // Pré-remplir des prompts exemples
  const loadExamplePrompt = (type) => {
    const examples = {
      practical: `Crée un test pratique avec des exercices concrets. Inclure:
- Des problèmes réels que le candidat pourrait rencontrer
- Des scénarios basés sur les missions du poste
- Des exercices de débogage
- Des questions sur les bonnes pratiques`,

      theoretical: `Crée un test théorique approfondi. Inclure:
- Des concepts fondamentaux de la technologie
- Des principes de design patterns
- Des questions d'architecture
- Des comparaisons entre différentes approches`,

      mixed: `Crée un test équilibré théorie/pratique. Inclure:
- 40% questions théoriques sur les concepts
- 40% exercices pratiques
- 20% questions de raisonnement et problématiques réelles`,

      senior: `Crée un test pour un poste senior. Inclure:
- Des questions d'architecture et design system
- Des scénarios de leadership technique
- Des problèmes d'optimisation et scaling
- Des questions sur les bonnes pratiques d'équipe`
    };

    setAiPromptConfig(prev => ({
      ...prev,
      customPrompt: examples[type] || ''
    }));
  };

  // Fonction pour mettre à jour le test depuis la modale
  const updateTestFromModal = (updatedTest) => {
    setAiGeneratedTest(updatedTest);
  };

  if (loading && !job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header
          job={job}
          navigate={navigate}
          jobId={jobId}
        />

        {/* Navigation par onglets */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          testsCount={tests.length}
          showPreviewTab={activeTab === 'preview'}
        />

        {/* Messages d'alerte */}
        <AlertMessages error={error} success={success} />

        {/* Contenu selon l'onglet actif */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {activeTab === 'create' && (
            <CreateTestTab
              manualTest={manualTest}
              setManualTest={setManualTest}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              addMcqOption={addMcqOption}
              updateMcqOption={updateMcqOption}
              removeMcqOption={removeMcqOption}
              handleMcqTypeChange={handleMcqTypeChange}
              handleSaveTest={handleSaveTest}
              loading={loading}
              navigate={navigate}
              setActiveTab={setActiveTab}
              job={job}
            />
          )}

          {activeTab === 'ai' && (
            <AITestTab
              aiPromptConfig={aiPromptConfig}
              setAiPromptConfig={setAiPromptConfig}
              job={job}
              generatingAI={generatingAI}
              handleGenerateAITest={handleGenerateAITest}
              handleAddFocusArea={handleAddFocusArea}
              handleRemoveFocusArea={handleRemoveFocusArea}
              loadExamplePrompt={loadExamplePrompt}
            />
          )}

          {activeTab === 'list' && (
            <TestListTab
              tests={tests}
              handlePreviewTest={handlePreviewTest}
              handleEditTest={handleEditTest}
              handleDeleteTest={handleDeleteTest}
              navigate={navigate}
            />
          )}

          {activeTab === 'preview' && (
            <PreviewTestTab
              test={manualTest}
              onBack={() => setActiveTab('create')}
              onEdit={() => setActiveTab('create')}
              onSave={handleSaveTest}
            />
          )}
        </div>

        {showIAModal && aiGeneratedTest && (
          <TestIAModal
            testData={aiGeneratedTest}
            jobTitle={job?.title}
            onClose={() => setShowIAModal(false)}
            onSave={() => handleSaveFromModal(aiGeneratedTest)}
            onEdit={() => {
              setShowIAModal(false);
              setManualTest(aiGeneratedTest);
              setActiveTab('create');
            }}
            onUpdateTest={updateTestFromModal}
          />
        )}
      </div>
    </div>
  );
}