import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { JobResponseDTO, PagedResponse } from '../../../core/models/job.models';
import { JobTypeBadgeComponent } from '../../../shared/components/job-type-badge/job-type-badge.component';
import { JobStatusBadgeComponent } from '../../../shared/components/job-status-badge/job-status-badge.component';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, JobTypeBadgeComponent, JobStatusBadgeComponent],
  templateUrl: './my-jobs.component.html'
})
export class MyJobsComponent implements OnInit {
  private jobService = inject(JobService);
  private toast      = inject(ToastService);

  jobs        = signal<JobResponseDTO[]>([]);
  response    = signal<PagedResponse<JobResponseDTO> | null>(null);
  loading     = signal(true);
  currentPage = signal(0);

  // Modal State
  showDeleteModal = signal(false);
  jobToDelete     = signal<JobResponseDTO | null>(null);
  isDeleting      = signal(false);

  ngOnInit() { this.loadJobs(); }

  loadJobs() {
    this.loading.set(true);
    this.jobService.getMyJobs(this.currentPage(), 10).subscribe({
      next: (res: any) => { 
        this.response.set(res); 
        this.jobs.set(res.content || res); 
        this.loading.set(false); 
      },
      error: ()  => this.loading.set(false)
    });
  }

  onPageChange(p: number) { this.currentPage.set(p); this.loadJobs(); }

  publishJob(id: number) {
    const job = this.jobs().find(j => j.id === id);
    if (!job) return;

    if (!this.isJobComplete(job)) {
      this.toast.error('Incomplete job. Please edit and fill all required fields.');
      return;
    }

    const payload = { ...job, status: 'ACTIVE' };
    this.jobService.updateJob(id, payload).subscribe({
      next: () => {
        this.toast.success('Job published successfully!');
        this.loadJobs();
      },
      error: () => this.toast.error('Failed to publish job.')
    });
  }

  isJobComplete(job: JobResponseDTO): boolean {
    return !!(
      job.title && 
      job.companyName && 
      job.location && 
      job.description && 
      job.jobType && 
      job.deadline
    );
  }

  // --- DELETE MODAL LOGIC ---
  
  openDeleteModal(job: JobResponseDTO) {
    this.jobToDelete.set(job);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    if (this.isDeleting()) return;
    this.showDeleteModal.set(false);
    this.jobToDelete.set(null);
  }

  confirmDelete() {
    const job = this.jobToDelete();
    if (!job) return;

    this.isDeleting.set(true);
    this.jobService.deleteJob(job.id).subscribe({
      next: () => {
        this.toast.success(`'${job.title}' deleted successfully.`);
        this.isDeleting.set(false);
        this.closeDeleteModal();
        this.loadJobs();
      },
      error: () => {
        this.toast.error('Failed to delete job.');
        this.isDeleting.set(false);
      }
    });
  }
}
