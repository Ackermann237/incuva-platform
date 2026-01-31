# backend/app/routes/planning.py
from flask import Blueprint, jsonify, request, session
from firebase_admin import firestore
import datetime
import logging
from functools import wraps
from ..firebase.init_firebase import db
from ..ai.manage import get_ai_manager

logger = logging.getLogger(__name__)
planning_bp = Blueprint('planning', __name__, url_prefix='/api/planning')


def company_required(f):
    """Décorateur pour vérifier que l'utilisateur est une entreprise"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'uid' not in session or session.get('account_type') != 'company':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        return f(*args, **kwargs)

    return decorated_function


@planning_bp.route('/employees', methods=['GET'])
@company_required
def get_employees_for_planning():
    """Récupérer les employés pour le planning"""
    try:
        company_id = session['uid']

        # Récupérer tous les employés actifs
        employees_ref = db.collection('employees') \
            .where('company_id', '==', company_id) \
            .where('status', 'in', ['active', 'on_leave'])

        employees = []
        for doc in employees_ref.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos du candidat
            if 'candidate_id' in data:
                candidate_doc = db.collection('users').document(data['candidate_id']).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    data['profile_image_url'] = candidate_data.get('profileImageUrl', '')

            employees.append(data)

        return jsonify({
            'success': True,
            'employees': employees
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des employés: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/', methods=['GET'])
@company_required
def get_planning():
    """Récupérer le planning"""
    try:
        company_id = session['uid']

        # Paramètres de filtrage
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')

        # Construire la requête
        query = db.collection('planning').where('company_id', '==', company_id)

        if start_date and end_date:
            query = query.where('date', '>=', start_date).where('date', '<=', end_date)

        if department and department != 'all':
            query = query.where('department', '==', department)

        if status and status != 'all':
            query = query.where('type', '==', status)

        # Exécuter la requête
        planning = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id

            # Récupérer les infos de l'employé
            if 'employee_id' in data:
                employee_doc = db.collection('employees').document(data['employee_id']).get()
                if employee_doc.exists:
                    emp_data = employee_doc.to_dict()
                    # Ajouter les deux formats pour compatibilité
                    data['employee_name'] = emp_data.get('candidate_name', 'Inconnu')
                    data['employeeName'] = emp_data.get('candidate_name', 'Inconnu')  # camelCase
                    data['position'] = emp_data.get('position', 'Non spécifié')

                    # Récupérer les infos du candidat
                    if 'candidate_id' in emp_data:
                        candidate_doc = db.collection('users').document(emp_data['candidate_id']).get()
                        if candidate_doc.exists:
                            candidate_data = candidate_doc.to_dict()
                            data['profile_image_url'] = candidate_data.get('profileImageUrl', '')

            # Ajouter les formats alternatifs pour compatibilité
            if 'start_time' in data:
                data['startTime'] = data['start_time']
            if 'end_time' in data:
                data['endTime'] = data['end_time']

            planning.append(data)

        # Filtrer par recherche si spécifié
        if search:
            search_lower = search.lower()
            planning = [
                p for p in planning
                if search_lower in p.get('employee_name', '').lower()
                   or search_lower in p.get('position', '').lower()
                   or search_lower in p.get('department', '').lower()
                   or search_lower in p.get('notes', '').lower()
            ]

        # Trier par date
        planning.sort(key=lambda x: (x.get('date', ''), x.get('start_time', '')))

        return jsonify({
            'success': True,
            'planning': planning
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération du planning: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/', methods=['POST'])
@company_required
def create_shift():
    """Créer un nouveau shift"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Validation des données
        required_fields = ['employee_id', 'date', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Champ manquant: {field}'}), 400

        # Vérifier que l'employé existe et appartient à l'entreprise
        employee_doc = db.collection('employees').document(data['employee_id']).get()
        if not employee_doc.exists:
            return jsonify({'success': False, 'error': 'Employé non trouvé'}), 404

        employee_data = employee_doc.to_dict()
        if employee_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Vérifier les conflits d'horaire
        conflicts = db.collection('planning') \
            .where('company_id', '==', company_id) \
            .where('employee_id', '==', data['employee_id']) \
            .where('date', '==', data['date']) \
            .stream()

        for conflict in conflicts:
            conflict_data = conflict.to_dict()
            # Vérifier le chevauchement des horaires
            conflict_start = conflict_data['start_time']
            conflict_end = conflict_data['end_time']
            new_start = data['start_time']
            new_end = data['end_time']

            if (new_start < conflict_end and new_end > conflict_start):
                return jsonify({
                    'success': False,
                    'error': f"Conflit d'horaire avec le shift {conflict.id}: {conflict_start}-{conflict_end}"
                }), 400

        # Créer le document
        shift_data = {
            'company_id': company_id,
            'employee_id': data['employee_id'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'type': data.get('type', 'work'),
            'department': data.get('department', employee_data.get('department', '')),
            'notes': data.get('notes', ''),
            'created_at': datetime.datetime.now(),
            'updated_at': datetime.datetime.now()
        }

        # Sauvegarder dans Firestore
        doc_ref = db.collection('planning').add(shift_data)

        return jsonify({
            'success': True,
            'message': 'Shift créé avec succès',
            'shift_id': doc_ref[1].id
        })

    except Exception as e:
        logger.error(f"Erreur lors de la création du shift: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/<shift_id>', methods=['PUT'])
@company_required
def update_shift(shift_id):
    """Mettre à jour un shift"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Vérifier que le shift appartient à l'entreprise
        shift_doc = db.collection('planning').document(shift_id).get()
        if not shift_doc.exists:
            return jsonify({'success': False, 'error': 'Shift non trouvé'}), 404

        shift_data = shift_doc.to_dict()
        if shift_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Préparer les données de mise à jour
        update_data = {
            'updated_at': datetime.datetime.now()
        }

        # Champs pouvant être mis à jour
        updatable_fields = ['date', 'start_time', 'end_time', 'type', 'department', 'notes']

        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]

        # Vérifier les conflits si les horaires changent
        if 'date' in data or 'start_time' in data or 'end_time' in data:
            conflicts = db.collection('planning') \
                .where('company_id', '==', company_id) \
                .where('employee_id', '==', shift_data['employee_id']) \
                .where('date', '==', data.get('date', shift_data.get('date'))) \
                .stream()

            for conflict in conflicts:
                if conflict.id == shift_id:
                    continue

                conflict_data = conflict.to_dict()
                conflict_start = conflict_data['start_time']
                conflict_end = conflict_data['end_time']
                new_start = data.get('start_time', shift_data.get('start_time'))
                new_end = data.get('end_time', shift_data.get('end_time'))

                if (new_start < conflict_end and new_end > conflict_start):
                    return jsonify({
                        'success': False,
                        'error': f"Conflit d'horaire avec le shift {conflict.id}: {conflict_start}-{conflict_end}"
                    }), 400

        # Mettre à jour
        db.collection('planning').document(shift_id).update(update_data)

        return jsonify({
            'success': True,
            'message': 'Shift mis à jour avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du shift: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/<shift_id>', methods=['DELETE'])
@company_required
def delete_shift(shift_id):
    """Supprimer un shift"""
    try:
        company_id = session['uid']

        # Vérifier que le shift appartient à l'entreprise
        shift_doc = db.collection('planning').document(shift_id).get()
        if not shift_doc.exists:
            return jsonify({'success': False, 'error': 'Shift non trouvé'}), 404

        shift_data = shift_doc.to_dict()
        if shift_data.get('company_id') != company_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403

        # Supprimer le shift
        db.collection('planning').document(shift_id).delete()

        return jsonify({
            'success': True,
            'message': 'Shift supprimé avec succès'
        })

    except Exception as e:
        logger.error(f"Erreur lors de la suppression du shift: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/stats', methods=['GET'])
@company_required
def get_planning_stats():
    """Récupérer les statistiques du planning"""
    try:
        company_id = session['uid']

        # Récupérer tout le planning
        planning_ref = db.collection('planning').where('company_id', '==', company_id)
        planning = []
        for doc in planning_ref.stream():
            data = doc.to_dict()
            planning.append(data)

        # Récupérer les employés
        employees_ref = db.collection('employees').where('company_id', '==', company_id)
        employees = []
        for doc in employees_ref.stream():
            employees.append(doc.id)

        # Calculer les statistiques
        stats = {
            'total_shifts': len(planning),
            'total_employees': len(employees),
            'by_type': {},
            'by_department': {},
            'by_day': {},
            'total_hours': 0,
            'average_hours_per_employee': 0
        }

        # Calculer les heures par employé
        hours_by_employee = {}

        for shift in planning:
            # Par type
            shift_type = shift.get('type', 'unknown')
            stats['by_type'][shift_type] = stats['by_type'].get(shift_type, 0) + 1

            # Par département
            department = shift.get('department', 'unknown')
            stats['by_department'][department] = stats['by_department'].get(department, 0) + 1

            # Par jour
            day = shift.get('date', 'unknown')
            stats['by_day'][day] = stats['by_day'].get(day, 0) + 1

            # Calculer les heures
            try:
                start = datetime.datetime.strptime(shift.get('start_time', '00:00'), '%H:%M')
                end = datetime.datetime.strptime(shift.get('end_time', '00:00'), '%H:%M')
                hours = (end - start).seconds / 3600
                stats['total_hours'] += hours

                employee_id = shift.get('employee_id')
                if employee_id:
                    hours_by_employee[employee_id] = hours_by_employee.get(employee_id, 0) + hours
            except:
                pass

        # Calculer la moyenne
        if hours_by_employee:
            stats['average_hours_per_employee'] = sum(hours_by_employee.values()) / len(hours_by_employee)

        return jsonify({
            'success': True,
            'stats': stats
        })

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@planning_bp.route('/optimize', methods=['POST'])
@company_required
def optimize_planning():
    """Générer un planning optimisé avec IA"""
    try:
        company_id = session['uid']
        data = request.get_json()

        # Récupérer les employés avec leurs contraintes
        employees_ref = db.collection('employees').where('company_id', '==', company_id)
        employees = []
        for doc in employees_ref.stream():
            emp_data = doc.to_dict()
            emp_data['id'] = doc.id

            # Récupérer les compétences et disponibilités
            if 'candidate_id' in emp_data:
                candidate_doc = db.collection('users').document(emp_data['candidate_id']).get()
                if candidate_doc.exists:
                    candidate_data = candidate_doc.to_dict()
                    emp_data['skills'] = candidate_data.get('skills', [])

            employees.append(emp_data)

        # Récupérer le gestionnaire IA
        ai_manager = get_ai_manager('planning')

        # Générer le planning optimisé
        optimization_params = {
            'employees': employees,
            'constraints': data.get('constraints', {})
        }

        optimized_planning = ai_manager.generate_optimal_planning(**optimization_params)

        return jsonify({
            'success': True,
            'planning': optimized_planning.get('planning', []),
            'recommendations': optimized_planning.get('recommendations', []),
            'statistics': optimized_planning.get('statistics', {})
        })

    except Exception as e:
        logger.error(f"Erreur lors de l'optimisation du planning: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500