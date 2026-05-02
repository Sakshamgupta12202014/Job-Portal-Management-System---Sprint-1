import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { JobResponseDTO } from '../../../core/models/job.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, JobCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private jobService   = inject(JobService);
  private adminService = inject(AdminService);
  private router       = inject(Router);
  private auth         = inject(AuthService);

  isLoggedIn  = this.auth.isLoggedIn;
  currentRole = this.auth.currentRole;

  featuredJobs = signal<JobResponseDTO[]>([]);
  stats        = signal({ totalJobs: 0, totalUsers: 0, totalApplications: 0 });
  loading      = signal(true);
  searchTitle  = '';
  searchLocation = '';
  selectedType = '';
  skeletons    = Array(6);
  jobTypes     = ['Full Time', 'Part Time', 'Remote', 'Internship', 'Contract'];

  ngOnInit() {
    // Redirect already-logged-in users straight to their dashboard
    if (this.auth.isLoggedIn()) {
      this.auth.navigateToDashboard();
      return;
    }

    this.jobService.getAllJobs(0, 6).subscribe({
      next: (res: any) => { this.featuredJobs.set(res.content); this.loading.set(false); },
      error: ()  => { this.loading.set(false); }
    });

    this.adminService.getPublicStats().subscribe({
      next: (res: any) => this.stats.set(res),
      error: () => {}
    });
  }

  search() {
    this.router.navigate(['/jobs'], {
      queryParams: { title: this.searchTitle, location: this.searchLocation }
    });
  }

  filterByType(type: string) {
    this.selectedType = type === this.selectedType ? '' : type;
    this.router.navigate(['/jobs'], { queryParams: { jobType: this.selectedType.replace(' ', '_').toUpperCase() } });
  }
}
