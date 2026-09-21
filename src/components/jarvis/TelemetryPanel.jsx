// src/components/jarvis/TelemetryPanel.jsx
// Panneau latéral « télémétrie RH » : chiffres en direct que Jarvis a sous les yeux.
import React, { useEffect, useState } from "react";
import { Activity, CalendarClock, ChevronRight, ChevronLeft, Clock, Database, FileSignature, RefreshCw, Users, Wallet, Briefcase } from "lucide-react";

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    let start;
    const tick = (now) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function Gauge({ percent }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const shown = useCountUp(percent);
  return (
    <div className="relative mx-auto h-32 w-32">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="jv-gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(148,197,255,0.12)" strokeWidth="8" />
        <circle
          cx="55" cy="55" r={radius} fill="none" stroke="url(#jv-gauge)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 6px rgba(34,211,238,.7))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{shown}%</span>
        <span className="jv-mono text-[9px] uppercase text-cyan-300">effectif actif</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, accent }) {
  const shown = useCountUp(value);
  return (
    <div className="jv-glass rounded-xl px-3.5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm text-slate-200">{label}</span>
        </div>
        <span className="text-2xl font-bold tabular-nums text-white">{shown}</span>
      </div>
      {hint && <p className="jv-mono mt-1.5 text-[10px] uppercase text-slate-500">{hint}</p>}
    </div>
  );
}

const SOURCES = [
  { icon: Users, label: "Employés et salaires" },
  { icon: Clock, label: "Absences" },
  { icon: CalendarClock, label: "Planning (14 jours)" },
  { icon: Briefcase, label: "Offres et candidatures" },
  { icon: FileSignature, label: "Contrats" },
];

export default function TelemetryPanel({ stats, loading, onRefresh, open, onToggle }) {
  if (!open) {
    return (
      <div className="relative z-10 hidden w-12 flex-col items-center border-l border-white/10 py-4 xl:flex">
        <button type="button" onClick={onToggle} className="rounded-lg p-2 text-cyan-300 hover:bg-white/10" aria-label="Afficher la télémétrie" title="Afficher la télémétrie">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Database className="mt-4 h-5 w-5 text-slate-500" />
      </div>
    );
  }

  const percent = stats.employees ? Math.round((stats.activeEmployees / stats.employees) * 100) : 0;

  return (
    <aside className="jv-scroll relative z-10 hidden w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/10 bg-black/20 p-4 backdrop-blur-md xl:flex" aria-label="Télémétrie RH">
      <div className="flex items-center justify-between">
        <div>
          <p className="jv-mono flex items-center gap-2 text-[10px] font-semibold uppercase text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Télémétrie RH
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Données en direct</p>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={onRefresh} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-300" aria-label="Actualiser les données" title="Actualiser">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={onToggle} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-300" aria-label="Masquer la télémétrie" title="Masquer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="jv-glass relative rounded-2xl py-4">
        <span className="jv-corner jv-corner-tl" />
        <span className="jv-corner jv-corner-br" />
        <Gauge percent={percent} />
      </div>

      <div className="space-y-2.5">
        <Stat icon={Users} label="Employés" value={stats.employees} hint={`${stats.activeEmployees} actifs`} accent="bg-cyan-400/15 text-cyan-300" />
        <Stat icon={Activity} label="Shifts planifiés" value={stats.shifts} hint={`${stats.todayShifts} aujourd'hui`} accent="bg-violet-400/15 text-violet-300" />
        <Stat icon={Wallet} label="Absences" value={stats.absences} hint={`${stats.pendingAbsences} en attente`} accent="bg-amber-400/15 text-amber-300" />
      </div>

      <div className="jv-glass rounded-2xl p-3.5">
        <p className="jv-mono mb-2.5 text-[10px] font-semibold uppercase text-slate-400">Jarvis lit</p>
        <ul className="space-y-2">
          {SOURCES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-xs text-slate-300">
              <Icon className="h-3.5 w-3.5 text-cyan-300" />
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-slate-500">
          Ces données sont transmises à l'assistant à chaque question. Il peut les analyser mais jamais les modifier.
        </p>
      </div>
    </aside>
  );
}
