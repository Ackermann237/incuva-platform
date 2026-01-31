// frontend/src/pages/SelectAccountType.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { selectAccountType } from "../../services/auth";
import {
  Users, Building2, Briefcase, Zap, Shield, TrendingUp,
  ChevronRight, ArrowLeft, Brain, Check, Sparkles, Target,
  Rocket, BarChart3, Globe
} from "lucide-react";

export default function SelectAccountType() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountType) {
      setError("Veuillez choisir un type de compte.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await selectAccountType(accountType);
      if (res.success) {
        navigate(res.next_url);
      } else {
        setError(res.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur. Réessayez plus tard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    {
      id: "individual",
      title: "Candidat",
      subtitle: "Trouvez votre emploi idéal",
      description: "Profil intelligent optimisé par IA, accès aux meilleures offres et suivi de candidature en temps réel.",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-500 to-blue-600",
      badgeColor: "bg-blue-500",
      features: [
        "CV optimisé par IA",
        "Matching intelligent avec les offres",
        "Alertes personnalisées",
        "Statistiques de candidature"
      ],
      stats: [
        { value: "3x", label: "Plus d'entretiens" },
        { value: "24h", label: "Réponse moyenne" },
        { value: "95%", label: "Satisfaction" }
      ]
    },
    {
      id: "company",
      title: "Entreprise",
      subtitle: "Recrutez les meilleurs talents",
      description: "Solution complète de recrutement IA pour trouver, évaluer et intégrer les talents parfaits pour votre équipe.",
      icon: <Building2 className="w-8 h-8" />,
      gradient: "from-blue-600 to-blue-800",
      badgeColor: "bg-blue-600",
      features: [
        "Matching Vectoriel IA",
        "Publication multi-plateformes",
        "Analytics prédictives",
        "Onboarding automatisé"
      ],
      stats: [
        { value: "10x", label: "Plus rapide" },
        { value: "87%", label: "Précision" },
        { value: "500+", label: "Clients satisfaits" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white p-4">
      {/* Animated Background - Style bleu */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-pink-200/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à la connexion</span>
          </motion.button>

          <motion.div
            className="flex items-center justify-center space-x-3 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="w-9 h-9 text-white" />
            </motion.div>
            <span className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
              INCUVA
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Commencez votre aventure
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Choisissez le type de compte qui correspond à vos besoins et accédez à notre plateforme intelligente
          </motion.p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="max-w-2xl mx-auto mb-8 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring" }}
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Type Cards */}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {accountTypes.map((type, idx) => (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => setAccountType(type.id)}
                onMouseEnter={() => setHoveredCard(type.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative group text-left"
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  delay: 0.4 + idx * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border-2 transition-all duration-300 ${
                    accountType === type.id
                      ? 'border-blue-500 shadow-xl shadow-blue-200/50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                  animate={{
                    boxShadow: accountType === type.id
                      ? '0 25px 50px -12px rgba(59, 130, 246, 0.3)'
                      : '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Glow effect */}
                  {(hoveredCard === type.id || accountType === type.id) && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5 rounded-3xl blur-xl -z-10`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0.1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    />
                  )}

                  {/* Selected Badge */}
                  <AnimatePresence>
                    {accountType === type.id && (
                      <motion.div
                        className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                          scale: 1,
                          rotate: 0,
                          y: [0, -5, 0]
                        }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                          y: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <Check className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-200/50`}
                    animate={{
                      rotate: hoveredCard === type.id || accountType === type.id ? [0, -5, 5, -5, 0] : 0,
                      scale: hoveredCard === type.id || accountType === type.id ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {type.icon}
                  </motion.div>

                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{type.title}</h2>
                    <p className="text-blue-600 font-semibold">{type.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {type.stats.map((stat, statIdx) => (
                      <motion.div
                        key={statIdx}
                        className="bg-blue-50 rounded-xl p-3 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.2 + statIdx * 0.1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgb(219, 234, 254)' }}
                      >
                        <div className="text-xl font-bold text-blue-700">{stat.value}</div>
                        <div className="text-xs text-blue-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {type.features.map((feature, featureIdx) => (
                      <motion.div
                        key={featureIdx}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.2 + featureIdx * 0.1 }}
                      >
                        <motion.div
                          className={`w-6 h-6 bg-gradient-to-br ${type.gradient} rounded-full flex items-center justify-center flex-shrink-0`}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <motion.div
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      accountType === type.id
                        ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg shadow-blue-200/50`
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <span className="font-semibold">
                      {accountType === type.id ? 'Sélectionné' : 'Choisir ce compte'}
                    </span>
                    <motion.div
                      animate={{
                        x: hoveredCard === type.id || accountType === type.id ? [0, 5, 0] : 0
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.button>
            ))}
          </div>

          {/* Submit Button */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              type="submit"
              disabled={loading || !accountType}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
              text-white py-5 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-200/50
              flex items-center justify-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <span>Continuer</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.div>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Trust Indicators */}
        <motion.div
          className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {[
            {
              icon: <Shield className="w-6 h-6" />,
              text: "Données 100% sécurisées",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              icon: <Zap className="w-6 h-6" />,
              text: "Configuration en 5 minutes",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              text: "Essai gratuit 14 jours",
              color: "text-blue-600",
              bg: "bg-blue-50"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={`flex items-center gap-3 justify-center text-gray-700 ${item.bg} backdrop-blur-sm rounded-xl p-4 border-2 border-blue-100`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + idx * 0.1 }}
              whileHover={{
                scale: 1.05,
                borderColor: 'rgb(147 197 253)',
                boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className={`p-2 rounded-lg ${item.bg}`}>
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {['Microsoft', 'Google', 'Amazon', 'Airbnb', 'Spotify'].map((company, idx) => (
            <motion.div
              key={company}
              className="flex items-center space-x-2 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:shadow-md transition-shadow">
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {company}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="mt-8 text-center text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-sm mb-2">
            Déjà un compte ?{" "}
            <motion.button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1 group"
              whileHover={{ x: 3 }}
            >
              Se connecter
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline hover:text-blue-700">Conditions d'utilisation</a>
            {" "}et notre{" "}
            <a href="#" className="text-blue-600 hover:underline hover:text-blue-700">Politique de confidentialité</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}