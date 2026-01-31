# backend/app/tasks/payroll_tasks.py
import datetime
import logging
import uuid

from firebase_admin import firestore
from ..firebase.init_firebase import db
from ..routes.contracts import get_last_working_day

logger = logging.getLogger(__name__)


def auto_generate_payslips():
    """Génère automatiquement les bulletins de paie pour tous les employés"""
    try:
        today = datetime.datetime.now()

        # Trouver le premier jour du mois prochain
        if today.month == 12:
            next_month = datetime.datetime(today.year + 1, 1, 1)
        else:
            next_month = datetime.datetime(today.year, today.month + 1, 1)

        period_start = next_month
        period_end = (next_month + datetime.timedelta(days=31)).replace(day=1) - datetime.timedelta(days=1)
        payment_date = get_last_working_day(period_end)

        # Récupérer toutes les configurations de paie automatique
        payroll_configs_ref = db.collection('payroll_configurations').where('auto_generate', '==', True).stream()

        generated_count = 0

        for config_doc in payroll_configs_ref:
            config = config_doc.to_dict()
            employee_id = config['employee_id']
            company_id = config['company_id']
            gross_salary = config['gross_salary']

            # Vérifier si un bulletin existe déjà pour cette période
            existing_payslip = db.collection('payslips') \
                .where('employee_id', '==', employee_id) \
                .where('period_start', '==', period_start) \
                .limit(1).stream()

            if any(existing_payslip):
                continue  # Bulletin déjà généré

            # Générer le bulletin
            payslip_id = generate_payslip_for_period(
                employee_id, company_id, gross_salary,
                period_start, period_end, payment_date
            )

            if payslip_id:
                generated_count += 1
                logger.info(f"Bulletin généré automatiquement: {payslip_id}")

        logger.info(f"Tâche terminée: {generated_count} bulletins générés automatiquement")
        return generated_count

    except Exception as e:
        logger.error(f"Erreur dans la génération automatique des bulletins: {str(e)}")
        return 0


def generate_payslip_for_period(employee_id, company_id, gross_salary, period_start, period_end, payment_date):
    """Génère un bulletin pour une période spécifique"""
    try:
        # Calculs des cotisations (simplifiés)
        employee_contributions = {
            'social_security': round(gross_salary * 0.068, 2),
            'health_insurance': round(gross_salary * 0.077, 2),
            'pension': round(gross_salary * 0.083, 2),
            'unemployment': round(gross_salary * 0.024, 2)
        }

        employer_contributions = {
            'social_security': round(gross_salary * 0.13, 2),
            'health_insurance': round(gross_salary * 0.128, 2),
            'pension': round(gross_salary * 0.162, 2)
        }

        total_employee_contributions = sum(employee_contributions.values())
        total_employer_contributions = sum(employer_contributions.values())
        income_tax = round(gross_salary * 0.15, 2)
        net_salary = round(gross_salary - total_employee_contributions - income_tax, 2)
        total_cost = round(gross_salary + total_employer_contributions, 2)

        # Créer le bulletin
        payslip_data = {
            'company_id': company_id,
            'employee_id': employee_id,
            'period_start': period_start,
            'period_end': period_end,
            'gross_salary': gross_salary,
            'net_salary': net_salary,
            'employee_contributions': employee_contributions,
            'total_employee_contributions': total_employee_contributions,
            'employer_contributions': employer_contributions,
            'total_employer_contributions': total_employer_contributions,
            'income_tax': income_tax,
            'total_cost': total_cost,
            'hours_worked': 151.67,
            'hourly_rate': round(gross_salary / 151.67, 2),
            'overtime_hours': 0,
            'overtime_pay': 0,
            'bonuses': 0,
            'deductions': 0,
            'status': 'draft',
            'payment_method': 'bank_transfer',
            'payment_date': payment_date,
            'notes': f'Bulletin généré automatiquement',
            'generated_at': datetime.datetime.now(),
            'payslip_number': f"PAY-{period_start.strftime('%Y%m')}-{str(uuid.uuid4())[:8]}",
            'is_auto_generated': True
        }

        # Sauvegarder
        doc_ref = db.collection('payslips').add(payslip_data)
        return doc_ref[1].id

    except Exception as e:
        logger.error(f"Erreur génération bulletin: {str(e)}")
        return None