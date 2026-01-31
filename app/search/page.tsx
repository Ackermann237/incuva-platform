'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Database, ShieldCheck, Layers, Cpu, Sparkles,
  BarChart, GitMerge, Target, Network, Zap, TrendingUp,
  Lightbulb, Microscope, Award, Calendar, Check, Globe
} from 'lucide-react';

type ResearchArea = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  publications: Array<{
    id: string;
    title: string;
    date: string;
    excerpt: string;
    status: 'published' | 'in-progress' | 'planned';
    impact: string;
    tags: string[];
  }>;
};

type LabProject = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'prototype' | 'concept';
  sector: string;
  precision: string;
  icon: React.ReactNode;
};

const researchAreas: ResearchArea[] = [
  {
    id: "predictive-hr",
    title: "IA Prédictive RH",
    description: "Modèles d'IA qui anticipent les dynamiques humaines et organisationnelles avec une précision inégalée.",
    icon: <Brain className="w-7 h-7" />,
    publications: [
      {
        id: "turnover-prediction-v3",
        title: "Mobyus Turnover Predictor v3",
        date: "Novembre 2025",
        excerpt: "Modèle multimodal combinant données RH, communication interne et signaux externes pour prédire les départs avec 94% de précision 90 jours à l'avance.",
        status: 'in-progress',
        impact: "Réduction moyenne de 68% du turnover involontaire",
        tags: ["Mobyus", "Prédiction", "Multimodal", "94% précision"]
      },
      {
        id: "skill-gap-forecast",
        title: "Skill Gap Forecasting Engine",
        date: "Q1 2026",
        excerpt: "Système qui identifie les écarts de compétences 12 mois avant qu'ils n'impactent la croissance, avec recommandations de formation ciblées.",
        status: 'planned',
        impact: "ROI formation multiplié par 4.2",
        tags: ["Forecasting", "Compétences", "Stratégie RH"]
      }
    ]
  },
  {
    id: "mobyus-llm",
    title: "Mobyus LLM Prédictif",
    description: "LLM spécialisé qui se connecte directement aux données d'entreprise pour générer des scénarios prédictifs actionnables.",
    icon: <Database className="w-7 h-7" />,
    publications: [
      {
        id: "zero-data-leak",
        title: "Architecture Zero Data Leak",
        date: "Octobre 2025",
        excerpt: "Mobyus traite les données sensibles directement dans l'environnement client. Aucune donnée ne transite par nos serveurs.",
        status: 'in-progress',
        impact: "0 fuite de données depuis le déploiement",
        tags: ["Sécurité", "On-Premise", "RGPD"]
      }
    ]
  },
  {
    id: "sector-models",
    title: "Modèles Sectoriels INCUVA AI Lab",
    description: "IA entraînée sur les spécificités de chaque industrie pour des prédictions ultra-précises.",
    icon: <Layers className="w-7 h-7" />,
    publications: [
      {
        id: "retail-dynamics",
        title: "Retail Workforce Dynamics Model",
        date: "Prototype validé",
        excerpt: "Modèle spécialisé retail prédisant les besoins en personnel avec 96% de précision sur les pics saisonniers.",
        status: 'in-progress',
        impact: "Réduction de 82% des ruptures de stock RH",
        tags: ["Retail", "Saisonnier", "96% précision"]
      }
    ]
  }
];

const labProjects: LabProject[] = [
  {
    id: "mobyus-core",
    title: "Mobyus Core Engine",
    description: "LLM prédictif qui analyse vos données en temps réel et génère des scénarios what-if avec mesures correctives automatiques.",
    status: 'active',
    sector: "Tous secteurs",
    precision: "93% moyenne",
    icon: <Cpu className="w-9 h-9" />
  },
  {
    id: "org-stability",
    title: "Stability Predictor",
    description: "Anticipe les disruptions organisationnelles 60 jours à l'avance avec plan de contingence généré automatiquement.",
    status: 'prototype',
    sector: "Tech & Scale-ups",
    precision: "91% sur 3 mois",
    icon: <ShieldCheck className="w-9 h-9" />
  },
  {
    id: "growth-accelerator",
    title: "Growth Accelerator AI",
    description: "Identifie les investissements RH à plus haut ROI et simule l'impact sur la croissance à 12 mois.",
    status: 'concept',
    sector: "Startups en hypercroissance",
    precision: "Estimation +340% ROI",
    icon: <TrendingUp className="w-9 h-9" />
  }
];

const labStats = {
  models: 12,
  sectors: 8,
  precision: "94.2%",
  clients: 23,
  patents: 3,
  publications: 7
};

export default function AILabPage() {
  const [activeArea, setActiveArea] = useState<string>("predictive-hr");
  const [activeTab, setActiveTab] = useState<'lab' | 'research' | 'projects'>('lab');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero - INCUVA AI Lab Vision */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-cyan-900/20 to-black" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-5 h-5 text-purple-300" />
            <span className="text-purple-300 font-medium">INCUVA AI Lab • Recherche de Pointe</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Prédire l'Avenir
            </span>
            <br />
            <span className="text-white">des Organisations</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-purple-400">INCUVA AI Lab</span> développe les modèles d'IA prédictifs
            les plus avancés du marché. Connectés à vos données, ils anticipent les scénarios,
            génèrent des insights graphiques et recommandent des actions pour <span className="text-cyan-400">maintenir votre croissance</span>.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              className={`px-8 py-3 rounded-full font-medium transition-all backdrop-blur-sm ${
                activeTab === 'lab' 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('lab')}
            >
              Le Lab
            </button>
            <button
              className={`px-8 py-3 rounded-full font-medium transition-all backdrop-blur-sm ${
                activeTab === 'research' 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('research')}
            >
              Recherches
            </button>
            <button
              className={`px-8 py-3 rounded-full font-medium transition-all backdrop-blur-sm ${
                activeTab === 'projects' 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('projects')}
            >
              Projets
            </button>
          </motion.div>
        </div>
      </section>

      {/* Vue Lab - Vision & Stats */}
      {activeTab === 'lab' && (
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  INCUVA AI Lab
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Le cerveau derrière Mobyus et les modèles prédictifs qui transforment les données d'entreprise en avantage stratégique
              </p>
            </motion.div>


            {/* Mission du Lab */}
            <div className="grid lg:grid-cols-3 gap-10">
              {[
                {
                  title: "Modèles Sectoriels",
                  description: "Chaque industrie a ses dynamiques. Nous entraînons des IA spécialisées pour une précision maximale.",
                  icon: <Cpu className="w-8 h-8" />,
                  metric: ""
                },
                {
                  title: "Confidentialité Absolue",
                  description: "Mobyus traite vos données dans votre infrastructure. Rien ne sort. Jamais.",
                  icon: <ShieldCheck className="w-8 h-8" />,
                  metric: "0 data breach • On-premise only"
                },
                {
                  title: "Actionnable Instantané",
                  description: "Pas de rapports. Des insights graphiques + actions recommandées en moins de 3 secondes.",
                  icon: <Zap className="w-8 h-8" />,
                  metric: ""
                }
              ].map((mission, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-purple-500/50 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {mission.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{mission.title}</h3>
                    <p className="text-gray-300 mb-6">{mission.description}</p>
                    <p className="text-sm font-medium text-cyan-400">{mission.metric}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vue Recherches */}
      {activeTab === 'research' && (
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div className="flex flex-col lg:flex-row gap-12">
              {/* Menu latéral */}
              <div className="lg:w-80 flex-shrink-0">
                <motion.div
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 sticky top-8"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Microscope className="w-7 h-7 text-purple-400" />
                    Axes de Recherche
                  </h3>
                  <div className="space-y-3">
                    {researchAreas.map(area => (
                      <button
                        key={area.id}
                        onClick={() => setActiveArea(area.id)}
                        className={`w-full text-left p-5 rounded-2xl transition-all group ${
                          activeArea === area.id 
                            ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            activeArea === area.id 
                              ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white' 
                              : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                          }`}>
                            {area.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-left">{area.title}</p>
                            <p className="text-xs text-gray-400 mt-1">Voir les travaux</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Contenu */}
              <div className="flex-1">
                {researchAreas.map(area => (
                  activeArea === area.id && (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl p-10 border border-white/10 mb-10">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                            {area.icon}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold">{area.title}</h3>
                            <p className="text-gray-300 mt-1">{area.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {area.publications.map((pub, index) => (
                          <motion.div
                            key={pub.id}
                            className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            whileHover={{ y: -5 }}
                          >
                            <div className="flex flex-col lg:flex-row gap-8">
                              <div className="lg:w-48 flex-shrink-0">
                                <div className="relative h-32 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-2xl p-6 flex items-center justify-center">
                                  <Microscope className="w-12 h-12 text-purple-400" />
                                  <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                                    {pub.status === 'in-progress' ? 'En cours' : 'Prévu'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {pub.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs font-medium">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <h4 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors">
                                  {pub.title}
                                </h4>
                                <p className="text-gray-300 mb-4 leading-relaxed">{pub.excerpt}</p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Calendar className="w-4 h-4" />
                                      <span>{pub.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-cyan-400 font-medium">
                                      <Award className="w-4 h-4" />
                                      <span>{pub.impact}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Vue Projets */}
      {activeTab === 'projects' && (
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-extrabold mb-6">
                Projets <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">INCUVA AI Lab</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Les modèles qui transforment vos données en croissance prédictible
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-10">
              {labProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />

                  <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl border border-white/10 p-10 hover:border-purple-500/50 transition-all group-hover:-translate-y-2">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {project.icon}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'prototype' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {project.status === 'active' ? 'Actif' : project.status === 'prototype' ? 'Prototype' : 'Concept'}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-6">{project.description}</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Secteur</span>
                        <span className="font-medium text-purple-300">{project.sector}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Précision</span>
                        <span className="font-medium text-cyan-400">{project.precision}</span>
                      </div>
                    </div>

                    {project.status !== 'concept' && (
                      <Link
                        href="/demo-lab"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Voir la démo
                        <Zap className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final - Visionary */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-3xl opacity-60" />
              <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-10">
                <Cpu className="w-24 h-24 mx-auto text-purple-400 mb-4" />
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Votre Entreprise, Prédite et Optimisée
                </p>
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Prêt à Voir l'Avenir de Votre Organisation?
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Une démo personnalisée de 30 minutes pour découvrir comment <strong>INCUVA AI Lab</strong>
            peut connecter Mobyus à vos données et transformer votre stratégie RH.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/demo-lab"
              className="px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-6 h-6 group-hover:animate-spin" />
              Réserver Ma Démo Lab
            </Link>
            <Link
              href="/contact-lab"
              className="px-12 py-5 bg-white/10 border-2 border-white/20 rounded-full font-medium text-lg hover:bg-white/20 hover:border-purple-500/50 transition-all backdrop-blur-sm"
            >
              Parler à un Chercheur
            </Link>
          </motion.div>

          <motion.div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Démo 100% confidentielle</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Analyse gratuite de vos données</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Engagement zero</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}