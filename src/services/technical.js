// src/services/Technical.js
const API_BASE_URL = '/api';

/**
 * Récupère les détails d'une offre d'emploi
 * @param {string} jobId - ID de l'offre
 * @returns {Promise<Object>}
 */
export async function getJobDetails(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/jobs/${jobId}/details`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getJobDetails:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crée un test technique
 * @param {string} jobId - ID de l'offre
 * @param {Object} testData - Données du test
 * @returns {Promise<Object>}
 */
export async function createTechnicalTest(jobId, testData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/technical-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        job_id: jobId,
        test_data: testData
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la création' };
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('Erreur createTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un test technique avec l'IA
 * @param {string} jobId - ID de l'offre
 * @param {Object} config - Configuration pour la génération
 * @returns {Promise<Object>}
 */
export async function generateAITest(jobId, config) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/technical-tests/generate-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        job_id: jobId,
        config: config
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la génération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur generateAITest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un test avec un prompt personnalisé
 * @param {string} jobId - ID de l'offre
 * @param {string} customPrompt - Prompt personnalisé
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Object>}
 */
export async function generateCustomAITest(jobId, customPrompt, options = {}) {
  try {
    const config = {
      customPrompt: customPrompt,
      number_of_questions: options.number_of_questions || 10,
      difficulty: options.difficulty || 'medium',
      question_types: options.question_types || ['mcq', 'coding', 'open_ended'],
      include_explanations: options.include_explanations !== false,
      ...options
    };

    return await generateAITest(jobId, config);
  } catch (error) {
    console.error('Erreur generateCustomAITest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère tous les tests techniques d'une offre
 * @param {string} jobId - ID de l'offre
 * @returns {Promise<Object>}
 */
export async function getTechnicalTests(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/jobs/${jobId}/technical-tests`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getTechnicalTests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère un test technique spécifique
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function getTechnicalTest(testId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/technical-tests/${testId}`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Test non trouvé' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour un test technique
 * @param {string} testId - ID du test
 * @param {Object} updates - Mises à jour à appliquer
 * @returns {Promise<Object>}
 */
export async function updateTechnicalTest(testId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/technical-tests/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la mise à jour' };
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('Erreur updateTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprime un test technique
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function deleteTechnicalTest(testId) {
  try {
    const response = await fetch(`${API_BASE_URL}/technical-tests/${testId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la suppression' };
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Erreur deleteTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soumet des réponses à un test technique
 * @param {string} testId - ID du test
 * @param {Array} answers - Réponses du candidat
 * @param {number} duration - Temps passé (minutes)
 * @returns {Promise<Object>}
 */
export async function submitTechnicalTest(testId, answers, duration = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/technical-tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        answers: answers,
        duration: duration
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la soumission' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur submitTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère les tentatives pour un test technique
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function getTestAttempts(testId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/technical-tests/${testId}/attempts`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur getTestAttempts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un lien public pour un test
 * @param {string} testId - ID du test
 * @returns {string}
 */
export function generatePublicTestLink(testId) {
  return `${window.location.origin}/technical-test/${testId}`;
}

/**
 * Copie le lien du test dans le presse-papier
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function copyTestLink(testId) {
  try {
    const link = generatePublicTestLink(testId);
    await navigator.clipboard.writeText(link);
    return { success: true, link: link };
  } catch (error) {
    console.error('Erreur copyTestLink:', error);
    return { success: false, error: 'Impossible de copier le lien' };
  }
}

/**
 * Exporte un test technique en PDF
 * @param {Object} testData - Données du test
 * @param {string} fileName - Nom du fichier
 * @returns {Promise<Object>}
 */
export async function exportTestToPDF(testData, fileName = 'test-technique') {
  try {
    // Note: Cette fonction nécessiterait une implémentation backend ou une bibliothèque frontend
    // Pour l'instant, retournons un message d'erreur
    console.warn('Export PDF non implémenté - nécessite une intégration backend');
    return {
      success: false,
      error: 'Export PDF non disponible',
      suggestion: 'Implémenter une route backend /api/technical-tests/export-pdf'
    };
  } catch (error) {
    console.error('Erreur exportTestToPDF:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Duplique un test technique existant
 * @param {string} testId - ID du test à dupliquer
 * @param {Object} modifications - Modifications à apporter à la copie
 * @returns {Promise<Object>}
 */
export async function duplicateTechnicalTest(testId, modifications = {}) {
  try {
    // Récupérer le test original
    const originalTest = await getTechnicalTest(testId);
    if (!originalTest.success) {
      return originalTest;
    }

    // Créer une copie avec modifications
    const testData = { ...originalTest.data };
    delete testData.id;
    delete testData.created_at;
    delete testData.updated_at;
    delete testData.candidate_count;
    delete testData.average_score;

    // Appliquer les modifications
    const duplicatedTest = {
      ...testData,
      title: modifications.title || `${testData.title} (Copie)`,
      status: 'draft',
      ...modifications
    };

    // Créer le nouveau test
    return await createTechnicalTest(duplicatedTest.job_id, duplicatedTest);
  } catch (error) {
    console.error('Erreur duplicateTechnicalTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Valide les données d'un test technique
 * @param {Object} testData - Données du test à valider
 * @returns {Object} - {isValid: boolean, errors: Array<string>}
 */
export function validateTestData(testData) {
  const errors = [];

  if (!testData.title?.trim()) {
    errors.push('Le titre du test est requis');
  }

  if (!testData.questions || testData.questions.length === 0) {
    errors.push('Le test doit contenir au moins une question');
  }

  if (testData.duration < 10 || testData.duration > 300) {
    errors.push('La durée doit être entre 10 et 300 minutes');
  }

  if (testData.passing_score < 0 || testData.passing_score > 100) {
    errors.push('Le score de passage doit être entre 0% et 100%');
  }

  // Valider chaque question
  testData.questions?.forEach((question, index) => {
    if (!question.question?.trim()) {
      errors.push(`La question ${index + 1} est vide`);
    }

    if (question.type === 'mcq') {
      const hasOptions = question.options?.length > 1;
      const hasCorrectOption = question.options?.some(opt => opt.is_correct);

      if (!hasOptions) {
        errors.push(`La question ${index + 1} (QCM) doit avoir au moins 2 options`);
      }

      if (!hasCorrectOption) {
        errors.push(`La question ${index + 1} (QCM) doit avoir au moins une réponse correcte`);
      }
    }

    if (question.type === 'coding' && !question.expected_output?.trim()) {
      errors.push(`La question ${index + 1} (Code) doit avoir une sortie attendue`);
    }

    if (question.points < 0) {
      errors.push(`La question ${index + 1} ne peut pas avoir de points négatifs`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Formate les données du test pour l'envoi au backend
 * @param {Object} testData - Données du test au format frontend
 * @returns {Object} - Données formatées pour le backend
 */
export function formatTestForBackend(testData) {
  const formatted = { ...testData };

  // Assurer que chaque question a un ID unique
  formatted.questions = formatted.questions?.map((q, index) => ({
    ...q,
    id: q.id || `q${index + 1}`,
    order: q.order || index + 1
  }));

  // Convertir les booléens si nécessaire
  formatted.is_public = Boolean(formatted.is_public);
  formatted.allow_retake = Boolean(formatted.allow_retake);
  formatted.show_results = Boolean(formatted.show_results);

  return formatted;
}

/**
 * Récupère les statistiques d'un test technique
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function getTestStatistics(testId) {
  try {
    // Récupérer le test et ses tentatives
    const [testResponse, attemptsResponse] = await Promise.all([
      getTechnicalTest(testId),
      getTestAttempts(testId)
    ]);

    if (!testResponse.success || !attemptsResponse.success) {
      return {
        success: false,
        error: testResponse.error || attemptsResponse.error
      };
    }

    const test = testResponse.data;
    const attempts = attemptsResponse.data.attempts || [];

    // Calculer les statistiques
    const stats = {
      totalAttempts: attempts.length,
      averageScore: test.average_score || 0,
      passingRate: 0,
      questionStats: [],
      recentAttempts: attempts.slice(0, 10)
    };

    if (attempts.length > 0) {
      const passedCount = attempts.filter(a => a.passed).length;
      stats.passingRate = (passedCount / attempts.length) * 100;

      // Statistiques par question
      if (attempts.length > 0 && attempts[0].results) {
        const questionMap = new Map();

        attempts.forEach(attempt => {
          attempt.results?.forEach(result => {
            const questionId = result.question_id;
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionId,
                totalAttempts: 0,
                correctAttempts: 0,
                averageScore: 0
              });
            }

            const qStat = questionMap.get(questionId);
            qStat.totalAttempts++;
            if (result.is_correct) {
              qStat.correctAttempts++;
            }
            qStat.averageScore += result.score_obtained;
          });
        });

        stats.questionStats = Array.from(questionMap.values()).map(stat => ({
          ...stat,
          averageScore: stat.averageScore / stat.totalAttempts,
          successRate: (stat.correctAttempts / stat.totalAttempts) * 100
        }));
      }
    }

    return {
      success: true,
      data: {
        test,
        statistics: stats
      }
    };
  } catch (error) {
    console.error('Erreur getTestStatistics:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vérifie si l'utilisateur peut accéder au test
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function canAccessTest(testId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/technical-tests/${testId}/access-check`, {
      credentials: 'include'
    });

    // Si la route n'existe pas, on tente de récupérer le test directement
    if (response.status === 404) {
      return await getTechnicalTest(testId);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur canAccessTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Génère un rapport détaillé pour un test
 * @param {string} testId - ID du test
 * @returns {Promise<Object>}
 */
export async function generateTestReport(testId) {
  try {
    const stats = await getTestStatistics(testId);
    if (!stats.success) {
      return stats;
    }

    // Formater le rapport
    const { test, statistics } = stats.data;
    const report = {
      testInfo: {
        title: test.title,
        description: test.description,
        duration: test.duration,
        passingScore: test.passing_score,
        totalQuestions: test.questions?.length || 0,
        createdAt: test.created_at
      },
      statistics: {
        ...statistics,
        scoreDistribution: calculateScoreDistribution(statistics.recentAttempts)
      },
      recommendations: generateRecommendations(statistics)
    };

    return { success: true, data: report };
  } catch (error) {
    console.error('Erreur generateTestReport:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcule la distribution des scores
 * @private
 */
function calculateScoreDistribution(attempts) {
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  attempts?.forEach(attempt => {
    const score = attempt.percentage || 0;
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });

  return distribution;
}

/**
 * Génère des recommandations basées sur les statistiques
 * @private
 */
function generateRecommendations(stats) {
  const recommendations = [];

  if (stats.totalAttempts === 0) {
    recommendations.push({
      type: 'info',
      message: 'Aucun candidat n\'a encore passé ce test'
    });
    return recommendations;
  }

  if (stats.passingRate < 30) {
    recommendations.push({
      type: 'warning',
      message: 'Le taux de réussite est faible. Considérez réviser la difficulté du test.'
    });
  } else if (stats.passingRate > 80) {
    recommendations.push({
      type: 'warning',
      message: 'Le taux de réussite est élevé. Le test pourrait être trop facile.'
    });
  }

  // Analyser les questions difficiles
  stats.questionStats?.forEach(qStat => {
    if (qStat.successRate < 40) {
      recommendations.push({
        type: 'suggestion',
        message: `La question ${qStat.questionId} a un taux de réussite faible (${qStat.successRate.toFixed(1)}%). Considérez la reformuler.`
      });
    }
  });

  return recommendations;
}

/**
 * Crée une configuration IA par défaut basée sur l'offre d'emploi
 * @param {Object} job - Offre d'emploi
 * @returns {Object} - Configuration IA par défaut
 */
export function createDefaultAIConfig(job) {
  return {
    difficulty: 'medium',
    question_types: ['mcq', 'coding', 'open_ended'],
    number_of_questions: 10,
    include_explanations: true,
    include_code_exercises: true,
    customPrompt: '',
    focusAreas: job?.required_skills?.slice(0, 5) || [],
    specificTopics: job?.required_skills?.join(', ') || '',
    excludeTopics: '',
    experienceLevel: 'intermediate',
    testStyle: 'mixed',
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
  };
}

/**
 * Suggestions de prompts prédéfinis
 * @returns {Array} - Liste de suggestions de prompts
 */
export function getPromptSuggestions() {
  return [
    {
      id: 'practical',
      title: 'Test pratique',
      description: 'Exercices concrets et scénarios réels',
      prompt: 'Crée un test pratique avec des exercices concrets. Inclure:\n- Des problèmes réels que le candidat pourrait rencontrer\n- Des scénarios basés sur les missions du poste\n- Des exercices de débogage\n- Des questions sur les bonnes pratiques'
    },
    {
      id: 'theoretical',
      title: 'Test théorique',
      description: 'Concepts fondamentaux et principes',
      prompt: 'Crée un test théorique approfondi. Inclure:\n- Des concepts fondamentaux de la technologie\n- Des principes de design patterns\n- Des questions d\'architecture\n- Des comparaisons entre différentes approches'
    },
    {
      id: 'mixed',
      title: 'Test mixte',
      description: 'Équilibre théorie et pratique',
      prompt: 'Crée un test équilibré théorie/pratique. Inclure:\n- 40% questions théoriques sur les concepts\n- 40% exercices pratiques\n- 20% questions de raisonnement et problématiques réelles'
    },
    {
      id: 'senior',
      title: 'Niveau senior',
      description: 'Leadership technique et architecture',
      prompt: 'Crée un test pour un poste senior. Inclure:\n- Des questions d\'architecture et design system\n- Des scénarios de leadership technique\n- Des problèmes d\'optimisation et scaling\n- Des questions sur les bonnes pratiques d\'équipe'
    },
    {
      id: 'security',
      title: 'Focus sécurité',
      description: 'Bonnes pratiques de sécurité',
      prompt: 'Crée un test axé sur la sécurité. Inclure:\n- Des questions sur les vulnérabilités courantes\n- Des exercices de sécurisation de code\n- Des scénarios de menaces et mitigation\n- Des bonnes pratiques OWASP'
    },
    {
      id: 'performance',
      title: 'Focus performance',
      description: 'Optimisation et scalabilité',
      prompt: 'Crée un test axé sur les performances. Inclure:\n- Des questions d\'optimisation de code\n- Des exercices de profiling\n- Des scénarios de scaling\n- Des techniques de caching et optimisation'
    }
  ];
}

export async function getCompanyJobs() {
  try {
    const response = await fetch('api/jobs/api/job_list', {
      credentials: 'include'
    });

    // Vérifie si la réponse est bien du JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      let text = '';
      try {
        text = await response.text();
      } catch (e) {
        text = '(impossible de lire le corps)';
      }
      console.error('Réponse non JSON reçue de /jobs/api/job_list :', text.substring(0, 500));
      return { success: false, error: 'Erreur serveur – réponse inattendue (probablement non connecté)' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Erreur serveur' };
    }

    return { success: true, data: data.jobs || [] };
  } catch (error) {
    console.error('Erreur getCompanyJobs:', error);
    return { success: false, error: 'Erreur réseau – impossible de contacter le serveur' };
  }
}

export async function getJobDetail(jobId) {
  try {
    // CORRECTION : Même chose ici
    const response = await fetch(`api/jobs/api/job_detail/${jobId}`, {  // ← Changé ici
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.job };
  } catch (error) {
    console.error('Erreur getJobDetail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupère tous les tests techniques de l'entreprise
 * @returns {Promise<Object>}
 */
export async function getCompanyTechnicalTests() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/company/technical-tests`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Erreur getCompanyTechnicalTests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Évalue un test avec l'IA
 * @param {string} testId - ID du test
 * @param {string} attemptId - ID de la tentative
 * @returns {Promise<Object>}
 */
export async function evaluateTestWithAI(testId, attemptId) {
  try {
    const response = await fetch(`${API_BASE_URL}/technical-tests/${testId}/evaluate-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ attempt_id: attemptId })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de l\'évaluation' };
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur evaluateTestWithAI:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Note manuellement une tentative de test
 * @param {string} testId - ID du test
 * @param {string} attemptId - ID de la tentative
 * @param {Object} grades - Notes par question
 * @param {string} feedback - Feedback pour le candidat
 * @returns {Promise<Object>}
 */
export async function manuallyGradeAttempt(testId, attemptId, grades, feedback) {
  try {
    const response = await fetch(`${API_BASE_URL}/technical-tests/${testId}/attempts/${attemptId}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        grades: grades,
        feedback: feedback
      })
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la notation' };
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('Erreur manuallyGradeAttempt:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Récupère les tests techniques disponibles pour une offre d'emploi
 * @param {string} jobId - ID de l'offre
 * @returns {Promise<Object>}
 */
export async function getAvailableTestsForJob(jobId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/api/jobs/${jobId}/available-tests`, {
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || 'Erreur lors de la récupération' };
    return { success: true, data: data.data || [], count: data.count || 0 };
  } catch (error) {
    console.error('Erreur getAvailableTestsForJob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gère la navigation vers un test technique
 * @param {string} testId - ID du test
 * @param {Function} navigate - Fonction de navigation react-router-dom
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<void>}
 */
export async function handleTakeTest(testId, navigate, options = {}) {
  try {
    // Option 1: Vérifier l'accès au test d'abord
    const accessCheck = await canAccessTest(testId);

    if (!accessCheck.success) {
      throw new Error(accessCheck.error || 'Accès non autorisé');
    }

    // Option 2: Naviguer directement
    navigate(`/api/technical-test/${testId}`, {
      state: {
        testId: testId,
        ...options
      }
    });

  } catch (error) {
    console.error('Erreur handleTakeTest:', error);
    throw error;
  }
}