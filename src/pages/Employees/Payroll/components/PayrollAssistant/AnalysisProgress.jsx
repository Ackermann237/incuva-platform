// src/pages/Employees/Payroll/components/PayrollAssistant/AnalysisProgress.jsx
// Écran d'attente animé pendant l'analyse : reprend, dans l'ordre, les étapes réellement exécutées par le serveur.
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import LottieLoader from '../../../../../components/lottie/LottieLoader';

const DEFAULT_STEPS = [
  'Lecture de tous vos bulletins de paie',
  'Calcul des indicateurs et des ratios',
  'Contrôle des anomalies (doublons, écarts, retards de paiement)',
  'Projection des coûts des prochains mois',
  "Rédaction de l'analyse par l'IA",
];

export default function AnalysisProgress({ title = "Analyse en cours", steps = DEFAULT_STEPS, stepMs = 2200 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((step) => Math.min(step + 1, steps.length - 1)), stepMs);
    return () => clearInterval(timer);
  }, [steps.length, stepMs]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <LottieLoader label={title} size={150} className="py-0" />
      <ul className="mt-5 w-full max-w-md space-y-2.5" aria-live="polite">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className={`flex items-center gap-3 text-sm transition-all duration-500 ${done ? 'text-emerald-700' : active ? 'font-semibold text-purple-700' : 'text-gray-400'}`}>
              {done ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <Circle className={`h-5 w-5 flex-shrink-0 ${active ? 'animate-pulse' : ''}`} />}
              {step}{active ? '…' : ''}
            </li>
          );
        })}
      </ul>
      <div className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="mt-3 text-xs text-gray-500">Cela peut prendre une dizaine de secondes.</p>
    </div>
  );
}
