// services/conversational.js
const API_BASE_URL = '/api/api/conversational';

/**
 * Traite une requête conversationnelle en langage naturel
 * @param {string} query - La requête en langage naturel
 * @param {object} localData - Données locales chargées
 * @returns {Promise<object>} - Réponse structurée
 */
export async function processConversationalQuery(query, localData) {
  try {
    // Utiliser le nouvel endpoint avancé qui gère NLP
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'analyse');
    }

    const data = await response.json();

    if (data.success) {
      return formatResponse(data);
    } else {
      return generateFallbackResponse(query, localData);
    }

  } catch (error) {
    console.error('Erreur analyse conversationnelle:', error);
    return generateFallbackResponse(query, localData);
  }
}

/**
 * Formatte la réponse selon le type
 */
function formatResponse(data) {
  if (data.type === 'conversation') {
    return {
      content: data.response,
      type: 'conversation',
      intent: data.intent,
      suggestions: getConversationSuggestions(data.intent),
      metadata: {
        confidence: data.intent?.confidence || 0,
        language: data.intent?.language || 'fr'
      }
    };
  } else {
    return {
      content: formatAnalysisResponse(data.analysis),
      type: 'analysis',
      analysis: data.analysis,
      intent: data.intent,
      suggestions: getAnalysisSuggestions(data.analysis),
      metadata: {
        confidence: data.intent?.confidence || 0,
        dataUsed: data.data_used || false
      }
    };
  }
}

/**
 * Formatte une réponse d'analyse
 */
function formatAnalysisResponse(analysis) {
  if (!analysis) {
    return 'Désolé, je n\'ai pas pu analyser votre requête.';
  }

  let content = '';

  // Titre basé sur l'intention
  const intentTitle = analysis.intent || 'Analyse RH';
  content += `📊 ${intentTitle}\n\n`;

  // Résumé
  if (analysis.summary) {
    content += `🔍 ${analysis.summary}\n\n`;
  }

  // Données clés
  if (analysis.total || analysis.count) {
    content += `📈 Données analysées:\n`;
    if (analysis.total) content += `• Total: ${analysis.total}\n`;
    if (analysis.count) content += `• Éléments: ${analysis.count}\n`;
    content += '\n';
  }

  // Insights AI
  if (analysis.ai_insights) {
    content += `💡 Insights IA:\n${analysis.ai_insights}\n\n`;
  }

  // Recommandations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    content += `🎯 Recommandations:\n`;
    analysis.recommendations.slice(0, 3).forEach(rec => {
      content += `• ${rec}\n`;
    });
    content += '\n';
  }

  // Prochaines étapes
  content += `🚀 Prochaines étapes:\n`;
  content += `• "Détaille cette analyse"\n`;
  content += `• "Exporte les résultats"\n`;
  content += `• "Planifie des actions"\n`;

  return content;
}

/**
 * Suggestions pour conversation
 */
function getConversationSuggestions(intent) {
  const primaryIntent = intent?.details?.primary_intent || 'unknown';

  const suggestions = {
    greeting: ['Comment vas-tu ?', 'Parle-moi de toi', 'Que peux-tu faire ?'],
    farewell: ['À bientôt', 'Merci', 'Bon courage'],
    thanks: ['De rien', 'À votre service', 'Encore besoin d\'aide ?'],
    introduction: ['Tes capacités', 'Ton expertise RH', 'Comment fonctionnes-tu ?'],
    capabilities: ['Analyse RH', 'Conversation', 'Aide-moi avec...'],
    small_talk: ['Tu as des hobbies ?', 'Quel temps fait-il ?', 'Raconte une blague'],
    help_request: ['Aide RH', 'Analyse de données', 'Conseils'],
    unknown: ['Aide-moi', 'Analyse RH', 'Conversation']
  };

  return suggestions[primaryIntent] || suggestions.unknown;
}

/**
 * Suggestions pour analyse
 */
function getAnalysisSuggestions(analysis) {
  const intent = analysis.intent || 'general';

  const suggestions = {
    burnout_risk: [
      'Détails des risques',
      'Plan d\'action',
      'Suivi des employés'
    ],
    recruitment_anomalies: [
      'Corriger les anomalies',
      'Optimiser le processus',
      'Analyser les coûts'
    ],
    planning_optimization: [
      'Implémenter les changements',
      'Analyser l\'impact',
      'Suivre les résultats'
    ],
    absence_trends: [
      'Analyser les causes',
      'Prévenir les absences',
      'Améliorer le présentéisme'
    ],
    general: [
      'Exporter l\'analyse',
      'Partager les résultats',
      'Programmer un suivi'
    ]
  };

  return suggestions[intent] || suggestions.general;
}

/**
 * Génère une réponse de secours
 */
function generateFallbackResponse(query, data) {
  const employeeCount = data.employees.length;
  const planningCount = data.planning.length;
  const absenceCount = data.absences.length;

  return {
    content: `🤖 Jarvis Assistant RH\n\nJ'ai reçu votre message: "${query}"\n\n📊 Données disponibles:\n• ${employeeCount} employés\n• ${planningCount} shifts\n• ${absenceCount} absences\n\n💡 Je peux vous aider avec:\n• Analyses RH approfondies\n• Conversations naturelles\n• Détection d'anomalies\n• Optimisations\n\nDites-moi comment vous aider !`,
    type: 'conversation',
    suggestions: [
      'Analyser les données RH',
      'Discuter librement',
      'Détecter des problèmes'
    ]
  };
}

/**
 * Analyse avancée avec NLP
 */
export async function advancedAnalysis(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/advanced-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Erreur analyse avancée');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur analyse avancée:', error);
    return null;
  }
}

/**
 * Exporte les données d'analyse
 */
export function exportAnalysisData(analysis, format = 'json') {
  if (!analysis) return '';

  if (format === 'json') {
    return JSON.stringify(analysis, null, 2);
  } else {
    let text = `ANALYSE RH - ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    text += `Requête: ${analysis.query || 'Non spécifiée'}\n`;
    text += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;

    if (analysis.summary) {
      text += `RÉSUMÉ\n${analysis.summary}\n\n`;
    }

    if (analysis.ai_insights) {
      text += `INSIGHTS IA\n${analysis.ai_insights}\n\n`;
    }

    return text;
  }
}

// Export centralisé
export default {
  processConversationalQuery,
  advancedAnalysis,
  exportAnalysisData
};