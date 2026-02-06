/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { toastManager } from './toast-manager';
import type { ToastItem, ToastContextValue, ToastType } from './types';

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const addToast = (message: string, type: ToastType = 'info', duration: number = 3000): void => {
    toastManager.addToast(message, type, duration);
  };

  const removeToast = (id: string): void => {
    toastManager.removeToast(id);
  };

  const success = (message: string, duration: number = 3000): void => {
    toastManager.success(message, duration);
  };

  const error = (message: string, duration: number = 3000): void => {
    toastManager.error(message, duration);
  };

  const warning = (message: string, duration: number = 3000): void => {
    toastManager.warning(message, duration);
  };

  const info = (message: string, duration: number = 3000): void => {
    toastManager.info(message, duration);
  };

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
