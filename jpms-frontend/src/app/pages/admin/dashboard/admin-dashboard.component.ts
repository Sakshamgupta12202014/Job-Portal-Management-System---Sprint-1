import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobMarketPulseComponent } from '../../../shared/components/job-market-pulse/job-market-pulse.component';
import { PlatformReport } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, JobMarketPulseComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private auth         = inject(AuthService);

  report  = signal<PlatformReport | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.adminService.getReport().subscribe({
      next: (res: PlatformReport) => { this.report.set(res); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getPercent(count: number): number {
    const total = this.report()?.applicationStats.totalApplications || 1;
    return (count / total) * 100;
  }
}
