import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { USER_ROLE_CONFIG } from '../../../core/models/admin.models';

@Component({
  selector: 'app-user-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span [class]="badgeClass()">{{ label() }}</span>`
})
export class UserRoleBadgeComponent {
  role = input.required<string>();

  badgeClass() { return USER_ROLE_CONFIG[this.role()]?.css || 'status-badge bg-gray-100'; }
  label()      { return USER_ROLE_CONFIG[this.role()]?.label || this.role(); }
}
