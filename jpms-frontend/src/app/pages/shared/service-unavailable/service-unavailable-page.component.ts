import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceUnavailableComponent } from '../../../shared/components/service-unavailable/service-unavailable.component';

@Component({
  selector: 'app-service-unavailable-page',
  standalone: true,
  imports: [CommonModule, ServiceUnavailableComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full space-y-8 bg-white dark:bg-gray-950 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-900">
        <app-service-unavailable 
          title="System Resilience Active" 
          message="One of our core services is experiencing high latency or failure. To protect the rest of the system, we have temporarily gated access. Please try again in a few moments."
        />
      </div>
    </div>
  `
})
export class ServiceUnavailablePageComponent {}
