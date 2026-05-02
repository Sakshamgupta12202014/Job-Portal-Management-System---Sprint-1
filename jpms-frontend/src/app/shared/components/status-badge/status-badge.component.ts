import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationStatus, STATUS_CONFIG } from '../../../core/models/application.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="badgeClass()">{{ label() }}</span>`
})
export class StatusBadgeComponent {
  status = input.required<ApplicationStatus>();

  badgeClass() { return STATUS_CONFIG[this.status()]?.css || 'status-badge bg-gray-100'; }
  label()      { return STATUS_CONFIG[this.status()]?.label || this.status(); }
}
