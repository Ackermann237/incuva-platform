// frontend/src/pages/VerifyEmail.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Mail, Shield, Clock } from "lucide-react";
import { verifyEmail, resendVerificationCode } from "../../services/auth";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to next
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCode = code.join("");

    if (finalCode.length !== 6) {
      setError("Veuillez entrer un code valide (6 chiffres).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyEmail(finalCode);
      if (res.success) {
        setSuccessMsg("Vérification réussie ! Redirection...");
        setTimeout(() => navigate(res.redirect_url), 1200);
      } else {
        setError(res.message || "Code incorrect.");
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setResendDisabled(true);
    setCountdown(60);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await resendVerificationCode();
      if (res.success) {
        setSuccessMsg("📧 Nouveau code envoyé ! Vérifiez votre boîte mail.");
      } else {
        setError(res.message || "Impossible de renvoyer le code.");
        clearInterval(timer);
        setResendDisabled(false);
        setCountdown(0);
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer.");
      clearInterval(timer);
      setResendDisabled(false);
      setCountdown(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white p-4">

      {/* Animated Background - Même style que la page principale */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-pink-200/10 rounded-full blur-3xl" />
      </div>

      {/* Floating particles bleues */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{
            opacity: 0,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: Math.random() * 4
          }}
        />
      ))}

      <div className="w-full max-w-2xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">

        {/* Left Side - Informations */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <motion.div
              className="flex items-center space-x-3 mb-6"
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
              className="text-4xl font-bold leading-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Vérifiez votre
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                adresse email
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              La sécurité de votre compte est notre priorité. Veuillez vérifier votre adresse email pour continuer.
            </motion.p>
          </div>

          <div className="space-y-6 pt-8">
            {[
              {
                icon: <Mail className="w-6 h-6" />,
                title: "Code de vérification",
                description: "Nous avons envoyé un code à 6 chiffres à votre adresse email",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Sécurité renforcée",
                description: "Cette étape protège votre compte contre les accès non autorisés",
                gradient: "from-blue-600 to-blue-700"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Code temporaire",
                description: "Le code est valable pendant 15 minutes pour des raisons de sécurité",
                gradient: "from-blue-700 to-blue-800"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start space-x-4 group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ x: 10 }}
              >
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Formulaire de vérification */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border-2 border-blue-100/50 relative overflow-hidden">

            {/* Decorative gradient overlay - Style bleu */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-blue-200/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-50/20 to-blue-100/10 rounded-full blur-3xl -z-10" />

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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Vérification Email</h2>
              <p className="text-gray-600">
                Entrez le code de vérification envoyé à votre adresse email
              </p>
            </motion.div>

            {/* Messages d'erreur/succès */}
            {error && (
              <motion.div
                className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <p className="text-sm font-medium">{successMsg}</p>
              </motion.div>
            )}

            {/* Formulaire avec les 6 inputs */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 text-center">
                  Code de vérification à 6 chiffres
                </label>

                <div className="flex justify-center gap-3 md:gap-4">
                  {code.map((digit, index) => (
                    <motion.input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      ref={(el) => (inputsRef.current[index] = el)}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      whileFocus={{ scale: 1.1 }}
                      className="w-14 h-16 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold rounded-xl border-2 border-blue-200 bg-white text-gray-900
                      focus:border-blue-500 focus:outline-none focus:shadow-lg focus:shadow-blue-200/50 shadow-sm
                      transition-all duration-200"
                      disabled={loading}
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Saisissez les 6 chiffres dans l'ordre
                </p>
              </motion.div>

              {/* Bouton de vérification */}
              <motion.button
                type="submit"
                disabled={loading || code.join("").length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-200/50
                flex items-center justify-center gap-2 group"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Vérifier le code</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            {/* Lien pour renvoyer le code */}
            <motion.div
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-2">
                <p className="text-gray-600">
                  Vous n'avez pas reçu le code ?
                </p>
                <motion.button
                  onClick={handleResend}
                  disabled={resendDisabled || loading}
                  className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-2 group disabled:text-gray-400 disabled:cursor-not-allowed"
                  whileHover={!resendDisabled && !loading ? { x: 3 } : {}}
                >
                  {resendDisabled ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Renvoyer ({countdown}s)</span>
                    </>
                  ) : (
                    <>
                      <span>Renvoyer le code</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="pt-4 border-t border-blue-100">
                <p className="text-gray-500 text-sm">
                  Vérifiez également votre dossier spam ou courriers indésirables
                </p>
              </div>
            </motion.div>
          </div>

          {/* Badges de sécurité */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
              <span className="group-hover:text-blue-700 transition-colors">Validation en temps réel</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}