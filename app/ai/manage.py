# backend/app/ai/manage.py
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from flask import current_app
import requests
from ..firebase.init_firebase import db
from .payroll_ia import PayrollAIManager


logger = logging.getLogger(__name__)

class HFChatClient:
    def __init__(self):
        self.api_key = None

    def _get_api_key(self):
        if not self.api_key:
            self.api_key = current_app.config.get("HUGGINGFACE_API_KEY")
        return self.api_key

    def generate_response(self, prompt: str) -> str:
        api_key = self._get_api_key()
        if not api_key:
            raise Exception("Clé API Hugging Face non configurée")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {"role": "system", "content": "Tu es un expert RH/Paie. Réponds de manière structurée et exploitable."},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 1500,
            "temperature": 0.6,
            "top_p": 0.9,
        }

        resp = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if resp.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {resp.text}")

        result = resp.json()
        return result.get("choices", [{}])[0].get("message", {}).get("content", "")

class PlanningAIManager:
    """Gestionnaire IA pour l'optimisation du planning"""

    def __init__(self):
        self.api_key = None

    def _get_api_key(self):
        if not self.api_key:
            self.api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        return self.api_key

    def generate_optimal_planning(self, employees: List[Dict], constraints: Dict) -> Dict:
        """
        Génère un planning optimisé avec IA

        Args:
            employees: Liste des employés avec leurs contraintes
            constraints: Contraintes de l'entreprise

        Returns:
            Dict: Planning optimisé
        """
        try:
            if not self._get_api_key:
                raise Exception("Clé API Hugging Face non configurée")

            # Préparer le prompt
            prompt = self._build_planning_prompt(employees, constraints)

            # Appeler l'IA
            planning_data = self._call_planning_ai(prompt)

            # Valider et structurer les données
            validated_planning = self._validate_planning(planning_data, employees, constraints)

            logger.info("Planning optimisé généré avec succès")
            return validated_planning

        except Exception as e:
            logger.error(f"Erreur lors de la génération du planning IA: {str(e)}")
            raise

    def _build_planning_prompt(self, employees: List[Dict], constraints: Dict) -> str:
        """Construit le prompt pour l'IA"""

        employees_info = ""
        for i, emp in enumerate(employees):
            employees_info += f"""
            Employé {i + 1}:
            - Nom: {emp.get('name', 'Inconnu')}
            - Poste: {emp.get('position', 'Non spécifié')}
            - Département: {emp.get('department', 'Non spécifié')}
            - Contrat: {emp.get('contract_type', 'CDI')}
            - Heures/semaine: {emp.get('weekly_hours', 35)}
            - Compétences: {', '.join(emp.get('skills', []))}
            - Disponibilités: {emp.get('availability', 'Lun-Ven 9h-18h')}
            - Contraintes: {emp.get('constraints', 'Aucune')}
            """

        prompt = f"""
        En tant que spécialiste en optimisation de planning, génère un planning optimal pour la semaine prochaine.

        CONTEXTE ENTREPRISE:
        - Jours de travail: Lundi à Vendredi
        - Heures d'ouverture: 8h-20h
        - Contraintes légales: 35h/semaine max par défaut

        CONTRAINTES:
        {constraints.get('description', 'Aucune contrainte spécifique')}

        EMPLOYÉS:
        {employees_info}

        RÉQUIS PAR PÉRIODE:
        - Lundi: {constraints.get('required_staff', {}).get('lundi', 'Non spécifié')}
        - Mardi: {constraints.get('required_staff', {}).get('mardi', 'Non spécifié')}
        - Mercredi: {constraints.get('required_staff', {}).get('mercredi', 'Non spécifié')}
        - Jeudi: {constraints.get('required_staff', {}).get('jeudi', 'Non spécifié')}
        - Vendredi: {constraints.get('required_staff', {}).get('vendredi', 'Non spécifié')}

        CRITÈRES D'OPTIMISATION (par ordre d'importance):
        1. Respecter les contraintes légales (heures max)
        2. Couvrir tous les créneaux requis
        3. Équilibrer la charge de travail
        4. Respecter les préférences des employés
        5. Minimiser les heures supplémentaires
        6. Regrouper les compétences par créneau

        Fournis la réponse au format JSON suivant:
        {{
            "planning": [
                {{
                    "employee_id": "ID",
                    "employee_name": "Nom",
                    "day": "YYYY-MM-DD",
                    "start_time": "HH:MM",
                    "end_time": "HH:MM",
                    "type": "work|overtime|training",
                    "department": "Département",
                    "notes": "Notes éventuelles"
                }}
            ],
            "statistics": {{
                "total_hours": 0,
                "average_hours_per_employee": 0,
                "coverage_rate": 0,
                "overtime_hours": 0
            }},
            "recommendations": [
                "Recommandation 1",
                "Recommandation 2"
            ]
        }}
        """

        return prompt

    def _call_planning_ai(self, prompt: str) -> Dict:
        """Appelle l'API IA pour générer le planning"""

        headers = {
            "Authorization": f"Bearer {self._get_api_key()}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {
                    "role": "system",
                    "content": """Tu es un expert en optimisation de planning RH.
                    Tu génères des plannings optimisés en respectant toutes les contraintes.
                    Tu fournis toujours la réponse en JSON valide."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.5,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Extraire le JSON de la réponse
        import json
        import re

        # Chercher du JSON dans la réponse
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                logger.warning("JSON invalide dans la réponse IA, tentative de nettoyage...")

        # Si pas de JSON valide, essayer de parser la réponse
        try:
            # Tentative de parsing manuel
            return self._parse_text_response(content)
        except Exception as e:
            logger.error(f"Impossible de parser la réponse IA: {str(e)}")
            raise Exception("Réponse IA invalide")

    def _validate_planning(self, planning_data: Dict, employees: List[Dict], constraints: Dict) -> Dict:
        """Valide et nettoie le planning généré par l'IA"""

        validated_planning = {
            "planning": [],
            "statistics": planning_data.get("statistics", {}),
            "recommendations": planning_data.get("recommendations", []),
            "warnings": []
        }

        # Valider chaque shift
        for shift in planning_data.get("planning", []):
            if self._is_valid_shift(shift, employees):
                # Normaliser les données
                normalized_shift = {
                    "employee_id": shift.get("employee_id", ""),
                    "employee_name": shift.get("employee_name", ""),
                    "day": shift.get("day", ""),
                    "start_time": shift.get("start_time", "09:00"),
                    "end_time": shift.get("end_time", "17:00"),
                    "type": shift.get("type", "work"),
                    "department": shift.get("department", ""),
                    "notes": shift.get("notes", "")
                }
                validated_planning["planning"].append(normalized_shift)
            else:
                validated_planning["warnings"].append(f"Shift invalide ignoré: {shift}")

        # Calculer les statistiques réelles
        validated_planning["statistics"] = self._calculate_real_statistics(
            validated_planning["planning"], employees
        )

        return validated_planning

    def _is_valid_shift(self, shift: Dict, employees: List[Dict]) -> bool:
        """Vérifie si un shift est valide"""
        required_fields = ["employee_id", "day", "start_time", "end_time"]

        for field in required_fields:
            if not shift.get(field):
                return False

        # Vérifier que l'employé existe
        employee_exists = any(
            emp.get("id") == shift["employee_id"] for emp in employees
        )

        if not employee_exists:
            return False

        # Vérifier le format de la date
        try:
            datetime.strptime(shift["day"], "%Y-%m-%d")
            datetime.strptime(shift["start_time"], "%H:%M")
            datetime.strptime(shift["end_time"], "%H:%M")
        except ValueError:
            return False

        return True

    def _calculate_real_statistics(self, planning: List[Dict], employees: List[Dict]) -> Dict:
        """Calcule les statistiques réelles du planning"""

        stats = {
            "total_shifts": len(planning),
            "total_hours": 0,
            "average_hours_per_employee": 0,
            "coverage_rate": 0,
            "overtime_hours": 0,
            "employees_count": len(employees)
        }

        # Calculer les heures par employé
        hours_by_employee = {}
        for shift in planning:
            employee_id = shift["employee_id"]
            start = datetime.strptime(shift["start_time"], "%H:%M")
            end = datetime.strptime(shift["end_time"], "%H:%M")
            hours = (end - start).seconds / 3600

            stats["total_hours"] += hours
            hours_by_employee[employee_id] = hours_by_employee.get(employee_id, 0) + hours

            if shift.get("type") == "overtime":
                stats["overtime_hours"] += hours

        # Calculer la moyenne
        if hours_by_employee:
            stats["average_hours_per_employee"] = sum(hours_by_employee.values()) / len(hours_by_employee)

        return stats

    def _parse_text_response(self, text: str) -> Dict:
        """Parse une réponse texte en JSON structuré"""
        # Implémentation basique pour parser du texte en JSON
        lines = text.strip().split('\n')
        planning = []

        for line in lines:
            if ':' in line and '->' in line:
                parts = line.split('->')
                if len(parts) == 2:
                    time_info = parts[0].strip()
                    employee_info = parts[1].strip()

                    # Extraire les informations (simplifié)
                    shift = {
                        "employee_name": employee_info,
                        "day": "2024-01-01",  # Date par défaut
                        "start_time": "09:00",
                        "end_time": "17:00",
                        "type": "work"
                    }
                    planning.append(shift)

        return {
            "planning": planning,
            "statistics": {},
            "recommendations": []
        }


class AbsenceAIManager:
    """Gestionnaire IA pour l'analyse des absences"""

    def __init__(self):
        self.api_key = None

    def _get_api_key(self):
        if not self.api_key:
            self.api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        return self.api_key

    def analyze_absence_patterns(self, absences_data: List[Dict]) -> Dict:
        """
        Analyse les patterns d'absences avec IA

        Args:
            absences_data: Données d'absences historiques

        Returns:
            Dict: Analyse et recommandations
        """
        try:
            if not self._get_api_key:
                raise Exception("Clé API Hugging Face non configurée")

            # Préparer le prompt
            prompt = self._build_absence_prompt(absences_data)

            # Appeler l'IA
            analysis = self._call_absence_ai(prompt)

            logger.info("Analyse des absences générée avec succès")
            return analysis

        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des absences IA: {str(e)}")
            raise

    def predict_absence_risks(self, employees: List[Dict], historical_data: Dict) -> List[Dict]:
        """
        Prédit les risques d'absences futurs

        Args:
            employees: Liste des employés
            historical_data: Données historiques

        Returns:
            List: Prédictions de risque
        """
        try:
            prompt = self._build_risk_prediction_prompt(employees, historical_data)
            predictions = self._call_risk_prediction_ai(prompt)

            return predictions

        except Exception as e:
            logger.error(f"Erreur lors de la prédiction des risques IA: {str(e)}")
            return []

    def _build_absence_prompt(self, absences_data: List[Dict]) -> str:
        """Construit le prompt pour l'analyse des absences"""

        # Résumer les données
        summary = {
            "total_absences": len(absences_data),
            "by_type": {},
            "by_month": {},
            "by_department": {},
            "frequent_absences": []
        }

        for absence in absences_data:
            # Par type
            absence_type = absence.get("type", "unknown")
            summary["by_type"][absence_type] = summary["by_type"].get(absence_type, 0) + 1

            # Par mois
            if "start_date" in absence:
                try:
                    month = datetime.strptime(absence["start_date"], "%Y-%m-%d").strftime("%Y-%m")
                    summary["by_month"][month] = summary["by_month"].get(month, 0) + 1
                except:
                    pass

            # Par département
            department = absence.get("department", "unknown")
            summary["by_department"][department] = summary["by_department"].get(department, 0) + 1

        prompt = f"""
        En tant qu'analyste RH spécialisé, analyse ces données d'absences et fournis des insights.

        DONNÉES D'ABSENCES:
        Total: {summary['total_absences']} absences

        Répartition par type:
        {self._dict_to_str(summary['by_type'])}

        Répartition par mois:
        {self._dict_to_str(summary['by_month'])}

        Répartition par département:
        {self._dict_to_str(summary['by_department'])}

        QUESTIONS D'ANALYSE:
        1. Quels sont les patterns dominants d'absences ?
        2. Y a-t-il des saisonnalités observables ?
        3. Quels départements ont les taux d'absence les plus élevés ?
        4. Quels types d'absences sont les plus fréquents ?
        5. Recommandations pour réduire les absences.
        6. Alertes à surveiller.

        Fournis la réponse au format JSON:
        {{
            "patterns": [
                {{"pattern": "Description", "confidence": 0.9, "impact": "high|medium|low"}}
            ],
            "seasonality": [
                {{"month": "Janvier", "rate": 0.15, "reason": "Raison possible"}}
            ],
            "department_analysis": [
                {{"department": "Ventes", "absence_rate": 0.12, "recommendation": "Recommandation"}}
            ],
            "risk_factors": [
                {{"factor": "Facteur de risque", "employees_affected": 5, "mitigation": "Action corrective"}}
            ],
            "recommendations": [
                {{"priority": "high|medium|low", "action": "Action", "expected_impact": "Impact attendu"}}
            ],
            "alerts": [
                {{"type": "warning|critical|info", "message": "Message d'alerte"}}
            ]
        }}
        """

        return prompt

    def _build_risk_prediction_prompt(self, employees: List[Dict], historical_data: Dict) -> str:
        """Construit le prompt pour la prédiction des risques"""

        employees_info = ""
        for emp in employees[:10]:  # Limiter aux 10 premiers pour éviter des prompts trop longs
            employees_info += f"""
            - {emp.get('name')} ({emp.get('position')}):
              * Ancienneté: {emp.get('seniority', 0)} mois
              * Dernière absence: {emp.get('last_absence', 'Jamais')}
              * Nombre d'absences/an: {emp.get('absence_count', 0)}
              * Stress level: {emp.get('stress_level', 'medium')}
              * Satisfaction: {emp.get('satisfaction', 7)}/10
            """

        prompt = f"""
        Prédit les risques d'absences pour les prochains 3 mois.

        EMPLOYÉS À ANALYSER:
        {employees_info}

        DONNÉES HISTORIQUES:
        - Taux d'absence moyen: {historical_data.get('average_rate', 0)}%
        - Saisonnalité: {historical_data.get('seasonality', 'Non spécifié')}
        - Facteurs influents: {historical_data.get('factors', 'Non spécifié')}

        Pour chaque employé, prédit:
        1. Probabilité d'absence dans les 3 prochains mois (0-100%)
        2. Type d'absence probable
        3. Durée probable
        4. Facteurs de risque
        5. Actions préventives recommandées

        Format de réponse JSON:
        {{
            "predictions": [
                {{
                    "employee_id": "ID",
                    "employee_name": "Nom",
                    "risk_level": "low|medium|high|critical",
                    "probability": 0.65,
                    "likely_type": "vacation|sick|other",
                    "likely_duration_days": 3,
                    "risk_factors": ["Facteur 1", "Facteur 2"],
                    "preventive_actions": ["Action 1", "Action 2"]
                }}
            ],
            "overall_risk": "low|medium|high",
            "high_risk_employees": ["Nom1", "Nom2"],
            "recommended_company_actions": [
                {{"action": "Action", "priority": "high|medium|low"}}
            ]
        }}
        """

        return prompt

    def _call_absence_ai(self, prompt: str) -> Dict:
        """Appelle l'API IA pour l'analyse des absences"""

        headers = {
            "Authorization": f"Bearer {self._get_api_key()}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {
                    "role": "system",
                    "content": """Tu es un analyste RH expert en gestion des absences.
                    Tu identifies les patterns, risques et recommandations.
                    Tu fournis toujours des analyses structurées en JSON."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 1500,
            "temperature": 0.6,
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Parser le JSON
        import json
        import re

        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                logger.warning("JSON invalide dans la réponse IA")

        # Retourner une structure vide en cas d'erreur
        return {
            "patterns": [],
            "recommendations": [],
            "alerts": []
        }

    def _call_risk_prediction_ai(self, prompt: str) -> Dict:
        """Appelle l'API IA pour la prédiction des risques"""
        return self._call_absence_ai(prompt)  # Même méthode pour l'instant

    def _dict_to_str(self, data: Dict) -> str:
        """Convertit un dict en string lisible"""
        return "\n".join([f"  - {k}: {v}" for k, v in data.items()])


class WorkloadOptimizer:
    """Optimiseur de charge de travail avec IA"""

    def optimize_workload_distribution(self, employees: List[Dict], current_workload: Dict) -> Dict:
        """
        Optimise la distribution de la charge de travail

        Args:
            employees: Liste des employés
            current_workload: Charge actuelle

        Returns:
            Dict: Plan d'optimisation
        """
        try:
            # Préparer les données
            employees_data = []
            for emp in employees:
                emp_data = {
                    "id": emp.get("id"),
                    "name": emp.get("name"),
                    "position": emp.get("position"),
                    "skills": emp.get("skills", []),
                    "current_workload": current_workload.get(emp.get("id"), {}).get("hours", 0),
                    "capacity": emp.get("weekly_capacity", 35),
                    "efficiency": emp.get("efficiency_score", 0.8)
                }
                employees_data.append(emp_data)

            # Appeler l'IA
            prompt = self._build_workload_prompt(employees_data)
            optimization = self._call_workload_ai(prompt)

            return optimization

        except Exception as e:
            logger.error(f"Erreur lors de l'optimisation de charge IA: {str(e)}")
            return {"error": str(e)}

    def _build_workload_prompt(self, employees_data: List[Dict]) -> str:
        """Construit le prompt pour l'optimisation de charge"""

        prompt = f"""
        Optimise la distribution de charge de travail entre {len(employees_data)} employés.

        DONNÉES EMPLOYÉS:
        """

        for emp in employees_data:
            prompt += f"""
            - {emp['name']} ({emp['position']}):
              * Charge actuelle: {emp['current_workload']}h/semaine
              * Capacité max: {emp['capacity']}h/semaine
              * Taux d'utilisation: {(emp['current_workload'] / emp['capacity'] * 100):.1f}%
              * Efficacité: {emp['efficiency']}
              * Compétences: {', '.join(emp['skills'][:5])}
            """

        prompt += """

        OBJECTIFS:
        1. Équilibrer la charge entre tous les employés
        2. Maximiser l'utilisation des compétences
        3. Rester sous la capacité maximale de chacun
        4. Minimiser la surcharge
        5. Préserver l'efficacité

        CONTRAINTES:
        - Charge totale à distribuer: Somme des charges actuelles
        - Aucun employé ne doit dépasser 90% de sa capacité
        - Respecter les affinités de compétences

        Fournis un plan de redistribution au format JSON:
        {
            "optimization_plan": [
                {
                    "employee_id": "ID",
                    "employee_name": "Nom",
                    "current_hours": 40,
                    "recommended_hours": 35,
                    "change": -5,
                    "new_utilization": 0.875,
                    "tasks_to_redistribute": [
                        {"task": "Nom tâche", "to_employee": "ID destinataire", "reason": "Raison"}
                    ],
                    "tasks_to_receive": [
                        {"task": "Nom tâche", "from_employee": "ID source", "reason": "Raison"}
                    ]
                }
            ],
            "overall_metrics": {
                "average_utilization": 0.0,
                "utilization_std_dev": 0.0,
                "overloaded_employees": 0,
                "underutilized_employees": 0,
                "efficiency_gain": 0.0
            },
            "implementation_steps": [
                {"step": 1, "action": "Action", "timeline": "1 semaine"}
            ]
        }
        """

        return prompt

    def _call_workload_ai(self, prompt: str) -> Dict:
        """Appelle l'API IA pour l'optimisation de charge"""

        api_key = current_app.config.get('HUGGINGFACE_API_KEY')
        if not api_key:
            raise Exception("Clé API Hugging Face non configurée")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct:novita",
            "messages": [
                {
                    "role": "system",
                    "content": """Tu es un expert en optimisation de charge de travail.
                    Tu équilibres parfaitement la charge entre les employés.
                    Tu fournis des plans réalisables et mesurables."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.4,  # Plus déterministe pour l'optimisation
            "top_p": 0.9
        }

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f"Erreur API Hugging Face: {response.text}")

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Parser le JSON
        import json
        import re

        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                logger.warning("JSON invalide dans la réponse IA")

        return {"error": "Réponse IA invalide"}


# Instances globales pour réutilisation
planning_ai = PlanningAIManager()
absence_ai = AbsenceAIManager()
workload_optimizer = WorkloadOptimizer()
hf_client = HFChatClient()
payroll_ai = PayrollAIManager(hf_client)


def get_ai_manager(manager_type: str):
    """
    Factory pour récupérer le gestionnaire IA approprié

    Args:
        manager_type: Type de manager ('planning', 'absence', 'workload')

    Returns:
        Object: Instance du manager IA
    """
    managers = {
        'planning': planning_ai,
        'absence': absence_ai,
        'workload': workload_optimizer,
        'payroll': payroll_ai,
    }

    return managers.get(manager_type, planning_ai)
