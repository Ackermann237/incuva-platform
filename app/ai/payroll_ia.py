# backend/app/ai/payroll_ia.py
import logging
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)


class PayrollAIManager:
    """Gestionnaire IA pour les fonctionnalités de paie"""

    def __init__(self, ai_client):
        self.ai_client = ai_client

    def analyze_payroll_trends(self, payroll_data):
        """Analyser les tendances de la paie avec accès à tous les bulletins"""
        try:
            # Extraire les données des bulletins
            all_payslips = payroll_data.get('all_payslips', [])
            total_payslips = len(all_payslips)

            # Calculer des statistiques détaillées
            status_counts = {}
            total_gross = 0
            total_net = 0
            monthly_data = {}

            for payslip in all_payslips:
                status = payslip.get('status', 'draft')
                status_counts[status] = status_counts.get(status, 0) + 1

                total_gross += payslip.get('gross_salary', 0)
                total_net += payslip.get('net_salary', 0)

                # Grouper par mois
                if 'period_end' in payslip:
                    try:
                        if hasattr(payslip['period_end'], 'strftime'):
                            month = payslip['period_end'].strftime('%Y-%m')
                        else:
                            month = payslip['period_end'][:7] if payslip['period_end'] else 'Unknown'

                        if month not in monthly_data:
                            monthly_data[month] = {
                                'gross_salary': 0,
                                'net_salary': 0,
                                'count': 0,
                                'employees': set()
                            }

                        monthly_data[month]['gross_salary'] += payslip.get('gross_salary', 0)
                        monthly_data[month]['net_salary'] += payslip.get('net_salary', 0)
                        monthly_data[month]['count'] += 1
                        if 'employee_name' in payslip:
                            monthly_data[month]['employees'].add(payslip['employee_name'])
                    except:
                        pass

            # Construire un prompt plus détaillé
            prompt = f"""
            Analyse détaillée des données de paie de l'entreprise :

            STATISTIQUES GLOBALES :
            - Nombre total de bulletins analysés : {total_payslips}
            - Salaires bruts cumulés : {total_gross:,.2f}€
            - Salaires nets cumulés : {total_net:,.2f}€
            - Différence totale (cotisations + taxes) : {total_gross - total_net:,.2f}€

            RÉPARTITION PAR STATUT :
            {json.dumps(status_counts, indent=2, ensure_ascii=False)}

            DONNÉES MENSUELLES (3 derniers mois) :
            {self._format_monthly_data(monthly_data)}

            LISTE COMPLÈTE DES BULLETINS DISPONIBLES :
            {self._format_payslips_list(all_payslips[:20])}  # Limité aux 20 premiers pour le prompt

            QUESTIONS D'ANALYSE :
            1. Fournis un résumé exécutif des tendances de paie
            2. Identifie les anomalies ou incohérences dans les bulletins
            3. Recommande des optimisations pour réduire les coûts de paie
            4. Détecte les risques potentiels (conformité, sureffectif, etc.)
            5. Propose des projections pour les 3 prochains mois
            6. Analyse l'équité salariale entre les employés
            7. Suggère des améliorations pour la gestion de la paie

            Format de réponse :
            - Sois précis et basé uniquement sur les données fournies
            - Utilise des chiffres concrets quand c'est possible
            - Structure ta réponse en sections claires
            - Propose des actions concrètes et réalisables
            """

            response = self.ai_client.generate_response(prompt)

            return {
                'success': True,
                'analysis': {
                    'summary': self._extract_summary(response),
                    'trends': self._extract_trends(response),
                    'recommendations': self._extract_recommendations(response),
                    'alerts': self._extract_alerts(response),
                    'projections': self._extract_projections(response),
                    'details': self._extract_details(response)
                }
            }

        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des tendances de paie: {str(e)}")
            return {'success': False, 'error': str(e)}



    def predict_payroll_costs(self, historical_data, months_ahead=3):
        """Prédire les coûts de paie futurs"""
        try:
            prompt = f"""
            Basé sur les données historiques de paie, prédisez les coûts pour les {months_ahead} prochains mois.

            Données historiques :
            {json.dumps(historical_data, indent=2)}

            Fournissez :
            1. Des prévisions mensuelles
            2. Les facteurs de croissance/inflation à considérer
            3. Les risques potentiels
            4. Les recommandations budgétaires
            """

            response = self.ai_client.generate_response(prompt)

            return {
                'success': True,
                'predictions': self._parse_predictions(response, months_ahead)
            }

        except Exception as e:
            logger.error(f"Erreur lors de la prédiction des coûts: {str(e)}")
            return {'success': False, 'error': str(e)}

    def optimize_salary_structure(self, employees_data):
        """Optimiser la structure salariale"""
        try:
            prompt = f"""
            Analyse la structure salariale suivante et propose des optimisations :

            Données des employés :
            {json.dumps(employees_data, indent=2)}

            Considérations :
            - Équité salariale
            - Rétention des talents
            - Budget de l'entreprise
            - Marché du travail
            - Performances individuelles

            Propose :
            1. Des ajustements salariaux recommandés
            2. Une grille salariale optimisée
            3. Des politiques d'augmentation
            4. Des indicateurs de suivi
            """

            response = self.ai_client.generate_response(prompt)

            return {
                'success': True,
                'optimization': self._parse_optimization_suggestions(response)
            }

        except Exception as e:
            logger.error(f"Erreur lors de l'optimisation salariale: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _format_monthly_data(self, monthly_data):
        """Formate les données mensuelles pour le prompt"""
        sorted_months = sorted(monthly_data.keys(), reverse=True)[:3]  # 3 derniers mois
        result = []

        for month in sorted_months:
            data = monthly_data[month]
            result.append(f"  - {month}:")
            result.append(f"    * Nombre de bulletins: {data['count']}")
            result.append(f"    * Salaire brut total: {data['gross_salary']:,.2f}€")
            result.append(f"    * Salaire net total: {data['net_salary']:,.2f}€")
            result.append(f"    * Nombre d'employés: {len(data['employees'])}")

        return '\n'.join(result) if result else "Aucune donnée mensuelle disponible"

    def _format_payslips_list(self, payslips):
        """Formate la liste des bulletins pour le prompt"""
        result = []
        for i, payslip in enumerate(payslips[:10], 1):  # Limité aux 10 premiers
            result.append(f"  {i}. {payslip.get('employee_name', 'Inconnu')}")
            result.append(f"     Période: {payslip.get('period_start', '?')} à {payslip.get('period_end', '?')}")
            result.append(
                f"     Brut: {payslip.get('gross_salary', 0):,.2f}€ | Net: {payslip.get('net_salary', 0):,.2f}€")
            result.append(f"     Statut: {payslip.get('status', 'inconnu')}")
            result.append("")

        return '\n'.join(result)

    def _extract_details(self, text):
        """Extrait les détails spécifiques"""
        details = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['détail', 'spécifique', 'bulletin', 'employé']):
                details.append(line.strip())
        return details

    def detect_anomalies(self, payslips_data):
        """Détecter les anomalies dans les bulletins de paie"""
        try:
            prompt = f"""
            Analyse les bulletins de paie suivants et détecte les anomalies :

            Données des bulletins :
            {json.dumps(payslips_data, indent=2)}

            Recherche :
            1. Salaire anormalement élevé/bas
            2. Heures supplémentaires suspectes
            3. Incohérences dans les cotisations
            4. Doublons potentiels
            5. Erreurs de calcul
            """

            response = self.ai_client.generate_response(prompt)

            return {
                'success': True,
                'anomalies': self._parse_anomalies(response)
            }

        except Exception as e:
            logger.error(f"Erreur lors de la détection d'anomalies: {str(e)}")
            return {'success': False, 'error': str(e)}

    def generate_payroll_report(self, payroll_data):
        """Générer un rapport de paie automatisé"""
        try:
            current_date = datetime.now().strftime("%d/%m/%Y")

            prompt = f"""
            Génère un rapport professionnel de paie pour la période en cours.

            Date : {current_date}
            Données : {json.dumps(payroll_data, indent=2)}

            Structure du rapport :
            1. Résumé exécutif
            2. Analyse des coûts
            3. Tendances principales
            4. Points d'attention
            5. Recommandations stratégiques
            6. Annexes statistiques

            Format : Professionnel, concis, axé sur l'action.
            """

            response = self.ai_client.generate_response(prompt)

            return {
                'success': True,
                'report': response
            }

        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _extract_summary(self, text):
        """Extraire le résumé de la réponse IA"""
        # Implémentation simplifiée - à améliorer avec du NLP
        lines = text.split('\n')
        summary_lines = []
        for line in lines:
            if 'résumé' in line.lower() or 'synthèse' in line.lower():
                summary_lines.append(line)
        return '\n'.join(summary_lines) if summary_lines else text[:500]

    def _extract_trends(self, text):
        """Extraire les tendances"""
        trends = []
        lines = text.split('\n')
        for line in lines:
            if 'tendance' in line.lower() or 'évolution' in line.lower():
                trends.append(line.strip())
        return trends

    def _extract_recommendations(self, text):
        """Extraire les recommandations"""
        recommendations = []
        lines = text.split('\n')
        for line in lines:
            if 'recommandation' in line.lower() or 'suggestion' in line.lower() or 'conseil' in line.lower():
                recommendations.append(line.strip())
        return recommendations

    def _extract_alerts(self, text):
        """Extraire les alertes"""
        alerts = []
        lines = text.split('\n')
        for line in lines:
            if 'alerte' in line.lower() or 'attention' in line.lower() or 'risque' in line.lower():
                alerts.append(line.strip())
        return alerts

    def _extract_projections(self, text):
        """Extraire les projections"""
        projections = []
        lines = text.split('\n')
        for line in lines:
            if 'projection' in line.lower() or 'prévision' in line.lower() or 'estimation' in line.lower():
                projections.append(line.strip())
        return projections

    def _parse_predictions(self, text, months_ahead):
        """Parser les prédictions"""
        predictions = {}
        lines = text.split('\n')
        for i, line in enumerate(lines):
            for month in range(1, months_ahead + 1):
                if f'mois {month}' in line.lower() or f'mois+{month}' in line.lower():
                    try:
                        # Essayer d'extraire les nombres
                        import re
                        numbers = re.findall(r'\d+[\.,]?\d*', line)
                        if numbers:
                            predictions[f'month_{month}'] = float(numbers[0].replace(',', '.'))
                    except:
                        pass
        return predictions

    def _parse_optimization_suggestions(self, text):
        """Parser les suggestions d'optimisation"""
        suggestions = {
            'salary_adjustments': [],
            'salary_grid': [],
            'policies': [],
            'metrics': []
        }

        lines = text.split('\n')
        current_section = None

        for line in lines:
            line_lower = line.lower()
            if 'ajustement' in line_lower or 'augmentation' in line_lower:
                current_section = 'salary_adjustments'
            elif 'grille' in line_lower:
                current_section = 'salary_grid'
            elif 'politique' in line_lower or 'règle' in line_lower:
                current_section = 'policies'
            elif 'indicateur' in line_lower or 'métrique' in line_lower or 'kpi' in line_lower:
                current_section = 'metrics'

            if current_section and line.strip() and not line.startswith('- ') and ':' in line:
                suggestions[current_section].append(line.strip())

        return suggestions

    def _parse_anomalies(self, text):
        """Parser les anomalies détectées"""
        anomalies = []
        lines = text.split('\n')
        for line in lines:
            if 'anomalie' in line.lower() or 'suspect' in line.lower() or 'incohérence' in line.lower() or 'erreur' in line.lower():
                anomalies.append({
                    'description': line.strip(),
                    'severity': 'medium',  # À déterminer par analyse de sentiment
                    'action_required': True
                })
        return anomalies

    def answer_payroll_question(self, question, context):
        """Répondre à une question spécifique sur la paie"""
        try:
            prompt = f"""
            En tant qu'expert en paie, réponds à cette question en te basant sur les données disponibles.

            QUESTION DE L'UTILISATEUR :
            "{question}"

            CONTEXTE DES DONNÉES :
            - Nombre total de bulletins récents : {context.get('recent_payslips_count', 0)}
            - Résumé des bulletins : {json.dumps(context.get('recent_payslips_summary', {}), indent=2)}
            - Contexte utilisateur : {json.dumps(context.get('user_context', {}), indent=2)}

            INSTRUCTIONS :
            1. Réponds de manière précise et professionnelle
            2. Si tu ne sais pas, dis-le clairement
            3. Reste dans le contexte de la paie et des données fournies
            4. Propose des actions concrètes quand c'est pertinent
            5. Sois concis mais complet

            FORMAT DE RÉPONSE :
            - Une réponse directe à la question
            - Des données spécifiques si disponibles
            - Des recommandations pratiques
            - Des étapes d'action si nécessaire
            """

            response = self.ai_client.generate_response(prompt)
            return self._clean_response(response)

        except Exception as e:
            logger.error(f"Erreur réponse question paie: {str(e)}")
            return "Je ne peux pas répondre à cette question pour le moment. Veuillez réessayer."

    def _clean_response(self, text):
        """Nettoie la réponse de l'IA"""
        # Supprimer les marqueurs de rôle
        text = text.replace("Assistant:", "").replace("assistant:", "").strip()
        # Supprimer les guillemets inutiles
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]
        return text
