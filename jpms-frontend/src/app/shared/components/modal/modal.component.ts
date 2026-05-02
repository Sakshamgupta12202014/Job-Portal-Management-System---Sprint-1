import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  modal = inject(ModalService);

  constructor() {
    // Lock background scroll when modal is open
    effect(() => {
      document.body.style.overflow = this.modal.modalState().isOpen ? 'hidden' : 'auto';
    });
  }

  handleConfirm() {
    this.modal.resolve(true);
  }

  handleCancel() {
    this.modal.resolve(false);
  }

  getTypeClass(type?: string): string {
    switch (type) {
      case 'danger':  return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600';
      case 'success': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600';
      default:        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-600';
    }
  }

  getButtonClass(type?: string): string {
    switch (type) {
      case 'danger':  return 'bg-red-600 hover:bg-red-700 shadow-red-500/40';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/40';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40';
      default:        return 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/40';
    }
  }
}
