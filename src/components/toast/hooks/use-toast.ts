import { useContext } from 'react';
import { ToastContext } from '../ToastProvider';
import type { ToastContextValue } from '../types';

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
