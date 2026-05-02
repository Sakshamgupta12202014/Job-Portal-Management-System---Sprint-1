export type ModalType = 'danger' | 'warning' | 'info' | 'success';

export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  icon?: string;
}

export interface ModalState {
  isOpen: boolean;
  options: ModalOptions | null;
  resolve: ((value: boolean) => void) | null;
}
