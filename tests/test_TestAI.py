# backend/tests/test_TestAI.py
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.ai.TestAI import TestAI


class TestTestAI(unittest.TestCase):
    def setUp(self):
        self.test_ai = TestAI()

    def test_analyze_job_details(self):
        """Teste l'analyse des détails d'une offre d'emploi."""
        job_data = {
            'title': 'Développeur React Senior',
            'description': 'Développement d\'applications web avec React et Node.js',
            'required_skills': ['React', 'JavaScript', 'Node.js', 'TypeScript'],
            'missions': [
                'Développer des interfaces utilisateur React',
                'Conception de l\'architecture frontend',
                'Mentoring des développeurs juniors'
            ],
            'contract_type': 'CDI'
        }

        analysis = self.test_ai.analyze_job_details(job_data)

        self.assertEqual(analysis['job_title'], 'Développeur React Senior')
        self.assertEqual(analysis['experience_level'], 'senior')
        self.assertIn('React', analysis['primary_technologies'])
        self.assertIn('frontend', analysis['technical_areas'])
        self.assertIn('development', analysis['job_focus'])
        self.assertIn('design', analysis['job_focus'])

    def test_format_list(self):
        """Teste le formatage des listes."""
        items = ['React', 'Node.js', 'TypeScript']
        formatted = self.test_ai._format_list(items)

        self.assertIn('- React', formatted)
        self.assertIn('- Node.js', formatted)
        self.assertIn('- TypeScript', formatted)

    def test_clean_json_string(self):
        """Teste le nettoyage des chaînes JSON."""
        json_str = '{ "test": "value" // comment\n, "another": "value" }'
        cleaned = self.test_ai._clean_json_string(json_str)

        self.assertNotIn('// comment', cleaned)
        self.assertIn('"test": "value"', cleaned)


if __name__ == '__main__':
    unittest.main()