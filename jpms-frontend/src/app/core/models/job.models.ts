export interface JobRequestDTO {
  title: string;
  companyName: string;
  location: string;
  salary: number;
  experienceYears: number;
  jobType: string;
  skillsRequired: string;
  description: string;
  status: string;
  deadline: string; // ISO date string: YYYY-MM-DD
}

export interface JobResponseDTO {
  id: number;
  title: string;
  companyName: string;
  location: string;
  salary: number;
  experienceYears: number;
  jobType: string;
  skillsRequired: string;
  description: string;
  status: string;
  deadline: string;
  postedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export interface JobSearchParams {
  title?: string;
  location?: string;
  jobType?: string;
  experienceYears?: number;
  page?: number;
  size?: number;
}

export const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'REMOTE'] as const;
export type JobType = typeof JOB_TYPES[number];

export const JOB_STATUSES = ['ACTIVE', 'INACTIVE', 'EXPIRED', 'DELETED', 'FILLED'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

export const JOB_TYPE_CONFIG: Record<string, { label: string, css: string }> = {
  'FULL_TIME':  { label: 'Full Time',  css: 'status-badge status-applied' }, // Using existing blue
  'PART_TIME':  { label: 'Part Time',  css: 'status-badge status-warning' },
  'INTERNSHIP': { label: 'Internship', css: 'status-badge status-review' },  // Using indigo/purple
  'CONTRACT':   { label: 'Contract',   css: 'status-badge bg-gray-100 text-gray-700' },
  'REMOTE':     { label: 'Remote',     css: 'status-badge bg-cyan-100 text-cyan-700' }
};

export const JOB_STATUS_CONFIG: Record<string, { label: string, css: string }> = {
  'ACTIVE':   { label: 'Active',   css: 'status-badge status-shortlisted' }, // Emerald
  'INACTIVE': { label: 'Inactive', css: 'status-badge bg-gray-100 text-gray-500' },
  'EXPIRED':  { label: 'Expired',  css: 'status-badge status-rejected' },    // Red
  'DELETED':  { label: 'Deleted',  css: 'status-badge bg-red-100 text-red-600 border border-red-200' },
  'FILLED':   { label: 'Filled',   css: 'status-badge bg-indigo-100 text-indigo-700' }
};
