// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../../services/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, Brain, Users, Cloud, CheckCircle } from "lucide-react";

// Composant pour les icônes de connexion sociale
const SocialIcon = ({ provider }) => {
  switch (provider) {
    case 'Google':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    case 'Microsoft':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <rect fill="#00A1F1" x="1" y="1" width="10.5" height="10.5"/>
          <rect fill="#FFB900" x="1" y="12.5" width="10.5" height="10.5"/>
          <rect fill="#00A1F1" x="12.5" y="1" width="10.5" height="10.5"/>
          <rect fill="#73CA5C" x="12.5" y="12.5" width="10.5" height="10.5"/>
        </svg>
      );
    case 'Apple':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.86-3.29-.86-1.53 0-2.05.86-3.31.86-1.33.03-2.21-1.24-3.04-2.48C4.3 19.15 3 17.07 3 14.95 3 11.85 5.74 9 9 9c.95 0 1.85-.17 2.67-.5.6-.22 1.1-.5 1.55-.87.45-.37.85-.87 1.2-1.45.35-.58.65-1.23.9-1.95.25-.72.45-1.5.6-2.33.15-.83.25-1.7.25-2.6 0-.95-.1-1.85-.25-2.67-.15-.83-.35-1.6-.6-2.33-.25-.72-.55-1.37-.9-1.95-.35-.58-.75-1.08-1.2-1.45-.45-.38-1-.66-1.55-.88-1.65-.37-3.55-.47-5.5-.3-1.7.15-3.25 1.65-4.25 3.4-1.25 2.2-1.85 5.15-1.85 8.15 0 3 1.5 5.85 3.75 7.75.95.85 2.05 1.45 3.25 1.45 1.2 0 2.35-.55 3.35-1.4.95-.8 1.85-1.95 2.4-3.35.6-.9.95-2 1.1-3.15.15-1.15.15-2.35 0-3.5-.15-1.15-.45-2.25-1.1-3.15-.65-1.05-1.45-1.95-2.4-2.65-.95-.7-2.05-1.15-3.25-1.15-2.5 0-4.85 1.5-6.25 3.75C5.15 8.15 4 10.5 4 13c0 2.5 1.15 4.9 2.75 6.55.75.8 1.65 1.4 2.65 1.85 1.2.45 1.15.75 2.35.75 3.55 0 .9-.15 1.75-.4 2.55-.25.8-.65 1.55-1.2 2.15-.55.6-1.25 1.05-2.1 1.25-1.7.4-3.55.2-5.35-.5z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate(res.redirect_url);
      } else {
        setError(res.message || "Email ou mot de passe incorrect.");
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Avancée",
      desc: "Matching vectoriel qui transforme 200 CV en 5 candidats idéaux",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité RGPD",
      desc: "Vos données protégées avec les standards les plus élevés",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Intégration Rapide",
      desc: "Configuration en 5 minutes avec votre SIRH existant",
      gradient: "from-blue-700 to-blue-900"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "500+ Entreprises",
      desc: "Rejoignez les entreprises qui ont transformé leur recrutement",
      gradient: "from-blue-800 to-blue-950"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white p-4">
      {/* Animated Background - Même style que la page principale */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-pink-200/10 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <motion.div
              className="flex items-center space-x-3 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                INCUVA
              </span>
            </motion.div>
            <motion.h1
              className="text-5xl font-bold leading-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Bienvenue sur votre
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                plateforme RH intelligente
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Connectez-vous pour accéder à tous vos outils RH et services en un seul endroit.
            </motion.p>
          </div>
          <div className="space-y-6 pt-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex items-start space-x-4 group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ x: 10 }}
              >
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges Left Side */}
          <motion.div
            className="pt-8 flex flex-wrap items-center gap-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {['Microsoft', 'Google', 'Amazon', 'Airbnb', 'Spotify'].map((company) => (
              <motion.div
                key={company}
                className="flex items-center space-x-2 group cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {company}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border-2 border-blue-100/50 relative overflow-hidden">
            {/* Decorative gradient overlay - Style bleu */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-50/20 to-blue-100/10 rounded-full blur-3xl -z-10"></div>

            {/* Mobile Logo */}
            <motion.div
              className="lg:hidden flex items-center justify-center space-x-3 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                INCUVA
              </span>
            </motion.div>

            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h2>
              <p className="text-gray-600">Connectez-vous pour continuer votre aventure</p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3"
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    animate={{
                      color: focusedField === 'email' ? '#3b82f6' : '#6b7280'
                    }}
                  >
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="nom@exemple.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    animate={{
                      color: focusedField === 'password' ? '#3b82f6' : '#6b7280'
                    }}
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-gray-600 group-hover:text-blue-700 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <motion.button
                  type="button"
                  onClick={() => navigate("/reset_password")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  whileHover={{ x: 3 }}
                >
                  Mot de passe oublié ?
                </motion.button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-200/50 flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <motion.div
                className="relative my-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Ou continuez avec
                  </span>
                </div>
              </motion.div>

              {/* Social Login */}
              <motion.div
                className="grid grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { name: 'Google', provider: 'Google' },
                  { name: 'Microsoft', provider: 'Microsoft' },
                  { name: 'Apple', provider: 'Apple' }
                ].map((provider, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    className={`py-3 border-2 border-blue-100 bg-white hover:bg-blue-50 rounded-xl font-semibold transition-all hover:border-blue-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                  >
                    <SocialIcon provider={provider.provider} />
                    <span className="text-sm text-gray-700">{provider.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-gray-600">
                Pas encore de compte ?{" "}
                <motion.button
                  onClick={() => navigate("/select_account_type")}
                  className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1 group"
                  whileHover={{ x: 3 }}
                >
                  Créer un compte
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </p>
            </motion.div>
          </div>

          {/* Trust Badges Bottom */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              className="flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <span className="group-hover:text-blue-700 transition-colors">Sécurisé SSL</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <motion.span
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </div>
              <span className="group-hover:text-blue-700 transition-colors">Tous systèmes opérationnels</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Cloud className="w-4 h-4 text-blue-600" />
              </div>
              <span className="group-hover:text-blue-700 transition-colors">99.9% Disponibilité</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}