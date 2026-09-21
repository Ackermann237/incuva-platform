// src/components/jarvis/MessageBubble.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import Markdown from "./Markdown";

const time = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1" role="status" aria-label="Jarvis réfléchit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-cyan-300"
          style={{ animation: `jv-blink 1.2s ${i * 0.2}s infinite`, boxShadow: "0 0 10px rgba(34,211,238,.9)" }}
        />
      ))}
    </div>
  );
}

export default function MessageBubble({ message, showSuggestions, onSuggestion, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* presse-papiers indisponible : sans conséquence */
    }
  };

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-[0.95rem] leading-relaxed text-white shadow-[0_0_30px_rgba(34,211,238,0.28)]">
            {message.content}
          </div>
          <p className="jv-mono mt-1 text-right text-[10px] uppercase text-slate-500">{time(message.timestamp)}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex gap-3">
      <div
        className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          message.error ? "bg-rose-500/20 text-rose-300" : "bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-[0_0_18px_rgba(34,211,238,0.55)]"
        }`}
      >
        {message.error ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className="min-w-0 max-w-full flex-1 sm:max-w-[48rem]">
        <div className={`jv-glass relative rounded-2xl rounded-tl-sm px-5 py-4 ${message.error ? "!border-rose-400/40" : ""}`}>
          <span className="jv-corner jv-corner-tl" />
          <span className="jv-corner jv-corner-br" />
          {message.content ? (
            message.error ? (
              <p className="text-sm text-rose-200">{message.content}</p>
            ) : (
              <Markdown>{message.content}</Markdown>
            )
          ) : (
            <ThinkingDots />
          )}
          {message.streaming && message.content && <span className="jv-caret" aria-hidden="true" />}
        </div>

        {!message.streaming && (
          <div className="mt-1.5 flex items-center gap-3 pl-1">
            <span className="jv-mono text-[10px] uppercase text-slate-500">{time(message.timestamp)}</span>
            {message.interrupted && <span className="jv-mono text-[10px] uppercase text-amber-300">interrompu</span>}
            {!message.error && (
              <button type="button" onClick={copy} className="flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-cyan-300" aria-label="Copier la réponse">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copié" : "Copier"}
              </button>
            )}
            {message.error && message.retryText && (
              <button type="button" onClick={() => onRetry(message)} className="flex items-center gap-1 text-[11px] text-rose-300 transition hover:text-rose-100">
                <RotateCcw className="h-3.5 w-3.5" /> Réessayer
              </button>
            )}
          </div>
        )}

        {showSuggestions && message.suggestions?.length > 0 && !message.streaming && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestion(suggestion)}
                className="jv-glass jv-glass-hover rounded-full px-3.5 py-1.5 text-left text-xs text-cyan-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
