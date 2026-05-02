import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobResponseDTO } from '../../../core/models/job.models';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply.component.html'
})
export class ApplyComponent implements OnInit {
  private appService = inject(ApplicationService);
  private jobService = inject(JobService);
  private auth       = inject(AuthService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private toast      = inject(ToastService);

  job            = signal<JobResponseDTO | null>(null);
  profileResumeUrl = signal<string>('');
  submitting     = signal(false);
  error          = signal('');

  coverLetter = '';
  useExisting = false;
  resumeFile: File | null = null;

  ngOnInit() {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.jobService.getJobById(jobId).subscribe(j => this.job.set(j));
    this.auth.getProfile().subscribe(p => {
      if (p.resumeUrl) { this.profileResumeUrl.set(p.resumeUrl); this.useExisting = true; }
    });
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.resumeFile = file;
  }

  submit() {
    this.error.set('');
    if (!this.useExisting && !this.resumeFile) {
      this.error.set('Please upload a resume or use your profile resume.');
      return;
    }
    this.submitting.set(true);
    const jobId = this.job()!.id;

    this.appService.applyForJob(
      jobId, this.coverLetter,
      this.useExisting ? null : this.resumeFile,
      this.useExisting,
      this.useExisting ? this.profileResumeUrl() : undefined
    ).subscribe({
      next: () => {
        this.toast.success('Application submitted! 🎉');
        this.router.navigate(['/seeker/my-applications']);
      },
      error: (e) => {
        this.submitting.set(false);
        this.error.set(e?.error?.message ?? 'Failed to submit application.');
      }
    });
  }

  cancel() { this.router.navigate(['/jobs', this.job()!.id]); }
}
