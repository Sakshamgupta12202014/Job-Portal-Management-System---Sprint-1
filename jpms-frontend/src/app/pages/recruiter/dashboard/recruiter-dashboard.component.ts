import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobResponseDTO } from '../../../core/models/job.models';
import { RecruiterApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { JobStatusBadgeComponent } from '../../../shared/components/job-status-badge/job-status-badge.component';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, JobStatusBadgeComponent],
  templateUrl: './recruiter-dashboard.component.html'
})
export class RecruiterDashboardComponent implements OnInit {
  private jobService = inject(JobService);
  private auth       = inject(AuthService);
  private appService = inject(ApplicationService);
  private toast      = inject(ToastService);

  jobs         = signal<JobResponseDTO[]>([]);
  applications = signal<RecruiterApplicationResponse[]>([]);
  loading      = signal(true);
  isUpdating   = signal<number | null>(null);
  userName     = computed(() => this.auth.currentUser()?.name ?? 'Recruiter');

  // Metrics
  liveJobs = computed(() => this.jobs().filter(j => j.status === 'ACTIVE').length);
  
  awaitingReview = computed(() => 
    this.applications().filter(a => a.status === 'UNDER_REVIEW').length
  );

  applicationVelocity = computed(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.applications().filter(a => new Date(a.appliedAt) >= sevenDaysAgo).length;
  });

  conversionRate = computed(() => {
    const total = this.applications().length;
    if (total === 0) return 0;
    const shortlisted = this.applications().filter(a => a.status === 'SHORTLISTED').length;
    return Math.round((shortlisted / total) * 100);
  });

  // Pipeline Logic
  reviewQueue = computed(() => 
    this.applications()
      .filter(a => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW')
      .slice(0, 5)
  );

  trendingSkills = computed(() => {
    const skillCounts: Record<string, number> = {};
    this.applications().forEach(app => {
      if (app.candidateSkills) {
        app.candidateSkills.split(',').forEach(s => {
          const skill = s.trim();
          if (skill) skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  });

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading.set(true);
    this.jobService.getMyJobs(0, 1000).subscribe({
      next: (jobRes: any) => {
        this.jobs.set(jobRes.content || jobRes);
        this.appService.getRecruiterApplications().subscribe({
          next: (appRes: any) => {
            this.applications.set(appRes);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(appId: number, nextStatus: ApplicationStatus) {
    this.isUpdating.set(appId);
    this.appService.updateApplicationStatus(appId, { newStatus: nextStatus }).subscribe({
      next: () => {
        this.toast.success(`Candidate ${nextStatus.toLowerCase().replace('_', ' ')} successfully`);
        this.fetchData();
        this.isUpdating.set(null);
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Update failed');
        this.isUpdating.set(null);
      }
    });
  }
}
