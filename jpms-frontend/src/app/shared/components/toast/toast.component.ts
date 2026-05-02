import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  toastService = inject(ToastService);

  getClasses(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-900/90 border-emerald-700/60 text-emerald-100',
      error:   'bg-red-900/90 border-red-700/60 text-red-100',
      warning: 'bg-yellow-900/90 border-yellow-700/60 text-yellow-100',
      info:    'bg-primary-900/90 border-primary-700/60 text-primary-100',
    };
    return map[toast.type] ?? map['info'];
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return map[type] ?? 'ℹ';
  }
}
