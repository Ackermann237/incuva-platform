from firebase_admin import firestore
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self, db):
        self.db = db

    def create_job(self, company_id, title, description, location, salary_range,
                   contract_type=None, work_hours=None, remote_policy=None,
                   experience_level=None, education_level=None, department=None,
                   employment_type=None, required_skills=None, benefits=None,
                   country=None, city=None, missions=None, immediate_start=False,
                   visa_sponsorship=False, raw_description=None):
        """Create a new job offer and store it in Firestore."""
        try:
            job_data = {
                'company_id': company_id,
                'title': title,
                'description': description,
                'raw_description': raw_description,  # Conserver la version originale
                'location': location,
                'salary_range': salary_range,
                'contract_type': contract_type,
                'work_hours': work_hours,
                'remote_policy': remote_policy,
                'experience_level': experience_level,
                'education_level': education_level,
                'department': department,
                'employment_type': employment_type,
                'required_skills': required_skills or [],
                'benefits': benefits or [],
                'country': country,
                'city': city,
                'missions': missions or [],
                'immediate_start': immediate_start,
                'visa_sponsorship': visa_sponsorship,
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
                'status': 'active',
                'applications_count': 0,
                'views_count': 0
            }
            job_ref = self.db.collection('jobs').add(job_data)[1]
            job_id = job_ref.id
            logger.info(f"Job created with ID: {job_id}")
            return job_id
        except Exception as e:
            logger.error(f"Error creating job: {str(e)}")
            raise Exception(f"Échec de la création de l'offre: {str(e)}")

    def get_jobs_by_company(self, company_id, limit=3):
        """Fetch active jobs for a company with an optional limit."""
        try:
            logger.debug(f"Querying jobs for company_id: {company_id}, limit: {limit}")
            if company_id is None:
                jobs_ref = self.db.collection('jobs').where(filter=firestore.FieldFilter('status', '==', 'active'))
            else:
                jobs_ref = self.db.collection('jobs').where(
                    filter=firestore.FieldFilter('company_id', '==', company_id)).where(
                    filter=firestore.FieldFilter('status', '==', 'active')).limit(limit)
            jobs_docs = jobs_ref.stream()
            jobs = []
            for doc in jobs_docs:
                data = doc.to_dict()
                data['job_id'] = doc.id
                data['created_at'] = data['created_at'].to_datetime() if hasattr(data['created_at'],
                                                                                 'to_datetime') else datetime.now()
                jobs.append(data)
            logger.debug(f"Found jobs: {jobs}")
            return jobs
        except Exception as e:
            logger.error(f"Error fetching jobs for company_id {company_id}: {str(e)}")
            return []
