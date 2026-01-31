'use client';
import { motion } from 'framer-motion';
import { 
  Check, X, Zap, ShieldCheck, Cpu, Layers, 
  BarChart, Target, Award, Sparkles, Globe, 
  Database, TrendingUp, Brain, Lightbulb
} from 'lucide-react';
import Link from 'next/link';

// Types pour les données
type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  roi?: string;
  precision?: string;
  features: Array<{
    text: string;
    included: boolean;
    highlight?: boolean;
    metric?: string;
  }>;
  cta: string;
  ctaLink: string;
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
};

type FAQItem = {
  question: string;
  answer: string;
  highlight?: boolean;
};

type ComparisonFeature = {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  growth: boolean | string;
  enterprise: boolean | string;
};

// Données refondues pour INCUVA AI Lab
const pricingPlans: PricingPlan[] = [
  {
    name: "Discovery",
    price: "0 €",
    period: "",
    description: "Accès limité aux modèles prédictifs pour évaluer le potentiel",
    features: [
      { text: "Mobyus Core - Mode démo", included: true },
      { text: "Analyse prédictive basique", included: true },
      { text: "1 simulation what-if", included: true },
      { text: "Rapport PDF générique", included: true },
      { text: "Données anonymisées", included: true },
      { text: "Support email (48h)", included: true },
      { text: "Connexion aux données réelles", included: false },
      { text: "Modèles sectoriels", included: false },
      { text: "Prédictions en temps réel", included: false },
      { text: "API complète", included: false },
    ],
    cta: "Démarrer Discovery",
    ctaLink: "/register?plan=discovery",
    icon: <Brain className="w-7 h-7" />,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Starter",
    price: "299 €",
    period: "/mois",
    description: "Mobyus connecté à vos données RH pour des prédictions actionnables",
    roi: "ROI moyen : 340%",
    precision: "91% précision",
    features: [
      { text: "Mobyus Core - Connexion sécurisée", included: true, highlight: true },
      { text: "Prédiction turnover 60 jours", included: true, metric: "91% précision" },
      { text: "5 simulations what-if/mois", included: true },
      { text: "Rapports graphiques automatisés", included: true },
      { text: "Support prioritaire (4h)", included: true },
      { text: "1 modèle sectoriel", included: true },
      { text: "API limitée (1000 appels)", included: true },
      { text: "Données on-premise", included: true },
      { text: "Prédictions en temps réel", included: false },
      { text: "Multi-modèles", included: false },
      { text: "Formation IA dédiée", included: false },
    ],
    cta: "Activer Starter",
    ctaLink: "/register?plan=starter",
    icon: <Database className="w-7 h-7" />,
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    name: "Growth",
    price: "999 €",
    period: "/mois",
    description: "Suite complète d'IA prédictive pour scale-ups en hypercroissance",
    roi: "ROI moyen : 680%",
    precision: "94% précision",
    features: [
      { text: "Mobyus Core + Multi-modèles", included: true, highlight: true },
      { text: "Prédiction 90 jours (tous indicateurs)", included: true, metric: "94% précision" },
      { text: "Simulations illimitées", included: true },
      { text: "Tableau de bord prédictif en temps réel", included: true },
      { text: "Support dédié (1h)", included: true },
      { text: "Modèles sectoriels illimités", included: true },
      { text: "API complète (100k appels)", included: true },
      { text: "Formation IA 4h/mois", included: true },
      { text: "Alertes prédictives automatiques", included: true },
      { text: "Intégration CRM/ERP", included: false },
      { text: "Lab custom model", included: false },
    ],
    cta: "Passer en Growth",
    ctaLink: "/register?plan=growth",
    popular: true,
    icon: <TrendingUp className="w-7 h-7" />,
    gradient: "from-purple-600 via-pink-500 to-cyan-500"
  },
  {
    name: "Enterprise Lab",
    price: "Sur mesure",
    period: "",
    description: "INCUVA AI Lab intégré à votre infrastructure avec modèles sur mesure",
    roi: "ROI sur mesure",
    precision: "96%+ précision",
    features: [
      { text: "Mobyus Enterprise - On-premise", included: true, highlight: true },
      { text: "Modèle IA entraîné sur vos données", included: true, highlight: true },
      { text: "Prédictions personnalisées", included: true, metric: "96%+ précision" },
      { text: "Lab dédié (2 chercheurs)", included: true },
      { text: "Support 24/7 avec SLA", included: true },
      { text: "API entreprise illimitée", included: true },
      { text: "Formation continue", included: true },
      { text: "Intégrations sur mesure", included: true },
      { text: "Audit prédictif trimestriel", included: true },
      { text: "Accès early features", included: true },
      { text: "Co-publication recherche", included: true },
    ],
    cta: "Réserver un appel Lab",
    ctaLink: "/contact?subject=enterprise-lab",
    icon: <Cpu className="w-7 h-7" />,
    gradient: "from-purple-700 via-pink-600 to-cyan-600"
  },
];

const faqItems: FAQItem[] = [
  {
    question: "Mobyus accède-t-il à mes données sensibles ?",
    answer: "Non. Mobyus s'exécute dans votre environnement (on-premise ou cloud privé). Aucune donnée ne transite par nos serveurs. Architecture Zero Data Leak validée par audit externe.",
    highlight: true
  },
  {
    question: "Quelle est la précision réelle des prédictions ?",
    answer: "94% en moyenne sur 90 jours pour le plan Growth (validé sur 23 clients). Starter : 91%. Enterprise Lab : 96%+ avec modèle entraîné sur vos données historiques."
  },
  {
    question: "Combien de temps pour voir un ROI ?",
    answer: "Moyenne : 47 jours pour le plan Starter, 21 jours pour Growth. 68% des clients Growth réduisent leur turnover de 40% dès le premier trimestre."
  },
  {
    question: "Peut-on commencer par Discovery puis upgrader ?",
    answer: "Oui. Toutes les données et configurations sont conservées. Passage instantané vers Starter/Growth avec migration automatique."
  },
  {
    question: "Proposez-vous des modèles sectoriels ?",
    answer: "Oui. Growth inclut l'accès à tous nos modèles pré-entraînés (retail, tech, santé, etc.). Enterprise Lab développe un modèle exclusif sur vos données."
  },
  {
    question: "Quel est le SLA pour Enterprise Lab ?",
    answer: "99.9% uptime garanti contractuellement. Support 24/7 avec temps de réponse < 30 min. Indemnisation en cas de non-respect."
  }
];

const comparisonFeatures: ComparisonFeature[] = [
  { name: "Mobyus Core", free: "Démo", starter: true, growth: "Multi-modèles", enterprise: "On-premise" },
  { name: "Connexion données réelles", free: false, starter: true, growth: true, enterprise: true },
  { name: "Prédiction turnover", free: "Basique", starter: "60 jours", growth: "90 jours", enterprise: "Personnalisé" },
  { name: "Précision moyenne", free: "N/A", starter: "91%", growth: "94%", enterprise: "96%+" },
  { name: "Simulations what-if", free: "1", starter: "5/mois", growth: "Illimité", enterprise: "Illimité + IA" },
  { name: "Modèles sectoriels", free: false, starter: "1", growth: "Illimité", enterprise: "Sur mesure" },
  { name: "API appels/mois", free: false, starter: "1 000", growth: "100 000", enterprise: "Illimité" },
  { name: "Support réponse", free: "48h", starter: "4h", growth: "1h", enterprise: "30 min" },
  { name: "Formation IA", free: false, starter: false, growth: "4h/mois", enterprise: "Continue" },
  { name: "Lab dédié", free: false, starter: false, growth: false, enterprise: "2 chercheurs" },
  { name: "SLA garanti", free: false, starter: false, growth: false, enterprise: "99.9%" },
  { name: "Co-publication", free: false, starter: false, growth: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Vision INCUVA AI Lab */}
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
            <span className="text-purple-300 font-medium">INCUVA AI Lab • Tarification Prédictive</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Prédire
            </span>
            <br />
            <span className="text-white">Votre Croissance</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Mobyus ne fait pas du reporting. Il <span className="text-cyan-400">prédit</span> vos besoins RH, 
            <span className="text-purple-400"> simule</span> les scénarios et <span className="text-pink-400">recommande</span> 
            les actions à fort ROI. Connecté à vos données. Sans fuite.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm">
              <span className="text-sm text-gray-400">Facturation</span>
              <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-sm font-medium">Mensuel</span>
              <span className="text-sm text-gray-400">Annuel (-25%)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans Tarifaires - Vision AI Lab */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative group overflow-hidden rounded-3xl border ${
                  plan.popular 
                    ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                    : 'border-white/10'
                } bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -10 }}
              >
                {/* Gradient background animé */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                {plan.popular && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1 px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-xs font-bold rounded-full shadow-lg">
                    CROISSANCE RAPIDE
                  </div>
                )}

                <div className="relative p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${plan.gradient}`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {plan.roi && <p className="text-sm text-cyan-400 font-medium">{plan.roi}</p>}
                    </div>
                  </div>

                  <div className="mb-6">
                    {plan.price === "Sur mesure" ? (
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {plan.price}
                      </p>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-extrabold">{plan.price}</span>
                          <span className="text-gray-400 text-xl">{plan.period}</span>
                        </div>
                        {plan.period && (
                          <p className="text-sm text-gray-400 mt-1">
                            {Math.round(parseInt(plan.price) * 12 * 0.75)}€/an (-25%)
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-gray-300 mb-8 leading-relaxed">{plan.description}</p>

                  <Link
                    href={plan.ctaLink}
                    className={`w-full block text-center py-4 rounded-2xl font-bold transition-all shadow-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-purple-500/50'
                        : plan.name === "Discovery"
                        ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                        : 'bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            feature.highlight ? 'bg-gradient-to-br from-purple-500 to-cyan-500' : 'bg-green-500/20'
                          }`}>
                            <Check className={`w-4 h-4 ${feature.highlight ? 'text-white' : 'text-green-400'}`} />
                          </div>
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mt-0.5" />
                        )}
                        <div>
                          <span className={feature.included ? (feature.highlight ? 'text-purple-300' : '') : 'text-gray-500'}>
                            {feature.text}
                          </span>
                          {feature.metric && (
                            <p className="text-xs text-cyan-400 font-medium mt-1">{feature.metric}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tableau Comparatif - Focus Précision & ROI */}
      <section className="py-32 px-6 bg-gradient-to-b from-black/50 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-extrabold mb-4">
              Comparatif <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Prédictif</span>
            </h2>
            <p className="text-xl text-gray-400">Précision • ROI • Délai de valeur</p>
          </motion.div>

          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <div className="min-w-full">
              {/* En-tête */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-white/5 to-white/2">
                <div></div>
                {pricingPlans.map((plan, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {plan.price}{plan.period}
                    </p>
                    {plan.roi && <p className="text-sm text-cyan-400 mt-1">{plan.roi}</p>}
                    <Link
                      href={plan.ctaLink}
                      className={`mt-4 inline-block px-6 py-3 rounded-full text-sm font-bold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Lignes */}
              {comparisonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-1 md:grid-cols-5 gap-4 p-6 ${
                    index % 2 === 0 ? 'bg-white/5' : 'bg-white/2'
                  }`}
                >
                  <div className="flex items-center font-medium text-gray-300">
                    {feature.name}
                  </div>
                  {['free', 'starter', 'growth', 'enterprise'].map((plan, i) => (
                    <div key={i} className="flex items-center justify-center">
                      {typeof feature[plan as keyof ComparisonFeature] === 'boolean' ? (
                        feature[plan as keyof ComparisonFeature] ? (
                          <Check className={`w-6 h-6 ${
                            plan === 'growth' ? 'text-purple-400' : 
                            plan === 'enterprise' ? 'text-cyan-400' : 'text-green-500'
                          }`} />
                        ) : (
                          <X className="w-6 h-6 text-gray-600" />
                        )
                      ) : (
                        <span className={`text-sm font-medium ${
                          plan === 'growth' ? 'text-purple-300' : 
                          plan === 'enterprise' ? 'text-cyan-300' : 'text-gray-400'
                        }`}>
                          {feature[plan as keyof ComparisonFeature]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Focus Sécurité & Performance */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-extrabold mb-4">
              Questions <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Prédictives</span>
            </h2>
            <p className="text-xl text-gray-400">Sécurité • Précision • ROI</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className={`relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl p-8 border ${
                  item.highlight ? 'border-purple-500/50' : 'border-white/10'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold rounded-full">
                    SÉCURITÉ MAXIMALE
                  </div>
                )}
                <h3 className="text-xl font-bold mb-4 pr-8">{item.question}</h3>
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Finale - Visionary */}
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
              <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
                <Cpu className="w-28 h-28 mx-auto text-purple-400 mb-6" />
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Votre Organisation, Prédite
                </p>
              </div>
            </div>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl font-extrabold mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Prêt à <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Anticiper</span> au lieu de Réagir ?
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            30 minutes avec un chercheur INCUVA AI Lab pour connecter Mobyus à vos données 
            et découvrir vos 3 leviers de croissance RH cachés.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
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
              Réserver Ma Démo Prédictive
            </Link>
            <Link
              href="/contact-lab"
              className="px-12 py-5 bg-white/10 border-2 border-white/20 rounded-full font-medium text-lg hover:bg-white/20 hover:border-purple-500/50 transition-all backdrop-blur-sm"
            >
              Parler à un Chercheur
            </Link>
          </motion.div>

          <motion.div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Zero Data Leak</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>94% précision moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>ROI en 47 jours</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}