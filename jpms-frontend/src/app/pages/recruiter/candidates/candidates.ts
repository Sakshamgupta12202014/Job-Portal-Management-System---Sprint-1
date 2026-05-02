import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { RecruiterApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './candidates.html',
  styleUrls: ['./candidates.css']
})
export class CandidatesComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private toast              = inject(ToastService);

  candidates = signal<RecruiterApplicationResponse[]>([]);
  loading = signal(true);
  isUpdating = signal<number | null>(null);
  
  // Stats
  totalApplicants = signal(0);
  pendingCount = signal(0);
  shortlistedCount = signal(0);
  rejectedCount = signal(0);

  // Status updates mapping
  statusUpdates: { [key: number]: { status: ApplicationStatus, note: string } } = {};

  ngOnInit() {
    this.fetchCandidates();
  }

  getAvailableStatuses(current: ApplicationStatus): ApplicationStatus[] {
    switch (current) {
      case 'APPLIED': return ['UNDER_REVIEW'];
      case 'UNDER_REVIEW': return ['SHORTLISTED', 'REJECTED'];
      case 'SHORTLISTED': return ['REJECTED'];
      default: return [];
    }
  }

  fetchCandidates() {
    this.loading.set(true);
    this.applicationService.getRecruiterApplications().subscribe({
      next: (data: any) => {
        const apps = data as RecruiterApplicationResponse[];
        this.candidates.set(apps);
        this.calculateStats(apps);
        
        // Initialize status updates with valid defaults
        apps.forEach(app => {
          const available = this.getAvailableStatuses(app.status);
          this.statusUpdates[app.id] = { 
            status: available.length > 0 ? available[0] : app.status, 
            note: app.recruiterNote || '' 
          };
        });
        
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching candidates:', err);
        this.loading.set(false);
        this.toast.error('Failed to load candidates.');
      }
    });
  }

  calculateStats(data: RecruiterApplicationResponse[]) {
    this.totalApplicants.set(data.length);
    this.pendingCount.set(data.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'APPLIED').length);
    this.shortlistedCount.set(data.filter(a => a.status === 'SHORTLISTED').length);
    this.rejectedCount.set(data.filter(a => a.status === 'REJECTED').length);
  }

  updateStatus(appId: number) {
    const update = this.statusUpdates[appId];
    this.isUpdating.set(appId);
    
    this.applicationService.updateApplicationStatus(appId, {
      newStatus: update.status,
      recruiterNote: update.note
    }).subscribe({
      next: () => {
        this.toast.success('Application status updated successfully!');
        this.fetchCandidates();
        this.isUpdating.set(null);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Failed to update status.';
        this.toast.error(msg);
        this.isUpdating.set(null);
      }
    });
  }
}
