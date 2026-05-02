import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobResponseDTO } from '../../../core/models/job.models';
import { JobTypeBadgeComponent } from '../job-type-badge/job-type-badge.component';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterLink, JobTypeBadgeComponent],
  templateUrl: './job-card.component.html'
})
export class JobCardComponent {
  job = input.required<JobResponseDTO>();

  getSkills(raw: string): string[] {
    if (!raw) return [];
    return raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  }

  formatSalary(): string {
    const salary = this.job().salary;
    if (salary >= 1000000) return `${(salary / 1000000).toFixed(1)}M`;
    if (salary >= 1000) return `${(salary / 1000).toFixed(0)}K`;
    return salary.toString();
  }

  getDaysRemaining(): number {
    const deadline = new Date(this.job().deadline).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  isUrgent(): boolean {
    return this.getDaysRemaining() <= 3 && this.getDaysRemaining() > 0;
  }
}
