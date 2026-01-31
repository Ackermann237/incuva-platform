'use client';
import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Brain,
  Shield,
  BarChart3,
  Sparkles,
  MessageSquare,
  FileText,
  Target,
  Bot,
  Rocket,
  ArrowUpRight,
  Play,
  Star,
  Globe,
  Lock,
  TrendingUp,
  Cloud,
  Cpu,
  Workflow,
  Heart,
  ChevronRight,
  Search,
  Filter,
  UserCheck,
  Clock,
  Award
} from 'lucide-react';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const images = [
    "https://images.pexels.com/photos/6457490/pexels-photo-6457490.jpeg", // Team meeting
    "https://images.pexels.com/photos/7876205/pexels-photo-7876205.jpeg", // Interview
    "https://images.pexels.com/photos/7937312/pexels-photo-7937312.jpeg", // Candidate selection
    "https://images.pexels.com/photos/6503000/pexels-photo-6503000.jpeg", // HR analytics
    "https://images.pexels.com/photos/3184634/pexels-photo-3184634.jpeg"  // Office workspace
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-pink-200/10 rounded-full blur-3xl"
          style={{ transform: `translateY(-${scrollY * 0.1}px)` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-blue-100/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                INCUVA
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {['Solutions', 'Fonctionnalités', 'Cas clients', 'Offres', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="relative text-blue-700/90 hover:text-blue-900 transition-colors font-medium group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                  className="hidden md:inline-flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors hover:scale-105 active:scale-95"
                  onClick={() => window.location.href = "http://localhost:5173/login"}
              >
                Connexion
              </button>
              <button
                  className="group relative inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 overflow-hidden"
                  onClick={() => window.location.href = "http://localhost:5173/select_account_type"}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative flex items-center">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Sans image */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-purple-50/20" />

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-700 animate-pulse">
              <Sparkles className="mr-2 h-4 w-4" />
              🚀 Propulsé par l'IA nouvelle génération
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
              <span className="block">Recrutement Intelligent</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Réinventé par l'IA
              </span>
            </h1>

            <p className="mb-10 text-xl text-gray-600 leading-relaxed">
              Découvrez <span className="font-semibold text-blue-700 relative inline-block">
                <span className="relative z-10">INCUVA Recruit</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-200/50 -z-10" />
              </span> pour les entreprises équipées,
              ou <span className="font-semibold text-orange-600 relative inline-block">
                <span className="relative z-10">INCUVA Suite</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-200/50 -z-10" />
              </span> pour une solution RH complète.
              L'IA qui transforme 200 CV en 5 candidats idéaux.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-200/50 hover:shadow-3xl hover:shadow-blue-300/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Essayer gratuitement
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="group inline-flex items-center justify-center rounded-xl border-2 border-blue-200 bg-white/80 px-8 py-4 text-base font-semibold text-blue-700 shadow-xl hover:shadow-2xl hover:border-blue-300 backdrop-blur-sm transition-all duration-300">
                <div className="relative flex items-center">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Voir la démo
                </div>
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
              {['Microsoft', 'Google', 'Amazon', 'Airbnb', 'Spotify'].map((company) => (
                <div key={company} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Image avec statistiques */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={images[4]}
                  alt="Espace de travail moderne"
                  className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />

                {/* Overlay stats */}
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4 backdrop-blur-sm bg-white/20 p-4 rounded-xl border border-white/30">
                  {[
                    { value: "95%", label: "Temps gagné", icon: <Clock className="h-4 w-4" /> },
                    { value: "87%", label: "Précision", icon: <Target className="h-4 w-4" /> },
                    { value: "4.9/5", label: "Satisfaction", icon: <Award className="h-4 w-4" /> }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-blue-100 flex items-center justify-center gap-1">
                        {stat.icon}
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transformez votre{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  processus RH
                </span>
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Notre plateforme intelligente utilise l'IA pour automatiser chaque étape du recrutement,
                depuis la publication des offres jusqu'à l'intégration des nouveaux collaborateurs.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Search className="h-5 w-5 text-blue-600" />,
                    title: "Recherche intelligente",
                    description: "Algorithme IA qui trouve les meilleurs profils correspondant à vos besoins"
                  },
                  {
                    icon: <Filter className="h-5 w-5 text-blue-600" />,
                    title: "Filtrage avancé",
                    description: "Tri automatique des candidats selon vos critères spécifiques"
                  },
                  {
                    icon: <UserCheck className="h-5 w-5 text-blue-600" />,
                    title: "Sélection objective",
                    description: "Évaluation basée sur les compétences, sans biais inconscients"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group cursor-pointer">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section avec images */}
      <section id="solutions" className="relative py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Deux solutions pour{' '}
              <span className="relative inline-block">
                chaque besoin
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4C50 -1.5 150 -1.5 200 4" stroke="url(#gradient)" strokeWidth="4"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Que vous ayez déjà un SIRH ou que vous cherchiez une solution complète,
              INCUVA s'adapte parfaitement à vos besoins.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            {/* INCUVA Recruit Card avec image */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/20 overflow-hidden shadow-2xl shadow-blue-50/50 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-100/50 hover:border-blue-200 hover:scale-[1.02]">

                {/* Image container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={images[1]}
                    alt="Entretien d'embauche"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">INCUVA Recruit</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">INCUVA Recruit</h3>
                    <p className="text-blue-600 font-medium mt-2">Pour entreprises avec SIRH existant</p>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {[
                      "Publication automatique sur LinkedIn, Indeed, etc.",
                      "Candidature en un clic pour les postulants",
                      "Matching Vectoriel IA : 200 → 5 candidats",
                      "Décisions explicables et suggestions de questions",
                      "Intégration automatique avec votre SIRH"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start group/item">
                        <div className="mr-3 mt-1 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="group/btn w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50">
                    <span className="relative flex items-center justify-center">
                      Découvrir INCUVA Recruit
                      <ArrowUpRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* INCUVA Suite Card avec image */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative rounded-2xl border-2 border-orange-100 bg-gradient-to-b from-white to-orange-50/10 overflow-hidden shadow-2xl shadow-orange-50/50 transition-all duration-500 hover:shadow-3xl hover:shadow-orange-100/50 hover:border-orange-200 hover:scale-[1.02]">

                {/* Image container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={images[3]}
                    alt="Analytics RH"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Rocket className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">INCUVA Suite</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    Solution complète
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">INCUVA Suite</h3>
                    <p className="text-orange-600 font-medium mt-2">SIRH complet avec Agent IA embarqué</p>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {[
                      "Tout inclus dans INCUVA Recruit",
                      "Agent IA Jarvis pour l'assistance RH",
                      "Gestion planning, absences et paie",
                      "Onboarding automatique des nouveaux",
                      "Analytics prédictives et reporting"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start group/item">
                        <div className="mr-3 mt-1 flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-orange-500 group-hover/item:scale-110 transition-transform" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="group/btn w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3.5 font-semibold text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50">
                    <span className="relative flex items-center justify-center">
                      Découvrir INCUVA Suite
                      <ArrowUpRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Carousel d'images */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/20 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Découvrez{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                INCUVA en action
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Voyez comment les entreprises utilisent notre plateforme pour transformer leur recrutement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: images[0],
                title: "Collaboration d'équipe",
                description: "Les équipes RH collaborent efficacement sur les processus de sélection"
              },
              {
                image: images[2],
                title: "Sélection de candidats",
                description: "Interface intuitive pour la revue et la sélection des profils"
              },
              {
                image: images[1],
                title: "Entretiens guidés",
                description: "Conduisez des entretiens structurés avec l'assistance de l'IA"
              }
            ].map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-blue-100">{item.description}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section avec image interactive */}
      <section id="features" className="relative py-20 md:py-28 bg-gradient-to-b from-white via-blue-50/20 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 mb-4">
                <Cpu className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Technologie de pointe</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Une révolution{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  guidée par l'IA
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Découvrez comment notre technologie transforme chaque étape du processus RH
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: <Bot className="h-5 w-5" />,
                    title: "Matching Vectoriel IA",
                    description: "Notre IA analyse et classe automatiquement les candidats"
                  },
                  {
                    icon: <MessageSquare className="h-5 w-5" />,
                    title: "Suggestions d'entretien",
                    description: "Questions personnalisées générées par IA"
                  },
                  {
                    icon: <FileText className="h-5 w-5" />,
                    title: "Contrats intelligents",
                    description: "Génération automatique de contrats conformes"
                  },
                  {
                    icon: <Users className="h-5 w-5" />,
                    title: "Onboarding fluide",
                    description: "Intégration automatique dans le SIRH"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      activeFeature === index 
                        ? 'border-blue-200 bg-blue-50/50 shadow-md' 
                        : 'border-transparent hover:border-blue-100 hover:bg-white'
                    }`}
                    onMouseEnter={() => setActiveFeature(index)}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activeFeature === index 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image interactive */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={images[activeFeature % images.length]}
                  alt="Fonctionnalité INCUVA"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />

                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-bold mb-2">
                    {[
                      "Matching IA en action",
                      "Préparation d'entretien",
                      "Gestion des contrats",
                      "Processus d'onboarding"
                    ][activeFeature]}
                  </h3>
                  <p className="text-blue-100">
                    {[
                      "Visualisation des correspondances entre offres et candidats",
                      "Interface de préparation avec suggestions de questions",
                      "Générateur automatique de contrats personnalisés",
                      "Tableau de bord de suivi d'intégration"
                    ][activeFeature]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section avec image de fond */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={images[4]}
            alt="Background statistiques"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-blue-950/95" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Chiffres qui{' '}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                parlent d'eux-mêmes
              </span>
            </h2>
            <p className="text-blue-100/90 max-w-2xl mx-auto">
              La preuve par les résultats : découvrez l'impact réel de notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Taux de satisfaction", icon: <Heart className="h-6 w-6" /> },
              { value: "10x", label: "Plus rapide", icon: <Zap className="h-6 w-6" /> },
              { value: "500+", label: "Entreprises", icon: <Globe className="h-6 w-6" /> },
              { value: "99.9%", label: "Disponibilité", icon: <Cloud className="h-6 w-6" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center rounded-full bg-white/10 p-3 mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-blue-100/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section avec image illustrative */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Votre parcours{' '}
                <span className="relative inline-block">
                  simplifié
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M0 4C50 -1.5 150 -1.5 200 4" stroke="url(#gradient2)" strokeWidth="4"/>
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Un processus entièrement automatisé de la publication à l'intégration
              </p>

              <div className="space-y-6">
                {[
                  { step: "1", title: "Publication Intelligente", description: "Postez votre offre, elle est automatiquement diffusée sur 10+ plateformes" },
                  { step: "2", title: "Candidature Optimisée", description: "Les candidats postulent en un clic via notre interface optimisée" },
                  { step: "3", title: "Sélection IA Avancée", description: "Notre IA analyse et pré-sélectionne les 5 meilleurs profils" },
                  { step: "4", title: "Entretien Guidé", description: "Conduisez des entretiens avec des questions suggérées par l'IA" },
                  { step: "5", title: "Intégration Automatique", description: "Signature électronique et intégration automatique dans le SIRH" }
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={images[2]}
                  alt="Processus de sélection"
                  className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />

                {/* Floating elements */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Analyse IA en temps réel</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Notre algorithme analyse chaque candidat en quelques secondes
                  </p>
                </div>

                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Résultats optimisés</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Augmentez votre taux de réussite de 40% avec nos suggestions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section avec image */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={images[0]}
            alt="CTA Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-purple-900/90" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 mb-6 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-white mr-2" />
              <span className="text-sm font-medium text-white">Édition limitée</span>
            </div>

            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
              Prêt à{' '}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                révolutionner
              </span>{' '}
              votre recrutement ?
            </h2>
            <p className="mb-10 text-xl text-blue-100/90">
              Rejoignez les entreprises qui ont déjà transformé leur processus RH avec INCUVA
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="group relative inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-900 shadow-2xl hover:bg-blue-50 hover:shadow-3xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Discuter avec un expert
                  <MessageSquare className="ml-3 h-5 w-5" />
                </span>
              </button>
              <button className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-orange-500/25 hover:shadow-3xl hover:shadow-orange-500/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Essai gratuit 14 jours
                  <Zap className="ml-3 h-5 w-5" />
                </span>
              </button>
            </div>

            <p className="mt-8 text-sm text-blue-200/70">
              ⚡ Aucune carte de crédit requise • 🚀 Configuration en 5 minutes • 🔒 100% sécurisé
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-gray-50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-start justify-between lg:flex-row">
            <div className="mb-12 lg:mb-0 lg:max-w-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl blur" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  INCUVA
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                La plateforme de recrutement intelligente qui transforme vos processus RH avec l'IA.
                Faites passer votre recrutement à l'ère numérique.
              </p>

              <div className="mt-8 flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <button
                    key={social}
                    className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
              {[
                {
                  title: "Produit",
                  links: ["INCUVA Recruit", "INCUVA Suite", "Fonctionnalités", "Tarifs", "Roadmap"]
                },
                {
                  title: "Ressources",
                  links: ["Documentation", "Blog", "Support", "RGPD", "API"]
                },
                {
                  title: "Entreprise",
                  links: ["À propos", "Carrières", "Contact", "Presse", "Partenaires"]
                },
                {
                  title: "Légal",
                  links: ["Mentions légales", "Confidentialité", "CGU", "Cookies", "Sécurité"]
                }
              ].map((column, index) => (
                <div key={index}>
                  <h4 className="mb-4 font-semibold text-gray-900">{column.title}</h4>
                  <ul className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href="#"
                          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:pl-1 inline-block"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} INCUVA. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Fabriqué avec ❤️ en France</span>
              <span>•</span>
              <span>v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;