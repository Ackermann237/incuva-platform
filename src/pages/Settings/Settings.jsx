// src/pages/Settings/Settings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Bell, KeyRound, LogOut, User } from "lucide-react";
import { getSettings, saveNotificationSettings } from "../../services/notifications";
import { logout } from "../../services/auth";
import LottieLoader from "../../components/lottie/LottieLoader";

const ACCOUNT_LABELS = { company: "Entreprise", individual: "Candidat" };

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 ${
        checked ? "bg-purple-600" : "bg-gray-300"
      }`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [categories, setCategories] = useState({});
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.status === 401) {
          navigate("/login", { replace: true });
        } else if (res.success) {
          setAccount(res.account);
          setCategories(res.categories);
          setPrefs(res.notifications);
        } else {
          setMessage({ type: "error", text: res.error || "Impossible de charger vos paramètres." });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Impossible de joindre le serveur." }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleToggle = async (key, value) => {
    const previous = prefs;
    setPrefs({ ...prefs, [key]: value }); // affichage immédiat, annulé si l'enregistrement échoue
    setSavingKey(key);
    setMessage(null);
    try {
      const res = await saveNotificationSettings({ [key]: value });
      if (res.success) {
        setPrefs(res.notifications);
        setMessage({ type: "ok", text: "Préférences enregistrées." });
      } else {
        setPrefs(previous);
        setMessage({ type: "error", text: res.error || "Enregistrement impossible." });
      }
    } catch {
      setPrefs(previous);
      setMessage({ type: "error", text: "Impossible de joindre le serveur." });
    } finally {
      setSavingKey(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
    navigate("/", { replace: true });
  };

  const card = "bg-white rounded-2xl border border-gray-200 shadow-sm p-6";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm text-gray-500">Gérez votre compte et vos notifications</p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === "ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <LottieLoader label="Chargement de vos paramètres..." />
        ) : (
          account && (
            <>
              <section className={card}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <User className="w-5 h-5 text-purple-600" /> Mon compte
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 text-sm">
                  <dt className="text-gray-500">Nom</dt>
                  <dd className="sm:col-span-2 font-medium text-gray-900">{account.name || "—"}</dd>
                  <dt className="text-gray-500">Adresse e-mail</dt>
                  <dd className="sm:col-span-2 font-medium text-gray-900 break-all">{account.email || "—"}</dd>
                  <dt className="text-gray-500">Type de compte</dt>
                  <dd className="sm:col-span-2 font-medium text-gray-900">{ACCOUNT_LABELS[account.account_type] || account.account_type}</dd>
                </dl>
              </section>

              <section className={card}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-1">
                  <Bell className="w-5 h-5 text-purple-600" /> Notifications
                </h2>
                <p className="text-sm text-gray-500 mb-4">Choisissez les notifications que vous recevez dans la cloche.</p>
                <ul className="divide-y divide-gray-100">
                  {Object.entries(categories).map(([key, label]) => (
                    <li key={key} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-gray-800">{label}</span>
                      <Toggle checked={!!prefs[key]} disabled={savingKey === key} label={label} onChange={(value) => handleToggle(key, value)} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className={card}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <KeyRound className="w-5 h-5 text-purple-600" /> Sécurité
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/reset_password")}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Changer mon mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </section>
            </>
          )
        )}
      </div>
    </div>
  );
}
