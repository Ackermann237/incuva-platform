// src/pages/Jobs/users/TrainingInterview/components/Header.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Video, Star } from 'lucide-react';

export default function Header({ jobDetails, feedback }) {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => navigate('/my-applications')}
        className="flex items-center gap-3 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Video className="w-8 h-8 text-blue-600" />
          Simulation d'Entretien
        </h1>
        {jobDetails && (
          <p className="text-gray-600 mt-1">
            Poste: <span className="font-semibold">{jobDetails.title}</span> •
            Entreprise: <span className="font-semibold">{jobDetails.company}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {feedback && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl">
            <Star className="w-5 h-5" />
            <span className="font-bold">
              {feedback.completedQuestions || 0}/{feedback.totalQuestions || 0} questions
            </span>
          </div>
        )}

        {applicationId && (
          <button
            onClick={() => navigate(`/visio-training/${applicationId}`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Entraînement Visio
          </button>
        )}
      </div>
    </div>
  );
}