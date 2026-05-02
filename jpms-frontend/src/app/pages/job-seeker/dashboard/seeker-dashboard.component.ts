import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/auth/auth.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { JobMarketPulseComponent } from '../../../shared/components/job-market-pulse/job-market-pulse.component';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, JobMarketPulseComponent],
  templateUrl: './seeker-dashboard.component.html'
})
export class SeekerDashboardComponent implements OnInit {
  private appService = inject(ApplicationService);
  private auth       = inject(AuthService);

  applications = signal<ApplicationResponse[]>([]);
  loading      = signal(true);
  userName     = computed(() => this.auth.currentUser()?.name ?? 'User');
  recent       = computed(() => this.applications().slice(0, 5));

  stats = computed(() => {
    const apps = this.applications() ?? [];
    return [
      { label: 'Total Applied',  value: apps.length,                                         icon: '📤', iconBg: 'bg-blue-500/20 text-blue-400' },
      { label: 'Under Review',   value: apps.filter(a => a?.status === 'UNDER_REVIEW').length, icon: '🔍', iconBg: 'bg-yellow-500/20 text-yellow-400' },
      { label: 'Shortlisted',    value: apps.filter(a => a?.status === 'SHORTLISTED').length,  icon: '⭐', iconBg: 'bg-emerald-500/20 text-emerald-400' },
      { label: 'Rejected',       value: apps.filter(a => a?.status === 'REJECTED').length,     icon: '❌', iconBg: 'bg-red-500/20 text-red-400' },
    ];
  });

  ngOnInit() {
    this.appService.getMyApplications().subscribe({
      next: res => {
        this.applications.set(res ?? []);
        this.loading.set(false);
      },
      error: ()  => { this.loading.set(false); }
    });
  }
}
