// src/pages/conversationnal/Conversational.jsx
// Jarvis : assistant IA de l'entreprise. Un vrai modèle de langage répond à toute question, avec les données RH
// de l'entreprise en contexte ; réponses en flux, voix (accueil, dictée, lecture) et orbe Lottie animée.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CalendarOff, Wallet, FileText, Scale, Sparkles,
  Download, Eraser, Volume2, VolumeX,
} from 'lucide-react';

import { getEmployees } from '../../services/employees';
import { getPlanning } from '../../services/planning';
import { getAbsences } from '../../services/absence';
import { askJarvis, stripSuggestions } from '../../services/conversational';
import JarvisOrb from '../../components/lottie/JarvisOrb';
import MessageBubble from '../../components/jarvis/MessageBubble';
import Composer from '../../components/jarvis/Composer';
import TelemetryPanel from '../../components/jarvis/TelemetryPanel';
import useVoice from '../../hooks/useVoice';
import '../../components/jarvis/jarvis.css';

// Message d'accueil prononcé quand on arrive dans la section IA
const GREETING = "Bonjour, je suis Jarvis, votre assistant RH intelligent. Que puis-je faire pour vous ?";
const VOICE_PREF_KEY = 'jarvis_voice_enabled';
const MAX_SPOKEN_CHARS = 700; // on ne lit à voix haute que le début des longues réponses

const STARTERS = [
  { icon: Activity, title: 'Point RH du jour', prompt: 'Fais-moi un point RH complet de mon entreprise à partir de mes données.' },
  { icon: CalendarOff, title: 'Absences à venir', prompt: 'Qui sera absent prochainement, et quel impact sur le planning ?' },
  { icon: Wallet, title: 'Masse salariale', prompt: 'Analyse ma masse salariale et signale-moi les points d\'attention.' },
  { icon: FileText, title: 'Rédiger une offre', prompt: 'Rédige une offre d\'emploi attractive pour un développeur full stack senior en CDI.' },
  { icon: Scale, title: 'Question juridique', prompt: 'Explique-moi le fonctionnement de la période d\'essai d\'un CDI.' },
  { icon: Sparkles, title: 'Idées managériales', prompt: 'Donne-moi 5 idées concrètes pour motiver mon équipe cette année.' },
];

const readVoicePref = () => {
  try {
    return localStorage.getItem(VOICE_PREF_KEY) !== 'false';
  } catch {
    return true;
  }
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Titre qui s'écrit lettre par lettre
function useTypewriter(text, speed = 42) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(text);
      return undefined;
    }
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return shown;
}

function Hero({ orbState, onMic, canListen, onStarter }) {
  const title = useTypewriter('Bonjour, je suis Jarvis.');
  return (
    <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center py-2 text-center">
      <button
        type="button"
        onClick={onMic}
        disabled={!canListen}
        className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-default"
        aria-label="Parler à Jarvis"
        title={canListen ? 'Cliquez sur l\'orbe pour parler à Jarvis' : 'Micro indisponible sur ce navigateur'}
      >
        <div className="jv-orb-halo" />
        <div className="relative">
          <JarvisOrb state={orbState} size={176} />
        </div>
      </button>

      <p className="jv-mono mt-2 text-[11px] uppercase text-cyan-300">Assistant IA · INCUVA Human Intelligence</p>
      <h1 className="jv-gradient-text mt-3 min-h-[3rem] text-3xl font-bold sm:text-5xl">
        {title}
        <span className="jv-caret" style={{ background: '#a78bfa', boxShadow: '0 0 10px #a78bfa' }} aria-hidden="true" />
      </h1>
      <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
        Posez-moi n'importe quelle question : je connais vos employés, absences, planning, recrutements et contrats, et je
        réponds aussi sur le droit du travail, le management ou la rédaction.
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STARTERS.map(({ icon: Icon, title: startTitle, prompt }, index) => (
          <motion.button
            key={startTitle}
            type="button"
            onClick={() => onStarter(prompt)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.07, duration: 0.4 }}
            className="jv-glass jv-glass-hover group relative rounded-2xl p-3.5 text-left"
          >
            <span className="jv-corner jv-corner-tl" />
            <span className="jv-corner jv-corner-br" />
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-cyan-200 transition group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-white">{startTitle}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{prompt}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function Conversational() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [dataSources, setDataSources] = useState({ employees: [], planning: [], absences: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(readVoicePref);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const sendRef = useRef(null); // dernière version de send (utilisée par le micro)

  const {
    speak, stopSpeaking, listen, stopListening,
    speaking, listening, interim, voiceError, clearVoiceError,
    speechBlocked, canSpeak, canListen,
  } = useVoice({ lang: 'fr-FR' });

  const loadInitialData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [employeesRes, planningRes, absencesRes] = await Promise.all([getEmployees(), getPlanning(), getAbsences()]);
      setDataSources({
        employees: employeesRes?.success ? employeesRes.employees : [],
        planning: planningRes?.success ? planningRes.planning : [],
        absences: absencesRes?.success ? absencesRes.absences : [],
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Jarvis salue à voix haute quand on arrive dans la section
  useEffect(() => {
    if (!voiceEnabled) return undefined;
    const timer = setTimeout(() => speak(GREETING), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coupe la génération en cours quand on quitte la page
  useEffect(() => () => abortRef.current?.abort(), []);

  // Suit la réponse qui s'écrit, sauf si l'utilisateur a remonté la conversation
  useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length > 0 && stickToBottom.current) el.scrollTo({ top: el.scrollHeight });
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  };

  // viaVoice : la question a été dictée, Jarvis répond alors aussi à voix haute
  const send = async (text, viaVoice = false, baseMessages = messages) => {
    const question = (text || '').trim();
    if (!question || streaming) return;

    const now = new Date().toISOString();
    const userMessage = { id: newId(), role: 'user', content: question, timestamp: now };
    const botId = newId();
    const botMessage = { id: botId, role: 'assistant', content: '', timestamp: now, streaming: true };
    const history = [...baseMessages.filter((m) => m.content && !m.error), userMessage].map(({ role, content }) => ({ role, content }));

    stickToBottom.current = true;
    setMessages([...baseMessages, userMessage, botMessage]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const patch = (changes) => setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...changes } : m)));
    let received = '';

    try {
      const { answer, suggestions } = await askJarvis({
        messages: history,
        signal: controller.signal,
        onToken: (token) => {
          received += token;
          patch({ content: stripSuggestions(received) });
        },
      });
      patch({ content: answer, suggestions, streaming: false });
      if (viaVoice && voiceEnabled) speak(answer.slice(0, MAX_SPOKEN_CHARS));
    } catch (error) {
      if (error.name === 'AbortError') {
        patch({ content: stripSuggestions(received) || 'Réponse interrompue.', streaming: false, interrupted: true });
      } else {
        patch({ content: error.message || 'Jarvis est indisponible.', streaming: false, error: true, retryText: question });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };
  sendRef.current = send;

  const handleRetry = (failed) => {
    const base = messages.slice(0, -2); // retire la question et la réponse en erreur
    setMessages(base);
    send(failed.retryText, false, base);
  };

  const handleStop = () => abortRef.current?.abort();

  const handleNewConversation = () => {
    abortRef.current?.abort();
    stopSpeaking();
    setMessages([]);
    setInput('');
  };

  // Micro : on dicte, la phrase est envoyée à la fin, et Jarvis répond à voix haute
  const toggleRecording = () => {
    if (listening) stopListening();
    else listen((spoken) => sendRef.current?.(spoken, true));
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    try {
      localStorage.setItem(VOICE_PREF_KEY, String(next));
    } catch {
      /* préférence non mémorisée : sans conséquence */
    }
    if (next) speak(GREETING);
    else stopSpeaking();
  };

  const exportConversation = () => {
    const text = messages
      .filter((m) => m.content)
      .map((m) => `${m.role === 'user' ? 'Vous' : 'Jarvis'} (${new Date(m.timestamp).toLocaleString('fr-FR')}) :\n${m.content}\n`)
      .join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-jarvis-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Etat de l'orbe et texte d'état
  const orbState = listening ? 'listening' : speaking ? 'speaking' : streaming ? 'thinking' : 'idle';
  const statusText = {
    listening: interim ? `« ${interim} »` : 'Je vous écoute...',
    speaking: 'Jarvis vous parle...',
    thinking: 'Jarvis analyse votre demande...',
    idle: canListen ? 'Prêt. Cliquez sur l\'orbe pour me parler.' : 'Prêt. Posez votre question ci-dessous.',
  }[orbState];

  const todayKey = new Date().toISOString().split('T')[0];
  const stats = {
    employees: dataSources.employees.length,
    activeEmployees: dataSources.employees.filter((e) => e.status === 'active').length,
    shifts: dataSources.planning.length,
    todayShifts: dataSources.planning.filter((s) => s.date === todayKey).length,
    absences: dataSources.absences.length,
    pendingAbsences: dataSources.absences.filter((a) => a.status === 'pending').length,
  };

  const hasConversation = messages.length > 0;
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="jv-root flex h-screen min-h-[620px] w-full">
      <div className="jv-grid" />
      <div className="jv-scan" />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure */}
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_22px_rgba(34,211,238,0.5)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="jv-mono text-sm font-bold uppercase tracking-[0.25em] text-white">J.A.R.V.I.S</h2>
              <p className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                En ligne · Llama 3.1 · données RH en direct
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canSpeak && (
              <button
                type="button"
                onClick={toggleVoice}
                className="rounded-lg p-2 text-cyan-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label={voiceEnabled ? 'Désactiver la voix de Jarvis' : 'Activer la voix de Jarvis'}
                title={voiceEnabled ? 'Voix de Jarvis activée (accueil et réponses aux questions dictées)' : 'Voix de Jarvis désactivée'}
              >
                {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            )}
            <button
              type="button"
              onClick={exportConversation}
              disabled={!hasConversation}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-cyan-200 disabled:opacity-30"
              aria-label="Exporter la conversation"
              title="Exporter la conversation"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNewConversation}
              disabled={!hasConversation}
              className="jv-glass jv-glass-hover ml-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-cyan-100 disabled:opacity-30"
            >
              <Eraser className="h-4 w-4" /> Nouvelle conversation
            </button>
          </div>
        </header>

        {/* Conversation */}
        <div ref={scrollRef} onScroll={handleScroll} className="jv-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {hasConversation ? (
            <div className="mx-auto max-w-4xl space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showSuggestions={message === lastMessage}
                    onSuggestion={(suggestion) => send(suggestion)}
                    onRetry={handleRetry}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Hero orbState={orbState} onMic={toggleRecording} canListen={canListen} onStarter={(prompt) => send(prompt)} />
          )}
        </div>

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          onStop={handleStop}
          streaming={streaming}
          showStrip={hasConversation}
          orbState={orbState}
          statusText={statusText}
          onMic={toggleRecording}
          listening={listening}
          canListen={canListen}
          voiceError={voiceError}
          onClearVoiceError={clearVoiceError}
          speechBlocked={speechBlocked}
          voiceEnabled={voiceEnabled}
          onReplayGreeting={() => speak(GREETING)}
        />
      </div>

      <TelemetryPanel stats={stats} loading={dataLoading} onRefresh={loadInitialData} open={panelOpen} onToggle={() => setPanelOpen((v) => !v)} />
    </div>
  );
}
