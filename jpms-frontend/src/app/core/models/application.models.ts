export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED';

export const APPLICATION_STATUSES: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; css: string }> = {
  APPLIED: {
    label: 'Applied',
    css: 'status-badge status-applied'
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    css: 'status-badge status-review'
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    css: 'status-badge status-shortlisted'
  },
  REJECTED: {
    label: 'Rejected',
    css: 'status-badge status-rejected'
  }
};

export interface ApplicationResponse {
  id: number;
  userId: number;
  jobId: number;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  recruiterNote?: string;
  appliedAt: string;
  updatedAt: string;
  
  // Enriched fields from ApplicationService
  jobTitle?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  experienceYears?: number;
}

export interface RecruiterApplicationResponse {
  id: number;
  userId: number;
  jobId: number;
  resumeUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  recruiterNote?: string;
  appliedAt: string;
  updatedAt: string;

  // Candidate Profile Details (Enriched)
  candidateName?: string;
  candidateEmail?: string;
  candidateBio?: string;
  candidateLocation?: string;
  candidateExperience?: number;
  candidateSkills?: string;

  // Job Details
  jobTitle?: string;
}

export interface StatusUpdateRequest {
  newStatus: ApplicationStatus;
  recruiterNote?: string;
}
