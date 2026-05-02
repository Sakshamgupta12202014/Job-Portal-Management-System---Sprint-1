import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ApplicationResponse } from '../../../core/models/application.models';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './my-applications.component.html'
})
export class MyApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);

  applications = signal<ApplicationResponse[]>([]);
  loading      = signal(true);

  ngOnInit() {
    this.appService.getMyApplications().subscribe({
      next: res => { 
        // Backend now returns enriched data (jobTitle, companyName, location)
        this.applications.set(res ?? []); 
        this.loading.set(false); 
      },
      error: ()  => { this.loading.set(false); }
    });
  }

  goBack() {
    window.history.back();
  }
}
