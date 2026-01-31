// src/pages/Jobs/users/TrainingInterview/components/ProgressPanel.jsx
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export default function ProgressPanel({ interviewData, feedback, currentQuestionIndex }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Progression</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Questions complétées</span>
            <span>{feedback?.completedQuestions || 0}/{interviewData?.questions.length || 0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((feedback?.completedQuestions || 0) / (interviewData?.questions.length || 1)) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {interviewData?.questions.map((q, index) => (
          <QuestionProgressItem
            key={q.id}
            question={q}
            index={index}
            isCompleted={index < (feedback?.completedQuestions || 0)}
            isCurrent={index === currentQuestionIndex}
            score={feedback?.[q.id]}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionProgressItem({ question, index, isCompleted, isCurrent, score }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isCompleted
          ? 'bg-green-50 border border-green-100'
          : isCurrent
          ? 'bg-blue-50 border border-blue-100'
          : 'bg-gray-50'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isCompleted
          ? 'bg-green-100 text-green-600'
          : isCurrent
          ? 'bg-blue-100 text-blue-600'
          : 'bg-gray-100 text-gray-400'
      }`}>
        {isCompleted ? (
          <CheckCircle className="w-4 h-4" />
        ) : isCurrent ? (
          <Clock className="w-4 h-4" />
        ) : (
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{question.category}</p>
      </div>
      {score && (
        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
          {score}/10
        </div>
      )}
    </div>
  );
}