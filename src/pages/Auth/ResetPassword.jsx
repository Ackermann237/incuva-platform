// frontend/src/pages/Auth/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPassword, verifyResetCode, setNewPassword } from "../../services/auth";

const inputClass =
  "w-full pl-12 pr-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-blue-300";

const STEPS = {
  EMAIL: "email",
  CODE: "code",
  PASSWORD: "password",
  DONE: "done",
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (action) => {
    setError("");
    setLoading(true);
    try {
      await action();
    } catch (err) {
      console.error(err);
      setError("Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = (e) => {
    e.preventDefault();
    run(async () => {
      const res = await resetPassword(email.trim());
      if (res.success) setStep(STEPS.CODE);
      else setError(res.message || "Impossible d'envoyer le code.");
    });
  };

  const handleCode = (e) => {
    e.preventDefault();
    run(async () => {
      const res = await verifyResetCode(code.trim());
      if (res.success) {
        if (res.email) setEmail(res.email);
        setStep(STEPS.PASSWORD);
      } else {
        setError(res.message || "Code incorrect.");
      }
    });
  };

  const handlePassword = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    run(async () => {
      const res = await setNewPassword(email, password);
      if (res.success) setStep(STEPS.DONE);
      else setError(res.message || "Impossible de modifier le mot de passe.");
    });
  };

  const submitButton = (label) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
    >
      <span>{loading ? "Veuillez patienter..." : label}</span>
      {!loading && <ArrowRight className="w-5 h-5" />}
    </button>
  );

  const field = (Icon, props) => (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <Icon className="w-5 h-5" />
      </div>
      <input className={inputClass} required {...props} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === STEPS.EMAIL && (
          <form onSubmit={handleEmail} className="space-y-6">
            <p className="text-gray-600">
              Saisissez votre adresse email : nous vous enverrons un code de réinitialisation.
            </p>
            {field(Mail, {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "nom@exemple.com",
            })}
            {submitButton("Envoyer le code")}
          </form>
        )}

        {step === STEPS.CODE && (
          <form onSubmit={handleCode} className="space-y-6">
            <p className="text-gray-600">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Il est valable 10 minutes.
            </p>
            {field(KeyRound, {
              type: "text",
              inputMode: "numeric",
              maxLength: 6,
              value: code,
              onChange: (e) => setCode(e.target.value.replace(/\D/g, "")),
              placeholder: "123456",
            })}
            {submitButton("Vérifier le code")}
          </form>
        )}

        {step === STEPS.PASSWORD && (
          <form onSubmit={handlePassword} className="space-y-6">
            <p className="text-gray-600">Choisissez votre nouveau mot de passe.</p>
            {field(Lock, {
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Nouveau mot de passe",
              minLength: 6,
            })}
            {field(Lock, {
              type: "password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              placeholder: "Confirmez le mot de passe",
              minLength: 6,
            })}
            {submitButton("Modifier le mot de passe")}
          </form>
        )}

        {step === STEPS.DONE && (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-gray-700">Votre mot de passe a été modifié avec succès.</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
