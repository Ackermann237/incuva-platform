from datetime import datetime


class Job:
    def __init__(self, job_id, title, description, company_id, status, created_at, location, salary_range):
        self.job_id = job_id
        self.title = title
        self.description = description
        self.company_id = company_id
        self.status = status  # 'active' or 'closed'
        self.created_at = created_at if isinstance(created_at, datetime) else created_at.to_datetime()
        self.location = location
        self.salary_range = salary_range

    @staticmethod
    def from_dict(data):
        """Create a Job instance from a Firestore document dictionary."""
        return Job(
            job_id=data.get('job_id', ''),
            title=data.get('title', ''),
            description=data.get('description', ''),
            company_id=data.get('company_id', ''),
            status=data.get('status', 'active'),
            created_at=data.get('created_at', datetime.utcnow()),
            location=data.get('location', ''),
            salary_range=data.get('salary_range', '')
        )

    def to_dict(self):
        """Convert Job instance to a dictionary for Firestore."""
        return {
            'job_id': self.job_id,
            'title': self.title,
            'description': self.description,
            'company_id': self.company_id,
            'status': self.status,
            'created_at': self.created_at,
            'location': self.location,
            'salary_range': self.salary_range
        }
