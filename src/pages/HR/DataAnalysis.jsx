// src/pages/HR/DataAnalysis.jsx
import React, { useState, useEffect } from "react";
import AIPromptModal from "../../components/AIPromptModal";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import {
  TrendingUp, Users, Briefcase, CheckCircle,
  AlertCircle, Sparkles, Zap, Target, BarChart3,
  Calendar, Filter, Download, RefreshCw,
  Lightbulb, ArrowUpRight, ArrowDownRight,
  ChevronDown, Clock, DollarSign, Award,
  Brain, LineChart as LineChartIcon, PieChart as PieChartIcon
} from "lucide-react";

const COLORS = ["#FF6B35", "#8A4FFF", "#00C896", "#FFD166", "#118AB2", "#EF476F"];
const GRADIENT_COLORS = [
  "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
  "linear-gradient(135deg, #8A4FFF 0%, #B37AFF 100%)",
  "linear-gradient(135deg, #00C896 0%, #00E5B0 100%)",
  "linear-gradient(135deg, #FFD166 0%, #FFE4A3 100%)",
];

export default function DataAnalysis({ data, loading, timeRange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState(data?.insights || "");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    if (data && data.success) {
      const { applications_stats, interviews_stats, contracts_stats } = data;
      const initialValues = {
        applications: Object.values(applications_stats).reduce((a, b) => a + b, 0),
        interviews: Object.values(interviews_stats).reduce((a, b) => a + b, 0),
        contracts: Object.values(contracts_stats).reduce((a, b) => a + b, 0),
        conversionRate: ((Object.values(contracts_stats).reduce((a, b) => a + b, 0) /
          (Object.values(applications_stats).reduce((a, b) => a + b, 1) || 1)) * 100).toFixed(1)
      };
      setAnimatedValues(initialValues);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <div className="mt-6 space-y-2 text-center">
          <p className="text-lg font-semibold text-gray-700">Chargement des analyses</p>
          <p className="text-sm text-gray-500">Préparation des visualisations...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center py-20 px-4">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-16 h-16 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Données non disponibles</h3>
        <p className="text-gray-600 text-center max-w-md mb-8">
          Les données analytiques n'ont pas pu être chargées.
          Vérifiez votre connexion ou réessayez ultérieurement.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
          <RefreshCw className="w-5 h-5 inline-block mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  const { applications_stats, interviews_stats, contracts_stats, insights } = data;

  // Préparer les données pour les graphiques
  const chartData = Object.keys(applications_stats).map(date => ({
    date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    fullDate: date,
    candidatures: applications_stats[date] || 0,
    entretiens: interviews_stats[date] || 0,
    contrats: contracts_stats[date] || 0,
    conversion: ((contracts_stats[date] || 0) / (applications_stats[date] || 1) * 100).toFixed(1)
  })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  const pieData = [
    { name: "Candidatures", value: Object.values(applications_stats).reduce((a, b) => a + b, 0), color: COLORS[0] },
    { name: "Entretiens", value: Object.values(interviews_stats).reduce((a, b) => a + b, 0), color: COLORS[1] },
    { name: "Contrats", value: Object.values(contracts_stats).reduce((a, b) => a + b, 0), color: COLORS[2] },
    { name: "En attente", value: Object.values(applications_stats).reduce((a, b) => a + b, 0) -
      Object.values(interviews_stats).reduce((a, b) => a + b, 0), color: COLORS[3] },
  ].filter(item => item.value > 0);

  const performanceData = chartData.slice(-7).map((item, index) => ({
    ...item,
    efficiency: ((item.entretiens / item.candidatures) * 100).toFixed(1),
    rank: index + 1
  }));

  // Statistiques avancées
  const totalApplications = Object.values(applications_stats).reduce((a, b) => a + b, 0);
  const totalInterviews = Object.values(interviews_stats).reduce((a, b) => a + b, 0);
  const totalContracts = Object.values(contracts_stats).reduce((a, b) => a + b, 0);
  const conversionRate = ((totalContracts / totalApplications) * 100).toFixed(1);
  const avgTimeToHire = "7.5"; // À calculer avec les données réelles

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6 space-y-6">
      {/* Header avec effet glassmorphism */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Effets décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-48 translate-y-48"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Analytics RH Intelligentes</h1>
                  <p className="text-white/90 mt-2">
                    Analyse avancée de votre processus de recrutement - {timeRange === "week" ? "Semaine" :
                    timeRange === "month" ? "Mois" : timeRange === "quarter" ? "Trimestre" : "Année"}
                  </p>
                </div>
              </div>

              {/* Quick stats header */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">Temps réel</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">{conversionRate}% de conversion</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Brain className="w-4 h-4" />
                  <span className="font-semibold">Insights IA</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Période
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                Assistant IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Cards avec animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Candidatures",
            value: animatedValues.applications,
            icon: <Briefcase className="w-6 h-6" />,
            change: "+12%",
            trend: "up",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
          },
          {
            label: "Entretiens",
            value: animatedValues.interviews,
            icon: <Users className="w-6 h-6" />,
            change: "+8%",
            trend: "up",
            color: "from-blue-600 to-blue-700",
            bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
          },
          {
            label: "Contrats signés",
            value: animatedValues.contracts,
            icon: <CheckCircle className="w-6 h-6" />,
            change: "+15%",
            trend: "up",
            color: "from-cyan-500 to-blue-500",
            bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
          },
          {
            label: "Taux de conversion",
            value: `${animatedValues.conversionRate}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            change: "+3.2%",
            trend: "up",
            color: "from-indigo-500 to-blue-500",
            bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50"
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className={`${kpi.bgColor} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-md`}>
                {React.cloneElement(kpi.icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-sm font-bold">{kpi.change}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
            <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${kpi.color} transition-all duration-1000`}
                style={{ width: `${Math.min(Number(kpi.value) * 2, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graphique principal */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LineChartIcon className="w-6 h-6 text-blue-600" />
                Évolution temporelle
              </h3>
              <p className="text-gray-500 text-sm mt-1">Performance sur les 30 derniers jours</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("line")}
                className={`px-4 py-2 rounded-lg transition-all ${chartType === "line" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Ligne
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-4 py-2 rounded-lg transition-all ${chartType === "area" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Zone
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-4 py-2 rounded-lg transition-all ${chartType === "bar" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Barres
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="candidatures"
                    stroke="#FF6B35"
                    name="Candidatures"
                    strokeWidth={3}
                    dot={{ stroke: '#FF6B35', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, stroke: '#FF6B35', strokeWidth: 2, fill: 'white' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="entretiens"
                    stroke="#8A4FFF"
                    name="Entretiens"
                    strokeWidth={3}
                    dot={{ stroke: '#8A4FFF', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="contrats"
                    stroke="#00C896"
                    name="Contrats"
                    strokeWidth={3}
                    dot={{ stroke: '#00C896', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : chartType === "area" ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="candidatures"
                    stroke="#FF6B35"
                    fill="url(#colorCandidatures)"
                    fillOpacity={0.3}
                    name="Candidatures"
                  />
                  <Area
                    type="monotone"
                    dataKey="entretiens"
                    stroke="#8A4FFF"
                    fill="url(#colorEntretiens)"
                    fillOpacity={0.3}
                    name="Entretiens"
                  />
                  <Area
                    type="monotone"
                    dataKey="contrats"
                    stroke="#00C896"
                    fill="url(#colorContrats)"
                    fillOpacity={0.3}
                    name="Contrats"
                  />
                  <defs>
                    <linearGradient id="colorCandidatures" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEntretiens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8A4FFF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8A4FFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorContrats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C896" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="candidatures" fill="#FF6B35" name="Candidatures" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="entretiens" fill="#8A4FFF" name="Entretiens" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="contrats" fill="#00C896" name="Contrats" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution et métriques */}
        <div className="space-y-6">
          {/* Graphique radar de performance */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Performance par métrique
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={pieData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" stroke="#666" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, Math.max(...pieData.map(d => d.value))]} stroke="#666" />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8A4FFF"
                    fill="#8A4FFF"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              Répartition
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Insights IA amélioré */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Effets décoratifs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Insights IA Avancés</h3>
                <p className="text-white/80">Analyse intelligente et recommandations personnalisées</p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              Générer de nouveaux insights
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {generatedInsights ? (
              <div className="prose prose-invert max-w-none">
                <div
                  className="text-white/90 space-y-4"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedInsights) }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4">
                  <Lightbulb className="w-12 h-12 text-white/50" />
                </div>
                <h4 className="text-xl font-bold mb-2">Générez vos premiers insights</h4>
                <p className="text-white/70 mb-6">
                  Notre IA va analyser vos données et vous fournir des recommandations personnalisées
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Commencer l'analyse IA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Temps moyen d'embauche",
            value: `${avgTimeToHire} jours`,
            icon: <Clock className="w-5 h-5" />,
            target: "7 jours",
            status: avgTimeToHire <= 7 ? "good" : "warning"
          },
          {
            label: "Coût par recrutement",
            value: "2,450 €",
            icon: <DollarSign className="w-5 h-5" />,
            target: "2,000 €",
            status: "warning"
          },
          {
            label: "Qualité d'embauche",
            value: "8.2/10",
            icon: <Award className="w-5 h-5" />,
            target: "8.5/10",
            status: "good"
          },
          {
            label: "Satisfaction candidats",
            value: "92%",
            icon: <Users className="w-5 h-5" />,
            target: "90%",
            status: "excellent"
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                metric.status === 'excellent' ? 'bg-green-100 text-green-600' :
                metric.status === 'good' ? 'bg-blue-100 text-blue-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {metric.icon}
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                Cible: {metric.target}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AIPromptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contextData={{
          applications: data?.applications || [],
          interviews: data?.interviews || [],
          contracts: data?.contracts || [],
          timeRange,
          charts: {
            lineData: chartData,
            pieData: pieData,
            performanceData: performanceData
          }
        }}
        onInsightsGenerated={(insights) => {
          setGeneratedInsights(insights);
        }}
      />
    </div>
  );
}

// Fonction parseMarkdown améliorée
const parseMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/^\# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
    .replace(/^\## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3">$1</h2>')
    .replace(/^\### (.*$)/gim, '<h3 class="text-lg font-bold text-white mb-2">$1</h3>')
    .replace(/\*\*\*(.*)\*\*\*/g, '<strong><em class="text-white">$1</em></strong>')
    .replace(/\*\*(.*)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*)\*/g, '<em class="italic text-white/90">$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-white/30 pl-4 my-3 text-white/80">$1</blockquote>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-white/90">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-white/90">$1</li>')
    .replace(/`(.*?)`/g, '<code class="bg-white/20 px-2 py-1 rounded text-sm font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br>')
    .replace(/<p><\/p>/g, '');
};