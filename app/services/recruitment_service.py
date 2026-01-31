from firebase_admin import firestore
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class RecruitmentService:
    def __init__(self, db):
        self.db = db

    def create_application(self, candidate_id, job_id, resume_url=None, motivation='', skills='', experience='',
                           phone=''):
        """Create a new application for a job."""
        try:
            # Get job to find company_id
            job_doc = self.db.collection('jobs').document(job_id).get()
            if not job_doc.exists:
                raise ValueError("Job not found")
            job = job_doc.to_dict()
            company_id = job['company_id']

            application_data = {
                'candidate_id': candidate_id,
                'job_id': job_id,
                'company_id': company_id,
                'status': 'pending',
                'submitted_at': datetime.now(),
                'resume_url': resume_url,
                'urgency': 'normal',  # Default, can be set based on logic
                'motivation': motivation,
                'skills': skills,
                'experience': experience,
                'phone': phone
            }
            app_ref = self.db.collection('applications').add(application_data)[1]
            application_id = app_ref.id
            self.update_metrics(company_id)
            logger.info(f"Application created with ID: {application_id}, Data: {application_data}")
            return application_id
        except Exception as e:
            logger.error(f"Error creating application: {str(e)}")
            raise Exception(f"Failed to create application: {str(e)}")

    def get_recruitment_metrics(self, user_id):
        """Fetch recruitment metrics for a company."""
        try:
            metrics_ref = self.db.collection('recruitment_metrics').where('company_id', '==', user_id)
            metrics_docs = metrics_ref.stream()
            metrics = {
                'active_offers': 0,
                'pending_applications': 0,
                'urgent_applications': 0,
                'avg_hiring_time': 0
            }
            for doc in metrics_docs:
                data = doc.to_dict()
                metrics[data['metric_type']] = data['value']
            logger.debug(f"Metrics for company {user_id}: {metrics}")
            return metrics
        except Exception as e:
            logger.error(f"Error fetching recruitment metrics: {str(e)}")
            return metrics

    def get_all_applications(self, user_id):
        """Fetch all applications for a company's jobs."""
        try:
            logger.debug(f"Fetching applications for company_id: {user_id}")
            applications_ref = self.db.collection('applications').where('company_id', '==', user_id)
            applications_docs = applications_ref.stream()
            applications = []
            for doc in applications_docs:
                data = doc.to_dict()
                data['application_id'] = doc.id
                # Handle Firestore timestamp (DatetimeWithNanoseconds)
                if isinstance(data['submitted_at'], datetime):
                    data['submitted_at'] = data['submitted_at']
                else:
                    logger.warning(f"Unexpected submitted_at type: {type(data['submitted_at'])}")
                    data['submitted_at'] = datetime.now()  # Fallback
                # Fetch job title for display
                job_doc = self.db.collection('jobs').document(data['job_id']).get()
                data['job_title'] = job_doc.to_dict().get('title', 'Unknown') if job_doc.exists else 'Unknown'
                # Fetch candidate name from users collection
                candidate_doc = self.db.collection('users').document(data['candidate_id']).get()
                data['candidate_name'] = candidate_doc.to_dict().get('name', 'Candidat ' + data['candidate_id'][
                                                                                           :8]) if candidate_doc.exists else 'Candidat ' + \
                                                                                                                             data[
                                                                                                                                 'candidate_id'][
                                                                                                                             :8]
                logger.debug(
                    f"Retrieved application: ID={data['application_id']}, Job={data['job_title']}, Candidate={data['candidate_name']}, Status={data['status']}")
                applications.append(data)
            logger.info(f"Total applications retrieved for company {user_id}: {len(applications)}")
            return applications
        except Exception as e:
            logger.error(f"Error fetching applications for company {user_id}: {str(e)}")
            return []

    def get_applications_by_job(self, job_id):
        """Fetch all applications for a specific job."""
        try:
            logger.debug(f"Fetching applications for job_id: {job_id}")
            applications_ref = self.db.collection('applications').where('job_id', '==', job_id)
            applications_docs = applications_ref.stream()
            applications = []
            for doc in applications_docs:
                data = doc.to_dict()
                data['application_id'] = doc.id
                # Handle Firestore timestamp (DatetimeWithNanoseconds)
                if isinstance(data['submitted_at'], datetime):
                    data['submitted_at'] = data['submitted_at']
                else:
                    logger.warning(f"Unexpected submitted_at type: {type(data['submitted_at'])}")
                    data['submitted_at'] = datetime.now()  # Fallback
                # Fetch job title for display
                job_doc = self.db.collection('jobs').document(data['job_id']).get()
                data['job_title'] = job_doc.to_dict().get('title', 'Unknown') if job_doc.exists else 'Unknown'
                # Fetch candidate name from users collection
                candidate_doc = self.db.collection('users').document(data['candidate_id']).get()
                data['candidate_name'] = candidate_doc.to_dict().get('name', 'Candidat ' + data['candidate_id'][
                                                                                           :8]) if candidate_doc.exists else 'Candidat ' + \
                                                                                                                             data[
                                                                                                                                 'candidate_id'][
                                                                                                                             :8]
                logger.debug(
                    f"Retrieved application: ID={data['application_id']}, Job={data['job_title']}, Candidate={data['candidate_name']}, Status={data['status']}")
                applications.append(data)
            logger.info(f"Total applications retrieved for job {job_id}: {len(applications)}")
            return applications
        except Exception as e:
            logger.error(f"Error fetching applications for job {job_id}: {str(e)}")
            return []

    def update_metrics(self, user_id):
        """Update recruitment metrics based on current data."""
        try:
            # Count active jobs
            from flask import g
            active_jobs = len(g.job_service.get_jobs_by_company(user_id, limit=None))  # Use JobService from app context
            # Count pending and urgent applications
            applications = self.get_all_applications(user_id)
            pending_applications = sum(1 for app in applications if app['status'] == 'pending')
            urgent_applications = sum(1 for app in applications if app['urgency'] == 'high')
            # Mock average hiring time (calculate from closed jobs if needed)
            avg_hiring_time = 8  # Static for now, replace with real calculation

            metrics = [
                {'metric_type': 'active_offers', 'value': active_jobs},
                {'metric_type': 'pending_applications', 'value': pending_applications},
                {'metric_type': 'urgent_applications', 'value': urgent_applications},
                {'metric_type': 'avg_hiring_time', 'value': avg_hiring_time}
            ]

            for metric in metrics:
                self.db.collection('recruitment_metrics').document(f"{user_id}_{metric['metric_type']}").set({
                    'company_id': user_id,
                    'metric_type': metric['metric_type'],
                    'value': metric['value'],
                    'last_updated': firestore.SERVER_TIMESTAMP
                })
            logger.debug(f"Updated metrics for company {user_id}: {metrics}")
        except Exception as e:
            logger.error(f"Error updating recruitment metrics: {str(e)}")

    def get_user_applications(self, user_id):
        """Fetch applications submitted by a user."""
        try:
            logger.debug(f"Fetching user applications for user_id: {user_id}")
            applications_ref = self.db.collection('applications').where('candidate_id', '==', user_id)
            applications_docs = applications_ref.stream()
            applications = []
            for doc in applications_docs:
                data = doc.to_dict()
                data['application_id'] = doc.id
                # Handle Firestore timestamp
                if isinstance(data['submitted_at'], datetime):
                    data['submitted_at'] = data['submitted_at']
                else:
                    logger.warning(f"Unexpected submitted_at type: {type(data['submitted_at'])}")
                    data['submitted_at'] = datetime.now()  # Fallback
                job_doc = self.db.collection('jobs').document(data['job_id']).get()
                data['job_title'] = job_doc.to_dict().get('title', 'Unknown') if job_doc.exists else 'Unknown'
                logger.debug(f"Retrieved user application: {data}")
                applications.append(data)
            logger.info(f"Total user applications retrieved for user {user_id}: {len(applications)}")
            return applications
        except Exception as e:
            logger.error(f"Error fetching user applications: {str(e)}")
            return []