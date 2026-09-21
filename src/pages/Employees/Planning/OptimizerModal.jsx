// src/pages/Employees/Planning/OptimizerModal.jsx
// Optimiseur de planning IA : paramètres -> proposition (grille, indicateurs, analyse de l'IA) -> application après validation.
import React, { useState } from 'react';
import {
  X, Sparkles, ChevronLeft, ChevronRight, Wand2, CheckCircle2, AlertTriangle, RefreshCw, Settings2,
  CalendarCheck, Users, Clock, Gauge, Lightbulb, ShieldCheck, Undo2,
} from 'lucide-react';
import AnalysisProgress from '../Payroll/components/PayrollAssistant/AnalysisProgress';
import { generateOptimalPlanning, applyOptimizedPlanning } from '../../../services/planning';

const STEPS = [
  'Lecture des employés, absences et shifts existants',
  'Placement des shifts (couverture, équilibre, plafonds d\'heures)',
  'Vérification de toutes les contraintes',
  'Analyse du planning par l\'IA',
];

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const PRIORITY = {
  haute: 'bg-red-100 text-red-700 border-red-200',
  moyenne: 'bg-amber-100 text-amber-700 border-amber-200',
  faible: 'bg-blue-100 text-blue-700 border-blue-200',
};

const toIso = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const mondayOf = (date) => {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
};

const nextMonday = () => {
  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + 7);
  return monday;
};

const weekLabel = (monday) => {
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  const format = (d, withYear) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', ...(withYear ? { year: 'numeric' } : {}) });
  return `Du ${format(monday)} au ${format(friday, true)}`;
};

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

function Kpi({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function OptimizerModal({ isOpen, onClose, onApplied }) {
  const [step, setStep] = useState('config'); // config | loading | result | applied
  const [monday, setMonday] = useState(nextMonday);
  const [form, setForm] = useState({ start_time: '09:00', end_time: '17:00', break_minutes: 60, weekly_hours: 35, min_staff: 1, fill_to_target: true });
  const [proposal, setProposal] = useState(null);
  const [excluded, setExcluded] = useState(new Set());
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const shiftWeek = (delta) => setMonday((prev) => { const d = new Date(prev); d.setDate(d.getDate() + delta * 7); return d; });

  const generate = async () => {
    setStep('loading');
    setError('');
    setExcluded(new Set());
    const res = await generateOptimalPlanning({
      ...form,
      week_start: toIso(monday),
      break_minutes: Number(form.break_minutes),
      weekly_hours: Number(form.weekly_hours),
      min_staff: Number(form.min_staff),
    });
    if (res.success) {
      setProposal(res.proposal);
      setStep('result');
    } else {
      setError(res.error || "Impossible de générer le planning.");
      setStep('config');
    }
  };

  const key = (shift) => `${shift.employee_id}|${shift.date}`;
  const shifts = proposal ? proposal.shifts : [];
  const kept = shifts.filter((s) => !excluded.has(key(s)));
  const shiftByCell = Object.fromEntries(shifts.map((s) => [key(s), s]));

  const toggleShift = (shift) => setExcluded((prev) => {
    const next = new Set(prev);
    if (next.has(key(shift))) next.delete(key(shift)); else next.add(key(shift));
    return next;
  });

  const apply = async () => {
    setApplying(true);
    setError('');
    const res = await applyOptimizedPlanning(kept);
    setApplying(false);
    if (res.success) {
      setResult(res);
      setStep('applied');
      onApplied?.(monday);
    } else {
      setError(res.error || "Impossible d'enregistrer le planning.");
    }
  };

  const close = () => {
    setStep('config');
    setProposal(null);
    setResult(null);
    setError('');
    onClose();
  };

  const stats = proposal?.statistiques;
  const narrative = proposal?.narrative;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Optimiseur de planning IA">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-md"><Wand2 className="h-5 w-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Optimiseur de planning IA</h2>
              <p className="text-sm text-gray-600">{weekLabel(monday)}</p>
            </div>
          </div>
          <button onClick={close} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </header>

        {step === 'loading' && <AnalysisProgress title="Optimisation en cours" steps={STEPS} stepMs={1800} />}

        {step === 'config' && (
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
              <div className="space-y-5 lg:col-span-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><CalendarCheck className="h-5 w-5 text-purple-600" /> Semaine à planifier</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => shiftWeek(-1)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50" aria-label="Semaine précédente"><ChevronLeft className="h-4 w-4" /></button>
                    <div className="flex-1 rounded-lg bg-purple-50 px-3 py-2 text-center text-sm font-semibold text-purple-800">{weekLabel(monday)}</div>
                    <button onClick={() => shiftWeek(1)} className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50" aria-label="Semaine suivante"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button onClick={() => setMonday(mondayOf(new Date()))} className="rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-50">Cette semaine</button>
                    <button onClick={() => setMonday(nextMonday())} className="rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-50">Semaine prochaine</button>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Settings2 className="h-5 w-5 text-purple-600" /> Contraintes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Début de journée"><input type="time" value={form.start_time} onChange={(e) => setField('start_time', e.target.value)} className={inputClass} /></Field>
                    <Field label="Fin de journée"><input type="time" value={form.end_time} onChange={(e) => setField('end_time', e.target.value)} className={inputClass} /></Field>
                    <Field label="Pause déjeuner (minutes)" hint="Déduite des journées de plus de 6 h"><input type="number" min="0" max="180" step="15" value={form.break_minutes} onChange={(e) => setField('break_minutes', e.target.value)} className={inputClass} /></Field>
                    <Field label="Heures par semaine et par employé" hint="Plafond et objectif (48 h maximum)"><input type="number" min="4" max="48" value={form.weekly_hours} onChange={(e) => setField('weekly_hours', e.target.value)} className={inputClass} /></Field>
                    <Field label="Effectif minimum par jour" hint="Nombre de personnes à couvrir chaque jour"><input type="number" min="1" max="50" value={form.min_staff} onChange={(e) => setField('min_staff', e.target.value)} className={inputClass} /></Field>
                    <label className="flex items-start gap-2 self-end pb-2 text-sm text-gray-700">
                      <input type="checkbox" checked={form.fill_to_target} onChange={(e) => setField('fill_to_target', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300" />
                      Compléter jusqu'à l'objectif d'heures de chaque employé
                    </label>
                  </div>
                </div>
              </div>

              <aside className="space-y-4 lg:col-span-2">
                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-purple-900"><Sparkles className="h-5 w-5" /> Comment ça marche</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {[
                      'Les absences validées ou en attente sont respectées.',
                      'Vos shifts déjà planifiés sont conservés, sans chevauchement.',
                      'La charge est équilibrée entre les employés, plafond d\'heures respecté.',
                      'L\'IA analyse ensuite le résultat et vous conseille.',
                      'Rien n\'est enregistré avant votre validation.',
                    ].map((line) => <li key={line} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />{line}</li>)}
                  </ul>
                </div>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
                <button onClick={generate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:opacity-90">
                  <Wand2 className="h-5 w-5" /> Générer la proposition
                </button>
              </aside>
            </div>
          </div>
        )}

        {step === 'result' && proposal && (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi icon={Gauge} label="Couverture" value={`${stats.taux_couverture_pct} %`} hint={`Effectif minimum atteint ${proposal.par_jour.filter((d) => d.couvert).length} jour(s) sur ${proposal.par_jour.length}`} tone={stats.taux_couverture_pct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} />
                <Kpi icon={CalendarCheck} label="Shifts à ajouter" value={kept.length} hint={`${stats.heures_ajoutees} h proposées`} tone="bg-purple-100 text-purple-700" />
                <Kpi icon={Clock} label="Heures de la semaine" value={`${stats.heures_totales} h`} hint={`${stats.employes} employé(s)`} tone="bg-blue-100 text-blue-700" />
                <Kpi icon={Users} label="Écart de charge" value={`${stats.ecart_heures_max_min} h`} hint="entre le plus et le moins chargé" tone="bg-teal-100 text-teal-700" />
              </div>

              {proposal.alertes.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertTriangle className="h-4 w-4" /> Points d'attention</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">{proposal.alertes.map((a) => <li key={a}>{a}</li>)}</ul>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Employé</th>
                      {proposal.par_jour.map((d, i) => <th key={d.date} className="px-2 py-3 text-center">{DAY_LABELS[i]} <span className="block font-normal normal-case text-gray-400">{d.date.slice(8, 10)}/{d.date.slice(5, 7)}</span></th>)}
                      <th className="px-3 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.par_employe.map((emp) => (
                      <tr key={emp.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3"><p className="font-medium text-gray-900">{emp.nom}</p><p className="text-xs text-gray-500">{emp.poste}</p></td>
                        {emp.jours.map((cell) => {
                          const shift = shiftByCell[`${emp.id}|${cell.date}`];
                          const isOff = shift && excluded.has(`${emp.id}|${cell.date}`);
                          return (
                            <td key={cell.date} className="px-1.5 py-2 text-center">
                              {cell.etat === 'nouveau' && shift ? (
                                <button onClick={() => toggleShift(shift)} title={`${shift.motif}. Cliquez pour ${isOff ? 'réintégrer' : 'exclure'} ce shift.`}
                                  className={`w-full rounded-lg px-1.5 py-1.5 text-xs font-medium transition ${isOff ? 'bg-gray-100 text-gray-400 line-through' : 'bg-gradient-to-br from-purple-100 to-blue-100 text-purple-800 hover:from-purple-200 hover:to-blue-200'}`}>
                                  {shift.start_time}–{shift.end_time}
                                </button>
                              ) : cell.etat === 'existant' ? <span className="block rounded-lg bg-gray-100 px-1.5 py-1.5 text-xs text-gray-600">Existant</span>
                                : cell.etat === 'absent' ? <span className="block rounded-lg bg-amber-100 px-1.5 py-1.5 text-xs font-medium text-amber-800">Absent</span>
                                : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-right"><span className={`font-semibold ${emp.heures_totales >= emp.objectif - 0.01 ? 'text-emerald-700' : 'text-amber-700'}`}>{emp.heures_totales} h</span><span className="block text-xs text-gray-400">/ {emp.objectif} h</span></td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 text-xs">
                      <td className="px-4 py-2 font-medium text-gray-600">Effectif ({proposal.parametres.min_staff} requis)</td>
                      {proposal.par_jour.map((d) => <td key={d.date} className="px-1.5 py-2 text-center"><span className={`inline-block rounded-full px-2 py-0.5 font-semibold ${d.couvert ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{d.effectif_apres}</span></td>)}
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">Astuce : cliquez sur un shift violet pour l'exclure de la proposition avant d'appliquer.</p>

              {narrative && (
                <section className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-5 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
                    <Sparkles className="h-5 w-5 text-purple-600" /> Analyse {proposal.source === 'ia' ? "de l'IA" : '(calculée, IA indisponible)'}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed text-gray-800">{narrative.synthese}</p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {narrative.points_forts.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-emerald-700">Points forts</p>
                        <ul className="space-y-1.5">{narrative.points_forts.map((p) => <li key={p} className="flex gap-2 text-sm text-gray-700"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />{p}</li>)}</ul>
                      </div>
                    )}
                    {narrative.recommandations.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-amber-700">Recommandations</p>
                        <ul className="space-y-2">{narrative.recommandations.map((r) => (
                          <li key={r.action} className="flex gap-2 text-sm text-gray-700"><Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                            <span><strong className="text-gray-900">{r.action}</strong> <span className={`ml-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY[r.priorite] || ''}`}>{r.priorite}</span><br />{r.justification}</span>
                          </li>))}</ul>
                      </div>
                    )}
                  </div>
                </section>
              )}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
              <button onClick={() => setStep('config')} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Undo2 className="h-4 w-4" /> Modifier les paramètres</button>
              <div className="flex gap-2">
                <button onClick={generate} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Régénérer</button>
                <button onClick={apply} disabled={applying || kept.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  <CheckCircle2 className="h-4 w-4" /> {applying ? 'Enregistrement...' : kept.length ? `Appliquer ${kept.length} shift${kept.length > 1 ? 's' : ''}` : 'Rien à ajouter'}
                </button>
              </div>
            </footer>
          </>
        )}

        {step === 'applied' && result && (
          <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-10 w-10 text-emerald-600" /></div>
            <h3 className="mt-5 text-2xl font-bold text-gray-900">Planning enregistré</h3>
            <p className="mt-2 max-w-md text-gray-600">{result.crees} shift{result.crees > 1 ? 's' : ''} ajouté{result.crees > 1 ? 's' : ''} au planning pour la semaine {weekLabel(monday).toLowerCase()}.</p>
            {result.ignores?.length > 0 && (
              <p className="mt-3 max-w-md rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">{result.ignores.length} shift(s) ignoré(s) : {result.ignores.map((s) => `${s.employe || 'employé'} le ${s.date} (${s.raison})`).join(' ; ')}.</p>
            )}
            <button onClick={close} className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90">Voir le planning</button>
          </div>
        )}
      </div>
    </div>
  );
}
