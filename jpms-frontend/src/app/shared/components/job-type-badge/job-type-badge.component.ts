import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JOB_TYPE_CONFIG } from '../../../core/models/job.models';

@Component({
  selector: 'app-job-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="badgeClass()">{{ label() }}</span>`
})
export class JobTypeBadgeComponent {
  type = input.required<string>();

  badgeClass() { return JOB_TYPE_CONFIG[this.type()]?.css || 'status-badge bg-gray-100'; }
  label()      { return JOB_TYPE_CONFIG[this.type()]?.label || this.type(); }
}
