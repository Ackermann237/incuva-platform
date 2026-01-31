// frontend/src/services/SpeechAnalyzer.js

let mediaRecorder = null;
let audioChunks = [];
let silenceTimer = null;
let isRecording = false;
let lastSpeechTime = Date.now();
const SPEECH_THRESHOLD_SECONDS = 8; // ← X secondes
let onSpeechDetected = null;
let onAnalysisUpdate = null;

export const startSpeechAnalysis = (callbacks) => {
  onSpeechDetected = callbacks.onSpeechDetected;
  onAnalysisUpdate = callbacks.onAnalysisUpdate;

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioChunks = [];

      // Envoi au backend pour transcription + analyse
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");

      try {
        const res = await fetch("/api/ai_assistant/analyze_speech", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await res.json();
        if (data.transcript && onSpeechDetected) {
          onSpeechDetected(data.transcript, data.suggested_questions);
        }
        if (onAnalysisUpdate) {
          onAnalysisUpdate(data.analysis);
        }
      } catch (err) {
        console.error("Erreur analyse audio:", err);
      }
    };

    // Détection de silence → déclenche l’envoi toutes les X secondes de parole continue
    const startSilenceDetection = () => {
      silenceTimer = setInterval(() => {
        if (Date.now() - lastSpeechTime > SPEECH_THRESHOLD_SECONDS * 1000 && isRecording) {
          mediaRecorder.stop();
          isRecording = false;
        }
      }, 1000);
    };

    // Restart après chaque envoi
    const restartRecording = () => {
      if (mediaRecorder.state === "inactive") {
        mediaRecorder.start();
        isRecording = true;
        lastSpeechTime = Date.now();
      }
    };

    mediaRecorder.onstart = restartRecording;
    mediaRecorder.onstop = () => {
      setTimeout(restartRecording, 500);
    };

    // Détection de voix via Web Audio API (simple energy threshold)
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    source.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    scriptProcessor.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const average = array.reduce((a, b) => a + b) / array.length;

      if (average > 25) {
        // Voix détectée
        lastSpeechTime = Date.now();
        if (!isRecording) {
          mediaRecorder.start();
          isRecording = true;
        }
      }
    };

    mediaRecorder.start();
    isRecording = true;
    startSilenceDetection();
  }).catch(err => {
    console.error("Accès micro refusé ou erreur:", err);
  });
};

export const stopSpeechAnalysis = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (silenceTimer) clearInterval(silenceTimer);
};