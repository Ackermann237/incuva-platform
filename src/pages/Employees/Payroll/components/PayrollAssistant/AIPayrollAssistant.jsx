// src/pages/Employees/Payroll/components/PayrollAssistant/AIPayrollAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import AnalysisPanel from './AnalysisPanel';
import AnalysisProgress from './AnalysisProgress';
import PayrollReport from './PayrollReport';
import ChatPanel from './ChatPanel';
import Footer from './Footer';
import { analyzePayrollWithAI, queryPayrollAI, getAllPayslipsForAI } from '../../../../../services/payroll';

export default function AIPayrollAssistant({ isOpen, onClose, payrollData }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [view, setView] = useState('report'); // 'report' : rapport complet, 'chat' : discussion avec l'assistant
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
            content: `Bonjour ! Je suis votre assistant IA pour la gestion de paie.\n\nJ'ai accès à **${result.payslips.length} bulletin(s)** de paie de votre entreprise. Posez-moi n'importe quelle question : je réponds à partir de vos chiffres réels, et aussi sur les règles générales de la paie.\n\nAstuce : lancez d'abord **l'analyse IA** pour obtenir un rapport complet, puis discutez des résultats ici.`,
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
      // Le serveur relit tous les bulletins, calcule les indicateurs et fait rédiger l'analyse par l'IA
      const result = await analyzePayrollWithAI();

      if (result.success) {
        const { metrics, narrative } = result.analysis;
        setAnalysis(result.analysis);
        setView('report');

        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          content: `Analyse terminée. Score de santé de la paie : **${metrics.score_sante.score ?? '—'}/100** (${metrics.score_sante.niveau}).\n\n${narrative.synthese}\n\nPosez-moi vos questions sur ces résultats.`,
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

  // `override` : texte envoyé directement (suggestion cliquée) ; sinon le contenu du champ de saisie
  const sendMessage = async (override) => {
    const text = (typeof override === 'string' ? override : userInput).trim();
    if (!text || chatLoading) return;

    setChatMessages(prev => [...prev, { id: Date.now(), type: 'user', content: text, timestamp: new Date() }]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await queryPayrollAI(text);

      if (!response.success) throw new Error(response.error);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, type: 'assistant', content: response.answer, timestamp: new Date() }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Désolé, je n'ai pas pu répondre : ${err.message || 'erreur inconnue'}. Réessayez dans un instant.`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Une suggestion pose réellement la question à l'IA (plus de réponses préécrites)
  const handleSuggestionClick = (suggestion) => {
    setView('chat');
    sendMessage(suggestion.text);
  };

  const askFromReport = (question) => {
    setView('chat');
    sendMessage(question);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  const showReport = analysis && view === 'report' && !loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl max-w-6xl w-full h-[88vh] overflow-hidden flex flex-col shadow-2xl">
        <Header
          analysis={analysis}
          allPayslips={allPayslips}
          onClose={onClose}
          view={view}
          setView={setView}
        />

        {loading ? (
          <AnalysisProgress />
        ) : showReport ? (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-5 md:p-6">
            <PayrollReport analysis={analysis} onAsk={askFromReport} onNewAnalysis={analyzeData} />
          </div>
        ) : (
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
        )}

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
