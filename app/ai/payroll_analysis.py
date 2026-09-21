# backend/app/ai/payroll_analysis.py
"""Analyse de paie : les indicateurs sont CALCULÉS sur les vrais bulletins, puis l'IA les commente.

Chaque analyse repart des données actuelles (bulletins, employés), détecte des anomalies précises, note la santé de la
paie, projette les coûts et se compare à la dernière analyse. Si le modèle de langage est indisponible, un commentaire
généré à partir des mêmes chiffres est fourni : l'analyse ne tombe jamais en panne.
"""
import json
import logging
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from . import llm

logger = logging.getLogger(__name__)

STATUS_LABELS = {'draft': 'brouillon', 'approved': 'approuvé', 'paid': 'payé'}


# ---------------------------------------------------------------------------------------------------------------------
# Lecture des données
# ---------------------------------------------------------------------------------------------------------------------
def _f(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _day(value):
    """Date AAAA-MM-JJ à partir d'un datetime ou d'un texte ISO ; None si absente."""
    if isinstance(value, datetime):
        return value.strftime('%Y-%m-%d')
    if isinstance(value, str) and len(value) >= 10:
        return value[:10]
    return None


def _parse(day):
    try:
        return datetime.strptime(day, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return None


def load_company_payroll(db, company_id):
    payslips = []
    for doc in db.collection('payslips').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        item['id'] = doc.id
        payslips.append(item)
    employees = {}
    for doc in db.collection('employees').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        item['id'] = doc.id
        employees[doc.id] = item
    return payslips, employees


def _name(employees, employee_id):
    emp = employees.get(employee_id) or {}
    return emp.get('candidate_name') or emp.get('name') or 'Employé inconnu'


def _pct(part, whole):
    return round(part / whole * 100, 1) if whole else 0.0


# ---------------------------------------------------------------------------------------------------------------------
# Indicateurs
# ---------------------------------------------------------------------------------------------------------------------
def compute_metrics(payslips, employees, today=None):
    today = today or datetime.now(timezone.utc).date()
    active = {i: e for i, e in employees.items() if e.get('status') in ('active', 'on_leave')}

    totals = defaultdict(float)
    statuses = Counter()
    monthly = defaultdict(lambda: {'brut': 0.0, 'net': 0.0, 'cout_total': 0.0, 'bulletins': 0, 'employes': set()})
    per_employee = defaultdict(list)
    by_position = defaultdict(lambda: {'employes': set(), 'cout_total': 0.0})

    for p in payslips:
        gross, net = _f(p.get('gross_salary')), _f(p.get('net_salary'))
        cost = _f(p.get('total_cost')) or (gross + _f(p.get('total_employer_contributions')))
        totals['brut'] += gross
        totals['net'] += net
        totals['cotisations_salariales'] += _f(p.get('total_employee_contributions'))
        totals['cotisations_patronales'] += _f(p.get('total_employer_contributions'))
        totals['impot'] += _f(p.get('income_tax'))
        totals['cout_total_employeur'] += cost
        totals['heures'] += _f(p.get('hours_worked'))
        totals['heures_sup'] += _f(p.get('overtime_hours'))
        totals['primes'] += _f(p.get('bonuses'))
        statuses[p.get('status') or 'draft'] += 1

        month = (_day(p.get('period_end')) or '')[:7]
        if month:
            bucket = monthly[month]
            bucket['brut'] += gross
            bucket['net'] += net
            bucket['cout_total'] += cost
            bucket['bulletins'] += 1
            bucket['employes'].add(p.get('employee_id'))
        per_employee[p.get('employee_id')].append(p)
        position = (employees.get(p.get('employee_id')) or {}).get('position') or 'Non renseigné'
        by_position[position]['employes'].add(p.get('employee_id'))
        by_position[position]['cout_total'] += cost

    months = sorted(monthly)
    series = [{'mois': m, 'brut': round(monthly[m]['brut'], 2), 'net': round(monthly[m]['net'], 2),
               'cout_total': round(monthly[m]['cout_total'], 2), 'bulletins': monthly[m]['bulletins'],
               'employes': len(monthly[m]['employes'])} for m in months][-12:]

    metrics = {
        'date_analyse': today.isoformat(),
        'perimetre': {'bulletins': len(payslips), 'employes_actifs': len(active),
                      'mois_couverts': len(months), 'premier_mois': months[0] if months else None,
                      'dernier_mois': months[-1] if months else None},
        'totaux': {k: round(v, 2) for k, v in totals.items()},
        'ratios': {
            'taux_cotisations_salariales_pct': _pct(totals['cotisations_salariales'], totals['brut']),
            'taux_charges_patronales_pct': _pct(totals['cotisations_patronales'], totals['brut']),
            'net_sur_brut_pct': _pct(totals['net'], totals['brut']),
            'surcout_employeur_pct': _pct(totals['cout_total_employeur'] - totals['brut'], totals['brut']),
            'part_heures_sup_pct': _pct(totals['heures_sup'], totals['heures']),
        },
        'statuts': {STATUS_LABELS.get(k, k): v for k, v in statuses.items()},
        'mensuel': series,
        'repartition_par_poste': sorted(
            [{'poste': pos, 'employes': len(v['employes']), 'cout_total': round(v['cout_total'], 2)}
             for pos, v in by_position.items()], key=lambda x: -x['cout_total'])[:10],
    }

    # Variation mensuelle et projection tendancielle
    metrics['variation_dernier_mois_pct'] = None
    if len(series) >= 2 and series[-2]['cout_total']:
        metrics['variation_dernier_mois_pct'] = round(
            (series[-1]['cout_total'] - series[-2]['cout_total']) / series[-2]['cout_total'] * 100, 1)
    metrics['projection'] = _project(series)

    # Bulletins non payés
    unpaid = [p for p in payslips if p.get('status') != 'paid']
    late = []
    for p in unpaid:
        due = _parse(_day(p.get('payment_date')))
        if due and due < today:
            late.append((p, (today - due).days))
    oldest_days = max([(today - d).days for d in (_parse(_day(p.get('period_end'))) for p in unpaid) if d and d <= today], default=0)
    metrics['en_attente'] = {
        'nombre': len(unpaid),
        'montant_net': round(sum(_f(p.get('net_salary')) for p in unpaid), 2),
        'en_retard_de_paiement': len(late),
        'retard_max_jours': max([days for _, days in late], default=0),
        'plus_ancien_jours': oldest_days,
    }

    # Employés : moyenne et écart avec le contrat
    employee_rows = []
    for employee_id, items in per_employee.items():
        emp = employees.get(employee_id) or {}
        gross_avg = sum(_f(p.get('gross_salary')) for p in items) / len(items)
        contract_monthly = _f(emp.get('salary')) / 12
        employee_rows.append({
            'id': employee_id, 'nom': _name(employees, employee_id), 'poste': emp.get('position'),
            'bulletins': len(items), 'brut_moyen': round(gross_avg, 2),
            'net_moyen': round(sum(_f(p.get('net_salary')) for p in items) / len(items), 2),
            'brut_mensuel_contrat': round(contract_monthly, 2) if contract_monthly else None,
        })
    employee_rows.sort(key=lambda r: -r['brut_moyen'])
    metrics['employes'] = employee_rows[:30]
    if employee_rows:
        grosses = [r['brut_moyen'] for r in employee_rows]
        metrics['equite'] = {'brut_min': min(grosses), 'brut_max': max(grosses),
                             'brut_median': round(statistics.median(grosses), 2),
                             'ecart_max_min_pct': _pct(max(grosses) - min(grosses), min(grosses)) if min(grosses) else None}

    metrics['anomalies'] = _detect_anomalies(payslips, employees, active, per_employee, series, late, today, metrics)
    metrics['score_sante'] = _health_score(metrics['anomalies'], metrics)
    metrics['fiabilite'] = _reliability(metrics)
    metrics['constats'] = _findings(metrics, by_position)
    return metrics


def _reliability(metrics):
    """Une analyse sur peu de bulletins ne permet pas de dégager de vraies tendances : on le dit."""
    bulletins, months = metrics['perimetre']['bulletins'], metrics['perimetre']['mois_couverts']
    if bulletins < 6 or months < 3:
        return {'niveau': 'limitée',
                'note': f"Historique court ({bulletins} bulletin(s) sur {months} mois) : les tendances et projections sont indicatives."}
    return {'niveau': 'solide', 'note': f"{bulletins} bulletins sur {months} mois : base suffisante pour dégager des tendances."}


# Fourchettes usuelles en France (hors allègements), servant de repère : on ne parle d'« élevé » qu'au-delà
USUAL_EMPLOYER_RATE = (38, 46)
USUAL_EMPLOYEE_RATE = (20, 26)


def _findings(metrics, by_position):
    """Constats chiffrés et jugés (ok / attention / alerte), sur lesquels l'IA s'appuie : elle n'a rien à deviner."""
    ratios, pending, totals = metrics['ratios'], metrics['en_attente'], metrics['totaux']
    findings = []

    def add(theme, level, statement):
        findings.append({'theme': theme, 'niveau': level, 'constat': statement})

    rate = ratios['taux_charges_patronales_pct']
    if rate:
        inside = USUAL_EMPLOYER_RATE[0] <= rate <= USUAL_EMPLOYER_RATE[1]
        add('Charges patronales', 'ok' if inside else 'attention',
            f"Les charges patronales représentent {rate} % du brut ({'dans' if inside else 'hors de'} la fourchette usuelle de "
            f"{USUAL_EMPLOYER_RATE[0]} à {USUAL_EMPLOYER_RATE[1]} %).")
    rate = ratios['taux_cotisations_salariales_pct']
    if rate:
        inside = USUAL_EMPLOYEE_RATE[0] <= rate <= USUAL_EMPLOYEE_RATE[1]
        add('Cotisations salariales', 'ok' if inside else 'attention',
            f"Les cotisations salariales représentent {rate} % du brut ({'dans' if inside else 'hors de'} la fourchette usuelle de "
            f"{USUAL_EMPLOYEE_RATE[0]} à {USUAL_EMPLOYEE_RATE[1]} %).")
    variation = metrics.get('variation_dernier_mois_pct')
    if variation is not None:
        level = 'ok' if abs(variation) <= 10 else 'attention' if abs(variation) <= 25 else 'alerte'
        add('Évolution du coût', level, f"Le coût employeur a varié de {variation:+.1f} % entre les deux derniers mois"
            + (" : la masse salariale est stable." if abs(variation) <= 2 else "."))
    if pending['nombre']:
        level = 'alerte' if pending['en_retard_de_paiement'] else 'attention'
        text = f"{pending['nombre']} bulletin(s) ne sont pas payés ({pending['montant_net']:.2f} € net)"
        text += f", dont {pending['en_retard_de_paiement']} en retard (jusqu'à {pending['retard_max_jours']} jour(s))." if pending['en_retard_de_paiement'] else ", aucun n'est encore en retard."
        add('Bulletins non payés', level, text)
    else:
        add('Bulletins non payés', 'ok', "Tous les bulletins sont payés.")
    if totals.get('heures'):
        share = ratios['part_heures_sup_pct']
        add('Heures supplémentaires', 'ok' if share <= 5 else 'attention' if share <= 10 else 'alerte',
            f"Les heures supplémentaires représentent {share} % des heures travaillées.")
    positions = sorted(by_position.values(), key=lambda v: -v['cout_total'])
    if metrics['perimetre']['employes_actifs'] >= 3 and totals.get('cout_total_employeur'):
        top_share = _pct(positions[0]['cout_total'], totals['cout_total_employeur'])
        if top_share > 40:
            add('Concentration des coûts', 'attention', f"Un seul poste concentre {top_share} % du coût employeur.")
    equity = metrics.get('equite')
    if equity and equity.get('ecart_max_min_pct') is not None and metrics['perimetre']['employes_actifs'] >= 3:
        gap = equity['ecart_max_min_pct']
        add('Équité salariale', 'ok' if gap <= 100 else 'attention', f"L'écart entre le brut moyen le plus haut et le plus bas est de {gap} %.")
    add('Contrôles automatiques', 'ok' if not metrics['anomalies'] else 'alerte' if any(a['gravite'] == 'haute' for a in metrics['anomalies']) else 'attention',
        "Aucune anomalie détectée par les contrôles." if not metrics['anomalies'] else f"{len(metrics['anomalies'])} anomalie(s) détectée(s) par les contrôles.")
    return findings


def _project(series, horizon=3):
    """Projection linéaire du coût employeur sur les 3 prochains mois (6 derniers mois observés)."""
    points = [s['cout_total'] for s in series][-6:]
    if not points:
        return []
    n = len(points)
    if n >= 3:
        mean_x, mean_y = (n - 1) / 2, sum(points) / n
        denominator = sum((i - mean_x) ** 2 for i in range(n))
        slope = sum((i - mean_x) * (y - mean_y) for i, y in enumerate(points)) / denominator if denominator else 0
        intercept = mean_y - slope * mean_x
        method = 'tendance linéaire'
    else:
        slope, intercept, method = 0, points[-1], 'dernier mois reconduit'
    last_month = datetime.strptime(series[-1]['mois'] + '-01', '%Y-%m-%d')
    result = []
    for step in range(1, horizon + 1):
        month = (last_month.replace(day=28) + timedelta(days=4 + 31 * (step - 1))).replace(day=1)
        result.append({'mois': month.strftime('%Y-%m'), 'cout_total_estime': round(max(0.0, intercept + slope * (n - 1 + step)), 2),
                       'methode': method})
    return result


def _detect_anomalies(payslips, employees, active, per_employee, series, late, today, metrics):
    anomalies = []

    def add(kind, severity, title, detail, employee=None):
        anomalies.append({'type': kind, 'gravite': severity, 'titre': title, 'detail': detail, 'employe': employee})

    # 1. Doublons : même employé, même période
    seen = Counter((p.get('employee_id'), _day(p.get('period_start')), _day(p.get('period_end'))) for p in payslips)
    for (employee_id, start, end), count in seen.items():
        if count > 1:
            add('doublon', 'haute', 'Bulletin en double',
                f"{count} bulletins existent pour la période {start} → {end}.", _name(employees, employee_id))

    # 2. Montants incohérents
    for p in payslips:
        gross, net = _f(p.get('gross_salary')), _f(p.get('net_salary'))
        if gross <= 0 or net <= 0 or net > gross:
            add('montant_incoherent', 'haute', 'Montants incohérents',
                f"Bulletin {p.get('payslip_number') or p['id']} : brut {gross:.2f} €, net {net:.2f} €.",
                _name(employees, p.get('employee_id')))

    # 3. Taux de cotisation atypique (écart de plus de 4 points avec la médiane de l'entreprise)
    rates = [(p, _f(p.get('total_employee_contributions')) / _f(p.get('gross_salary')) * 100)
             for p in payslips if _f(p.get('gross_salary')) > 0 and _f(p.get('total_employee_contributions')) > 0]
    if len(rates) >= 3:
        median_rate = statistics.median(r for _, r in rates)
        for p, rate in rates:
            if abs(rate - median_rate) > 4:
                add('taux_cotisation', 'moyenne', 'Taux de cotisations atypique',
                    f"{rate:.1f} % de cotisations salariales contre {median_rate:.1f} % en médiane dans l'entreprise.",
                    _name(employees, p.get('employee_id')))

    # 4. Bulletin différent du contrat (brut mensuel attendu = salaire annuel / 12)
    for employee_id, items in per_employee.items():
        expected = _f((employees.get(employee_id) or {}).get('salary')) / 12
        if expected <= 0:
            continue
        for p in items:
            gross = _f(p.get('gross_salary'))
            if gross > 0 and abs(gross - expected) / expected > 0.10 and not _f(p.get('bonuses')) and not _f(p.get('overtime_pay')):
                add('ecart_contrat', 'moyenne', 'Brut différent du contrat',
                    f"Bulletin {p.get('payslip_number') or p['id']} : {gross:.2f} € contre {expected:.2f} € attendus d'après le contrat.",
                    _name(employees, employee_id))
                break  # une alerte par employé suffit

    # 5. Employés actifs sans bulletin sur le dernier mois de paie
    last_month = metrics['perimetre']['dernier_mois']
    if last_month:
        paid_last = {p.get('employee_id') for p in payslips if (_day(p.get('period_end')) or '')[:7] == last_month}
        for employee_id, emp in active.items():
            start = _day(emp.get('start_date')) or ''
            if employee_id not in paid_last and start[:7] <= last_month:
                add('bulletin_manquant', 'moyenne', 'Bulletin manquant',
                    f"Aucun bulletin pour {last_month} alors que l'employé est actif.", _name(employees, employee_id))

    # 6. Retards de paiement
    for p, days in sorted(late, key=lambda x: -x[1])[:10]:
        add('retard_paiement', 'haute' if days > 15 else 'moyenne', 'Paiement en retard',
            f"Bulletin {p.get('payslip_number') or p['id']} ({_f(p.get('net_salary')):.2f} € net) : échéance dépassée de {days} jour(s), statut « {STATUS_LABELS.get(p.get('status') or 'draft', p.get('status'))} ».",
            _name(employees, p.get('employee_id')))

    # 7. Brouillons anciens (plus de 30 jours après la fin de période)
    for p in payslips:
        if p.get('status', 'draft') == 'draft':
            end = _parse(_day(p.get('period_end')))
            if end and (today - end).days > 30:
                add('brouillon_ancien', 'moyenne', 'Brouillon non validé depuis plus de 30 jours',
                    f"Bulletin {p.get('payslip_number') or p['id']} de la période se terminant le {end.isoformat()}.",
                    _name(employees, p.get('employee_id')))

    # 8. Heures supplémentaires élevées (plus de 10 % des heures)
    for employee_id, items in per_employee.items():
        hours, overtime = sum(_f(p.get('hours_worked')) for p in items), sum(_f(p.get('overtime_hours')) for p in items)
        if hours and overtime / hours > 0.10:
            add('heures_sup', 'moyenne', 'Heures supplémentaires élevées',
                f"{overtime:.1f} h supplémentaires pour {hours:.1f} h travaillées ({overtime / hours * 100:.0f} %).",
                _name(employees, employee_id))

    # 9. Salaire atypique dans l'entreprise (au moins 4 salariés)
    rows = metrics.get('employes', [])
    if len(rows) >= 4:
        median = statistics.median(r['brut_moyen'] for r in rows)
        for r in rows:
            if median and abs(r['brut_moyen'] - median) / median > 0.40:
                add('salaire_atypique', 'faible', 'Salaire éloigné de la médiane',
                    f"{r['brut_moyen']:.2f} € brut moyen contre {median:.2f} € de médiane.", r['nom'])

    # 10. Variation brutale du coût d'un mois à l'autre
    variation = metrics.get('variation_dernier_mois_pct')
    if variation is not None and abs(variation) > 25:
        add('variation_brutale', 'moyenne', 'Variation brutale du coût de paie',
            f"Le coût employeur a varié de {variation:+.1f} % entre les deux derniers mois.")

    order = {'haute': 0, 'moyenne': 1, 'faible': 2}
    anomalies.sort(key=lambda a: order[a['gravite']])
    return anomalies[:40]


def _health_score(anomalies, metrics):
    if not metrics['perimetre']['bulletins']:
        return {'score': None, 'niveau': 'sans données', 'details': []}
    penalties = {'haute': (12, 48), 'moyenne': (5, 30), 'faible': (2, 10)}  # (points par anomalie, plafond)
    counts = Counter(a['gravite'] for a in anomalies)
    details, score = [], 100
    for severity, (points, cap) in penalties.items():
        lost = min(cap, counts.get(severity, 0) * points)
        if lost:
            score -= lost
            details.append({'critere': f"Anomalies de gravité {severity}", 'points_perdus': lost,
                            'raison': f"{counts[severity]} anomalie(s) × {points} points (plafond {cap})"})
    score = max(0, score)
    level = 'excellent' if score >= 85 else 'bon' if score >= 70 else 'à surveiller' if score >= 50 else 'critique'
    return {'score': score, 'niveau': level, 'details': details}


# ---------------------------------------------------------------------------------------------------------------------
# Historique : comparaison avec la dernière analyse
# ---------------------------------------------------------------------------------------------------------------------
def _snapshot(metrics):
    last = metrics['mensuel'][-1] if metrics['mensuel'] else {}
    return {'score': metrics['score_sante']['score'], 'anomalies': len(metrics['anomalies']),
            'bulletins': metrics['perimetre']['bulletins'], 'en_attente': metrics['en_attente']['nombre'],
            'cout_total_dernier_mois': last.get('cout_total'), 'dernier_mois': last.get('mois')}


def compare_with_previous(db, company_id, metrics):
    """Compare avec la dernière analyse enregistrée, puis enregistre celle-ci."""
    now = datetime.now(timezone.utc)
    snapshot = _snapshot(metrics)
    previous = None
    try:
        docs = [d.to_dict() for d in db.collection('payroll_analyses').where('company_id', '==', company_id).stream()]
        docs = [d for d in docs if isinstance(d.get('created_at'), datetime)]
        if docs:
            previous = max(docs, key=lambda d: d['created_at'])
        db.collection('payroll_analyses').add({'company_id': company_id, 'created_at': now, **snapshot})
    except Exception as e:
        logger.error(f"Historique d'analyse de paie indisponible : {e}")
    if not previous:
        return None

    def delta(key):
        before, after = previous.get(key), snapshot.get(key)
        return None if before is None or after is None else round(after - before, 2)

    return {
        'date_precedente': previous['created_at'].astimezone(timezone.utc).isoformat(),
        'score_avant': previous.get('score'), 'score_delta': delta('score'),
        'anomalies_avant': previous.get('anomalies'), 'anomalies_delta': delta('anomalies'),
        'en_attente_avant': previous.get('en_attente'), 'en_attente_delta': delta('en_attente'),
        'bulletins_delta': delta('bulletins'),
        'cout_total_dernier_mois_avant': previous.get('cout_total_dernier_mois'),
        'cout_total_dernier_mois_delta': delta('cout_total_dernier_mois'),
    }


# ---------------------------------------------------------------------------------------------------------------------
# Rédaction de l'analyse
# ---------------------------------------------------------------------------------------------------------------------
SYSTEM_PROMPT = """Tu es un directeur administratif et financier expert en paie, réputé pour la clarté et la pertinence de ses analyses.
On te fournit les RÉSULTATS D'UNE ANALYSE DÉJÀ CALCULÉE sur les bulletins réels d'une entreprise (JSON) : constats jugés
(ok / attention / alerte), anomalies, indicateurs, projection, comparaison avec la précédente analyse et fiabilité des données.
Ton rôle : interpréter ces résultats comme un vrai conseiller, pas les recopier.

RÈGLES STRICTES
- N'utilise QUE les chiffres et faits fournis. N'invente aucun montant, nom, date ni pourcentage.
- Respecte les niveaux fournis : ne qualifie JAMAIS d'« élevé », de « préoccupant » ou de « risque » un constat de niveau « ok ».
- Si la fiabilité est « limitée », dis clairement que l'historique est court et évite de conclure sur des tendances.
- Chaque « detail » et chaque « justification » est une vraie phrase (au moins 15 mots) qui cite les chiffres utiles et explique
  ce qu'ils signifient pour l'entreprise. Ne réponds jamais par un simple nombre.
- Les recommandations sont concrètes (quoi faire, pour qui, pourquoi), classées par priorité, et tirées des constats et anomalies.
  S'il n'y a ni alerte ni anomalie, propose des actions de bonne gestion (fiabiliser, anticiper, documenter), pas de fausses urgences.
- « gain_estime » : une phrase courte uniquement si le gain est calculable à partir des données, sinon "".
- Français professionnel, phrases courtes, sans jargon inutile, sans emojis.
- Réponds par UN SEUL objet JSON valide, sans aucun texte autour, de cette forme exacte :
{
  "synthese": "3 à 4 phrases : état de la paie, chiffre clé, verdict clair",
  "points_forts": ["phrase", "..."],
  "insights": [{"titre": "court", "detail": "phrase complète avec chiffres", "impact": "haut|moyen|faible"}],
  "recommandations": [{"action": "verbe à l'infinitif + objet", "justification": "phrase complète", "priorite": "haute|moyenne|faible", "gain_estime": ""}],
  "lecture_projection": "1 à 2 phrases sur la projection des 3 prochains mois",
  "questions_a_se_poser": ["question courte", "..."]
}
- 2 à 4 points forts, 3 à 5 insights, 3 à 5 recommandations, 2 à 3 questions."""


def _as_list(value):
    return value if isinstance(value, list) else []


LEVEL_TO_IMPACT = {'alerte': 'haut', 'attention': 'moyen', 'ok': 'faible'}
PRIORITIES = {'haute', 'moyenne', 'faible'}
IMPACTS = {'haut', 'moyen', 'faible'}


def _text(value, limit=600):
    return str(value).strip()[:limit] if value is not None else ''


def _is_sentence(value, minimum=30):
    """Écarte les réponses paresseuses du modèle (un simple nombre, un mot)."""
    value = _text(value)
    return len(value) >= minimum and any(c.isalpha() for c in value)


def _clean_narrative(raw, metrics):
    """Garde la structure attendue avec des types sûrs, écarte les contenus vides et remplace les risques.

    Les risques ne viennent jamais du modèle : ils sont issus des anomalies calculées, pour qu'aucun risque inventé
    n'apparaisse dans le rapport.
    """
    insights = []
    for entry in _as_list(raw.get('insights'))[:6]:
        if isinstance(entry, dict) and _is_sentence(entry.get('detail')) and _text(entry.get('titre')):
            impact = _text(entry.get('impact')).lower()
            insights.append({'titre': _text(entry['titre'], 120), 'detail': _text(entry['detail']), 'impact': impact if impact in IMPACTS else 'moyen'})
    if len(insights) < 2:  # le modèle a été trop pauvre : on complète avec les constats calculés
        known = {i['titre'] for i in insights}
        for finding in metrics['constats']:
            if finding['theme'] not in known and len(insights) < 4:
                insights.append({'titre': finding['theme'], 'detail': finding['constat'], 'impact': LEVEL_TO_IMPACT[finding['niveau']]})

    recommendations = []
    for entry in _as_list(raw.get('recommandations'))[:6]:
        if isinstance(entry, dict) and _text(entry.get('action')) and _is_sentence(entry.get('justification')) \
                and not llm.is_filler(entry.get('justification')):
            priority = _text(entry.get('priorite')).lower()
            gain = _text(entry.get('gain_estime'), 200)
            recommendations.append({'action': _text(entry['action'], 200), 'justification': _text(entry['justification']),
                                    'priorite': priority if priority in PRIORITIES else 'moyenne',
                                    'gain_estime': gain if _is_sentence(gain, 8) else ''})

    return {
        'synthese': _text(raw.get('synthese'), 1200),
        'points_forts': [_text(x, 300) for x in _as_list(raw.get('points_forts'))[:4] if _is_sentence(x, 15)],
        'insights': insights,
        'risques': _risks_from_anomalies(metrics),
        'recommandations': recommendations,
        'lecture_projection': _text(raw.get('lecture_projection'), 500) if _is_sentence(raw.get('lecture_projection'), 20) else '',
        'questions_a_se_poser': [_text(x, 300) for x in _as_list(raw.get('questions_a_se_poser'))[:3] if _is_sentence(x, 15)],
    }


def _risks_from_anomalies(metrics):
    return [{'titre': a['titre'], 'detail': a['detail'] + (f" ({a['employe']})" if a.get('employe') else ''), 'gravite': a['gravite']}
            for a in metrics['anomalies'][:5]]


def _money(value):
    return f"{value:,.0f}".replace(',', ' ') + ' €'


def fallback_narrative(metrics):
    """Commentaire construit à partir des chiffres, utilisé si le modèle de langage est indisponible."""
    perimetre, totals, en_attente = metrics['perimetre'], metrics['totaux'], metrics['en_attente']
    score = metrics['score_sante']
    anomalies = metrics['anomalies']
    if not perimetre['bulletins']:
        return {'synthese': "Aucun bulletin de paie n'a encore été généré : il n'y a rien à analyser pour le moment.",
                'points_forts': [], 'insights': [], 'risques': [], 'recommandations': [
                    {'action': "Créer les bulletins de paie du mois", 'justification': "L'analyse a besoin de bulletins pour produire des indicateurs.",
                     'priorite': 'haute', 'gain_estime': ''}], 'lecture_projection': '', 'questions_a_se_poser': []}
    high = [a for a in anomalies if a['gravite'] == 'haute']
    synthese = (f"{perimetre['bulletins']} bulletin(s) analysé(s) pour {perimetre['employes_actifs']} employé(s) actif(s), "
                f"soit un coût employeur cumulé de {_money(totals['cout_total_employeur'])} (brut {_money(totals['brut'])}). "
                f"Score de santé de la paie : {score['score']}/100 ({score['niveau']}). ")
    synthese += (f"{len(high)} anomalie(s) de gravité haute à traiter en priorité." if high else "Aucune anomalie grave détectée.")
    insights = [{'titre': f['theme'], 'detail': f['constat'], 'impact': LEVEL_TO_IMPACT[f['niveau']]} for f in metrics['constats'][:5]]
    recommendations = []
    if high:
        recommendations.append({'action': "Corriger d'abord les anomalies de gravité haute", 'priorite': 'haute', 'gain_estime': '',
                                'justification': f"{len(high)} anomalie(s) : " + ' ; '.join(a['titre'] for a in high[:3])})
    if en_attente['en_retard_de_paiement']:
        recommendations.append({'action': "Régler les bulletins dont l'échéance est dépassée", 'priorite': 'haute', 'gain_estime': '',
                                'justification': f"Retard maximal : {en_attente['retard_max_jours']} jour(s)."})
    projection = metrics['projection']
    return {'synthese': synthese, 'points_forts': [f['constat'] for f in metrics['constats'] if f['niveau'] == 'ok'][:3], 'insights': insights,
            'risques': _risks_from_anomalies(metrics),
            'recommandations': recommendations,
            'lecture_projection': (f"Projection ({projection[0]['methode']}) : environ {_money(projection[0]['cout_total_estime'])} le mois prochain." if projection else ''),
            'questions_a_se_poser': []}


def write_narrative(metrics, comparison):
    """(narration, source) : commentaire du modèle de langage, ou commentaire de secours si indisponible."""
    payload = {
        'fiabilite_des_donnees': metrics['fiabilite'],
        'score_sante': metrics['score_sante'],
        'constats_calcules': metrics['constats'],
        'anomalies': [{k: a[k] for k in ('gravite', 'titre', 'detail', 'employe')} for a in metrics['anomalies'][:10]],
        'indicateurs': {k: metrics[k] for k in ('perimetre', 'totaux', 'ratios', 'statuts', 'en_attente', 'mensuel', 'projection',
                                                'repartition_par_poste') if k in metrics} | ({'equite': metrics['equite']} if 'equite' in metrics else {}),
        'comparaison_avec_la_derniere_analyse': comparison,
    }
    user = "RÉSULTATS DE L'ANALYSE (JSON) :\n" + json.dumps(payload, ensure_ascii=False, default=str, separators=(',', ':'))[:14000]
    try:
        for _ in range(2):  # une seconde tentative si le JSON est inexploitable
            raw = llm.complete_json(SYSTEM_PROMPT, user, max_tokens=2200, temperature=0.3)
            if raw and _is_sentence(raw.get('synthese'), 40):
                narrative = _clean_narrative(raw, metrics)
                if narrative['recommandations']:
                    return narrative, 'ia'
    except llm.LLMUnavailable as e:
        logger.error(f"Analyse de paie : IA indisponible ({e})")
    return fallback_narrative(metrics), 'calcul'


def analyze(db, company_id):
    payslips, employees = load_company_payroll(db, company_id)
    metrics = compute_metrics(payslips, employees)
    comparison = compare_with_previous(db, company_id, metrics)
    narrative, source = write_narrative(metrics, comparison)

    return {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'source': source,
        'modele': llm.model_name() if source == 'ia' else None,
        'metrics': metrics,
        'comparison': comparison,
        'narrative': narrative,
        # Champs historiques, conservés pour les anciens écrans
        'summary': narrative['synthese'],
        'trends': [f"{i['titre']} : {i['detail']}" for i in narrative['insights']],
        'recommendations': [f"{r['action']} : {r['justification']}" for r in narrative['recommandations']],
        'alerts': [f"{a['titre']} : {a['detail']}" for a in metrics['anomalies']],
    }


# ---------------------------------------------------------------------------------------------------------------------
# Questions libres sur la paie (assistant de la fenêtre d'analyse)
# ---------------------------------------------------------------------------------------------------------------------
QA_SYSTEM_PROMPT = """Tu es l'assistant paie d'INCUVA, expert en paie et comptabilité sociale. Tu réponds aux questions d'un
responsable d'entreprise en t'appuyant sur les INDICATEURS calculés sur ses vrais bulletins (JSON ci-dessous).
- Pour une question sur ses données : utilise uniquement ces chiffres, cite-les, et dis clairement si l'information manque.
- Pour une question générale de paie (cotisations, congés, droit du travail) : réponds avec tes connaissances en précisant que
  cela dépend du pays et de la convention collective.
- Réponds en français, de façon structurée en Markdown (listes, **gras**), concise, sans emojis.
- Ne cite jamais les noms techniques des champs du JSON (comme « totaux.cout_total_employeur ») : parle en langage courant."""


def answer_question(db, company_id, question):
    payslips, employees = load_company_payroll(db, company_id)
    metrics = compute_metrics(payslips, employees)
    system = f"{QA_SYSTEM_PROMPT}\n\nINDICATEURS :\n" + json.dumps(metrics, ensure_ascii=False, default=str, separators=(',', ':'))[:12000]
    return llm.complete(system, question[:2000], max_tokens=1200, temperature=0.4)
