// frontend/src/pages/RegisterIndividual.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerIndividual } from "../../services/auth";
import {
  User, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff,
  ArrowLeft, ChevronRight, Brain, Shield, Sparkles,
  Check, AlertCircle, Briefcase, UserCircle, Search,
  Target, Award, Zap, TrendingUp, BookOpen
} from "lucide-react";

export default function RegisterIndividual() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    name: "",
    email: "",
    phone: "",
    country: "FR",
    location: "",
    user_role: "standard",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (passwordStrength < 2) {
      setError("Le mot de passe est trop faible. Ajoutez des majuscules, chiffres ou caractères spéciaux.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => submitForm(pos.coords.latitude, pos.coords.longitude),
          () => submitForm(null, null)
        );
      } else {
        submitForm(null, null);
      }
    } catch (err) {
      setError("Erreur lors de l'envoi du formulaire.");
      setLoading(false);
    }
  };

  const submitForm = async (latitude, longitude) => {
    try {
      const res = await registerIndividual({ ...form, latitude, longitude });
      if (res.success) {
        navigate(res.next_url);
      } else {
        setError(res.message || JSON.stringify(res.errors));
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-400";
    if (passwordStrength === 2) return "bg-orange-400";
    if (passwordStrength === 3) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Faible";
    if (passwordStrength === 2) return "Moyen";
    if (passwordStrength === 3) return "Bon";
    return "Excellent";
  };

  const countries = [
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "US", name: "États-Unis", flag: "🇺🇸" },
    { code: "ES", name: "Espagne", flag: "🇪🇸" },
    { code: "DE", name: "Allemagne", flag: "🇩🇪" },
    { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
    { code: "IT", name: "Italie", flag: "🇮🇹" },
    { code: "CA", name: "Canada", flag: "🇨🇦" }
  ];

  const userRoles = [
    {
      value: "standard",
      label: "Candidat Standard",
      desc: "Accès complet aux offres et outils de carrière",
      icon: <UserCircle className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      value: "job_seeker",
      label: "Chercheur Actif",
      desc: "Priorité sur les offres et accompagnement personnalisé",
      icon: <Target className="w-6 h-6" />,
      gradient: "from-blue-600 to-blue-700"
    }
  ];

  const benefits = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Matching IA",
      desc: "L'algorithme trouve les opportunités parfaites pour vous",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "CV Intelligent",
      desc: "Générez un CV optimisé en 2 minutes avec notre IA",
      gradient: "from-blue-600 to-blue-700"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Alertes Personnalisées",
      desc: "Recevez les offres correspondant à votre profil en temps réel",
      gradient: "from-blue-700 to-blue-800"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analyse de Carrière",
      desc: "Suivez votre progression et obtenez des recommandations",
      gradient: "from-blue-800 to-blue-900"
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
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding & Benefits */}
          <motion.div
            className="hidden lg:block space-y-8 sticky top-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/select_account_type")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour au choix du compte</span>
            </motion.button>

            <div className="space-y-6">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    INCUVA
                  </span>
                  <p className="text-sm text-blue-600 font-medium">Espace Candidat</p>
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl font-bold leading-tight text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Boostez votre carrière avec
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  l'IA de recrutement
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Trouvez des opportunités qui correspondent vraiment à vos compétences et aspirations
              </motion.p>
            </div>

            <div className="space-y-4 pt-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start space-x-4 group"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50`}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {benefit.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Card */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { value: "3x", label: "Plus d'entretiens", icon: <Target className="w-4 h-4" /> },
                  { value: "24h", label: "Réponse moyenne", icon: <Zap className="w-4 h-4" /> },
                  { value: "95%", label: "Satisfaction", icon: <Award className="w-4 h-4" /> },
                  { value: "10k+", label: "Candidats actifs", icon: <User className="w-4 h-4" /> }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">{stat.value}</div>
                    <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                      {stat.icon}
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-700 italic text-center">
                "J'ai trouvé mon emploi idéal en moins d'une semaine !"
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-blue-800">Marie Dubois</p>
                  <p className="text-xs text-blue-600">Développeuse Full-Stack</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 border-2 border-blue-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-50/20 to-blue-100/10 rounded-full blur-3xl -z-10"></div>

              {/* Mobile Header */}
              <div className="lg:hidden mb-8">
                <motion.button
                  onClick={() => navigate("/select_account_type")}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group mb-6"
                  whileHover={{ x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Retour</span>
                </motion.button>

                <motion.div
                  className="flex items-center justify-center space-x-3 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    INCUVA
                  </span>
                </motion.div>
              </div>

              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Inscription Candidat</h2>
                <p className="text-gray-600">Rejoignez la plateforme qui révolutionne le recrutement</p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First Name & Last Name Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700">Prénom</label>
                    <div className="relative group">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        animate={{ color: focusedField === 'first_name' ? '#3b82f6' : '#6b7280' }}
                      >
                        <User className="w-5 h-5" />
                      </motion.div>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('first_name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Jean"
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700">Nom</label>
                    <div className="relative group">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        animate={{ color: focusedField === 'name' ? '#3b82f6' : '#6b7280' }}
                      >
                        <User className="w-5 h-5" />
                      </motion.div>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Dupont"
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                        required
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Email */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <div className="relative group">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{ color: focusedField === 'email' ? '#3b82f6' : '#6b7280' }}
                    >
                      <Mail className="w-5 h-5" />
                    </motion.div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="jean.dupont@exemple.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                      required
                    />
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">Téléphone</label>
                  <div className="relative group">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{ color: focusedField === 'phone' ? '#3b82f6' : '#6b7280' }}
                    >
                      <Phone className="w-5 h-5" />
                    </motion.div>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                      required
                    />
                  </div>
                </motion.div>

                {/* Location & Country Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700">Ville</label>
                    <div className="relative group">
                      <motion.div
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        animate={{ color: focusedField === 'location' ? '#3b82f6' : '#6b7280' }}
                      >
                        <MapPin className="w-5 h-5" />
                      </motion.div>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('location')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Paris"
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700">Pays</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 appearance-none cursor-pointer hover:border-blue-300 group-hover:shadow-md"
                      >
                        {countries.map(country => (
                          <option key={country.code} value={country.code} className="bg-white text-gray-900">
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                </div>

                {/* User Role */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Type de profil
                  </label>
                  <div className="grid gap-3">
                    {userRoles.map((role, idx) => (
                      <motion.button
                        key={role.value}
                        type="button"
                        onClick={() => setForm({ ...form, user_role: role.value })}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          form.user_role === role.value
                            ? 'border-blue-500 bg-blue-50/50 shadow-md'
                            : 'border-blue-100 hover:border-blue-300 bg-white'
                        }`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.65 + idx * 0.1 }}
                      >
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-200/50`}
                          animate={{
                            scale: form.user_role === role.value ? 1.1 : 1,
                            rotate: form.user_role === role.value ? [0, -5, 5, 0] : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {role.icon}
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{role.label}</h3>
                          <p className="text-sm text-gray-600">{role.desc}</p>
                        </div>
                        <AnimatePresence>
                          {form.user_role === role.value && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <Check className="w-6 h-6 text-blue-500 flex-shrink-0" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{ color: focusedField === 'password' ? '#3b82f6' : '#6b7280' }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
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
                  <AnimatePresence>
                    {form.password && (
                      <motion.div
                        className="space-y-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(level => (
                            <motion.div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                level <= passwordStrength ? getPasswordStrengthColor() : 'bg-blue-100'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: level * 0.1 }}
                            ></motion.div>
                          ))}
                        </div>
                        {passwordStrength > 0 && (
                          <motion.p
                            className={`text-xs font-medium ${
                              passwordStrength < 2 ? 'text-red-500' :
                              passwordStrength < 3 ? 'text-orange-500' :
                              passwordStrength < 4 ? 'text-yellow-500' : 'text-green-600'
                            }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {getPasswordStrengthText()}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{ color: focusedField === 'confirm_password' ? '#3b82f6' : '#6b7280' }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirm_password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300 group-hover:shadow-md"
                      required
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {form.confirm_password && form.password === form.confirm_password && (
                      <motion.div
                        className="flex items-center gap-2 text-green-600 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <Check className="w-4 h-4" />
                        <span>Les mots de passe correspondent</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Terms */}
                <motion.label
                  className="flex items-start gap-3 cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ x: 2 }}
                >
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    J'accepte les{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                      conditions d'utilisation
                    </a>
                    {" "}et la{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                      politique de confidentialité
                    </a>
                  </span>
                </motion.label>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                  text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-200/50
                  flex items-center justify-center gap-2 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1 group"
                    whileHover={{ x: 3 }}
                  >
                    Se connecter
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </p>
              </motion.div>

              {/* Security Badges */}
              <motion.div
                className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="group-hover:text-blue-700 transition-colors">RGPD Compliant</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer">
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
                  <span className="group-hover:text-blue-700 transition-colors">Données chiffrées</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}