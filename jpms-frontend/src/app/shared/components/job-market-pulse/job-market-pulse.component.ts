import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { JobMarketPulseResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-job-market-pulse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-market-pulse.component.html',
  styleUrls: ['./job-market-pulse.component.css']
})
export class JobMarketPulseComponent implements OnInit {
  private adminService = inject(AdminService);
  
  pulseData = signal<JobMarketPulseResponse | null>(null);
  loading   = signal(true);
  error     = signal(false);

  ngOnInit() {
    this.fetchPulseData();
  }

  fetchPulseData() {
    this.loading.set(true);
    this.adminService.getMarketPulse().subscribe({
      next: (data) => {
        this.pulseData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch market pulse', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  formatCurrency(value: number): string {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  }
}
