// src/components/insights/InsightsAssistant.jsx
import React, { useState, useEffect } from "react";
import { X, Sparkles, TrendingUp, Users, Target, Zap, AlertCircle, Briefcase  } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell  } from 'recharts';
import { getRecruitmentInsights } from "../../services/jobs";
import { askAI } from "../../services/aiAssistant";

export default function InsightsAssistant({ isOpen, onClose }) {
  const [insights, setInsights] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadInsights();
    }
  }, [isOpen]);

  const loadInsights = async () => {
    setLoading(true);
    const res = await getRecruitmentInsights();
    if (res.success) {
      setInsights(res.data);

      // Demande à l'IA d'analyser les données
      askAI(
        `Analyse ces statistiques de recrutement et donne-moi 5 insights stratégiques + 3 recommandations concrètes en français :
        - ${res.data.total_applications} candidatures totales
        - ${res.data.accepted} acceptées (${res.data.conversion_rate}% de conversion)
        - ${res.data.total_jobs} offres publiées
        - Top offre : ${res.data.top_performing_jobs[0]?.[0] || 'N/A'} (${res.data.top_performing_jobs[0]?.[1] || 0} candidatures)
        - ${res.data.applications_last_7_days} candidatures cette semaine`,
        res.data
      ).then(r => {
        if (r.response) setAiAnalysis(r.response);
      });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const pieData = insights ? [
    { name: 'En cours', value: insights.pending, color: '#f59e0b' },
    { name: 'Acceptées', value: insights.accepted, color: '#10b981' },
    { name: 'Refusées', value: insights.rejected, color: '#ef4444' },
  ] : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Insights IA Recrutement</h2>
              <p className="text-white/80">Analyse prédictive et recommandations stratégiques</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div class="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">L'IA analyse vos données...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* === COLONNE GAUCHE : Stats & Graphiques === */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                Statistiques Clés
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl">
                  <Users className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{insights?.total_applications || 0}</p>
                  <p className="text-sm opacity-90">Candidatures</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl">
                  <Target className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{insights?.conversion_rate || 0}%</p>
                  <p className="text-sm opacity-90">Taux de conversion</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-2xl">
                  <Zap className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{insights?.applications_last_7_days || 0}</p>
                  <p className="text-sm opacity-90">Cette semaine</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
                  <Briefcase className="w-10 h-10 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{insights?.total_jobs || 0}</p>
                  <p className="text-sm opacity-90">Offres actives</p>
                </div>
              </div>

              {/* Graphique évolution candidatures */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4">Évolution des candidatures (30j)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={insights?.applications_over_time || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} tick={{fontSize: 12}} height={60} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{fill: '#8b5cf6'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top offres */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4">Top 5 des offres les plus attractives</h4>
                {insights?.top_performing_jobs?.map(([title, count], i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium">{title}</span>
                    <span className="font-bold text-purple-600">{count} candidatures</span>
                  </div>
                ))}
              </div>
            </div>

            {/* === COLONNE DROITE : Analyse IA === */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Sparkles className="w-9 h-9 text-pink-600" />
                <span>Analyse prédictive par IA</span>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-200 rounded-2xl p-8 min-h-96">
                {aiAnalysis ? (
                  <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br>') }} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Analyse en cours...</p>
                  </div>
                )}
              </div>

              {/* Camembert des statuts */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4">Répartition des candidatures</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{backgroundColor: entry.color}}></div>
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          Ces insights sont générés automatiquement • Mis à jour il y a quelques secondes
        </div>
      </div>
    </div>
  );
}