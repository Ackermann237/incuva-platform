import React, { useState } from "react";
import { Star, CheckCircle, X, Award, MessageSquare, Zap, Save, TrendingUp } from "lucide-react";

// Simuler la fonction saveEvaluation
const saveEvaluation = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

export default function EvaluationModal({ interviewId, candidateName, onClose = () => {} }) {
  const [form, setForm] = useState({
    technical_score: 5,
    communication_score: 5,
    motivation_score: 5,
    notes_technical: "",
    notes_softskills: "",
    checklist: {
      presentation: false,
      technical_questions: false,
      company_discussion: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const evaluationData = {
      ...form,
      evaluated_at: new Date().toISOString(),
    };

    const res = await saveEvaluation(interviewId, evaluationData);
    setSaving(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => onClose(), 1500);
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const CircularScoreSelector = ({ label, value, onChange, color, icon: Icon }) => {
    const colorClasses = {
      purple: {
        gradient: "from-purple-500 to-purple-600",
        ring: "ring-purple-200",
        bg: "bg-purple-50",
        text: "text-purple-700",
        glow: "shadow-purple-200",
      },
      blue: {
        gradient: "from-blue-500 to-blue-600",
        ring: "ring-blue-200",
        bg: "bg-blue-50",
        text: "text-blue-700",
        glow: "shadow-blue-200",
      },
      emerald: {
        gradient: "from-emerald-500 to-emerald-600",
        ring: "ring-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        glow: "shadow-emerald-200",
      },
    };

    const colors = colorClasses[color];
    const percentage = (value / 10) * 100;

    return (
      <div className="relative">
        <div className={`${colors.bg} rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 h-full`}>
          {/* Icon et Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{label}</h4>
              <p className="text-sm text-gray-500">Évaluation sur 10</p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  className={colors.text}
                  style={{
                    strokeDasharray: `${2 * Math.PI * 70}`,
                    strokeDashoffset: `${2 * Math.PI * 70 * (1 - percentage / 100)}`,
                    transition: 'stroke-dashoffset 0.5s ease'
                  }}
                />
              </svg>
              {/* Center score */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${colors.text}`}>{value}</div>
                  <div className="text-gray-500 text-sm font-medium">/10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score selector buttons */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => onChange(n)}
                className={`h-11 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-110 ${
                  value === n
                    ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg ${colors.glow} scale-105`
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const avgScore = ((form.technical_score + form.communication_score + form.motivation_score) / 3).toFixed(1);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">Évaluation d'entretien</span>
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {candidateName}
              </h2>
              <p className="text-purple-100 text-base">
                Complétez votre évaluation pour finaliser l'entretien
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Scores Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  Notation des compétences
                </h3>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-2xl border-2 border-indigo-100">
                  <div className="text-sm text-gray-600 mb-1">Score moyen</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {avgScore}/10
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <CircularScoreSelector
                  label="Compétences techniques"
                  value={form.technical_score}
                  onChange={(n) => setForm({ ...form, technical_score: n })}
                  color="purple"
                  icon={Award}
                />
                <CircularScoreSelector
                  label="Communication"
                  value={form.communication_score}
                  onChange={(n) => setForm({ ...form, communication_score: n })}
                  color="blue"
                  icon={MessageSquare}
                />
                <CircularScoreSelector
                  label="Motivation"
                  value={form.motivation_score}
                  onChange={(n) => setForm({ ...form, motivation_score: n })}
                  color="emerald"
                  icon={Zap}
                />
              </div>
            </div>

            {/* Checklist Section */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-3xl border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                Points abordés durant l'entretien
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { key: "presentation", label: "Présentation du candidat", emoji: "" },
                  { key: "technical_questions", label: "Questions techniques", emoji: "" },
                  { key: "company_discussion", label: "Discussion entreprise", emoji: "" }
                ].map(({ key, label, emoji }) => (
                  <label
                    key={key}
                    className={`relative flex items-center gap-4 p-5 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                      form.checklist[key]
                        ? 'border-indigo-400 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.checklist[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            checklist: { ...form.checklist, [key]: e.target.checked },
                          })
                        }
                        className="w-6 h-6 text-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="text-3xl">{emoji}</div>
                    <span className={`text-sm font-semibold transition-colors ${
                      form.checklist[key] ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-600'
                    }`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 p-8 rounded-3xl border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-base font-bold text-gray-800">
                    Notes techniques
                  </label>
                </div>
                <textarea
                  rows="6"
                  value={form.notes_technical}
                  onChange={(e) => setForm({ ...form, notes_technical: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 resize-none bg-white/80 backdrop-blur-sm text-sm"
                  placeholder="Points forts, lacunes, technologies maîtrisées, qualité du code, résolution de problèmes..."
                />
              </div>
              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 p-8 rounded-3xl border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-base font-bold text-gray-800">
                    Notes comportementales
                  </label>
                </div>
                <textarea
                  rows="6"
                  value={form.notes_softskills}
                  onChange={(e) => setForm({ ...form, notes_softskills: e.target.value })}
                  className="w-full px-5 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none bg-white/80 backdrop-blur-sm text-sm"
                  placeholder="Communication, motivation, fit culturel, travail d'équipe, adaptation..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-100 p-8 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="max-w-6xl mx-auto flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 border-2 border-gray-300 rounded-2xl hover:bg-white hover:border-gray-400 transition-all font-semibold text-gray-700 hover:shadow-md"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-10 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all transform hover:scale-105 ${
                saved
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-200"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl shadow-lg"
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sauvegarde...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Évaluation sauvegardée !
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Sauvegarder l'évaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}