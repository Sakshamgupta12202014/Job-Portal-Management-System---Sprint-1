import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { JobResponse, PagedResponse } from '../../../core/models/admin.models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { JobStatusBadgeComponent } from '../../../shared/components/job-status-badge/job-status-badge.component';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [CommonModule, PaginationComponent, JobStatusBadgeComponent],
  templateUrl: './admin-jobs.component.html'
})
export class AdminJobsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast        = inject(ToastService);
  private modal        = inject(ModalService);

  jobs    = signal<JobResponse[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  // Pagination State
  currentPage = signal(0);
  pageSize    = signal(10);
  totalPages  = signal(0);
  totalItems  = signal(0);
  isLast      = signal(false);

  // Processing state for deletion
  isProcessing = signal(false);

  constructor() {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading.set(true);
    this.adminService.getAllJobsPaged(this.currentPage(), this.pageSize(), this.searchQuery()).subscribe({
      next: (res: PagedResponse<JobResponse>) => { 
        this.jobs.set(res.content); 
        this.totalPages.set(res.totalPages);
        this.totalItems.set(res.totalElements);
        this.isLast.set(res.isLast);
        this.loading.set(false); 
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(0); // Reset to first page on search
    this.loadJobs();
  }

  setPage(page: number) {
    this.currentPage.set(page);
    this.loadJobs();
  }

  async deleteJob(job: JobResponse) {
    if (job.status === 'DELETED') return;

    const confirmed = await this.modal.confirm({
      title: 'Delete Job?',
      message: `Are you sure you want to delete '${job.title}'? This action cannot be undone and will remove the listing from all search results.`,
      confirmText: 'Delete Now',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      this.isProcessing.set(true);
      this.adminService.deleteJob(job.id).subscribe({
        next: () => {
          this.toast.success(`Job '${job.title}' deleted successfully`);
          this.isProcessing.set(false);
          this.loadJobs();
        },
        error: () => {
          this.toast.error('Failed to delete job');
          this.isProcessing.set(false);
        }
      });
    }
  }


}
