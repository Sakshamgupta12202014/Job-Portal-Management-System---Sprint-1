import { Injectable, signal } from '@angular/core';
import { ModalOptions, ModalState } from '../models/modal.models';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private state = signal<ModalState>({
    isOpen: false,
    options: null,
    resolve: null
  });

  // Expose signal as read-only
  modalState = this.state.asReadonly();

  /**
   * Opens a confirmation modal and returns a Promise that resolves 
   * to true (Confirm) or false (Cancel).
   */
  confirm(options: ModalOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        isOpen: true,
        options: {
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'info',
          ...options
        },
        resolve
      });
    });
  }

  /**
   * Resolves the current modal and closes it.
   */
  resolve(value: boolean) {
    const current = this.state();
    if (current.resolve) {
      current.resolve(value);
    }
    this.close();
  }

  private close() {
    this.state.update(s => ({ ...s, isOpen: false, resolve: null }));
  }
}
