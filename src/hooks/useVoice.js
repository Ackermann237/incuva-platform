// src/hooks/useVoice.js
// Voix du navigateur : synthèse vocale (Jarvis parle) et reconnaissance vocale (on parle à Jarvis).
// Aucune donnée n'est stockée par l'application ; la reconnaissance passe par le service vocal du navigateur (Chrome / Edge).
import { useCallback, useEffect, useRef, useState } from "react";

const RecognitionAPI = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

// Retire ce qui se lit mal à voix haute : emojis, symboles Markdown, listes à puces
const cleanForSpeech = (text) =>
  String(text || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[*_#`>~]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

// Chrome coupe les énoncés trop longs (~15 s) : on découpe par phrases
const toChunks = (text, max = 220) => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > max && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence + " ";
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

export default function useVoice({ lang = "fr-FR" } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [speechBlocked, setSpeechBlocked] = useState(false); // le navigateur refuse de parler avant une interaction
  const speechToken = useRef(0); // invalide les énoncés annulés
  const recognitionRef = useRef(null);

  const stopSpeaking = useCallback(() => {
    speechToken.current += 1;
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // Retourne une promesse : true si la lecture est allée au bout, false si elle a été bloquée ou interrompue
  const speak = useCallback(
    (text) =>
      new Promise((resolve) => {
        const cleaned = cleanForSpeech(text);
        if (!canSpeak || !cleaned) return resolve(false);

        window.speechSynthesis.cancel();
        const token = ++speechToken.current;
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith("fr"));
        const chunks = toChunks(cleaned);
        let blocked = false;

        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = lang;
          if (voice) utterance.voice = voice;
          utterance.rate = 1.02;
          utterance.pitch = 0.95;
          if (index === 0) {
            utterance.onstart = () => {
              if (token !== speechToken.current) return;
              setSpeechBlocked(false);
              setSpeaking(true);
            };
          }
          utterance.onerror = (e) => {
            if (e.error === "not-allowed") {
              blocked = true; // lecture refusée : pas encore d'interaction avec la page
              setSpeechBlocked(true);
            }
            if (token === speechToken.current) setSpeaking(false);
            if (index === chunks.length - 1 || blocked) resolve(false);
          };
          if (index === chunks.length - 1) {
            utterance.onend = () => {
              if (token === speechToken.current) setSpeaking(false);
              resolve(token === speechToken.current);
            };
          }
          window.speechSynthesis.speak(utterance);
        });
      }),
    [lang]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // onFinal(texte) est appelé une fois la phrase terminée
  const listen = useCallback(
    (onFinal) => {
      if (!RecognitionAPI) {
        setVoiceError("La reconnaissance vocale n'est pas disponible sur ce navigateur (utilisez Chrome ou Edge).");
        return;
      }
      stopSpeaking(); // Jarvis se tait pour ne pas s'entendre lui-même
      setVoiceError("");
      setInterim("");

      const recognition = new RecognitionAPI();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      let finalText = "";
      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += transcript;
          else interimText += transcript;
        }
        setInterim(finalText || interimText);
      };
      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError("Le micro est bloqué : autorisez-le dans la barre d'adresse du navigateur.");
        } else if (event.error === "network") {
          setVoiceError("Le service vocal du navigateur est injoignable (connexion Internet requise).");
        } else if (event.error === "audio-capture") {
          setVoiceError("Aucun micro détecté.");
        } // « no-speech » et « aborted » : silence, pas d'erreur à afficher
      };
      recognition.onend = () => {
        setListening(false);
        setInterim("");
        recognitionRef.current = null;
        if (finalText.trim()) onFinal(finalText.trim());
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setListening(false);
      }
    },
    [lang, stopSpeaking]
  );

  // Coupe micro et voix en quittant la page
  useEffect(
    () => () => {
      speechToken.current += 1;
      if (canSpeak) window.speechSynthesis.cancel();
      recognitionRef.current?.abort();
    },
    []
  );

  return {
    speak,
    stopSpeaking,
    listen,
    stopListening,
    speaking,
    listening,
    interim,
    voiceError,
    speechBlocked,
    clearVoiceError: () => setVoiceError(""),
    canSpeak,
    canListen: !!RecognitionAPI,
  };
}
