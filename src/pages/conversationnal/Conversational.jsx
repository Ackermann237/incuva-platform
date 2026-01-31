// src/pages/conversational/Conversational.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Database, Shield,
  Mic, MicOff, RefreshCw, ChevronLeft,
  Users, Calendar, Clock, Download,
  BarChart, PieChart, TrendingUp, AlertTriangle,
  Brain, Target, Zap, Search, Filter,
  MessageSquare, Smile
} from 'lucide-react';

// Services
import { getEmployees } from '../../services/employees';
import { getPlanning } from '../../services/planning';
import { getAbsences } from '../../services/absence';
import { processConversationalQuery } from '../../services/conversational';

export default function Conversational() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Bonjour ! Je suis Jarvis, votre assistant IA RH intelligent.\n\nJe peux analyser vos données en temps réel pour vous aider à :\n\n📊 Examiner les processus RH\n🔍 Détecter des anomalies\n📈 Analyser les tendances\n💡 Proposer des améliorations\n\nComment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [dataSources, setDataSources] = useState({
    employees: [],
    planning: [],
    absences: []
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInitialData = async () => {
    try {
      const [employeesRes, planningRes, absencesRes] = await Promise.all([
        getEmployees(),
        getPlanning(),
        getAbsences()
      ]);

      if (employeesRes.success) {
        setDataSources(prev => ({ ...prev, employees: employeesRes.employees }));
      }
      if (planningRes.success) {
        setDataSources(prev => ({ ...prev, planning: planningRes.planning }));
      }
      if (absencesRes.success) {
        setDataSources(prev => ({ ...prev, absences: absencesRes.absences }));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const formatAssistantMessage = (text) => {
    // Si le texte contient des sections structurées (comme les analyses RH)
    if (text.includes('📊') || text.includes('🔍') || text.includes('📈') || text.includes('💡')) {
      const sections = text.split('\n\n');
      return sections.map((section, sectionIndex) => {
        const lines = section.split('\n');

        return (
          <div key={sectionIndex} className="mb-4 last:mb-0">
            {lines.map((line, lineIndex) => {
              // Détection des emojis pour le style
              const emojiMatch = line.trim().match(/^([📊🔍📈💡⚠️🎯✨🔴🟡🟢🤖🚀⭐🌟✅❌]+)/);
              if (emojiMatch) {
                const emoji = emojiMatch[1];
                const restOfLine = line.slice(emoji.length).trim();
                return (
                  <div key={lineIndex} className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="font-semibold text-blue-700">
                      {restOfLine}
                    </span>
                  </div>
                );
              }

              if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 ml-4 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{line.substring(2).trim()}</span>
                  </div>
                );
              }

              if (line.trim().match(/^\d+\.\s/)) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 ml-4 mb-1">
                    <span className="text-blue-600 font-medium mt-0.5 flex-shrink-0">{line.match(/^\d+\./)[0]}</span>
                    <span className="text-gray-700">{line.substring(line.indexOf('.') + 1).trim()}</span>
                  </div>
                );
              }

              return (
                <div key={lineIndex} className="text-gray-700 mb-2">
                  {line}
                </div>
              );
            })}
          </div>
        );
      });
    }

    // Pour les conversations générales (sans structure particulière)
    return text.split('\n').map((line, index) => (
      <div key={index} className="text-gray-700 mb-2 last:mb-0">
        {line}
      </div>
    ));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Appeler le service de traitement conversationnel
      const response = await processConversationalQuery(currentInput, dataSources);

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        type: response.type || 'text',
        analysis: response.analysis,
        suggestions: response.suggestions,
        dataPoints: response.dataPoints
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur traitement IA:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue lors de l\'analyse. Veuillez réessayer ou poser votre question différemment.',
        timestamp: new Date().toISOString(),
        type: 'text',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const quickQuestions = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'Conversation',
      query: 'Bonjour, comment ça va ?'
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Détecter anomalies',
      query: 'Y a-t-il des anomalies dans le processus de recrutement ?'
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Risque burnout',
      query: 'Quels employés risquent un burnout ?'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Analyser tendances',
      query: 'Quelles sont les tendances d\'absentéisme ?'
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: 'Optimiser planning',
      query: 'Comment optimiser le planning de la semaine prochaine ?'
    },
  ];

  const dataStats = [
    {
      label: 'Employés',
      value: dataSources.employees.length,
      active: dataSources.employees.filter(e => e.status === 'active').length,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Planning',
      value: dataSources.planning.length,
      today: dataSources.planning.filter(s => s.date === new Date().toISOString().split('T')[0]).length,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Absences',
      value: dataSources.absences.length,
      pending: dataSources.absences.filter(a => a.status === 'pending').length,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handleQuestionClick = (query) => {
    setInput(query);
    // Focus sur le textarea
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 100);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-blue-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Jarvis Assistant IA</h1>
                <p className="text-sm text-blue-600">Assistant RH intelligent & conversationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadInitialData}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                title="Actualiser les données"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>IA Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className={`flex-1 ${message.role === 'user' ? '' : ''}`}>
                  <div className="inline-block max-w-full">
                    <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white border border-blue-100'
                    } ${message.isError ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="text-sm leading-relaxed">
                        {message.role === 'user'
                          ? message.content.split('\n').map((line, idx) => (
                              <div key={idx} className="text-white/95">{line}</div>
                            ))
                          : formatAssistantMessage(message.content)
                        }
                      </div>
                    </div>
                    <div className={`mt-1 text-xs ${message.role === 'user' ? 'text-blue-600' : 'text-blue-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-blue-100 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm text-blue-600 ml-2">Jarvis réfléchit...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-blue-100 bg-white/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            {/* Questions rapides */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question.query)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-sm text-blue-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  {question.icon}
                  {question.label}
                </button>
              ))}
            </div>

            {/* Input principal */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Parlez-moi comme à un ami ou posez une question RH (ex: 'Bonjour !' ou 'Analyse les risques de burnout')..."
                className="w-full p-4 pr-28 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl focus:outline-none resize-none bg-white text-gray-900 placeholder-blue-400 shadow-sm"
                rows="3"
                disabled={isLoading}
              />

              {/* Boutons d'action */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 border border-red-200' 
                      : 'hover:bg-blue-100 text-blue-600 border border-blue-200'
                  }`}
                  title={isRecording ? "Arrêter l'enregistrement" : "Enregistrement vocal"}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    !input.trim() || isLoading
                      ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>

            {/* Indicateurs */}
            <div className="mt-3 flex items-center justify-between text-xs text-blue-500">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Conversation sécurisée</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span>Llama 3.1</span>
                <kbd className="px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200">Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar à droite */}
      <div className={`flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-l border-blue-100 shadow-lg`}>
        {/* Header sidebar */}
        <div className="p-4 border-b border-blue-100">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center justify-between w-full group"
          >
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Données RH</h3>
                    <p className="text-xs text-blue-600">Connecté en direct</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
              </>
            ) : (
              <Database className="w-6 h-6 text-blue-600" />
            )}
          </button>
        </div>

        {/* Statistiques */}
        {!isSidebarCollapsed && (
          <div className="p-4 space-y-4">
            {dataStats.map((stat, index) => (
              <div key={index} className={`rounded-xl p-4 border ${stat.bgColor} border-blue-200`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <span className="font-medium text-gray-900">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-800">{stat.value}</span>
                </div>
                <div className="text-sm text-blue-600">
                  {stat.active && `${stat.active} actifs`}
                  {stat.today && `${stat.today} aujourd'hui`}
                  {stat.pending && `${stat.pending} en attente`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Types de conversations */}
        <div className="p-4 border-t border-blue-100">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-gray-900">Conversation</h4>
            </div>
          )}
          <div className="space-y-2">
            {[
              {
                icon: <Smile className="w-4 h-4" />,
                label: 'Conversation générale',
                action: () => handleQuestionClick('Bonjour ! Comment vas-tu aujourd\'hui ?')
              },
              {
                icon: <Brain className="w-4 h-4" />,
                label: 'Questions RH',
                action: () => handleQuestionClick('Peux-tu m\'expliquer les lois RH récentes ?')
              },
              {
                icon: <BarChart className="w-4 h-4" />,
                label: 'Analyse données',
                action: () => handleQuestionClick('Analyse mes données RH actuelles')
              }
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-start p-3'} w-full rounded-lg hover:bg-blue-50 text-blue-700 transition-colors border border-transparent hover:border-blue-200`}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <span className="ml-3 text-sm">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Export */}
        <div className="mt-auto p-4 border-t border-blue-100">
          <button
            onClick={() => {
              const conversationText = messages.map(msg =>
                `${msg.role === 'user' ? 'Vous' : 'Jarvis'} (${new Date(msg.timestamp).toLocaleString('fr-FR')}):\n${msg.content}\n\n`
              ).join('');

              const blob = new Blob([conversationText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `conversation-jarvis-${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-start p-3'} w-full rounded-lg hover:bg-blue-50 text-blue-700 transition-colors border border-blue-200 hover:border-blue-300`}
          >
            <Download className="w-5 h-5" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm">Exporter la conversation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}