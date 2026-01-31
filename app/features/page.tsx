'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Database, ShieldCheck, Layers, Zap, BarChart,
  Search, Settings, Globe, Check, Cpu, Sparkles, Target,
  GitMerge, PieChart, TrendingUp, Lock, Network, Award
} from 'lucide-react';

const featureCategories = [
  {
    title: "Plateforme RH INCUVA",
    description: "Automatisation complète du recrutement avec un agent IA embarqué respectant la confidentialité des données",
    icon: <Brain className="w-8 h-8" />,
    features: [
      {
        title: "Automatisation du Recrutement",
        description: "L'agent IA gère l'intégralité du processus : sourcing, screening, entretiens virtuels et propositions d'offres.",
        icon: <Zap className="w-6 h-6" />,
        benefits: [
          "Réduction de 85% du temps de sourcing",
          "Élimination des biais humains",
          "Conformité RGPD intégrée"
        ]
      },
      {
        title: "Analyse Prédictive RH",
        description: "Anticipe les besoins en talents, les risques de turnover et génère des insights actionnables.",
        icon: <BarChart className="w-6 h-6" />,
        benefits: [
          "Prédiction à 92% des départs volontaires",
          "Optimisation budgétaire RH",
          "Alertes proactives sur les tensions internes"
        ]
      },
      {
        title: "Confidentialité Absolue",
        description: "Chiffrement de bout en bout et anonymisation des données candidates.",
        icon: <ShieldCheck className="w-6 h-6" />,
        benefits: [
          "Zero data breach depuis le lancement",
          "Consentement granulaire par candidat",
          "Audit trail complet"
        ]
      }
    ]
  },
  {
    title: "Mobyus - LLM Prédictif",
    description: "Connexion directe aux bases de données d'entreprise pour des insights prédictifs en temps réel",
    icon: <Database className="w-8 h-8" />,
    features: [
      {
        title: "Connexion Sécurisée",
        description: "Intégration native avec vos systèmes existants (ERP, CRM, SIRH) sans déplacement de données.",
        icon: <GitMerge className="w-6 h-6" />,
        benefits: [
          "Connexion en moins de 5 minutes",
          "Aucune donnée stockée hors de votre infrastructure",
          "API REST/GraphQL sécurisées"
        ]
      },
      {
        title: "Insights Graphiques",
        description: "Visualisations prédictives dynamiques générées automatiquement à partir de vos données.",
        icon: <PieChart className="w-6 h-6" />,
        benefits: [
          "Dashboards auto-générés par secteur",
          "Scénarios what-if en temps réel",
          "Export PowerBI/Tableau natif"
        ]
      },
      {
        title: "Recommandations Actionnables",
        description: "Suggestions précises pour maintenir croissance et stabilité (ajustements salariaux, formations, restructurations).",
        icon: <Target className="w-6 h-6" />,
        benefits: [
          "ROI moyen de 340% sur les actions implémentées",
          "Réduction de 60% des erreurs stratégiques",
          "Plan d'action généré en moins de 3 secondes"
        ]
      }
    ]
  },
  {
    title: "INCUVA AI Lab",
    description: "Développement sur-mesure de modèles IA prédictifs adaptés à votre secteur d'activité",
    icon: <Cpu className="w-8 h-8" />,
    features: [
      {
        title: "Modèles Sectoriels",
        description: "IA entraînée spécifiquement sur les données et dynamiques de votre industrie.",
        icon: <Layers className="w-6 h-6" />,
        benefits: [
          "Précision +45% vs modèles génériques",
          "Mise à jour continue avec vos données",
          "Propriété intellectuelle 100% cliente"
        ]
      },
      {
        title: "R&D Collaborative",
        description: "Équipe de data scientists dédiée travaillant main dans la main avec vos experts métiers.",
        icon: <Network className="w-6 h-6" />,
        benefits: [
          "POC validé en moins de 4 semaines",
          "Transfert de compétences intégré",
          "Accès aux dernières avancées IA"
        ]
      },
      {
        title: "Déploiement Agile",
        description: "Mise en production progressive avec A/B testing et monitoring continu.",
        icon: <Sparkles className="w-6 h-6" />,
        benefits: [
          "Time-to-value moyen : 6 semaines",
          "Rollback instantané",
          "Métriques de performance en temps réel"
        ]
      }
    ]
  }
];

const enterpriseSolutions = [
  {
    title: "Stabilité Opérationnelle",
    description: "Anticipez et prévenez les disruptions organisationnelles avant qu'elles n'impactent votre performance",
    icon: <TrendingUp className="w-8 h-8" />,
    metrics: [
      "Réduction de 75% des arrêts imprévus",
      "Maintien de la productivité à plus de 98%",
      "Alertes 30 jours avant impact"
    ]
  },
  {
    title: "Croissance Prédictive",
    description: "Identifiez les leviers de croissance et les investissements RH à fort ROI avant vos concurrents",
    icon: <Award className="w-8 h-8" />,
    metrics: [
      "Croissance moyenne +28% vs marché",
      "Identification des talents clés 6 mois en avance",
      "Optimisation budgétaire formation +62% ROI"
    ]
  },
  {
    title: "Transformation IA",
    description: "Accompagnement complet dans l'adoption de l'IA prédictive au cœur de votre stratégie RH",
    icon: <Globe className="w-8 h-8" />,
    metrics: [
      "100+ entreprises transformées",
      "Adoption IA interne multipliée par 12",
      "Champion's program inclus"
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Vision INCUVA */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/20" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Startup IA Prédictive Révolutionnaire</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              L'IA Prédictive
            </span>
            <br />
            <span className="text-white">au Service de Votre Croissance</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            INCUVA combine <span className="text-purple-400">RH automatisée</span>, 
            <span className="text-cyan-400"> insights prédictifs en temps réel</span> et 
            <span className="text-pink-400"> modèles IA sur-mesure</span> pour transformer 
            vos données en avantage stratégique compétitif.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/demo"
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 group"
            >
              <Cpu className="w-5 h-5 group-hover:animate-pulse" />
              Demander une Démo Personnalisée
            </Link>
            <Link
              href="/whitepaper"
              className="px-10 py-4 bg-white/10 border border-white/20 rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Télécharger le Whitepaper
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trois Piliers INCUVA */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {featureCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="mb-32 last:mb-0"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
            >
              {/* En-tête de pilier */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
                  {category.icon}
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  {category.title}
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Cartes de fonctionnalités */}
              <div className="grid lg:grid-cols-3 gap-8">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-purple-500/50 transition-all duration-300"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: featureIndex * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-8 leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="space-y-4">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Entreprise */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Impact Mesurable
              </span>
              <br />sur Votre Entreprise
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des résultats concrets validés par nos clients dans plus de 15 secteurs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {enterpriseSolutions.map((solution, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 hover:border-purple-500/50 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    {solution.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
                  <p className="text-gray-300 mb-8">{solution.description}</p>
                  
                  <div className="space-y-3">
                    {solution.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                        <span className="text-sm font-medium text-cyan-300">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Visionary */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-3xl opacity-50" />
              <div className="relative bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <Brain className="w-20 h-20 mx-auto text-purple-400 mb-4" />
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Rejoignez la Révolution IA Prédictive
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
            Prêt à Voir l'Avenir de Votre Entreprise?
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Une démo personnalisée de 30 minutes pour découvrir comment INCUVA 
            peut transformer vos données en croissance prédictible.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/demo-enterprise"
              className="px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              <Sparkles className="w-6 h-6 group-hover:animate-spin" />
              Réserver Ma Démo IA
            </Link>
            <Link
              href="/contact"
              className="px-12 py-5 bg-white/10 border-2 border-white/20 rounded-full font-medium text-lg hover:bg-white/20 hover:border-purple-500/50 transition-all backdrop-blur-sm"
            >
              Parler à un Expert
            </Link>
          </motion.div>

          <motion.p
            className="text-sm text-gray-400 mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Lock className="w-4 h-4 inline mr-1" />
            Démo 100% confidentielle • Analyse gratuite de vos données possible • Engagement zero
          </motion.p>
        </div>
      </section>
    </div>
  );
}