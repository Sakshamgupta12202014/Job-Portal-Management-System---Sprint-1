export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  profilePictureUrl: string;
  resumeUrl: string;
}

export interface JobResponse {
  id: number;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  status: string;
  postedBy: number;
  createdAt: string;
}

export interface ApplicationStats {
  totalApplications: number;
  appliedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  rejectedCount: number;
}

export interface PlatformReport {
  totalUsers: number;
  totalJobs: number;
  seekerCount: number;
  recruiterCount: number;
  applicationStats: ApplicationStats;
  users: UserResponse[];
  jobs: JobResponse[];
}

export interface AuditLog {
  id: number;
  action: string;
  targetId: number;
  adminId: number;
  timestamp: string;
}

export interface SkillDemand {
  name: string;
  percentage: number;
}

export interface JobMarketPulseResponse {
  avgSalary: number;
  salaryGrowthPercentage: number;
  marketDemandStatus: string;
  marketDemandSubtitle: string;
  topSkills: SkillDemand[];
}

export interface PagedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export const USER_ROLE_CONFIG: Record<string, { label: string, css: string }> = {
  'ADMIN':      { label: 'Administrator', css: 'status-badge status-review' }, // Indigo
  'RECRUITER':  { label: 'Recruiter',     css: 'status-badge status-applied' }, // Blue
  'JOB_SEEKER': { label: 'Job Seeker',    css: 'status-badge bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' }
};

export const USER_STATUS_CONFIG: Record<string, { label: string, css: string }> = {
  'ACTIVE':  { label: 'Active',  css: 'status-badge status-shortlisted' }, // Emerald
  'BANNED':  { label: 'Banned',  css: 'status-badge status-rejected' },    // Red
  'PENDING': { label: 'Pending', css: 'status-badge status-warning' }      // Amber
};
