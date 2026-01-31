'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Users, ShieldCheck, Globe, Award, Rocket, Lightbulb,
  Linkedin, Twitter, ArrowRight, Heart, Target, Zap, TrendingUp,
  Code, GitMerge, BookOpen, BarChart, User, UserPlus, UserCheck, ChevronRight,
} from 'lucide-react';

// Données adaptées pour une startup ambitieuse
const storyPoints = [
  {
    year: "2024",
    title: "L'idée est née",
    desc: "Tout a commencé avec une question simple : comment rendre l'appariement entre talents et entreprises plus intelligent, plus équitable et plus accessible ? Une petite équipe de passionnés se lance dans l'aventure avec un prototype minimal.",
    icon: <Lightbulb className="w-6 h-6 text-purple-500" />
  },
  {
    year: "2025",
    title: "Lancement de la version bêta",
    desc: "Nous dévoilons notre première version bêta avec des fonctionnalités de base de matching intelligent. Malgré nos ressources limitées, nous attirons déjà l'attention pour notre approche innovante et accessible.",
    icon: <Rocket className="w-6 h-6 text-purple-500" />
  },
  {
    year: "2025-2026",
    title: "Croissance et innovation",
    desc: "Avec une communauté grandissante de bêta-testeurs, nous améliorons continuellement notre plateforme. Nous commençons à développer des fonctionnalités avancées comme l'analyse prédictive légère et les contrats simplifiés.",
    icon: <TrendingUp className="w-6 h-6 text-purple-500" />
  },
  {
    year: "2027+",
    title: "Vision à long terme",
    desc: "Notre ambition est de devenir la plateforme de référence pour les solutions RH intelligentes et accessibles, en particulier pour les startups et PME qui n'ont pas accès aux outils enterprise coûteux.",
    icon: <Target className="w-6 h-6 text-purple-500" />
  }
];

const team = [
  {
    name: "François Louis Marie",
    role: "Fondateur & CEO",
    description: "Visionnaire avec une passion pour l'innovation technologique. Il guide la stratégie globale d'INCUVA avec une approche pragmatique et ambitieuse, déterminé à démocratiser l'accès aux outils RH intelligents.",
    icon: <User className="w-12 h-12 p-2 bg-purple-500/20 rounded-xl" />
  }
];

const startupValues = [
  {
    icon: <Lightbulb className="w-8 h-8 text-purple-500" />,
    title: "Innovation Accessible",
    desc: "Nous croyons que les technologies les plus avancées devraient être accessibles à toutes les entreprises, pas seulement aux grandes corporations avec des budgets illimités."
  },
  {
    icon: <Heart className="w-8 h-8 text-purple-500" />,
    title: "Approche Humaine",
    desc: "Derrière chaque ligne de code, il y a des personnes. Nous concevons nos solutions en pensant d'abord aux besoins réels des utilisateurs, avec empathie et pragmatisme."
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-500" />,
    title: "Agilité Startup",
    desc: "Nous bougeons vite, nous apprenons vite, et nous nous adaptons vite. Notre taille réduite nous permet d'innover et d'itérer rapidement en fonction des retours de nos utilisateurs."
  },
  {
    icon: <Target className="w-8 h-8 text-purple-500" />,
    title: "Ambition Démesurée",
    desc: "Nous sommes une petite équipe, mais nous visons grand. Nous voulons transformer radicalement le monde du travail, une connexion intelligente à la fois."
  }
];

const startupStats = [
  { number: "5", desc: "Membres dans l'équipe fondatrice" },
  { number: "20+", desc: "Utilisateurs bêta enthousiastes" },
  { number: "3", desc: "Fonctionnalités clés développées" },
  { number: "100%", desc: "Dévouement à notre mission" }
];

const technologyVision = [
  {
    icon: <Brain className="w-12 h-12 p-2 bg-purple-500/20 rounded-xl" />,
    title: "Mobyus Lite",
    desc: "Notre moteur d'IA léger conçu spécialement pour les startups et PME. Il offre des fonctionnalités de matching intelligent sans nécessiter des ressources informatiques coûteuses.",
    features: [
      "Analyse sémantique des compétences",
      "Matching basé sur les besoins réels",
      "Optimisé pour les petites structures"
    ]
  },
  {
    icon: <ShieldCheck className="w-12 h-12 p-2 bg-blue-500/20 rounded-xl" />,
    title: "Sécurité Simplifiée",
    desc: "Notre approche de la sécurité et de la confidentialité conçue pour être robuste mais simple à comprendre et à utiliser, même pour les non-techniciens.",
    features: [
      "Protection des données par design",
      "Transparence totale sur l'utilisation des données",
      "Conformité RGPD simplifiée"
    ]
  }
];

const ambitionSections = [
  {
    title: "Notre Vision à 5 Ans",
    description: "D'ici 5 ans, nous voulons devenir la plateforme de référence pour les solutions RH intelligentes et accessibles en Europe, avec :",
    goals: [
      "10 000 entreprises utilisatrices",
      "100 000 talents connectés",
      "Une suite complète d'outils RH intelligents",
      "Une présence dans 5 pays européens"
    ],
    icon: <Globe className="w-12 h-12 p-2 bg-purple-500/20 rounded-xl" />
  },
  {
    title: "Notre Impact Social",
    description: "Nous voulons contribuer à résoudre certains des plus grands défis du marché du travail :",
    impacts: [
      "Réduire le chômage structurel de 10%",
      "Augmenter la diversité dans les embauches",
      "Rendre les opportunités professionnelles plus accessibles",
      "Aider les PME à rivaliser avec les grandes entreprises pour attirer les talents"
    ],
    icon: <UserCheck className="w-12 h-12 p-2 bg-green-500/20 rounded-xl" />
  },
  {
    title: "Notre Approche Technologique",
    description: "Nous développons des technologies qui allient puissance et simplicité :",
    tech: [
      "IA légère et efficace",
      "Blockchain pour la transparence",
      "Analyse prédictive accessible",
      "Automatisation intelligente des processus RH"
    ],
    icon: <Code className="w-12 h-12 p-2 bg-blue-500/20 rounded-xl" />
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Version startup ambitieuse */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black/80" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-5" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Une Startup avec une Vision Audacieuse
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Nous sommes une jeune startup avec une mission claire : <strong>démocratiser l'accès aux outils RH intelligents</strong> pour toutes les entreprises,
            en particulier celles qui n'ont pas les ressources pour les solutions enterprise traditionnelles.
          </motion.p>

          <motion.div
            className="flex justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              Nous contacter
            </Link>
            <Link
              href="#vision"
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-full font-medium hover:bg-white/20 transition-all"
            >
              Découvrir notre vision
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Notre Histoire - Version startup */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Parcours</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Une petite idée devenue une aventure entrepreneuriale ambitieuse.
            </p>
          </motion.div>

          {/* Timeline simplifiée */}
          <div className="relative max-w-3xl mx-auto">
            {/* Ligne centrale */}
            <div className="absolute left-6 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500" />

            {/* Événements */}
            <div className="space-y-8">
              {storyPoints.map((point, index) => (
                <motion.div
                  key={index}
                  className="relative pl-12"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  {/* Point sur la ligne */}
                  <div className={`absolute left-0 top-4 w-4 h-4 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-purple-500' : 'bg-white/20'
                  }`}>
                    {point.icon}
                  </div>

                  {/* Contenu */}
                  <div className="p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                      {point.year}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        index === 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/20 text-gray-400'
                      }`}>
                        {index === 0 ? 'Début' : index === storyPoints.length-1 ? 'Vision' : 'Étape'}
                      </span>
                    </h3>
                    <h4 className="text-lg font-semibold mb-2">{point.title}</h4>
                    <p className="text-gray-300">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Vision - Nouvelle section */}
      <section id="vision" className="py-24 px-6 bg-gradient-to-b from-black/30 to-black/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vision</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Nous ne voulons pas juste améliorer les outils RH existants - nous voulons les réinventer pour les rendre accessibles à tous.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {ambitionSections.map((section, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                <p className="text-gray-300 mb-6">{section.description}</p>

                <ul className="space-y-2">
                  {section.goals && section.goals.map((goal, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Zap className="w-4 h-4 text-purple-400" />
                      {goal}
                    </li>
                  ))}

                  {section.impacts && section.impacts.map((impact, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Heart className="w-4 h-4 text-purple-400" />
                      {impact}
                    </li>
                  ))}

                  {section.tech && section.tech.map((tech, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Code className="w-4 h-4 text-purple-400" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Valeurs - Version startup */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Valeurs Startup</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ce qui nous définit en tant que jeune entreprise innovante.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {startupValues.map((value, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mb-6 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Équipe - Version simplifiée */}
      <section id="team" className="py-24 px-6 bg-gradient-to-b from-black/30 to-black/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                L'Équipe Fondatrice
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Une petite équipe avec de grandes ambitions, déterminée à transformer le monde du travail.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CEO */}
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-purple-400 mb-4">{member.role}</p>
                <p className="text-gray-300 mb-6">{member.description}</p>

                <div className="flex justify-center gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-purple-400" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-purple-400" />
                  </a>
                </div>
              </motion.div>
            ))}

            {/* Placeholder pour les futurs membres */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-xl flex items-center justify-center">
                <UserPlus className="w-12 h-12 text-white/30" />
              </div>
              <h3 className="text-xl font-bold mb-4">Et bientôt vous ?</h3>
              <p className="text-gray-300 mb-6">
                Nous recherchons des talents passionnés pour rejoindre notre aventure et nous aider à grandir.
                Que vous soyez développeur, expert RH ou spécialiste du marketing, nous aimerions discuter avec vous !
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
              >
                Voir nos offres
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Statistiques startup */}
          <motion.div
            className="mt-16 bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6">Notre parcours en chiffres</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {startupStats.map((stat, index) => (
                <div key={index} className="p-4 bg-white/10 rounded-xl">
                  <h4 className="text-2xl font-bold text-purple-400 mb-1">{stat.number}</h4>
                  <p className="text-sm text-gray-400">{stat.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-300 mt-6">
              Nous commençons juste, mais nous avons de grandes ambitions et nous grandissons chaque jour !
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notre Technologie - Version startup */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Approche Technologique</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Nous développons des technologies puissantes mais accessibles, conçues spécialement pour les startups et PME.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {technologyVision.map((tech, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  {tech.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{tech.title}</h3>
                <p className="text-gray-300 mb-6">{tech.desc}</p>

                <div className="space-y-2">
                  {tech.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 p-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Notre Philosophie Technologique</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Nous croyons que la technologie devrait être un <strong>levier</strong> pour les petites entreprises,
              pas un <strong>obstacle</strong>. C'est pourquoi nous concevons nos solutions avec :
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <Zap className="w-6 h-6 text-purple-400" />, text: "Des outils légers et efficaces" },
                { icon: <UserCheck className="w-6 h-6 text-purple-400" />, text: "Une interface intuitive" },
                { icon: <Code className="w-6 h-6 text-purple-400" />, text: "Une intégration facile" },
                { icon: <ShieldCheck className="w-6 h-6 text-purple-400" />, text: "Une sécurité robuste" },
                { icon: <BarChart className="w-6 h-6 text-purple-400" />, text: "Des insights actionnables" },
                { icon: <Heart className="w-6 h-6 text-purple-400" />, text: "Un support humain" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Finale - Version startup ambitieuse */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-5" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Faites partie de <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">notre aventure</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nous sommes une jeune startup avec une vision audacieuse : transformer le monde du travail en rendant
            les outils RH intelligents accessibles à tous. Vous pouvez nous aider de plusieurs façons :
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Devenez bêta-testeur</h3>
              <p className="text-gray-300 mb-4">
                Aidez-nous à améliorer nos outils en les testant avant leur lancement officiel et donnez-nous votre avis.
              </p>
              <Link
                href="/contact?subject=beta-testing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                S'inscrire
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <GitMerge className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborez avec nous</h3>
              <p className="text-gray-300 mb-4">
                Vous êtes expert en RH, en IA ou en développement ? Travaillons ensemble sur des projets innovants.
              </p>
              <Link
                href="/contact?subject=collaboration"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                Nous contacter
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rejoignez notre équipe</h3>
              <p className="text-gray-300 mb-4">
                Nous recherchons des talents passionnés pour nous aider à grandir et à réaliser notre vision ambitieuse.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                Voir les offres
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/contact"
              className="px-10 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              Nous contacter
            </Link>
            <Link
              href="/demo"
              className="px-10 py-4 bg-white/10 border border-white/20 rounded-full font-medium hover:bg-white/20 transition-all"
            >
              Voir une démo
            </Link>
          </motion.div>

          <motion.p
            className="text-sm text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            Ensemble, nous pouvons transformer l'avenir du travail, une connexion intelligente à la fois.
          </motion.p>
        </div>
      </section>
    </div>
  );
}

// Composant Check pour les listes
const Check = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
