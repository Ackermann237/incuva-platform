# Fichier: contract_generator.py
import logging
from ..ai.copilote import generate_contract_content
from datetime import datetime

logger = logging.getLogger(__name__)


class ContractGenerator:
    def __init__(self):
        pass

    def generate_contract(self, position, salary, contract_type, company_name,
                          candidate_name, candidate_country=None, ai_mode="auto",
                          custom_prompt=None):
        """Generate a contract using different AI modes or manual input."""
        try:
            # Mode automatique IA
            if ai_mode == "auto":
                return self.generate_auto_contract(
                    position, salary, contract_type,
                    company_name, candidate_name, candidate_country
                )

            # Mode avec prompt personnalisé
            elif ai_mode == "prompt" and custom_prompt:
                return self.generate_custom_contract(custom_prompt, company_name,
                                                     candidate_name, candidate_country)

            # Mode manuel ou fallback
            else:
                return self.generate_fallback_contract(
                    position, salary, contract_type,
                    company_name, candidate_name, candidate_country
                )

        except Exception as e:
            logger.error(f"Erreur lors de la génération du contrat: {str(e)}")
            raise Exception(f"Erreur lors de la génération du contrat: {str(e)}")

    def generate_auto_contract(self, position, salary, contract_type,
                               company_name, candidate_name, candidate_country=None):
        """Generate contract automatically with AI based on legal requirements."""

        # Définir le contexte légal
        legal_context = ""
        if candidate_country and candidate_country != 'Non spécifié':
            legal_context = self.get_country_legal_context(candidate_country)
        else:
            legal_context = self.get_country_legal_context("France")

        # Prompt pour génération automatique
        prompt = f"""
        EN TANT QU'EXPERT JURIDIQUE, générez un contrat de travail COMPLET ET LÉGALEMENT VALIDE.

        CONTEXTE LÉGAL : {legal_context}

        INFORMATIONS DU CONTRAT :
        - Poste : {position}
        - Salaire annuel brut : {salary} €
        - Type de contrat : {contract_type}
        - Employeur : {company_name}
        - Employé(e) : {candidate_name}
        - Pays concerné : {candidate_country if candidate_country else 'France'}
        - Date de début : {datetime.now().strftime('%d/%m/%Y')}

        SECTIONS OBLIGATOIRES :
        1. PRÉAMBULE ET PARTIES
        2. OBJET ET DURÉE DU CONTRAT
        3. RÉMUNÉRATION ET AVANTAGES
        4. HORAIRES ET LIEU DE TRAVAIL
        5. PÉRIODE D'ESSAI
        6. CONGÉS ET ABSENCES
        7. OBLIGATIONS DES PARTIES
        8. CONFIDENTIALITÉ ET PROPRIÉTÉ INTELLECTUELLE
        9. CONDITIONS DE RÉSILIATION
        10. DISPOSITIONS GÉNÉRALES
        11. SIGNATURES

        EXIGENCES :
        - Langage juridique formel et précis
        - Conforme au droit du travail applicable
        - Clauses claires et non ambiguës
        - Mention des références légales importantes
        - Structure HTML avec balises appropriées (h2, h3, p, ul, li)

        Retourner uniquement le contenu HTML du contrat, sans explications supplémentaires.
        """

        # Appeler l'IA
        contract_content = generate_contract_content(prompt)

        # Structurer le résultat
        structured_content = f"""
        <div class="contract-container">
            <div class="contract-header">
                <h1>CONTRAT DE TRAVAIL</h1>
                <p class="subtitle">{position} | {contract_type} | {candidate_country if candidate_country else 'France'}</p>
            </div>

            <div class="contract-metadata">
                <div class="metadata-item">
                    <strong>Employeur :</strong> {company_name}
                </div>
                <div class="metadata-item">
                    <strong>Employé(e) :</strong> {candidate_name}
                </div>
                <div class="metadata-item">
                    <strong>Salaire :</strong> {salary} € brut annuel
                </div>
                <div class="metadata-item">
                    <strong>Date de début :</strong> {datetime.now().strftime('%d/%m/%Y')}
                </div>
            </div>

            <div class="legal-notice">
                <p><strong>⚠️ NOTICE LÉGALE :</strong> Ce contrat a été généré automatiquement selon les normes du droit du travail en vigueur. Consultation juridique recommandée avant signature.</p>
            </div>

            <div class="contract-body">
                {contract_content}
            </div>
        </div>
        """

        logger.info(f"Contrat auto-généré pour {position} (Pays: {candidate_country})")
        return structured_content

    def generate_custom_contract(self, custom_prompt, company_name,
                                 candidate_name, candidate_country=None):
        """Generate contract based on custom user prompt."""

        # Ajouter des informations de base au prompt personnalisé
        enhanced_prompt = f"""
        {custom_prompt}

        CONTEXTE SUPPLÉMENTAIRE :
        - Nom de l'entreprise : {company_name}
        - Nom du candidat : {candidate_name}
        - Pays concerné : {candidate_country if candidate_country else 'Non spécifié'}
        - Date actuelle : {datetime.now().strftime('%d/%m/%Y')}

        INSTRUCTIONS :
        - Générer un contrat de travail professionnel
        - Utiliser un langage juridique approprié
        - Structurer en HTML (h2, h3, p, ul, li)
        - Inclure toutes les mentions légales nécessaires
        - Adapter aux spécificités du pays si mentionné
        """

        # Appeler l'IA avec le prompt personnalisé
        contract_content = generate_contract_content(enhanced_prompt)

        # Structurer le résultat
        structured_content = f"""
        <div class="contract-container custom-generated">
            <div class="contract-header">
                <h1>CONTRAT DE TRAVAIL</h1>
                <p class="subtitle">Généré selon spécifications personnalisées</p>
            </div>

            <div class="generation-info">
                <p><strong>⚠️ NOTE :</strong> Ce contrat a été généré selon vos instructions spécifiques. Vérifiez attentivement la conformité légale.</p>
            </div>

            <div class="contract-body">
                {contract_content}
            </div>
        </div>
        """

        logger.info("Contrat généré avec prompt personnalisé")
        return structured_content

    def generate_fallback_contract(self, position, salary, contract_type,
                                   company_name, candidate_name, candidate_country=None):
        """Generate a basic fallback contract template."""

        return f"""
        <div class="contract-container fallback">
            <h1>CONTRAT DE TRAVAIL</h1>

            <div class="basic-info">
                <p><strong>Entre :</strong> {company_name}</p>
                <p><strong>Et :</strong> {candidate_name}</p>
                <p><strong>Pour le poste de :</strong> {position}</p>
                <p><strong>Avec un salaire de :</strong> {salary} € brut annuel</p>
                <p><strong>Type de contrat :</strong> {contract_type}</p>
                <p><strong>Date de début :</strong> {datetime.now().strftime('%d/%m/%Y')}</p>
            </div>

            <div class="notice">
                <p><em>Ce modèle de contrat nécessite une complétion manuelle des clauses spécifiques.</em></p>
            </div>
        </div>
        """

    def get_country_legal_context(self, country):
        """Return legal context for specific country."""
        contexts = {
            "France": """
            - Droit français du travail (Code du travail)
            - Durée légale : 35h/semaine
            - Congés payés : 2.5 jours/mois
            - Période d'essai max : 2-4 mois selon catégorie
            - SMIC : 11,65€/h (2025)
            - Préavis selon ancienneté
            """,
            "Belgique": """
            - Droit belge du travail
            - Durée légale : 38h/semaine
            - Congés payés : 20 jours minimum
            - Période d'essai : max 6 mois
            - Préavis : 1-9 mois selon ancienneté
            """,
            "Suisse": """
            - Droit suisse du travail
            - Durée : 40-45h/semaine selon secteur
            - Congés : 4-5 semaines
            - Période d'essai : 1 mois standard
            - Délai-congé : 1-6 mois
            """,
            "Canada": """
            - Normes fédérales/provinciales
            - Congés payés : 2 semaines minimum
            - Préavis : 1-8 semaines
            - Législation par province
            """
        }

        return contexts.get(country, contexts["France"])