// src/pages/Employees/Payroll/components/PayrollAssistant/AIPayrollAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import AnalysisPanel from './AnalysisPanel';
import ChatPanel from './ChatPanel';
import Footer from './Footer';
import { analyzePayrollWithAI, queryPayrollAI, getAllPayslipsForAI } from '../../../../../services/payroll';

export default function AIPayrollAssistant({ isOpen, onClose, payrollData }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [allPayslips, setAllPayslips] = useState([]);
  const [hasDataForChat, setHasDataForChat] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadAllPayslips();
    }
  }, [isOpen]);

  const loadAllPayslips = async () => {
    try {
      const result = await getAllPayslipsForAI();
      if (result.success) {
        setAllPayslips(result.payslips);
        setHasDataForChat(true);

        setChatMessages([
          {
            id: 1,
            type: 'assistant',
            content: `👋 Bonjour ! Je suis votre assistant IA pour la gestion de paie.

J'ai accès à ${result.payslips.length} bulletins de paie dans votre système.

🔄 Je peux vous aider à :
• Analyser les tendances de vos coûts de paie
• Détecter les anomalies et problèmes potentiels
• Faire des projections budgétaires
• Optimiser vos cotisations sociales
• Répondre à vos questions spécifiques

💡 Astuce : Cliquez sur une suggestion ci-dessous ou tapez votre question dans la zone de texte.`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des bulletins:', err);
    }
  };

  const analyzeData = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await analyzePayrollWithAI({
        ...payrollData,
        all_payslips: allPayslips
      });

      if (result.success) {
        setAnalysis(result.analysis);

        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          content: `✅ Analyse IA terminée avec succès !

J'ai analysé en profondeur vos ${allPayslips.length} bulletins de paie. Voici ce que j'ai découvert :

📊 Points clés :
• ${result.analysis?.trends?.[0]?.substring(0, 100) || "Analyse des tendances complétée"}
• ${result.analysis?.recommendations?.[0]?.substring(0, 100) || "Recommandations générées"}
• ${result.analysis?.alerts?.[0]?.substring(0, 100) || "Aucune alerte critique détectée"}

🔍 Pour explorer les détails :
1. Consultez les onglets dans le panneau de gauche
2. Posez-moi des questions spécifiques
3. Utilisez les suggestions rapides ci-dessous`,
          timestamp: new Date()
        }]);
      } else {
        setError(result.error || 'Erreur lors de l\'analyse IA');
      }
    } catch (err) {
      setError('Erreur de connexion au service IA');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);

    try {
      const contextData = {
        payslips_count: allPayslips.length,
        employees_count: payrollData?.employees?.length || 0,
        stats: payrollData?.stats || {},
        all_payslips_summary: allPayslips.slice(0, 10).map(p => ({
          employee_name: p.employee_name || 'Inconnu',
          gross_salary: p.gross_salary,
          net_salary: p.net_salary,
          status: p.status,
          period: `${p.period_start} - ${p.period_end}`
        })),
        has_analysis: !!analysis
      };

      const response = await queryPayrollAI(userInput, contextData);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.answer,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ Désolé, une erreur s'est produite : ${err.message}

Essayez de : 
1. Rafraîchir la page
2. Vérifier votre connexion internet
3. Contacter le support technique si le problème persiste`,
        timestamp: new Date(),
        isError: true
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion.text);

    if (chatMessages.length <= 1) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: suggestion.text,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      setTimeout(() => {
        setChatLoading(true);
        setTimeout(() => {
          const responses = {
            "Quels sont les bulletins en attente ?": `🔍 Analyse des bulletins en attente...

Je recherche parmi vos ${allPayslips.length} bulletins ceux qui sont en statut "draft" ou "en attente". Cela peut prendre quelques secondes.

📋 Pour une analyse complète :
1. Lancez l'analyse IA complète pour des statistiques détaillées
2. Consultez le tableau des bulletins dans la page principale
3. Filtrez par statut pour voir les bulletins spécifiques

💡 Action rapide : Cliquez sur "Démarrer l'analyse IA" pour une vue d'ensemble.`,
            "Analyse les coûts de paie par département": `📊 Analyse des coûts par département...

Je prépare une analyse détaillée de la répartition des coûts de paie entre vos différents départements.

🏢 Ce que je vais examiner :
• Répartition des salaires par service/département
• Coût moyen par employé par département
• Écarts et anomalies potentielles

⚡ Pour des résultats précis : Lancez l'analyse IA complète.`,
            "Y a-t-il des anomalies dans les salaires ?": `🛡️ Détection d'anomalies salariales...

Je scanne vos ${allPayslips.length} bulletins pour détecter :
• Salaires anormalement élevés ou bas
• Incohérences dans les cotisations
• Écarts importants entre employés similaires

⚠️ Important : L'analyse complète IA fournira une détection plus précise des anomalies.`,
            "Projette les coûts pour le prochain trimestre": `📈 Projection des coûts trimestriels...

Basé sur vos données historiques, je calcule :
• Tendances de croissance des salaires
• Impact des nouvelles embauches
• Variations saisonnières potentielles

🎯 Précision : Les projections sont plus fiables après une analyse IA complète.`,
            "Comment optimiser les cotisations ?": `💡 Optimisation des cotisations sociales...

J'analyse les opportunités d'optimisation :
• Réduction légale des charges sociales
• Optimisation fiscale
• Aides et crédits d'impôt disponibles

⚖️ Note : Toutes les optimisations respectent la réglementation en vigueur.`
          };

          const response = responses[suggestion.text] || `🤖 Traitement de votre demande...

Je prépare une réponse spécifique à : "${suggestion.text}"

🔄 Pour une analyse approfondie : 
• Lancez l'analyse IA complète
• Fournissez plus de contexte si nécessaire
• Consultez les onglets d'analyse une fois terminé`;

          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response,
            timestamp: new Date()
          };

          setChatMessages(prev => [...prev, assistantMessage]);
          setChatLoading(false);
        }, 1500);
      }, 300);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <Header
          analysis={analysis}
          allPayslips={allPayslips}
          onClose={onClose}
        />

        <div className="flex flex-1 overflow-hidden">
          <AnalysisPanel
            loading={loading}
            error={error}
            analysis={analysis}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allPayslips={allPayslips}
            analyzeData={analyzeData}
            handleSuggestionClick={handleSuggestionClick}
          />

          <ChatPanel
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            allPayslips={allPayslips}
            hasDataForChat={hasDataForChat}
            chatEndRef={chatEndRef}
            handleSuggestionClick={handleSuggestionClick}
            userInput={userInput}
            setUserInput={setUserInput}
            sendMessage={sendMessage}
            chatMessagesCount={chatMessages.length}
          />
        </div>

        <Footer
          analysis={analysis}
          allPayslips={allPayslips}
          chatMessages={chatMessages}
          handleSuggestionClick={handleSuggestionClick}
          loadAllPayslips={loadAllPayslips}
          setChatMessages={setChatMessages}
          setAnalysis={setAnalysis}
          onClose={onClose}
        />
      </div>
    </div>
  );
}