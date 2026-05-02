import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RecruiterApplicationResponse, ApplicationStatus } from '../../../core/models/application.models';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent],
  templateUrl: './applicants.component.html'
})
export class ApplicantsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private route      = inject(ActivatedRoute);
  private toast      = inject(ToastService);

  applicants    = signal<RecruiterApplicationResponse[]>([]);
  loading       = signal(true);
  isUpdating    = signal<number | null>(null);
  jobId         = signal(0);
  statusUpdates: Record<number, { status: ApplicationStatus; note: string }> = {};

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobId.set(id);
    this.fetchApplicants(id);
  }

  getAvailableStatuses(current: ApplicationStatus): ApplicationStatus[] {
    switch (current) {
      case 'APPLIED': return ['UNDER_REVIEW'];
      case 'UNDER_REVIEW': return ['SHORTLISTED', 'REJECTED'];
      case 'SHORTLISTED': return ['REJECTED'];
      default: return [];
    }
  }

  fetchApplicants(id: number) {
    this.loading.set(true);
    this.appService.getApplicantsForJob(id).subscribe({
      next: (res: any[]) => {
        const apps = res as RecruiterApplicationResponse[];
        this.applicants.set(apps);
        apps.forEach(a => { 
          const available = this.getAvailableStatuses(a.status);
          this.statusUpdates[a.id] = { 
            status: available.length > 0 ? available[0] : a.status, 
            note: a.recruiterNote ?? '' 
          }; 
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load applicants.');
        this.loading.set(false);
      }
    });
  }

  updateStatus(appId: number) {
    const upd = this.statusUpdates[appId];
    this.isUpdating.set(appId);
    
    this.appService.updateApplicationStatus(appId, { 
      newStatus: upd.status, 
      recruiterNote: upd.note 
    }).subscribe({
      next: () => { 
        this.toast.success('Application status updated successfully!');
        this.isUpdating.set(null);
        this.fetchApplicants(this.jobId());
      },
      error: (err: any)  => {
        const msg = err.error?.message || 'Failed to update status.';
        this.toast.error(msg);
        this.isUpdating.set(null);
      }
    });
  }
}
