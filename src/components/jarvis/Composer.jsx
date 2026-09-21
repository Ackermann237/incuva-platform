// src/components/jarvis/Composer.jsx
// Zone de saisie : orbe Jarvis animée au-dessus (mode conversation), champ de texte, micro, envoi / arrêt.
import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Send, Square, ShieldCheck } from "lucide-react";
import JarvisOrb from "../lottie/JarvisOrb";

const MAX_CHARS = 2000;

function VoiceBars({ active }) {
  if (!active) return null;
  return (
    <div className="hidden h-7 items-center gap-1 sm:flex" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className="jv-bar" style={{ animationDelay: `${i * 0.08}s`, animationDuration: `${0.55 + (i % 4) * 0.14}s` }} />
      ))}
    </div>
  );
}

export default function Composer({
  value, onChange, onSend, onStop, streaming,
  showStrip, orbState, statusText, onMic, listening, canListen,
  voiceError, onClearVoiceError, speechBlocked, voiceEnabled, onReplayGreeting,
}) {
  const textareaRef = useRef(null);

  // Le champ grandit avec le texte (6 lignes maximum)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !streaming;

  return (
    <div className="relative z-10 px-4 pb-4 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {showStrip && (
          <div className="jv-glass relative mb-3 flex items-center gap-4 rounded-2xl px-4 py-1">
            <span className="jv-corner jv-corner-tl" />
            <span className="jv-corner jv-corner-tr" />
            <button
              type="button"
              onClick={onMic}
              disabled={!canListen}
              className="relative flex-shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-default"
              aria-label={listening ? "Arrêter le micro" : "Parler à Jarvis"}
              title={canListen ? (listening ? "Cliquez pour arrêter" : "Cliquez pour parler à Jarvis") : "Micro indisponible sur ce navigateur"}
            >
              <div className="jv-orb-halo" style={{ inset: "-6%" }} />
              <div className="relative">
                <JarvisOrb state={orbState} size={88} />
              </div>
            </button>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="jv-mono text-[10px] font-semibold uppercase text-cyan-300">Jarvis · assistant IA</p>
              <p className="mt-0.5 truncate text-sm text-cyan-50">{statusText}</p>
            </div>
            <VoiceBars active={orbState === "listening" || orbState === "speaking"} />
          </div>
        )}

        <div className="jv-glass jv-composer relative rounded-2xl p-2 pl-4">
          <span className="jv-corner jv-corner-tl" />
          <span className="jv-corner jv-corner-tr" />
          <span className="jv-corner jv-corner-bl" />
          <span className="jv-corner jv-corner-br" />
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Posez votre question à Jarvis..."
              aria-label="Votre message pour Jarvis"
              className="max-h-[168px] min-h-[44px] flex-1 resize-none self-center bg-transparent py-2.5 text-[0.95rem] text-slate-100 placeholder-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={onMic}
              disabled={!canListen}
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                listening
                  ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                  : "border-white/10 text-cyan-200 hover:border-cyan-400/50 hover:bg-cyan-400/10"
              }`}
              aria-label={listening ? "Arrêter le micro" : "Dicter un message"}
              title={canListen ? (listening ? "Arrêter l'enregistrement" : "Dicter un message") : "Micro indisponible sur ce navigateur"}
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-rose-400/50 bg-rose-500/15 text-rose-200 transition hover:bg-rose-500/25"
                aria-label="Arrêter la réponse"
                title="Arrêter la réponse"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                className="jv-send flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white"
                aria-label="Envoyer"
                title="Envoyer (Entrée)"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {(voiceError || (speechBlocked && voiceEnabled)) && (
          <p className="mt-2 text-xs text-amber-300" role="alert">
            {voiceError ? (
              <>
                {voiceError}{" "}
                <button type="button" onClick={onClearVoiceError} className="underline">
                  OK
                </button>
              </>
            ) : (
              <button type="button" onClick={onReplayGreeting} className="underline hover:text-amber-100">
                Le navigateur a bloqué la voix : cliquez ici pour entendre Jarvis
              </button>
            )}
          </p>
        )}

        <div className="jv-mono mt-2 flex items-center justify-between text-[10px] uppercase text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Conversation sécurisée
          </span>
          <span className="hidden sm:inline">Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne</span>
          <span>
            {value.length}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
