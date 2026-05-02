import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JOB_STATUS_CONFIG } from '../../../core/models/job.models';

@Component({
  selector: 'app-job-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="badgeClass()">{{ label() }}</span>`
})
export class JobStatusBadgeComponent {
  status = input.required<string>();

  badgeClass() { return JOB_STATUS_CONFIG[this.status()]?.css || 'status-badge bg-gray-100'; }
  label()      { return JOB_STATUS_CONFIG[this.status()]?.label || this.status(); }
}
