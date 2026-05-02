import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobTypeBadgeComponent } from '../../../shared/components/job-type-badge/job-type-badge.component';
import { JobStatusBadgeComponent } from '../../../shared/components/job-status-badge/job-status-badge.component';
import { JobResponseDTO } from '../../../core/models/job.models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, JobTypeBadgeComponent, JobStatusBadgeComponent],
  templateUrl: './job-detail.component.html'
})
export class JobDetailComponent implements OnInit {
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  private auth       = inject(AuthService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);

  job     = signal<JobResponseDTO | null>(null);
  loading = signal(true);
  hasApplied = signal(false);

  isLoggedIn = this.auth.isLoggedIn;
  canApply   = () => this.auth.isRole('JOB_SEEKER');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobById(id).subscribe({
      next: j  => { 
        this.job.set(j); 
        this.checkIfApplied(id);
        this.loading.set(false); 
      },
      error: () => { this.loading.set(false); }
    });
  }

  private checkIfApplied(jobId: number) {
    if (this.isLoggedIn() && this.canApply()) {
      this.appService.getMyApplications().subscribe({
        next: apps => {
          this.hasApplied.set(apps.some(a => a.jobId === jobId));
        }
      });
    }
  }

  getSkills(): string[] {
    return this.job()?.skillsRequired.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  }

  applyNow() {
    if (this.hasApplied()) return;
    this.router.navigate(['/seeker/apply', this.job()!.id]);
  }
}
