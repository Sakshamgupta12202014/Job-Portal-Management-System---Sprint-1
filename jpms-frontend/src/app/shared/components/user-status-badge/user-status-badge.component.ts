import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { USER_STATUS_CONFIG } from '../../../core/models/admin.models';

@Component({
  selector: 'app-user-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="badgeClass()">{{ label() }}</span>`
})
export class UserStatusBadgeComponent {
  status = input.required<string>();

  badgeClass() { return USER_STATUS_CONFIG[this.status()]?.css || 'status-badge bg-gray-100'; }
  label()      { return USER_STATUS_CONFIG[this.status()]?.label || this.status(); }
}
