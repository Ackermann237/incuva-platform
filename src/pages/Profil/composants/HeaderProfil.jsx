// frontend/src/pages/profil/composant/HeaderProfil.jsx
import React from "react";
import { Camera, Edit2, X, MapPin, ShieldCheck } from "lucide-react";

const HeaderProfil = ({ profile, isEditing, setIsEditing }) => {
  const initials = `${profile?.first_name?.[0] || ""}${profile?.name?.[0] || ""}`.toUpperCase();
  const roleLabel = profile?.userRole === "job_seeker" ? "Candidat" : "Freelance / Particulier";

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
      {/* Background: subtle pattern + blue glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(37,99,235,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.35) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top accent line */}
      <div className="relative h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-sky-300" />

      <div className="relative px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Avatar block */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Photo de profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white text-3xl font-semibold">
                    {initials || "?"}
                  </div>
                )}
              </div>

              {/* Edit avatar */}
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 rounded-xl bg-white border border-gray-200 px-2.5 py-2 shadow-sm hover:bg-gray-50 transition">
                  <Camera className="w-4 h-4 text-blue-600" />
                </button>
              )}

              {/* Decorative ring */}
              <div className="pointer-events-none absolute -inset-2 rounded-[22px] ring-1 ring-blue-500/10" />
            </div>

            {/* Name + badges */}
            <div className="text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                  {profile?.first_name} {profile?.name}
                </h1>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-medium border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                    Profil
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-sm font-medium border border-gray-200">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{profile?.location || "—"}</span>, {profile?.country || "—"}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  Complétion : <span className="font-semibold text-gray-800">82%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right side actions + mini card */}
          <div className="lg:ml-auto flex flex-col sm:flex-row items-center gap-4">
            {/* Mini info card */}
            <div className="w-full sm:w-auto rounded-2xl border border-gray-100 bg-white/70 backdrop-blur px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500">Suggestion IA</p>
              <p className="mt-1 text-sm text-gray-800">
                Ajoute 2 compétences pour améliorer ton matching.
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-[72%] bg-gradient-to-r from-blue-600 to-sky-400 rounded-full" />
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold transition
                ${
                  isEditing
                    ? "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_12px_30px_-16px_rgba(37,99,235,0.9)]"
                }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderProfil;
