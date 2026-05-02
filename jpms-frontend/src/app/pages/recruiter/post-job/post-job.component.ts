import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { JOB_TYPES } from '../../../core/models/job.models';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-job.component.html'
})
export class PostJobComponent {
  private fb         = inject(FormBuilder);
  private jobService = inject(JobService);
  private router     = inject(Router);
  private toast      = inject(ToastService);

  loading  = signal(false);
  errorMsg = signal('');
  jobTypes = JOB_TYPES;

  form = this.fb.group({
    title:           ['', Validators.required],
    companyName:     ['', Validators.required],
    location:        ['', Validators.required],
    jobType:         ['', Validators.required],
    salary:          [null as number | null],
    experienceYears: [null as number | null, Validators.required],
    deadline:        ['', Validators.required],
    status:          ['ACTIVE'],
    skillsRequired:  [''],
    description:     ['', Validators.required],
  });

  hasError(f: string) { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.jobService.postJob(this.form.getRawValue() as any).subscribe({
      next: () => { this.toast.success('Job posted successfully! 🎉'); this.router.navigate(['/recruiter/my-jobs']); },
      error: (e: any) => { this.loading.set(false); this.errorMsg.set(e?.error?.message ?? 'Failed to post job.'); }
    });
  }

  cancel() { this.router.navigate(['/recruiter/my-jobs']); }
}
