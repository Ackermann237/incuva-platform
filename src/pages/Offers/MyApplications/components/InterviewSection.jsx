// src/pages/Offers/MyApplications/components/InterviewSection.jsx
import React from 'react';
import { Video, BookOpen, Star, PlayCircle } from 'lucide-react';

export default function InterviewSection({ stats, navigate }) {
  return (
    <div className="mt-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Préparez-vous pour vos entretiens</h3>
            <p className="text-white/90">
              Vous avez {stats.accepted} entretien{stats.accepted > 1 ? 's' : ''} à préparer.
              Utilisez nos outils pour maximiser vos chances de succès.
            </p>
          </div>
          <button
              onClick={() => navigate('/interview/training')}
              className="px-6 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap"
          >
              <PlayCircle className="w-5 h-5" />
              Accéder à la formation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <FeatureCard
            icon={<Video className="w-5 h-5 text-white" />}
            title="Simulation d'entretien"
            description="Entraînez-vous avec notre IA qui simule un vrai entretien"
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5 text-white" />}
            title="Guide de préparation"
            description="Conseils, questions types et meilleures pratiques"
          />
          <FeatureCard
            icon={<Star className="w-5 h-5 text-white" />}
            title="Feedback personnalisé"
            description="Recevez des retours sur vos réponses et votre présentation"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h4 className="font-bold">{title}</h4>
      </div>
      <p className="text-sm text-white/90">{description}</p>
    </div>
  );
}