'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Users, Rocket, Code, Lightbulb, Zap, TrendingUp,
  Search, BookOpen, Target, Award, Heart, ShieldCheck, Globe,
  ChevronRight, FileText, BarChart, GitMerge, GraduationCap
} from 'lucide-react';

// Données simplifiées pour une startup ambitieuse
const resourceCategories = [
  {
    id: "recruitment-innovation",
    title: "Recrutement Innovant",
    description: "Nos recherches et ressources pour transformer le recrutement avec des solutions accessibles",
    icon: <Users className="w-6 h-6" />,
    resources: [
      {
        id: "ai-recruitment-basics",
        title: "Les bases du recrutement par IA",
        description: "Comprendre comment l'IA peut améliorer votre recrutement, même avec un budget limité",
        status: "available",
        type: "guide",
        tags: ["IA", "Recrutement", "Startups"]
      },
      {
        id: "bias-awareness",
        title: "Sensibilisation aux biais de recrutement",
        description: "Guide pratique pour identifier et réduire les biais dans vos processus (version bêta)",
        status: "in-progress",
        type: "guide",
        tags: ["Diversité", "Équité", "Bonnes pratiques"]
      }
    ]
  },
  {
    id: "freelance-growth",
    title: "Croissance Freelance",
    description: "Ressources pour développer votre activité freelance avec des méthodes éprouvées",
    icon: <Rocket className="w-6 h-6" />,
    resources: [
      {
        id: "rate-strategy",
        title: "Stratégie de tarification pour freelances",
        description: "Comment déterminer vos tarifs en fonction de votre expérience et du marché",
        status: "available",
        type: "guide",
        tags: ["Freelance", "Tarification", "Stratégie"]
      },
      {
        id: "portfolio-tips",
        title: "Créer un portfolio efficace",
        description: "Les éléments clés à inclure dans votre portfolio pour attirer vos premiers clients",
        status: "available",
        type: "guide",
        tags: ["Freelance", "Marketing", "Conseils"]
      }
    ]
  },
  {
    id: "career-development",
    title: "Développement de Carrière",
    description: "Conseils pour faire progresser votre carrière dans un monde du travail en évolution",
    icon: <TrendingUp className="w-6 h-6" />,
    resources: [
      {
        id: "skill-mapping",
        title: "Cartographie de compétences simplifiée",
        description: "Identifiez vos compétences clés et les lacunes à combler pour progresser",
        status: "available",
        type: "guide",
        tags: ["Carrière", "Compétences", "Développement"]
      },
      {
        id: "networking-guide",
        title: "Guide de networking efficace",
        description: "Stratégies pratiques pour développer votre réseau professionnel",
        status: "available",
        type: "guide",
        tags: ["Carrière", "Réseautage", "Conseils"]
      }
    ]
  }
];

const comingSoonResources = [
  {
    id: "ai-demystified",
    title: "L'IA pour les non-techniciens",
    description: "Un guide simple pour comprendre les bases de l'IA appliquée aux RH",
    status: "planned",
    tags: ["IA", "RH", "Débutants"]
  },
  {
    id: "remote-work-tips",
    title: "Travailler à distance efficacement",
    description: "Conseils pratiques pour être productif en télétravail",
    status: "in-progress",
    tags: ["Télétravail", "Productivité"]
  },
  {
    id: "negotiation-guide",
    title: "Négociation salariale pour débutants",
    description: "Comment aborder une négociation avec confiance",
    status: "planned",
    tags: ["Salaire", "Négociation", "Carrière"]
  }
];

const startupStats = {
  resourcesCreated: 8,
  resourcesPlanned: 15,
  guidesDownloaded: 427,
  happyUsers: 35,
  coffeeCups: 1250,
  linesOfCode: 18421
};

const ambitionPoints = [
  {
    icon: <Globe className="w-8 h-8 text-purple-500" />,
    title: "Devenir le standard des solutions RH intelligentes",
    description: "Notre ambition est de créer la plateforme de référence pour les entreprises de toutes tailles qui veulent optimiser leur gestion des talents avec des outils intelligents et accessibles."
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    title: "Démocratiser l'IA pour les RH",
    description: "Nous voulons rendre les technologies d'IA et de matching intelligent accessibles à toutes les entreprises, pas seulement aux grandes corporations avec des budgets illimités."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-purple-500" />,
    title: "Créer un écosystème équitable",
    description: "Notre vision est un monde où chaque talent a les mêmes opportunités d'être découvert et chaque entreprise peut trouver les meilleurs candidats, quel que soit leur taille ou leur budget."
  },
  {
    icon: <Rocket className="w-8 h-8 text-purple-500" />,
    title: "Réduire le chômage structurel",
    description: "En améliorant la correspondance entre les compétences et les besoins des entreprises, nous voulons contribuer à réduire le chômage structurel et les pénuries de talents."
  }
];

const roadmap = [
  {
    phase: "Phase 1 (2024-2025)",
    title: "Fondation et développement",
    description: "Lancement de notre plateforme de base avec des fonctionnalités essentielles de matching et de gestion des talents.",
    status: "completed",
    icon: <Code className="w-6 h-6" />
  },
  {
    phase: "Phase 2 (2025)",
    title: "Expansion des fonctionnalités",
    description: "Ajout de l'analyse prédictive, des contrats intelligents et de l'intégration avec les outils RH existants.",
    status: "in-progress",
    icon: <GitMerge className="w-6 h-6" />
  },
  {
    phase: "Phase 3 (2026)",
    title: "Internationalisation",
    description: "Expansion vers les marchés européens et nord-américains avec des fonctionnalités multilingues et adaptées aux réglementations locales.",
    status: "planned",
    icon: <Globe className="w-6 h-6" />
  },
  {
    phase: "Phase 4 (2027+)",
    title: "Plateforme complète d'intelligence des talents",
    description: "Développement d'une suite complète d'outils d'IA pour la gestion du cycle de vie complet des talents, de l'embauche à la rétention.",
    status: "planned",
    icon: <Target className="w-6 h-6" />
  }
];

const team = [
  {
    name: "François Louis Marie",
    role: "Co-fondateur & CEO",
    description: "Visionnaire avec 10 ans d'expérience dans les technologies RH et l'intelligence artificielle. Il guide la stratégie globale et l'innovation chez INCUVA.",
    icon: <Users className="w-12 h-12 p-2 bg-purple-500/20 rounded-xl" />
  }
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resourceCategories
    .filter(category => activeCategory === 'all' || category.id === activeCategory)
    .flatMap(category => category.resources)
    .filter(resource =>
      searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Version startup ambitieuse */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-black/80" />
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] opacity-5" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ressources pour l'Avenir du Travail
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Nous sommes une startup avec de grandes ambitions : transformer le monde du travail grâce à des ressources accessibles et innovantes.
            Découvrez nos guides pratiques et nos recherches en cours pour vous aider à réussir.
          </motion.p>

          <motion.div
            className="max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-full border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="Rechercher des ressources (ex: recrutement, freelance, carrière)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nos Ambitions */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Nos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ambitions</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Chez INCUVA, nous ne nous contentons pas de suivre les tendances - nous voulons les créer.
            Voici ce qui nous motive chaque jour :
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            {ambitionPoints.map((point, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mb-6 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  {point.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                <p className="text-gray-300">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Feuille de Route */}
      <section className="py-24 px-6 bg-gradient-to-b from-black/30 to-black/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Notre <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Feuille de Route</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nous avons un plan ambitieux pour les années à venir. Voici où nous en sommes et où nous allons :
          </motion.p>

          <div className="relative">
            {/* Ligne de temps */}
            <div className="absolute left-8 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500" />

            {/* Étapes */}
            <div className="space-y-8 ml-12">
              {roadmap.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Point sur la ligne */}
                  <div className={`absolute -left-10 top-4 w-4 h-4 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in-progress' ? 'bg-purple-500' : 'bg-white/30'
                  }`}>
                    {item.icon}
                  </div>

                  {/* Contenu */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10 ml-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-white/20 text-gray-400'
                      }`}>
                        {item.phase}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{item.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in-progress' ? 'bg-purple-500' : 'bg-white/50'
                      }`} />
                      <span className="text-gray-400">
                        {item.status === 'completed' ? 'Terminé' :
                         item.status === 'in-progress' ? 'En cours' : 'Prévu'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Équipe - Version simplifiée */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              L'Équipe Fondatrice
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Une petite équipe avec de grandes ambitions, déterminée à transformer le monde du travail :
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
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
                <p className="text-gray-300">{member.description}</p>
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
                <Users className="w-12 h-12 text-white/30" />
              </div>
              <h3 className="text-xl font-bold mb-4">Et bientôt vous ?</h3>
              <p className="text-gray-300 mb-6">
                Nous recherchons des talents passionnés pour rejoindre notre aventure et nous aider à grandir.
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
        </div>
      </section>

      {/* Ressources par catégorie */}
      <section className="py-24 px-6 bg-gradient-to-b from-black/30 to-black/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Nos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ressources</span>
          </motion.h2>

          {/* Menu simplifié */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/10 rounded-full p-1">
              <button
                className={`px-6 py-2 rounded-full transition-all ${activeCategory === 'all' ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveCategory('all')}
              >
                Toutes les catégories
              </button>
              {resourceCategories.map((category) => (
                <button
                  key={category.id}
                  className={`px-6 py-2 rounded-full transition-all ${activeCategory === category.id ? 'bg-white text-black' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu simplifié */}
          {filteredResources.length > 0 ? (
            <div className="space-y-8">
              {resourceCategories.map((category) => {
                const categoryResources = category.resources.filter(resource =>
                  filteredResources.some(r => r.id === resource.id)
                );

                if (categoryResources.length === 0) return null;

                return (
                  <motion.div
                    key={category.id}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{category.title}</h3>
                        <p className="text-gray-400">{category.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {categoryResources.map((resource, index) => (
                        <motion.div
                          key={resource.id}
                          className="p-4 bg-white/10 rounded-lg border border-white/20"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              resource.status === 'available' ? 'bg-green-500/20 text-green-400' :
                              resource.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-white/20 text-gray-400'
                            }`}>
                              {resource.status === 'available' ? 'Disponible' :
                               resource.status === 'in-progress' ? 'En préparation' : 'À venir'}
                            </span>
                            <span className="px-2 py-1 bg-white/20 rounded-full text-xs capitalize">
                              {resource.type}
                            </span>
                          </div>

                          <h4 className="text-lg font-semibold mb-2">{resource.title}</h4>
                          <p className="text-gray-300 mb-3 line-clamp-2">{resource.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {resource.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {resource.status === 'available' ? (
                            <Link
                              href={`/resources/${resource.id}`}
                              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              Accéder à la ressource
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          ) : (
                            <div className="text-sm text-gray-400">
                              {resource.status === 'in-progress' ? 'En cours de développement' : 'À venir prochainement'}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl mb-2">Aucune ressource ne correspond à vos critères</h3>
              <p className="text-gray-400 mb-6">Essayez d'élargir votre recherche ou consultez nos autres catégories.</p>
              <button
                className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
              >
                Réinitialiser
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Ressources à venir */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prochainement Disponible
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nous travaillons sur de nouvelles ressources pour vous aider encore mieux.
            Voici ce que nous préparons :
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {comingSoonResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>

                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-gray-300 mb-4">{resource.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={`px-3 py-1 rounded-full text-sm inline-block ${
                  resource.status === 'in-progress' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-white/20 text-gray-400'
                }`}>
                  {resource.status === 'in-progress' ? 'En développement' : 'À venir'}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-300 mb-6">
              Vous avez une idée de ressource qui vous serait utile ? <br />
              Faites-nous savoir ce qui vous aiderait !
            </p>
            <Link
              href="/contact?subject=resource-idea"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
            >
              Suggérer une idée
              <ChevronRight className="w-4 h-4" />
            </Link>
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
            Rejoignez notre <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">mouvement</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Nous sommes une jeune startup avec une vision audacieuse. Vous pouvez nous aider à transformer le monde du travail :
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
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Utilisez nos ressources</h3>
              <p className="text-gray-300 mb-4">
                Appliquez nos conseils dans votre quotidien professionnel et faites-nous part de vos retours.
              </p>
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
                Vous êtes expert dans un domaine ? Partagez vos connaissances avec notre communauté.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rejoignez notre équipe</h3>
              <p className="text-gray-300 mb-4">
                Nous recherchons des talents passionnés pour nous aider à grandir et à réaliser notre vision.
              </p>
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
            Ensemble, nous pouvons transformer l'avenir du travail !
          </motion.p>
        </div>
      </section>
    </div>
  );
}
