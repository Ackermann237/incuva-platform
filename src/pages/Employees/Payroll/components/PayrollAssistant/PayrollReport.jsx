// src/pages/Employees/Payroll/components/PayrollAssistant/PayrollReport.jsx
// Rapport d'analyse de paie : score de santé, indicateurs, courbe avec projection, anomalies, recommandations de l'IA.
import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  Sparkles, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, Minus, Wallet, Users, Clock, Percent,
  Lightbulb, AlertTriangle, CheckCircle2, ArrowRight, Download, RefreshCw, Cpu, Calculator,
} from 'lucide-react';

const euro = (value) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
const monthLabel = (month) => new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

const LEVELS = {
  excellent: { label: 'Excellent', color: '#059669', soft: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bon: { label: 'Bon', color: '#2563eb', soft: 'bg-blue-50 text-blue-700 border-blue-200' },
  'à surveiller': { label: 'À surveiller', color: '#d97706', soft: 'bg-amber-50 text-amber-700 border-amber-200' },
  critique: { label: 'Critique', color: '#dc2626', soft: 'bg-red-50 text-red-700 border-red-200' },
  'sans données': { label: 'Sans données', color: '#6b7280', soft: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const SEVERITY = {
  haute: 'bg-red-100 text-red-700 border-red-200',
  haut: 'bg-red-100 text-red-700 border-red-200',
  moyenne: 'bg-amber-100 text-amber-700 border-amber-200',
  moyen: 'bg-amber-100 text-amber-700 border-amber-200',
  faible: 'bg-blue-100 text-blue-700 border-blue-200',
};

function Badge({ level, children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY[level] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {children || level}
    </span>
  );
}

function ScoreGauge({ score, level }) {
  const { color } = LEVELS[level] || LEVELS['sans données'];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  return (
    <div className="relative h-36 w-36 flex-shrink-0">
      <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="11" />
        <circle
          cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-gray-900">{score ?? '—'}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">sur 100</span>
      </div>
    </div>
  );
}

// Variation par rapport à la dernière analyse ; `goodWhenUp` indique si une hausse est une bonne nouvelle
function Delta({ label, value, goodWhenUp, suffix = '' }) {
  if (value === null || value === undefined) return null;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  const good = value === 0 ? null : (value > 0) === goodWhenUp;
  const tone = good === null ? 'text-gray-600 bg-gray-100' : good ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {label} {value > 0 ? '+' : ''}{value}{suffix}
    </span>
  );
}

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

function Section({ icon: Icon, title, children, tone = 'text-purple-600' }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
        <Icon className={`h-5 w-5 ${tone}`} /> {title}
      </h3>
      {children}
    </section>
  );
}

export function reportToMarkdown(analysis) {
  const { metrics, narrative, comparison } = analysis;
  const lines = [
    `# Analyse de paie — ${new Date(analysis.generated_at).toLocaleString('fr-FR')}`, '',
    `**Score de santé : ${metrics.score_sante.score ?? '—'}/100 (${metrics.score_sante.niveau})**`, '',
    narrative.synthese, '',
    '## Indicateurs',
    `- Bulletins analysés : ${metrics.perimetre.bulletins}`,
    `- Coût employeur cumulé : ${euro(metrics.totaux.cout_total_employeur)}`,
    `- Brut : ${euro(metrics.totaux.brut)} — Net : ${euro(metrics.totaux.net)}`,
    `- Bulletins non payés : ${metrics.en_attente.nombre} (${euro(metrics.en_attente.montant_net)} net)`, '',
  ];
  if (comparison) lines.push('## Depuis la dernière analyse', `- Score : ${comparison.score_delta ?? '—'}`, `- Anomalies : ${comparison.anomalies_delta ?? '—'}`, '');
  if (metrics.anomalies.length) {
    lines.push('## Anomalies', ...metrics.anomalies.map((a) => `- [${a.gravite}] ${a.titre}${a.employe ? ` (${a.employe})` : ''} : ${a.detail}`), '');
  }
  if (narrative.recommandations.length) {
    lines.push('## Recommandations', ...narrative.recommandations.map((r, i) => `${i + 1}. **${r.action}** (${r.priorite}) — ${r.justification}${r.gain_estime ? ` Gain : ${r.gain_estime}` : ''}`), '');
  }
  if (metrics.projection.length) {
    lines.push('## Projection', ...metrics.projection.map((p) => `- ${p.mois} : ${euro(p.cout_total_estime)} (${p.methode})`));
  }
  return lines.join('\n');
}

export default function PayrollReport({ analysis, onAsk, onNewAnalysis }) {
  const { metrics, narrative, comparison, source } = analysis;
  const { score_sante: health, totaux, ratios, en_attente: pending, perimetre } = metrics;
  const level = LEVELS[health.niveau] || LEVELS['sans données'];

  const chartData = [
    // Le dernier mois réel sert aussi de point de départ à la courbe de projection (les deux lignes se rejoignent)
    ...metrics.mensuel.map((m, index) => ({
      mois: monthLabel(m.mois), brut: m.brut, net: m.net, cout: m.cout_total,
      ...(index === metrics.mensuel.length - 1 && metrics.projection.length ? { projection: m.cout_total } : {}),
    })),
    ...metrics.projection.map((p) => ({ mois: `${monthLabel(p.mois)} (prév.)`, projection: p.cout_total_estime })),
  ];

  const download = () => {
    const url = URL.createObjectURL(new Blob([reportToMarkdown(analysis)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-paie-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Synthèse */}
      <section className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreGauge score={health.score} level={health.niveau} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${level.soft}`}>
                {health.score >= 70 ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                Santé de la paie : {level.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                {source === 'ia' ? <Sparkles className="h-3.5 w-3.5 text-purple-600" /> : <Calculator className="h-3.5 w-3.5 text-gray-500" />}
                {source === 'ia' ? `Rédigé par l'IA${analysis.modele ? ` · ${analysis.modele.split('/').pop().split(':')[0]}` : ''}` : "Commentaire calculé (IA indisponible)"}
              </span>
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-gray-800">{narrative.synthese}</p>
            {comparison && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Depuis l'analyse du {new Date(comparison.date_precedente).toLocaleDateString('fr-FR')} :</span>
                <Delta label="score" value={comparison.score_delta} goodWhenUp />
                <Delta label="anomalies" value={comparison.anomalies_delta} goodWhenUp={false} />
                <Delta label="en attente" value={comparison.en_attente_delta} goodWhenUp={false} />
                <Delta label="bulletins" value={comparison.bulletins_delta} goodWhenUp />
              </div>
            )}
          </div>
        </div>
        {health.details.length > 0 && (
          <p className="mt-4 border-t border-purple-100 pt-3 text-xs text-gray-500">
            Calcul du score : 100 points, moins {health.details.map((d) => `${d.points_perdus} (${d.critere.toLowerCase()})`).join(', ')}.
          </p>
        )}
      </section>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Coût employeur" value={euro(totaux.cout_total_employeur)} hint={`Brut ${euro(totaux.brut)}`} tone="bg-purple-100 text-purple-700" />
        <Kpi icon={Wallet} label="Net versé" value={euro(totaux.net)} hint={`${ratios.net_sur_brut_pct} % du brut`} tone="bg-emerald-100 text-emerald-700" />
        <Kpi icon={Percent} label="Charges patronales" value={`${ratios.taux_charges_patronales_pct} %`} hint={`Cotisations salariales ${ratios.taux_cotisations_salariales_pct} %`} tone="bg-blue-100 text-blue-700" />
        <Kpi icon={Clock} label="Non payés" value={pending.nombre} hint={pending.nombre ? `${euro(pending.montant_net)} net · ${pending.en_retard_de_paiement} en retard` : 'Tout est réglé'} tone={pending.en_retard_de_paiement ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} />
      </div>

      {/* Courbe + projection */}
      {chartData.length > 0 && (
        <Section icon={TrendingUp} title="Évolution du coût de paie et projection" tone="text-blue-600">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(value) => euro(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="brut" name="Brut" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="cout" name="Coût employeur" stroke="#2563eb" strokeWidth={2.5} dot />
                <Line type="monotone" dataKey="projection" name="Projection" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 4" dot />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {narrative.lecture_projection && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{narrative.lecture_projection}</p>}
        </Section>
      )}

      {/* Points forts et enseignements */}
      {(narrative.points_forts.length > 0 || narrative.insights.length > 0) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {narrative.points_forts.length > 0 && (
            <Section icon={CheckCircle2} title="Points forts" tone="text-emerald-600">
              <ul className="space-y-2">
                {narrative.points_forts.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-gray-700"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />{point}</li>
                ))}
              </ul>
            </Section>
          )}
          {narrative.insights.length > 0 && (
            <Section icon={Sparkles} title="Ce que révèlent vos données">
              <ul className="space-y-3">
                {narrative.insights.map((insight) => (
                  <li key={insight.titre} className="text-sm">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">{insight.titre} <Badge level={insight.impact}>impact {insight.impact}</Badge></div>
                    <p className="mt-0.5 text-gray-600">{insight.detail}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Anomalies */}
      <Section icon={AlertTriangle} title={`Anomalies détectées (${metrics.anomalies.length})`} tone="text-red-600">
        {metrics.anomalies.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><ShieldCheck className="h-5 w-5" /> Aucune anomalie : tous les contrôles automatiques sont passés.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {metrics.anomalies.slice(0, 12).map((anomaly, index) => (
              <li key={`${anomaly.type}-${index}`} className="flex items-start gap-3 py-2.5 text-sm">
                <Badge level={anomaly.gravite} />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{anomaly.titre}{anomaly.employe ? <span className="font-normal text-gray-500"> · {anomaly.employe}</span> : null}</p>
                  <p className="text-gray-600">{anomaly.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {metrics.anomalies.length > 12 && <p className="mt-2 text-xs text-gray-500">+ {metrics.anomalies.length - 12} autre(s) anomalie(s) moins prioritaires.</p>}
      </Section>

      {/* Recommandations */}
      {narrative.recommandations.length > 0 && (
        <Section icon={Lightbulb} title="Plan d'action recommandé" tone="text-amber-500">
          <ol className="space-y-3">
            {narrative.recommandations.map((rec, index) => (
              <li key={rec.action} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{rec.action}</p>
                    <Badge level={rec.priorite}>priorité {rec.priorite}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{rec.justification}</p>
                  {rec.gain_estime && <p className="mt-1 text-xs font-medium text-emerald-700">Gain estimé : {rec.gain_estime}</p>}
                  <button type="button" onClick={() => onAsk(`Détaille comment mettre en œuvre : ${rec.action}`)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-900">
                    Demander à l'assistant <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Répartition et équité */}
      <div className="grid gap-5 lg:grid-cols-2">
        {metrics.repartition_par_poste.length > 0 && (
          <Section icon={Users} title="Coût par poste" tone="text-blue-600">
            <ul className="space-y-2.5">
              {metrics.repartition_par_poste.slice(0, 6).map((row) => {
                const max = metrics.repartition_par_poste[0].cout_total || 1;
                return (
                  <li key={row.poste} className="text-sm">
                    <div className="mb-1 flex justify-between text-gray-700"><span>{row.poste} <span className="text-gray-400">({row.employes})</span></span><span className="font-medium">{euro(row.cout_total)}</span></div>
                    <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${(row.cout_total / max) * 100}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}
        {metrics.equite && (
          <Section icon={Cpu} title="Équité salariale (brut mensuel moyen)" tone="text-purple-600">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['Minimum', metrics.equite.brut_min], ['Médiane', metrics.equite.brut_median], ['Maximum', metrics.equite.brut_max]].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-bold text-gray-900">{euro(value)}</p></div>
              ))}
            </div>
            {metrics.equite.ecart_max_min_pct !== null && <p className="mt-3 text-sm text-gray-600">Écart entre le plus haut et le plus bas : <strong>{metrics.equite.ecart_max_min_pct} %</strong>.</p>}
          </Section>
        )}
      </div>

      {/* Questions et actions */}
      {narrative.questions_a_se_poser.length > 0 && (
        <Section icon={Lightbulb} title="Questions à vous poser">
          <ul className="space-y-1.5">
            {narrative.questions_a_se_poser.map((q) => (
              <li key={q}><button type="button" onClick={() => onAsk(q)} className="text-left text-sm text-gray-700 hover:text-purple-700">• {q}</button></li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 text-xs text-gray-500">
        <span>Analyse générée le {new Date(analysis.generated_at).toLocaleString('fr-FR')} sur {perimetre.bulletins} bulletin(s).</span>
        <div className="flex gap-2">
          <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><Download className="h-4 w-4" /> Télécharger</button>
          <button type="button" onClick={onNewAnalysis} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"><RefreshCw className="h-4 w-4" /> Relancer l'analyse</button>
        </div>
      </div>
    </div>
  );
}
