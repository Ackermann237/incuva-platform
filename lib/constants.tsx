'use client';
import {
  Brain, Users, TrendingUp, ShieldCheck, Layers, Zap, Database, Star,
  Network, Shield, Globe, Check, Cpu, Sparkles, Award, Target
} from 'lucide-react';
import { use } from 'react';

// Types
type UserType = 'entreprise' | 'chercheur' | 'freelance';

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

interface Testimonial {
  text: string;
  author: string;
  role: string;
  rating: number;
  avatar: string;
}

interface FAQCategory {
  category: string;
  questions: Array<{ q: string; a: string }>;
}

interface FAQData extends Array<FAQCategory> {}

// Données des features
export const features: Record<UserType, Feature[]> = {
  entreprise: [
    {
      title: "IA de Matching Prédictif",
      desc: "Analyse instantanée des compétences, soft skills et probabilités de réussite pour chaque candidat.",
      icon: <Brain />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Générateur d’Équipes Automatique",
      desc: "L’IA assemble des équipes optimisées en fonction des compétences, personnalités et objectifs du projet.",
      icon: <Users />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Score de Stabilité Professionnelle",
      desc: "Identifie les talents à haut potentiel et prédit la durée estimée de collaboration.",
      icon: <TrendingUp />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Contrats Dynamiques Blockchain",
      desc: "Contrats auto-exécutables, infalsifiables et ajustables selon la durée, livrables et qualité.",
      icon: <ShieldCheck />,
      color: "from-yellow-500 to-orange-500",
    },
  ],
  chercheur: [
    {
      title: "Analyseur IA de CV en Temps Réel",
      desc: "Votre CV est scanné et amélioré automatiquement selon les tendances du marché et les exigences locales.",
      icon: <Layers />,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Simulateur d’Entretien IA",
      desc: "Entraînez-vous avec un avatar intelligent qui détecte vos hésitations, ton, posture et répond à votre place.",
      icon: <Brain />,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Assistant Salarial Prédictif",
      desc: "Estime votre salaire idéal en fonction de votre profil, localisation et évolution du marché.",
      icon: <TrendingUp />,
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Opportunités Ultra-Ciblées",
      desc: "L’IA surveille le marché et vous alerte dès qu’un poste correspond à 95% ou plus à votre profil.",
      icon: <Zap />,
      color: "from-amber-500 to-yellow-500",
    },
  ],
  freelance: [
    {
      title: "Analyseur de Taux Journalier Automatique",
      desc: "Calcule automatiquement votre TJM optimal selon la demande, votre historique et la concurrence locale.",
      icon: <TrendingUp />,
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Optimisation IA de Portefeuille",
      desc: "L’IA identifie les missions les plus rentables et prédit vos périodes creuses pour anticiper.",
      icon: <Database />,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Assistante Virtuelle Pro",
      desc: "Génère vos devis, contrats, relances clients, et même vos réponses automatiques aux messages.",
      icon: <Zap />,
      color: "from-emerald-500 to-green-500",
    },
    {
      title: "Boost de Réputation IA",
      desc: "Analyse votre activité et crée un profil irrésistible pour attirer les clients premium.",
      icon: <Star />,
      color: "from-red-500 to-pink-500",
    },
  ],
};

// Témoignages
export const testimonials: Testimonial[] = [
  {
    text: "INCUVA m'a permis de trouver mes premiers clients locaux en moins d'une semaine. L'application simplifie tout, de la mise en relation à la gestion des paiements.",
    author: "Sarah M.",
    role: "Freelance Graphiste",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    text: "Grâce à INCUVA, nous avons pu embaucher rapidement des prestataires fiables pour nos projets. Le tableau de bord simplifie le suivi et les contrats intelligents garantissent la sécurité.",
    author: "Marc D.",
    role: "Directeur RH, TechUp",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    text: "Je cherchais des missions en parallèle de mes études. INCUVA m'a aidé à décrocher des petits contrats proches de chez moi, sans stress ni perte de temps.",
    author: "Yanis L.",
    role: "Étudiant & Développeur Web",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

// FAQ
export const faqData: FAQData = [
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
    },
];
