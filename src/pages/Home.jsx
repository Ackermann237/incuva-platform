import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronRight, Play, ArrowRight, ArrowLeft,
  Zap, Shield, Layers, TrendingUp, Users, Database,
  Network, Brain, ShieldCheck, Globe, Check, Cpu,
  Facebook, Twitter, Linkedin, Instagram, Send,
  Sparkles, Award, Target, Star, ChevronDown
} from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeUserType, setActiveUserType] = useState('entreprise');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const features = {
  entreprise: [
    {
      title: "IA de Matching Prédictif",
      desc: "Analyse instantanée des compétences, soft skills et probabilités de réussite pour chaque candidat.",
      icon: <Brain />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Générateur d’Équipes Automatique",
      desc: "L’IA assemble des équipes optimisées en fonction des compétences, personnalités et objectifs du projet.",
      icon: <Users />,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Score de Stabilité Professionnelle",
      desc: "Identifie les talents à haut potentiel et prédit la durée estimée de collaboration.",
      icon: <TrendingUp />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Contrats Dynamiques Blockchain",
      desc: "Contrats auto-exécutables, infalsifiables et ajustables selon la durée, livrables et qualité.",
      icon: <ShieldCheck />,
      color: "from-yellow-500 to-orange-500"
    }
  ],

  chercheur: [
    {
      title: "Analyseur IA de CV en Temps Réel",
      desc: "Votre CV est scanné et amélioré automatiquement selon les tendances du marché et les exigences locales.",
      icon: <Layers />,
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Simulateur d’Entretien IA",
      desc: "Entraînez-vous avec un avatar intelligent qui détecte vos hésitations, ton, posture et répond à votre place.",
      icon: <Brain />,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Assistant Salarial Prédictif",
      desc: "Estime votre salaire idéal en fonction de votre profil, localisation et évolution du marché.",
      icon: <TrendingUp />,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Opportunités Ultra-Ciblées",
      desc: "L’IA surveille le marché et vous alerte dès qu’un poste correspond à 95% ou plus à votre profil.",
      icon: <Zap />,
      color: "from-amber-500 to-yellow-500"
    }
  ],

  freelance: [
    {
      title: "Analyseur de Taux Journalier Automatique",
      desc: "Calcule automatiquement votre TJM optimal selon la demande, votre historique et la concurrence locale.",
      icon: <TrendingUp />,
      color: "from-violet-500 to-purple-500"
    },
    {
      title: "Optimisation IA de Portefeuille",
      desc: "L’IA identifie les missions les plus rentables et prédit vos périodes creuses pour anticiper.",
      icon: <Database />,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Assistante Virtuelle Pro",
      desc: "Génère vos devis, contrats, relances clients, et même vos réponses automatiques aux messages.",
      icon: <Zap />,
      color: "from-emerald-500 to-green-500"
    },
    {
      title: "Boost de Réputation IA",
      desc: "Analyse votre activité et crée un profil irrésistible pour attirer les clients premium.",
      icon: <Star />,
      color: "from-red-500 to-pink-500"
    }
  ]
};


  const testimonials = [
    {
      text: "INCUVA m'a permis de trouver mes premiers clients locaux en moins d'une semaine. L'application simplifie tout, de la mise en relation à la gestion des paiements.",
      author: "Sarah M.",
      role: "Freelance Graphiste",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      text: "Grâce à INCUVA, nous avons pu embaucher rapidement des prestataires fiables pour nos projets. Le tableau de bord simplifie le suivi et les contrats intelligents garantissent la sécurité.",
      author: "Marc D.",
      role: "Directeur RH, TechUp",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
    },
    {
      text: "Je cherchais des missions en parallèle de mes études. INCUVA m'a aidé à décrocher des petits contrats proches de chez moi, sans stress ni perte de temps.",
      author: "Yanis L.",
      role: "Étudiant & Développeur Web",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
    }
  ];

  const faqData = [
    { 
      category: "Pour les Entreprises & Recruteurs",
        questions: [
        {
          q: "Comment Mobyus m’aide au recrutement ?",
          a: "Mobyus analyse chaque candidat comme un assistant RH surhumain : parsing du CV, lecture comportementale, détection des soft skills, prédiction de compatibilité culturelle et scoring automatique. Il identifie les talents qui réussiront – et ceux qui risquent d’échouer – bien avant l'entretien."
        },
        {
          q: "Est-ce que Mobyus peut prédire les départs et les risques RH ?",
          a: "Oui. Mobyus détecte les signaux faibles de turnover, d’épuisement, d’inadéquation poste-profil et d’instabilité d’équipe. Il alerte instantanément les managers et propose des actions préventives (réallocation, formation, ajustement de charge, intervention RH)."
        },
        {
          q: "Comment Mobyus optimise mes équipes au quotidien ?",
          a: "Il surveille les dynamiques internes : charge de travail, productivité, collaboration, anomalies. Mobyus recommande des réorganisations intelligentes (qui mettre ensemble, qui repositionner, qui promouvoir) basées sur des simulations en temps réel."
        },
        {
          q: "Mobyus peut-il m’aider dans la prise de décision stratégique ?",
          a: "Oui. Il analyse les données RH, financières et opérationnelles pour générer des scénarios prédictifs : coût réel d’un poste, impact d’un recrutement, projection de croissance, besoins futurs en compétences. Il vous donne la meilleure décision calculée."
        },
        {
          q: "Les contrats et paiements automatisés par Mobyus sont-ils sécurisés ?",
          a: "Mobyus opère via des smart contracts blockchain. Chaque validation, paiement ou renouvellement est automatisé, infalsifiable et signé numériquement. Plus d’erreurs humaines, plus de litiges, transparence totale."
        },
        {      q: "Puis-je personnaliser les critères de sélection et d’évaluation de Mobyus ?",
          a: "Absolument. Vous pouvez ajuster les algorithmes de matching selon vos priorités : compétences techniques, soft skills, expérience, culture d’entreprise. Mobyus s’adapte à vos besoins spécifiques."
        }
      ]
    },
    {
      category: "Pour les Clients & Chercheurs d'emploi",
      questions: [
        {
          q: "Comment Mobyus m’aide à trouver une opportunité ?",
          a: "Mobyus analyse votre CV, votre style de travail, vos préférences, vos forces réelles et vos comportements pour prédire les postes où vous performerez le mieux. Il vous propose les offres où votre taux de réussite est le plus élevé."
        },
        {
          q: "Et si je ne sais pas quel métier viser ?",
          a: "Mobyus réalise un profil cognitif complet : personnalité professionnelle, rythme optimal, compétences latentes, potentiel d’évolution. Il génère automatiquement des métiers compatibles et des parcours personnalisés."
        },
        {
          q: "Comment Mobyus personnalise mes candidatures ?",
          a: "Il optimise votre CV, améliore vos descriptions, propose des réponses pour vos entretiens et crée des messages professionnels adaptés à chaque recruteur en fonction de leur style."
        }
      ]
    },

    {
      category: "Pour les Freelances & Prestataires",
      questions: [
        {
          q: "Comment Mobyus m’aide à trouver des missions ?",
          a: "Il analyse vos compétences, vos performances passées, vos tarifs, vos horaires, vos clients précédents et votre style de collaboration. Puis il vous envoie les missions les plus compatibles à plus de 90%."
        },
        {
          q: "Mobyus peut-il augmenter ma visibilité ?",
          a: "Oui. Il ajuste en temps réel votre profil, vos mots-clés et votre positionnement pour vous hisser automatiquement en haut des recherches des entreprises qui recherchent votre expertise."
        },
        {
          q: "Comment Mobyus facilite ma communication avec les clients ?",
          a: "Il génère des propositions commerciales, optimise vos messages, rédige des réponses rapides, organise vos rendez-vous, suit vos conversations et vous aide même à négocier efficacement."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">INCUVA</span>
            </motion.div>

            <div className="hidden md:flex space-x-8 text-sm">
              {['segments', 'features', 'about', 'faq'].map((item) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-gray-300 hover:text-white transition-colors relative"
                  whileHover={{ y: -2 }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </motion.button>
              ))}
            </div>

            <div className="hidden md:flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 text-sm rounded-full text-gray-300 hover:text-white transition-all"
                onClick={() => navigate("/login")}
              >
                Connexion
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
                onClick={() => navigate("/select_account_type")}
              >
                Démarrer
              </motion.button>
            </div>

            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10"
            >
              <div className="px-6 py-6 space-y-4">
                {['segments', 'features', 'about', 'faq'].map((item) => (
                  <button key={item} onClick={() => scrollToSection(item)} className="block w-full text-left text-gray-300 hover:text-white py-2">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"
            style={{
              x: mousePosition.x,
              y: mousePosition.y,
            }}
          />
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  opacity: 0,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
              />
            ))}
          </div>
        </div>

        <motion.div 
          className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20"
          style={{ scale: scaleProgress, opacity: opacityProgress }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Nouvelle génération de plateforme RH</span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              L'intelligence des données
            </span>
            <br />
            <span className="text-5xl md:text-7xl text-gray-400">Au service des ressources humaines</span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Une plateforme intelligente qui connecte entreprises, freelances et talents.
            <br />Propulsée par l'IA. Conçue pour l'excellence.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all"
            >
              Commencer maintenant
            </motion.button>
            <motion.button 
              className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full font-medium hover:bg-white/10 transition-all flex items-center gap-2 justify-center group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Voir la démo
            </motion.button>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <motion.div 
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop" 
                alt="Modern workspace"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-16 flex items-center justify-center gap-2 text-gray-500"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm">Faites défiler pour découvrir</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Segments Section avec formes hexagonales */}
      <section id="segments" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Conçue pour <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">trois univers</span>
            </h2>
            <p className="text-xl text-gray-400">Une plateforme. Trois expériences uniques.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Entreprises",
                desc: "Recrutez les meilleurs talents avec l'intelligence artificielle",
                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=800&fit=crop",
                gradient: "from-blue-500/20 to-cyan-500/20",
              },
              {
                title: "Chercheurs d'emploi",
                desc: "Trouvez l'opportunité parfaite qui correspond à vos compétences",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                title: "Freelances",
                desc: "Développez votre activité et gérez vos missions en toute simplicité",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop",
                gradient: "from-orange-500/20 to-red-500/20",
              }
            ].map((segment, idx) => (
              <motion.div
                key={idx}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-[600px] rounded-3xl overflow-hidden"
                  style={{
                    clipPath: idx === 1 ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : undefined
                  }}
                >
                  <motion.img 
                    src={segment.image} 
                    alt={segment.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${segment.gradient} to-black/80`} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                  
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-8"
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                  >
                    <h3 className="text-3xl font-bold mb-3">{segment.title}</h3>
                    <motion.p 
                      className="text-gray-300 mb-6"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {segment.desc}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-2 text-white"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-sm font-medium">En savoir plus</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section avec cartes en forme de losange */}
      <section id="features" className="py-32 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Des fonctionnalités <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">révolutionnaires</span>
            </h2>
            <p className="text-xl text-gray-400">Propulsées par l'intelligence artificielle</p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-16 flex-wrap">
            {['entreprise', 'chercheur', 'freelance'].map((type) => (
              <motion.button
                key={type}
                onClick={() => setActiveUserType(type)}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  activeUserType === type
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type === 'entreprise' ? 'Entreprise' : type === 'chercheur' ? 'Chercheur' : 'Freelance'}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeUserType}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {features[activeUserType].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: 1000
                  }}
                >
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      
      {/* MOBYUS — IA EMBARQUÉE */}
      <section className="py-32 px-6 relative overflow-hidden">

        {/* Background Holographique */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/30 to-black" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Pulses lumineux */}
        <div className="absolute w-96 h-96 bg-purple-600/20 blur-[180px] rounded-full -top-32 -right-32 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-600/20 blur-[180px] rounded-full -bottom-32 -left-32 animate-pulse" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* TITLE */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Mobyus</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              L’IA embarquée d’INCUVA inspirée des systèmes tactiques Mobyus — analyse, anticipe et exécute vos besoins en temps réel.
            </p>
          </motion.div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-12">

            {/* CARD 1 — HOLOGRAPHIC AI ANALYTICS */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="relative p-10 rounded-3xl bg-gradient-to-br from-white/10 via-purple-50/10 to-pink-50/5 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(180,90,255,0.2)] overflow-hidden group"
            >

              {/* Bordure Néon 3D animée */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-purple-400/40"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.7)" }}
              />

              {/* Effet scan vertical */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Glow shapes */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/30 blur-3xl" />

              <div className="relative z-10">

                {/* Icon container */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold mb-4 text-white">
                  Mobyus analyse & anticipe
                </h3>

                <p className="text-gray-300 leading-relaxed mb-6">
                  Le moteur prédictif de Mobyus observe vos comportements et détecte vos besoins avant même que vous ne les formuliez.
                </p>

                {/* Items */}
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">Scan comportemental continu</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">IA de recommandation dynamique</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-purple-400" />
                    <span className="text-gray-300">Détection de signaux faibles</span>
                  </li>
                </ul>

              </div>
            </motion.div>


            {/* CARD 2 — DEEP NEURAL EXECUTION ENGINE */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="relative p-10 rounded-3xl bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black backdrop-blur-2xl shadow-[0_0_60px_rgba(90,40,255,0.4)] border border-purple-500/20 overflow-hidden group"
            >

              {/* Bordure Néon animée */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-pink-400/40"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1, boxShadow: "0 0 40px rgba(236,72,153,0.7)" }}
              />

              {/* Effet de scan horizontal façon HUD */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-150%", "150%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              {/* Glow shapes */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/20 blur-3xl" />

              {/* Circuit holographique */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-72 h-72 border-4 border-white/10 rounded-full" />
              </motion.div>

              <div className="relative z-10">

                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-6 shadow-xl">
                  <Cpu className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold mb-4 text-white">
                  Mobyus exécute pour vous
                </h3>

                <p className="text-purple-200 leading-relaxed mb-6">
                  Mobyus ne se limite pas au diagnostic : il exécute vos actions, automatise vos processus et devient votre véritable copilote intégral.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-pink-300" />
                    <span className="text-gray-200">Actions automatisées intelligentes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-pink-300" />
                    <span className="text-gray-200">Génération instantanée de documents</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Play className="w-6 h-6 text-pink-300" />
                    <span className="text-gray-200">Interaction vocale & textuelle fluide</span>
                  </li>
                </ul>

              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* Testimonials avec cartes en forme circulaire */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-5xl font-bold mb-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ils nous font <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">confiance</span>
          </motion.h2>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 100, rotateY: 90 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -100, rotateY: -90 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 relative overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(168, 85, 247, 0.25)'
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <motion.img
                      src={testimonials[testimonialIndex].avatar}
                      alt={testimonials[testimonialIndex].author}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    />
                    <div>
                      <p className="font-bold text-xl">{testimonials[testimonialIndex].author}</p>
                      <p className="text-gray-400">{testimonials[testimonialIndex].role}</p>
                      <div className="flex gap-1 mt-2">
                        {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl text-gray-300 leading-relaxed italic">
                    "{testimonials[testimonialIndex].text}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))}
                className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"
                disabled={testimonialIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setTestimonialIndex(Math.min(testimonials.length - 1, testimonialIndex + 1))}
                className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"
                disabled={testimonialIndex === testimonials.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ avec accordéon animé */}
      <section id="faq" className="py-32 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Questions <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">fréquentes</span>
            </h2>
            <p className="text-xl text-gray-400">Tout ce que vous devez savoir sur INCUVA</p>
          </motion.div>

          <div className="space-y-6">
            {faqData.map((category, catIdx) => (
              <motion.div 
                key={catIdx}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => {
                    const faqId = `${catIdx}-${qIdx}`;
                    return (
                      <motion.div 
                        key={qIdx} 
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: qIdx * 0.1 }}
                      >
                        <motion.button
                          onClick={() => setActiveFaq(activeFaq === faqId ? null : faqId)}
                          className="w-full p-6 text-left flex justify-between items-center"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="font-medium text-lg pr-4">{item.q}</span>
                          <motion.div
                            animate={{ rotate: activeFaq === faqId ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          </motion.div>
                        </motion.button>
                        <AnimatePresence>
                          {activeFaq === faqId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                <p>{item.a}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    {/* About Section avec cartes 3D premium */}
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      {/* Aura lumineuse */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Pourquoi{" "}
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              INCUVA
            </span>{" "}
            ?
          </h2>
          <p className="text-xl text-gray-400">
            La plateforme qui réinvente le monde du travail
          </p>
        </motion.div>

        {/* Cartes flottantes */}
        <div className="grid md:grid-cols-4 gap-10">
          {[
            { icon: <Network className="w-8 h-8" />, title: "Écosystème Connecté", desc: "Un réseau intelligent qui connecte les bonnes personnes", delay: 0 },
            { icon: <Brain className="w-8 h-8" />, title: "IA Avancée", desc: "Des algorithmes qui comprennent vos besoins réels", delay: 0.1 },
            { icon: <ShieldCheck className="w-8 h-8" />, title: "Sécurité Totale", desc: "Transactions sécurisées par blockchain", delay: 0.2 },
            { icon: <Globe className="w-8 h-8" />, title: "Portée Mondiale", desc: "Connectez-vous au monde entier", delay: 0.3 }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -14 }}
              className="
                group relative p-8 rounded-3xl 
                bg-white/5 border border-white/10 
                backdrop-blur-xl 
                shadow-[0px_8px_30px_rgba(0,0,0,0.3)] 
                hover:shadow-[0px_20px_60px_rgba(0,0,0,0.45)]
                transition-all duration-500
              "
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glow effet autour de l’icône */}
              <motion.div
                className="
                  w-20 h-20 rounded-2xl mx-auto mb-6
                  flex items-center justify-center
                  bg-gradient-to-br from-purple-500/20 to-pink-500/20
                  border border-white/20
                  shadow-inner
                "
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                {item.icon}
              </motion.div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>

              {/* Halo lumineux subtil */}
              <div className="
                absolute inset-0 opacity-0 group-hover:opacity-20 
                bg-gradient-to-br from-purple-400 to-pink-400 
                rounded-3xl blur-2xl transition-all
              " />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    
    {/* AI-Powered Experiences Section avec cartes en parallélépipède */}
    <section className="py-32 px-6 relative overflow-hidden">

      <motion.h2
        className="text-center text-5xl md:text-7xl font-extrabold mb-20 tracking-tight"
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        Propulsé par{" "}
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          l'intelligence artificielle
        </span>
      </motion.h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">

        {[
          {
            title: "Pour les Entreprises",
            desc: "Une IA décisionnelle détecte les talents, prédit les départs et optimise vos performances. Elle apprend votre culture interne pour recommander les meilleurs recrutements et réorganisations.",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
            gradient: "from-blue-600/80 to-cyan-600/80"
          },
          {
            title: "Pour les Freelances",
            desc: "Une IA de matching analyse votre expertise et vos habitudes pour vous connecter aux missions les plus compatibles. Elle anticipe vos besoins et met en avant les opportunités les plus rentables.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
            gradient: "from-purple-600/80 to-pink-600/80"
          },
          {
            title: "Pour les Chercheurs",
            desc: "Une IA cognitive analyse vos compétences et votre potentiel pour générer des recommandations sur mesure : opportunités, parcours de carrière, formations et conseils d’entretien.",
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
            gradient: "from-orange-600/80 to-red-600/80"
          }


        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="
              relative h-[500px] rounded-[2rem] overflow-hidden 
              group cursor-pointer shadow-2xl
            "
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.06 }}
          >
            {/* Image */}
            <motion.img
              src={item.image}
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.8 }}
            />

            {/* Filtre principal */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${item.gradient} to-black/70`}
            />

            {/* Brume glossy au hover */}
            <div
              className="
                absolute inset-0 bg-white/5 opacity-0 
                group-hover:opacity-20 transition-all duration-500
              "
            />

            {/* Texte */}
            <motion.div
              className="absolute bottom-0 p-10 text-white"
              initial={{ y: 20, opacity: 0.8 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-200 mb-6 leading-relaxed">
                {item.desc}
              </p>

              {/* CTA animé */}
              <motion.div
                className="flex items-center gap-2 text-white"
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
              >
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium">Découvrir</span>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}

      </div>
    </section>


      {/* Steps Section – Timeline Néon en courbes avec formes organiques */}
      <section className="relative py-40 px-6 overflow-hidden">

        {/* Fond néon ondulé */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>

            <path
              d="M 0 250 C 300 150, 500 350, 800 250 C 1100 150, 1400 350, 1700 250"
              stroke="url(#wave)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Blobs lumineux */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-600/20 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2
            className="text-center text-6xl md:text-7xl font-extrabold mb-28 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Commencez en{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              3 étapes
            </span>
          </motion.h2>

          {/* Timeline organique */}
          <div className="relative grid md:grid-cols-3 gap-24">

            {[
              {
                num: "01",
                title: "Créez votre profil",
                desc: "Inscrivez-vous en moins de 2 minutes et activez votre univers personnel",
                icon: <Users className="w-7 h-7" />,
                gradient: "from-blue-500 to-cyan-400"
              },
              {
                num: "02",
                title: "Connectez-vous",
                desc: "L’IA détecte, analyse et propose les meilleures opportunités",
                icon: <Target className="w-7 h-7" />,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                num: "03",
                title: "Collaborez",
                desc: "Un espace unique pour gérer missions, paiements et contrats",
                icon: <Award className="w-7 h-7" />,
                gradient: "from-orange-500 to-red-500"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ scale: 1.1 }}
                className="relative text-center"
              >
                {/* Arc lumineux derrière chaque étape */}
                <div className="absolute inset-0 -z-10">
                  <svg width="100%" height="100%">
                    <path
                      d="M 50 180 C 100 40, 200 40, 250 180"
                      strokeWidth="10"
                      fill="none"
                      stroke="url(#wave)"
                      className="opacity-20"
                    />
                  </svg>
                </div>

                {/* Badge holographique */}
                <motion.div
                  className={`
                    w-20 h-20 mx-auto rounded-3xl 
                    flex items-center justify-center 
                    bg-gradient-to-br ${step.gradient}
                    shadow-[0_0_30px_rgba(255,255,255,0.4)]
                    border border-white/20
                  `}
                  whileHover={{ rotate: [0, -8, 8, -8, 0], scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.icon}
                </motion.div>

                {/* Numéro 3D */}
                <div className="
                  text-[140px] font-extrabold 
                  text-white/5 absolute -top-20 left-1/2 -translate-x-1/2 
                  tracking-tighter pointer-events-none
                ">
                  {step.num}
                </div>

                <h3 className="text-3xl font-bold mt-10 mb-4">{step.title}</h3>
                <p className="text-gray-400 max-w-xs mx-auto">{step.desc}</p>

                {/* Couronne néon au hover */}
                <div className="
                  absolute inset-0 rounded-3xl opacity-0 
                  group-hover:opacity-40 bg-gradient-to-r 
                  from-purple-400 to-pink-400 blur-xl 
                  transition-all
                " />
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-40 px-6 overflow-hidden">

        {/* Cercles orbitaux */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-[900px] h-[900px] rounded-full border border-white/10 blur-xl" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/10" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-white/10" />
        </div>

        {/* Particules lumineuses */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              animate={{
                y: [0, -80, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.12
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* Contenu CTA */}
        <div className="max-w-4xl mx-auto text-center relative z-10">

          <motion.h2
            className="text-6xl md:text-7xl font-extrabold mb-10 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Prêt à transformer  
            <br />
            <span className="
              bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 
              bg-clip-text text-transparent
            ">
              votre carrière ?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-400 mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Rejoignez des milliers de professionnels qui ont choisi INCUVA  
            pour propulser leur activité
          </motion.p>

          {/* Boutons Glass premium */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <motion.button
              whileHover={{ scale: 1.08 }}
              className="
                px-12 py-4 bg-white text-black rounded-full 
                font-semibold shadow-xl hover:bg-gray-200 transition-all
              "
            >
              Pour les entreprises
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, backdropFilter: 'blur(30px)' }}
              className="
                px-12 py-4 bg-white/10 border border-white/20 
                backdrop-blur-2xl rounded-full text-white font-semibold 
                shadow-lg transition-all
              "
            >
              Pour les particuliers
            </motion.button>
          </div>

          {/* Garanties */}
          <div className="flex flex-wrap justify-center gap-10 text-gray-400 text-sm">
            {[
              { icon: <Check className="w-6 h-6 text-green-400" />, text: "Gratuit pendant 30 jours" },
              { icon: <Shield className="w-6 h-6 text-blue-400" />, text: "Paiements sécurisés" },
              { icon: <Award className="w-6 h-6 text-pink-400" />, text: "Support 24/7" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + idx * 0.15 }}
                whileHover={{ scale: 1.15 }}
              >
                {item.icon}
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Layers className="w-5 h-5" />
                </motion.div>
                <span className="text-xl font-semibold">INCUVA</span>
              </div>
              <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                La plateforme qui connecte entreprises, freelances et talents à travers des solutions intelligentes et sécurisées.
              </p>
              <div className="flex space-x-4">
                {[<Facebook />, <Twitter />, <Linkedin />, <Instagram />].map((Icon, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {Icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links */}
            {[
              { title: "Plateforme", links: ["Application mobile", "Dashboard Web", "Tarifs", "Sécurité"] },
              { title: "Ressources", links: ["Blog", "Guides", "Documentation", "FAQ"] },
              { title: "Entreprise", links: ["À propos", "Carrières", "Partenaires", "Contact"] }
            ].map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="font-semibold mb-4 text-sm">{section.title}</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <motion.li 
                      key={linkIdx}
                      whileHover={{ x: 5, color: '#ffffff' }}
                    >
                      <a href="#" className="transition-colors">{link}</a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 mb-16 border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <h4 className="text-2xl font-bold mb-3">Restez informé</h4>
              <p className="text-gray-400 mb-6">
                Recevez nos dernières actualités et conseils directement dans votre boîte mail
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-full border border-white/10 focus:border-purple-500 focus:outline-none transition-all placeholder-gray-500"
                  required
                />
                <motion.button
                  type="submit"
                  className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center gap-2 justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                  S'abonner
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
              <p>&copy; 2025 INCUVA. Tous droits réservés.</p>
              <div className="flex gap-6">
                {["Conditions", "Confidentialité", "RGPD"].map((link, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    className="hover:text-white transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}