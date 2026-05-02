import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { JOB_TYPES } from '../../../core/models/job.models';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-job.component.html'
})
export class EditJobComponent implements OnInit {
  private fb         = inject(FormBuilder);
  private jobService = inject(JobService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private toast      = inject(ToastService);

  loadingJob = signal(true);
  saving     = signal(false);
  errorMsg   = signal('');
  jobTypes   = JOB_TYPES;
  jobId!: number;

  form = this.fb.group({
    title: ['', Validators.required], companyName: ['', Validators.required],
    location: ['', Validators.required], jobType: ['', Validators.required],
    salary: [null as number | null], experienceYears: [null as number | null, Validators.required],
    deadline: ['', Validators.required], status: ['ACTIVE'],
    skillsRequired: [''], description: ['', Validators.required],
  });

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobById(this.jobId).subscribe({
      next: j => {
        this.form.patchValue({ ...j, deadline: j.deadline?.toString().substring(0, 10) });
        this.loadingJob.set(false);
      },
      error: () => this.loadingJob.set(false)
    });
  }

  hasError(f: string) { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload = this.form.getRawValue() as any;
    console.log('Updating job with payload:', payload);
    
    this.jobService.updateJob(this.jobId, payload).subscribe({
      next: (res) => { 
        console.log('Update successful, response:', res);
        this.toast.success('Job updated!'); 
        this.router.navigate(['/recruiter/my-jobs']); 
      },
      error: (e) => { 
        console.error('Update failed:', e);
        this.saving.set(false); 
        this.errorMsg.set(e?.error?.message ?? 'Failed to update.'); 
      }
    });
  }

  cancel() { this.router.navigate(['/recruiter/my-jobs']); }
}
