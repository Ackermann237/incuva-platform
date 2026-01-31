from datetime import datetime


class Application:
    def __init__(self, application_id, job_id, candidate_id, company_id, status, urgency, submitted_at, resume_url):
        self.application_id = application_id
        self.job_id = job_id
        self.candidate_id = candidate_id
        self.company_id = company_id
        self.status = status  # 'pending', 'reviewed', 'accepted', 'rejected'
        self.urgency = urgency  # 'high', 'medium', 'low'
        self.submitted_at = submitted_at if isinstance(submitted_at, datetime) else submitted_at.to_datetime()
        self.resume_url = resume_url

    @staticmethod
    def from_dict(data):
        """Create an Application instance from a Firestore document dictionary."""
        return Application(
            application_id=data.get('application_id', ''),
            job_id=data.get('job_id', ''),
            candidate_id=data.get('candidate_id', ''),
            company_id=data.get('company_id', ''),
            status=data.get('status', 'pending'),
            urgency=data.get('urgency', 'medium'),
            submitted_at=data.get('submitted_at', datetime.utcnow()),
            resume_url=data.get('resume_url', '')
        )

    def to_dict(self):
        """Convert Application instance to a dictionary for Firestore."""
        return {
            'application_id': self.application_id,
            'job_id': self.job_id,
            'candidate_id': self.candidate_id,
            'company_id': self.company_id,
            'status': self.status,
            'urgency': self.urgency,
            'submitted_at': self.submitted_at,
            'resume_url': self.resume_url
        }
