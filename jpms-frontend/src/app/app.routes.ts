import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [

  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/public/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/public/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/public/job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/public/job-detail/job-detail.component').then(m => m.JobDetailComponent)
  },

  // ── Job Seeker ────────────────────────────────────────────────────────────
  {
    path: 'seeker',
    canActivate: [authGuard],
    data: { role: 'JOB_SEEKER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/job-seeker/dashboard/seeker-dashboard.component').then(m => m.SeekerDashboardComponent)
      },
      {
        path: 'apply/:jobId',
        loadComponent: () => import('./pages/job-seeker/apply/apply.component').then(m => m.ApplyComponent)
      },
      {
        path: 'my-applications',
        loadComponent: () => import('./pages/job-seeker/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./pages/job-seeker/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/job-seeker/profile/seeker-profile.component').then(m => m.SeekerProfileComponent)
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./pages/shared/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Recruiter ─────────────────────────────────────────────────────────────
  {
    path: 'recruiter',
    canActivate: [authGuard],
    data: { role: 'RECRUITER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/recruiter/dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent)
      },
      {
        path: 'post-job',
        loadComponent: () => import('./pages/recruiter/post-job/post-job.component').then(m => m.PostJobComponent)
      },
      {
        path: 'my-jobs',
        loadComponent: () => import('./pages/recruiter/my-jobs/my-jobs.component').then(m => m.MyJobsComponent)
      },
      {
        path: 'candidates',
        loadComponent: () => import('./pages/recruiter/candidates/candidates').then(m => m.CandidatesComponent)
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () => import('./pages/recruiter/edit-job/edit-job.component').then(m => m.EditJobComponent)
      },
      {
        path: 'jobs/:id/applicants',
        loadComponent: () => import('./pages/recruiter/applicants/applicants.component').then(m => m.ApplicantsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/recruiter/profile/recruiter-profile.component').then(m => m.RecruiterProfileComponent)
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./pages/shared/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/admin/jobs/admin-jobs.component').then(m => m.AdminJobsComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'service-unavailable',
    loadComponent: () => import('./pages/shared/service-unavailable/service-unavailable-page.component').then(m => m.ServiceUnavailablePageComponent)
  },

  { path: '**', redirectTo: '' }
];
