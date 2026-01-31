// src/pages/Jobs/users/TrainingInterview/hooks/useSpeechSynthesis.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = (options = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [error, setError] = useState(null);
  const [speechQueue, setSpeechQueue] = useState([]);
  const currentUtteranceRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Charger les voix disponibles
  useEffect(() => {
    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Trouver la meilleure voix française
        const frenchVoices = availableVoices.filter(voice =>
          voice.lang.includes('fr') || voice.lang.includes('FR')
        );

        // Priorité : voix Microsoft (souvent meilleures), puis Google
        let bestVoice = frenchVoices.find(voice =>
          voice.name.includes('Microsoft') &&
          (voice.name.includes('Catherine') || voice.name.includes('Julie') || voice.name.includes('Paul'))
        );

        if (!bestVoice) {
          bestVoice = frenchVoices.find(voice =>
            voice.name.includes('Google') && voice.name.includes('Français')
          );
        }

        if (!bestVoice && frenchVoices.length > 0) {
          bestVoice = frenchVoices[0];
        }

        setSelectedVoice(bestVoice || availableVoices[0]);
      } catch (err) {
        console.error('Erreur chargement voix:', err);
        setError('Impossible de charger les voix disponibles');
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Certains navigateurs nécessitent un délai
      setTimeout(() => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }, 100);
    } else {
      setError('La synthèse vocale n\'est pas supportée par votre navigateur');
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        cancel();
      }
    };
  }, []);

  // Traiter la file d'attente de parole
  useEffect(() => {
    if (speechQueue.length > 0 && !isProcessingRef.current) {
      processNextInQueue();
    }
  }, [speechQueue]);

  const processNextInQueue = useCallback(() => {
    if (speechQueue.length === 0 || isProcessingRef.current) return;

    isProcessingRef.current = true;
    const { text, voiceOptions, resolve, reject } = speechQueue[0];

    speakInternal(text, voiceOptions)
      .then(() => {
        // Succès
        setSpeechQueue(prev => prev.slice(1));
        isProcessingRef.current = false;
        resolve();
      })
      .catch((err) => {
        // Échec
        setSpeechQueue(prev => prev.slice(1));
        isProcessingRef.current = false;
        reject(err);
      });
  }, [speechQueue]);

  const speakInternal = useCallback((text, voiceOptions = {}) => {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          throw new Error('Synthèse vocale non disponible');
        }

        // Arrêter toute parole en cours
        window.speechSynthesis.cancel();

        // Pré-traiter le texte pour plus de fluidité
        const processedText = preprocessText(text);

        const utterance = new SpeechSynthesisUtterance(processedText);

        // Configuration avec priorités : voiceOptions > options du hook > valeurs par défaut
        const finalVoice = voiceOptions.voice || selectedVoice;
        const finalRate = voiceOptions.rate !== undefined ? voiceOptions.rate :
                         (options.rate !== undefined ? options.rate : 0.9);
        const finalPitch = voiceOptions.pitch !== undefined ? voiceOptions.pitch :
                          (options.pitch !== undefined ? options.pitch : 1.1);
        const finalVolume = voiceOptions.volume !== undefined ? voiceOptions.volume :
                           (options.volume !== undefined ? options.volume : 1.0);
        const finalLang = voiceOptions.lang || options.lang || 'fr-FR';

        utterance.voice = finalVoice;
        utterance.rate = finalRate;
        utterance.pitch = finalPitch;
        utterance.volume = finalVolume;
        utterance.lang = finalLang;

        // Ajustement automatique en fonction de la longueur du texte
        const sentenceCount = processedText.split(/[.!?]+/).length;
        if (sentenceCount > 3) {
          utterance.rate = Math.max(0.7, utterance.rate - (sentenceCount * 0.02));
        }

        currentUtteranceRef.current = utterance;

        // Gestionnaires d'événements
        utterance.onstart = () => {
          console.log('🟢 Début synthèse vocale:', processedText.substring(0, 50) + '...');
          setIsSpeaking(true);
          setIsPaused(false);
          if (voiceOptions.onStart) voiceOptions.onStart();
        };

        utterance.onend = () => {
          console.log('🟣 Fin synthèse vocale');
          setIsSpeaking(false);
          setIsPaused(false);
          currentUtteranceRef.current = null;
          if (voiceOptions.onEnd) voiceOptions.onEnd();
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('🔴 Erreur synthèse vocale:', event);
          setIsSpeaking(false);
          setIsPaused(false);
          currentUtteranceRef.current = null;
          setError(`Erreur synthèse vocale: ${event.error}`);
          if (voiceOptions.onError) voiceOptions.onError(event.error);
          reject(new Error(event.error));
        };

        utterance.onpause = () => {
          console.log('⏸️ Synthèse vocale en pause');
          setIsPaused(true);
          if (voiceOptions.onPause) voiceOptions.onPause();
        };

        utterance.onresume = () => {
          console.log('▶️ Reprise synthèse vocale');
          setIsPaused(false);
          if (voiceOptions.onResume) voiceOptions.onResume();
        };

        utterance.onboundary = (event) => {
          // Pour animations ou timing précis si nécessaire
          if (voiceOptions.onBoundary) voiceOptions.onBoundary(event);
        };

        // Timeout de sécurité
        const timeoutDuration = processedText.length * 120; // ~120ms par caractère
        const timeoutId = setTimeout(() => {
          if (isSpeaking) {
            console.warn('⚠️ Timeout synthèse vocale, annulation');
            window.speechSynthesis.cancel();
            resolve(); // Resoudre quand même pour éviter les blocages
          }
        }, timeoutDuration);

        utterance.onend = () => {
          clearTimeout(timeoutId);
          setIsSpeaking(false);
          setIsPaused(false);
          currentUtteranceRef.current = null;
          if (voiceOptions.onEnd) voiceOptions.onEnd();
          resolve();
        };

        console.log('🎤 Lancement synthèse vocale avec paramètres:', {
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume,
          lang: utterance.lang,
          voice: utterance.voice?.name || 'défaut'
        });

        window.speechSynthesis.speak(utterance);

      } catch (err) {
        console.error('❌ Erreur fatale synthèse vocale:', err);
        setError(`Erreur lors de la synthèse: ${err.message}`);
        reject(err);
      }
    });
  }, [selectedVoice, options, isSpeaking]);

  // Fonction de pré-traitement du texte pour une parole plus naturelle
  const preprocessText = (text) => {
    return text
      // Normaliser les espaces
      .replace(/\s+/g, ' ')
      // Ajouter des pauses naturelles après la ponctuation
      .replace(/([.!?])\s+/g, '$1  ')
      .replace(/,(\S)/g, ', $1')
      .replace(/:\s*/g, ': ')
      // Corriger certaines abréviations pour une meilleure prononciation
      .replace(/\bM\./g, 'Monsieur')
      .replace(/\bMme\./g, 'Madame')
      .replace(/\bDr\./g, 'Docteur')
      // Ajouter des pauses pour les listes
      .replace(/;\s*/g, '; ')
      // Échapper certains caractères problématiques
      .replace(/\(/g, ' ')
      .replace(/\)/g, ' ')
      .replace(/\[/g, ' ')
      .replace(/\]/g, ' ')
      .trim();
  };

  const speak = useCallback((text, voiceOptions = {}) => {
    return new Promise((resolve, reject) => {
      // Ajouter à la file d'attente
      setSpeechQueue(prev => [...prev, { text, voiceOptions, resolve, reject }]);
    });
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeechQueue([]);
      isProcessingRef.current = false;
      currentUtteranceRef.current = null;
    }
  }, []);

  const changeVoice = useCallback((voice) => {
    setSelectedVoice(voice);
  }, []);

  const getCurrentVoice = useCallback(() => {
    return selectedVoice;
  }, [selectedVoice]);

  const clearQueue = useCallback(() => {
    setSpeechQueue([]);
  }, []);

  return {
    // États
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    error,

    // Actions principales
    speak,
    pause,
    resume,
    cancel,

    // Actions supplémentaires
    changeVoice,
    getCurrentVoice,
    clearQueue,

    // Info
    queueLength: speechQueue.length,
    isProcessing: isProcessingRef.current,

    // Utilitaire
    preprocessText
  };
};