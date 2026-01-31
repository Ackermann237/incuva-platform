// src/pages/Jobs/users/TrainingInterview/components/InputPanel.jsx
import React from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

export default function InputPanel({
  userAnswer,
  setUserAnswer,
  isRecording,
  toggleRecording,
  handleSubmitAnswer,
  clearAnswer,
  skipQuestion,
  isSubmitting,
  currentQuestionIndex,
  totalQuestions
}) {
  return (
    <div className="border-t border-gray-200 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} sur {totalQuestions}
          </div>
          <button
            onClick={skipQuestion}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Passer cette question
          </button>
        </div>

        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tapez votre réponse ici... ou utilisez la reconnaissance vocale"
          className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none resize-none"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              disabled={isSubmitting}
              className={`p-3 rounded-full ${
                isRecording
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-gray-600">
              {isRecording ? 'Enregistrement...' : 'Appuyez pour parler'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Effacer
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer la réponse
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}