import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './application-detail.component.html'
})
export class ApplicationDetailComponent implements OnInit {
  private appService = inject(ApplicationService);
  private route      = inject(ActivatedRoute);

  app     = signal<ApplicationResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appService.getApplicationById(id).subscribe({
      next: a  => { this.app.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
