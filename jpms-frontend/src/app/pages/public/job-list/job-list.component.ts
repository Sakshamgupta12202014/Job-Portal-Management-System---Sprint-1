import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { JobResponseDTO, PagedResponse, JOB_TYPES } from '../../../core/models/job.models';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardComponent, PaginationComponent],
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);

  jobs       = signal<JobResponseDTO[]>([]);
  response   = signal<PagedResponse<JobResponseDTO> | null>(null);
  loading    = signal(true);
  currentPage = signal(0);
  skeletons  = Array(6);
  jobTypes   = JOB_TYPES;

  filters = { title: '', location: '', jobType: '', experienceYears: undefined as number | undefined };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['title'])    this.filters.title    = params['title'];
      if (params['location']) this.filters.location = params['location'];
      if (params['jobType'])  this.filters.jobType  = params['jobType'];
      if (params['page'])     this.currentPage.set(Number(params['page']));
      else                    this.currentPage.set(0);
      this.loadJobs();
    });
  }

  loadJobs() {
    this.loading.set(true);
    const hasFilters = this.filters.title || this.filters.location || this.filters.jobType || this.filters.experienceYears;
    const obs = hasFilters
      ? this.jobService.searchJobs({ ...this.filters, page: this.currentPage(), size: 5 })
      : this.jobService.getAllJobs(this.currentPage(), 5);

    obs.subscribe({
      next: (res: PagedResponse<JobResponseDTO>) => {
        this.response.set(res);
        this.jobs.set(res?.content ?? []);
        this.loading.set(false);
      },
      error: ()  => { this.loading.set(false); }
    });
  }

  applyFilters() { this.currentPage.set(0); this.loadJobs(); }
  resetFilters()  { this.filters = { title: '', location: '', jobType: '', experienceYears: undefined }; this.loadJobs(); }
  onPageChange(p: number) {
    this.currentPage.set(p);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: p },
      queryParamsHandling: 'merge'
    });
  }
}
