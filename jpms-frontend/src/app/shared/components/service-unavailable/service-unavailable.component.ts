import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-unavailable',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div class="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-red-500/10">
        <span class="text-5xl">🚧</span>
      </div>
      
      <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4 uppercase">
        {{ title() }}
      </h1>
      
      <p class="text-lg text-gray-500 dark:text-gray-400 max-w-md font-medium mb-10">
        {{ message() }}
      </p>

      <div class="flex flex-col sm:flex-row gap-4">
        <button (click)="retry()" 
                class="px-8 py-3 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-widest hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/20">
          Try Again
        </button>
        <a routerLink="/" 
           class="px-8 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all">
          Back Home
        </a>
      </div>

      <div class="mt-16 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Status: Circuit Breaker Active
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class ServiceUnavailableComponent {
  title = input<string>('Service Unavailable');
  message = input<string>('The service you are looking for is temporarily down for maintenance. We will be back shortly.');

  retry() {
    window.location.reload();
  }
}
