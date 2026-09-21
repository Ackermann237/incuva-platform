# backend/app/ai/planning_optimizer.py
"""Optimiseur de planning.

Le planning est construit par un algorithme (donc toujours valide : absences respectées, aucun chevauchement, plafond
d'heures hebdomadaires, couverture minimale, charge équilibrée), puis l'IA analyse le résultat et le commente.
Rien n'est enregistré tant que l'utilisateur n'a pas validé la proposition.
"""
import json
import logging
import statistics
from datetime import date, datetime, timedelta, timezone

from . import llm

logger = logging.getLogger(__name__)

DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
ALLOWED_TYPES = {'work', 'overtime', 'training'}
GENERATED_NOTE = "Généré par l'optimiseur IA"
MIN_PARTIAL_SHIFT_HOURS = 2.0


# ---------------------------------------------------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------------------------------------------------
def monday_of(day):
    return day - timedelta(days=day.weekday())


def parse_day(value):
    if isinstance(value, datetime):
        return value.date()
    try:
        return datetime.strptime(str(value)[:10], '%Y-%m-%d').date()
    except ValueError:
        return None


def _minutes(hhmm):
    hours, minutes = str(hhmm).split(':')[:2]
    return int(hours) * 60 + int(minutes)


def _hours_between(start, end):
    try:
        return max(0.0, (_minutes(end) - _minutes(start)) / 60)
    except (ValueError, TypeError):
        return 0.0


def _valid_time(value):
    try:
        datetime.strptime(str(value), '%H:%M')
        return True
    except ValueError:
        return False


def _employee_name(emp):
    return emp.get('candidate_name') or emp.get('name') or 'Employé'


def _clamp(value, low, high, default):
    try:
        return max(low, min(high, float(value)))
    except (TypeError, ValueError):
        return default


def normalize_params(raw):
    """Paramètres validés avec valeurs par défaut (semaine prochaine, 9h-17h, pause 1 h, 35 h, 1 personne minimum)."""
    raw = raw or {}
    week = parse_day(raw.get('week_start')) or (date.today() + timedelta(days=7))
    start = raw.get('start_time') if _valid_time(raw.get('start_time')) else '09:00'
    end = raw.get('end_time') if _valid_time(raw.get('end_time')) else '17:00'
    if _minutes(end) <= _minutes(start):
        start, end = '09:00', '17:00'
    break_minutes = int(_clamp(raw.get('break_minutes'), 0, 180, 60))
    return {
        'week_start': monday_of(week).isoformat(),
        'start_time': start,
        'end_time': end,
        'break_minutes': break_minutes,
        'weekly_hours': _clamp(raw.get('weekly_hours'), 4, 48, 35),
        'min_staff': int(_clamp(raw.get('min_staff'), 1, 50, 1)),
        'fill_to_target': bool(raw.get('fill_to_target', True)),
    }


# ---------------------------------------------------------------------------------------------------------------------
# Construction de la proposition
# ---------------------------------------------------------------------------------------------------------------------
def load_context(db, company_id, monday):
    employees = []
    for doc in db.collection('employees').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        item['id'] = doc.id
        if item.get('status') in ('active', 'on_leave'):
            employees.append(item)

    days = [monday + timedelta(days=i) for i in range(5)]
    week_iso = {d.isoformat() for d in days}

    existing = []
    for doc in db.collection('planning').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        item['id'] = doc.id
        if str(item.get('date', ''))[:10] in week_iso:
            existing.append(item)

    absences = []
    for doc in db.collection('absences').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        if item.get('status') in ('approved', 'pending'):
            start, end = parse_day(item.get('start_date')), parse_day(item.get('end_date'))
            if start and end and start <= days[-1] and end >= days[0]:
                absences.append({'employee_id': item.get('employee_id'), 'start': start, 'end': end,
                                 'type': item.get('type'), 'status': item.get('status')})
    return employees, existing, absences, days


def build_proposal(employees, existing, absences, days, params):
    net_hours = _hours_between(params['start_time'], params['end_time']) - params['break_minutes'] / 60
    net_hours = round(max(net_hours, 0.5), 2)
    target = params['weekly_hours']
    min_staff = params['min_staff']

    absent = {(a['employee_id'], d.isoformat()): a for a in absences for d in days if a['start'] <= d <= a['end']}
    existing_by = {}
    for shift in existing:
        existing_by.setdefault((shift.get('employee_id'), str(shift.get('date'))[:10]), []).append(shift)

    def effective(start, end):
        """Durée travaillée : la pause est déduite des journées de plus de 6 h, comme pour les shifts générés."""
        raw = _hours_between(start, end)
        return max(0.0, raw - params['break_minutes'] / 60) if raw > 6 else raw

    hours = {e['id']: sum(effective(s.get('start_time'), s.get('end_time'))
                          for d in days for s in existing_by.get((e['id'], d.isoformat()), [])) for e in employees}
    existing_hours = dict(hours)
    staffed = {d.isoformat(): len({s.get('employee_id') for s in existing if str(s.get('date'))[:10] == d.isoformat()}) for d in days}
    staffed_before = dict(staffed)
    assigned = set()  # (employee_id, jour)
    new_shifts = []
    names = {e['id']: _employee_name(e) for e in employees}

    def free(emp, day):
        key = (emp['id'], day.isoformat())
        return key not in absent and key not in existing_by and key not in assigned

    def remaining(emp):
        return target - hours[emp['id']]

    def has_capacity(emp):
        # Un shift complet, ou un shift raccourci d'au moins 2 h pour atteindre exactement l'objectif hebdomadaire
        return remaining(emp) >= min(net_hours, MIN_PARTIAL_SHIFT_HOURS) - 1e-9

    def assign(emp, day, reason):
        length = round(min(net_hours, remaining(emp)), 2)
        end_time = params['end_time']
        note = GENERATED_NOTE
        if length < net_hours - 1e-9:  # shift raccourci : même début, fin avancée, sans pause
            end_minutes = _minutes(params['start_time']) + round(length * 60)
            end_time = f"{end_minutes // 60:02d}:{end_minutes % 60:02d}"
            note = f"{GENERATED_NOTE} (shift raccourci pour respecter {target:g} h)"
            reason = f"{reason} : shift raccourci à {length:g} h pour respecter l'objectif hebdomadaire"
        assigned.add((emp['id'], day.isoformat()))
        hours[emp['id']] += length
        staffed[day.isoformat()] += 1
        new_shifts.append({'employee_id': emp['id'], 'employee_name': names[emp['id']], 'date': day.isoformat(),
                           'start_time': params['start_time'], 'end_time': end_time, 'type': 'work',
                           'department': emp.get('department', '') or '', 'notes': note, 'motif': reason,
                           'heures': length})

    # Phase 1 : couvrir chaque jour avec l'effectif minimal, en commençant par les jours les plus difficiles
    order = sorted(days, key=lambda d: sum(1 for e in employees if free(e, d)))
    for day in order:
        need = max(0, min_staff - staffed[day.isoformat()])
        candidates = sorted((e for e in employees if free(e, day) and has_capacity(e)), key=lambda e: (hours[e['id']], names[e['id']]))
        for emp in candidates[:need]:
            assign(emp, day, "Couverture minimale du jour")

    # Phase 2 : compléter les heures contractuelles en équilibrant la charge et l'effectif par jour
    if params['fill_to_target']:
        progress = True
        while progress:
            progress = False
            for emp in sorted(employees, key=lambda e: (hours[e['id']], names[e['id']])):
                if not has_capacity(emp):
                    continue
                options = [d for d in days if free(emp, d)]
                if options:
                    assign(emp, min(options, key=lambda d: (staffed[d.isoformat()], d)), "Équilibrage de la charge")
                    progress = True
                    break

    new_shifts.sort(key=lambda s: (s['date'], s['employee_name']))

    # Statistiques et alertes
    per_employee, warnings = [], []
    for emp in sorted(employees, key=lambda e: names[e['id']]):
        cells = []
        for d in days:
            key = (emp['id'], d.isoformat())
            kind = 'absent' if key in absent else 'existant' if key in existing_by else 'nouveau' if key in assigned else 'repos'
            cells.append({'date': d.isoformat(), 'etat': kind})
        total = round(hours[emp['id']], 1)
        per_employee.append({'id': emp['id'], 'nom': names[emp['id']], 'poste': emp.get('position'),
                             'heures_existantes': round(existing_hours[emp['id']], 1),
                             'heures_ajoutees': round(total - existing_hours[emp['id']], 1),
                             'heures_totales': total, 'objectif': target, 'jours': cells})
        if params['fill_to_target'] and total < target - 0.01:
            reasons = [f"absence {a['start'].strftime('%d/%m')}→{a['end'].strftime('%d/%m')}" for a in absences if a['employee_id'] == emp['id']]
            warnings.append(f"{names[emp['id']]} : {total:g} h sur {target:g} h" + (f" ({', '.join(reasons)})." if reasons else " (pas de créneau libre suffisant)."))

    per_day = []
    for d in days:
        iso = d.isoformat()
        present = staffed[iso]
        per_day.append({'date': iso, 'jour': DAY_NAMES[d.weekday()], 'effectif_avant': staffed_before[iso],
                        'effectif_apres': present, 'requis': min_staff, 'couvert': present >= min_staff})
        if present < min_staff:
            missing = [names[e['id']] for e in employees if (e['id'], iso) in absent]
            warnings.append(f"{DAY_NAMES[d.weekday()]} {d.strftime('%d/%m')} : {present} présent(s) pour {min_staff} requis"
                            + (f" (absents : {', '.join(missing)})." if missing else "."))

    totals = [p['heures_totales'] for p in per_employee]
    statistics_block = {
        'nouveaux_shifts': len(new_shifts),
        'heures_ajoutees': round(sum(s['heures_ajoutees'] for s in per_employee), 1),
        'heures_totales': round(sum(totals), 1),
        'employes': len(employees),
        'taux_couverture_pct': round(sum(1 for p in per_day if p['couvert']) / len(per_day) * 100),
        'ecart_heures_max_min': round(max(totals) - min(totals), 1) if totals else 0,
        'ecart_type_heures': round(statistics.pstdev(totals), 2) if len(totals) > 1 else 0,
        'absences_prises_en_compte': len({(a['employee_id'], a['start'], a['end']) for a in absences}),
        'shifts_existants_conserves': len(existing),
        'heures_par_shift': net_hours,
    }
    return {'shifts': new_shifts, 'par_employe': per_employee, 'par_jour': per_day,
            'statistiques': statistics_block, 'alertes': warnings}


# ---------------------------------------------------------------------------------------------------------------------
# Commentaire de l'IA
# ---------------------------------------------------------------------------------------------------------------------
SYSTEM_PROMPT = """Tu es un expert en organisation du travail et en planification RH. On te donne un planning hebdomadaire
DÉJÀ CONSTRUIT et vérifié par un algorithme (JSON) : paramètres, constats jugés (ok / attention / alerte), statistiques,
heures par employé et par jour. Tu l'interprètes pour le responsable, comme un conseiller.

RÈGLES STRICTES
- N'utilise QUE les faits et chiffres fournis. N'invente aucun nom, horaire, pourcentage ni contrainte.
- Un constat « ok » n'est jamais un problème. Ne parle pas de « surcharge » si les heures ne dépassent pas l'objectif.
- Chaque « justification » et chaque point fort est une vraie phrase (au moins 12 mots) qui cite les chiffres utiles.
- Les recommandations sont concrètes et réalisables par le responsable (décaler un shift, ajuster l'effectif minimal, prévoir un
  renfort un jour donné, valider les absences en attente...), classées par priorité. Sans alerte, propose des actions d'amélioration
  sobres, pas de fausses urgences.
- Français professionnel, phrases courtes, sans emojis.
- Réponds par UN SEUL objet JSON valide, sans texte autour :
{
  "synthese": "3 à 4 phrases : ce que fait ce planning, sa qualité, le verdict clair",
  "points_forts": ["phrase", "..."],
  "recommandations": [{"action": "verbe à l'infinitif + objet", "justification": "phrase complète", "priorite": "haute|moyenne|faible"}]
}
- 2 à 3 points forts, 2 à 4 recommandations."""


def _findings(proposal, params):
    """Constats chiffrés et jugés du planning proposé : l'IA les interprète, elle ne les invente pas."""
    stats = proposal['statistiques']
    findings = []
    covered = [d for d in proposal['par_jour'] if d['couvert']]
    findings.append({'theme': 'Couverture', 'niveau': 'ok' if len(covered) == len(proposal['par_jour']) else 'alerte',
                     'constat': f"L'effectif minimal de {params['min_staff']} personne(s) est atteint {len(covered)} jour(s) sur {len(proposal['par_jour'])}."})
    for e in proposal['par_employe']:
        gap = round(e['heures_totales'] - e['objectif'], 1)
        if abs(gap) < 0.05:
            level, text = 'ok', f"{e['nom']} atteint exactement son objectif de {e['objectif']:g} h."
        elif gap < 0:
            level, text = 'attention', f"{e['nom']} totalise {e['heures_totales']:g} h, soit {abs(gap):g} h de moins que l'objectif de {e['objectif']:g} h."
        else:
            level, text = 'attention', f"{e['nom']} totalise {e['heures_totales']:g} h, soit {gap:g} h de plus que l'objectif de {e['objectif']:g} h."
        findings.append({'theme': f"Charge de {e['nom']}", 'niveau': level, 'constat': text})
    if stats['employes'] > 1:
        spread = stats['ecart_heures_max_min']
        findings.append({'theme': 'Équilibre', 'niveau': 'ok' if spread <= 4 else 'attention',
                         'constat': f"L'écart entre l'employé le plus chargé et le moins chargé est de {spread:g} h."})
    if stats['absences_prises_en_compte']:
        findings.append({'theme': 'Absences', 'niveau': 'ok', 'constat': f"{stats['absences_prises_en_compte']} absence(s) prise(s) en compte : aucun shift n'est placé sur ces jours."})
    if stats['shifts_existants_conserves']:
        findings.append({'theme': 'Shifts existants', 'niveau': 'ok', 'constat': f"{stats['shifts_existants_conserves']} shift(s) déjà planifié(s) cette semaine ont été conservés sans modification."})
    return findings


def _is_sentence(value, minimum=25):
    value = str(value or '').strip()
    return len(value) >= minimum and any(c.isalpha() for c in value)


def _risks_from_alerts(proposal):
    """Les risques viennent des alertes calculées, jamais du modèle."""
    return [{'titre': 'Couverture insuffisante' if 'requis' in alert else "Objectif d'heures non atteint",
             'detail': alert, 'gravite': 'haute' if 'requis' in alert else 'moyenne'} for alert in proposal['alertes'][:5]]


def _clean_narrative(raw, proposal):
    recommendations = []
    for e in (raw.get('recommandations') if isinstance(raw.get('recommandations'), list) else [])[:5]:
        if isinstance(e, dict) and str(e.get('action') or '').strip() and _is_sentence(e.get('justification')) \
                and not llm.is_filler(e.get('justification')):
            priority = str(e.get('priorite') or '').lower()
            recommendations.append({'action': str(e['action']).strip()[:200], 'justification': str(e['justification']).strip()[:500],
                                    'priorite': priority if priority in ('haute', 'moyenne', 'faible') else 'moyenne'})
    return {'synthese': str(raw.get('synthese') or '').strip()[:900],
            'points_forts': [str(x).strip()[:300] for x in (raw.get('points_forts') if isinstance(raw.get('points_forts'), list) else [])[:3] if _is_sentence(x, 12)],
            'risques': _risks_from_alerts(proposal),
            'recommandations': recommendations}


def fallback_narrative(proposal, params):
    stats = proposal['statistiques']
    alerts = proposal['alertes']
    synthese = (f"Le planning de la semaine du {params['week_start']} ajoute {stats['nouveaux_shifts']} shift(s) "
                f"({stats['heures_ajoutees']:g} h) pour {stats['employes']} employé(s). La couverture minimale est assurée "
                f"{stats['taux_couverture_pct']} % des jours et l'écart de charge entre employés est de {stats['ecart_heures_max_min']:g} h.")
    return {'synthese': synthese,
            'points_forts': [f['constat'] for f in _findings(proposal, params) if f['niveau'] == 'ok'][:3],
            'risques': _risks_from_alerts(proposal),
            'recommandations': ([{'action': "Traiter les alertes avant d'appliquer le planning", 'justification': f"{len(alerts)} alerte(s) détectée(s) sur la proposition.", 'priorite': 'haute'}]
                                if alerts else [{'action': "Appliquer le planning", 'justification': "Aucune alerte : la proposition respecte toutes les contraintes.", 'priorite': 'faible'}])}


def write_narrative(proposal, params):
    payload = {'parametres': params, 'constats_calcules': _findings(proposal, params), 'statistiques': proposal['statistiques'],
               'alertes': proposal['alertes'], 'par_jour': proposal['par_jour'],
               'par_employe': [{k: v for k, v in e.items() if k != 'jours'} for e in proposal['par_employe']]}
    user = "PLANNING CALCULÉ (JSON) :\n" + json.dumps(payload, ensure_ascii=False, default=str, separators=(',', ':'))[:9000]
    try:
        for _ in range(2):
            raw = llm.complete_json(SYSTEM_PROMPT, user, max_tokens=1400, temperature=0.3)
            if raw and _is_sentence(raw.get('synthese'), 40):
                narrative = _clean_narrative(raw, proposal)
                if narrative['recommandations']:
                    return narrative, 'ia'
    except llm.LLMUnavailable as e:
        logger.error(f"Optimiseur de planning : IA indisponible ({e})")
    return fallback_narrative(proposal, params), 'calcul'


def optimize(db, company_id, raw_params):
    params = normalize_params(raw_params)
    monday = parse_day(params['week_start'])
    employees, existing, absences, days = load_context(db, company_id, monday)
    if not employees:
        raise ValueError("Aucun employé actif : ajoutez des employés avant d'optimiser le planning.")
    proposal = build_proposal(employees, existing, absences, days, params)
    narrative, source = write_narrative(proposal, params)
    return {'generated_at': datetime.now(timezone.utc).isoformat(), 'parametres': params, 'source': source,
            'modele': llm.model_name() if source == 'ia' else None, 'narrative': narrative,
            'constats': _findings(proposal, params), **proposal}


# ---------------------------------------------------------------------------------------------------------------------
# Application de la proposition
# ---------------------------------------------------------------------------------------------------------------------
MAX_SHIFTS_PER_APPLY = 300


def apply_shifts(db, company_id, shifts):
    """Enregistre les shifts validés ; chaque shift est revérifié (employé de l'entreprise, horaires, chevauchement)."""
    if not isinstance(shifts, list) or not shifts:
        raise ValueError("Aucun shift à appliquer.")
    if len(shifts) > MAX_SHIFTS_PER_APPLY:
        raise ValueError(f"Trop de shifts à la fois (maximum {MAX_SHIFTS_PER_APPLY}).")

    employees = {}
    for doc in db.collection('employees').where('company_id', '==', company_id).stream():
        employees[doc.id] = doc.to_dict()
    dates = sorted({str(s.get('date'))[:10] for s in shifts if isinstance(s, dict)})
    occupied = {}
    for doc in db.collection('planning').where('company_id', '==', company_id).stream():
        item = doc.to_dict()
        if str(item.get('date', ''))[:10] in dates:
            occupied.setdefault((item.get('employee_id'), str(item['date'])[:10]), []).append((item.get('start_time'), item.get('end_time')))

    created, skipped, batch, in_batch = 0, [], db.batch(), 0
    now = datetime.now()
    for shift in shifts:
        try:
            employee_id, day = shift['employee_id'], str(shift['date'])[:10]
            start, end = shift['start_time'], shift['end_time']
            if employee_id not in employees:
                raise ValueError("employé inconnu")
            if parse_day(day) is None or not (_valid_time(start) and _valid_time(end)) or _minutes(end) <= _minutes(start):
                raise ValueError("date ou horaires invalides")
            if any(start < other_end and end > other_start for other_start, other_end in occupied.get((employee_id, day), [])):
                raise ValueError("chevauche un shift existant")
        except (KeyError, TypeError, ValueError) as e:
            skipped.append({'employe': (shift.get('employee_name') if isinstance(shift, dict) else None), 'date': (shift.get('date') if isinstance(shift, dict) else None),
                            'raison': str(e)})
            continue
        shift_type = shift.get('type') if shift.get('type') in ALLOWED_TYPES else 'work'
        batch.set(db.collection('planning').document(), {
            'company_id': company_id, 'employee_id': employee_id, 'date': day, 'start_time': start, 'end_time': end,
            'type': shift_type, 'department': employees[employee_id].get('department', '') or '',
            'notes': GENERATED_NOTE, 'created_at': now, 'updated_at': now, 'source': 'optimiseur_ia'})
        occupied.setdefault((employee_id, day), []).append((start, end))
        created += 1
        in_batch += 1
        if in_batch == 400:
            batch.commit()
            batch, in_batch = db.batch(), 0
    if in_batch:
        batch.commit()
    return {'crees': created, 'ignores': skipped}
