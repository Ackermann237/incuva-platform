# backend/tests/conftest.py
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def mock_job_data():
    return {
        'title': 'Développeur Full Stack',
        'description': 'Développement web avec React et Node.js',
        'required_skills': ['React', 'Node.js', 'MongoDB', 'Docker'],
        'missions': ['Développement frontend', 'Développement backend', 'Déploiement'],
        'contract_type': 'CDI'
    }

@pytest.fixture
def mock_config():
    return {
        'difficulty': 'medium',
        'question_types': ['mcq', 'coding', 'open_ended'],
        'number_of_questions': 10,
        'include_explanations': True
    }