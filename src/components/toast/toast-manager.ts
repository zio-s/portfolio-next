import type { ToastItem, ToastType } from './types';

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  addToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
    const id = crypto.randomUUID();
    const toast: ToastItem = {
      id,
      message,
      type,
      duration,
    };

    this.toasts = [...this.toasts, toast];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  success(message: string, duration: number = 3000): string {
    return this.addToast(message, 'success', duration);
  }

  error(message: string, duration: number = 3000): string {
    return this.addToast(message, 'error', duration);
  }

  warning(message: string, duration: number = 3000): string {
    return this.addToast(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): string {
    return this.addToast(message, 'info', duration);
  }

  getToasts(): ToastItem[] {
    return [...this.toasts];
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();
