import { useEffect, useState } from 'react';
import type { ToastItem } from './types';
import './toast.css';

interface ToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);

      return () => clearTimeout(exitTimer);
    }
  }, [toast.duration]);

  const handleClose = (): void => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getIcon = (): string => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`toast toast--${toast.type} ${isExiting ? 'toast--exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon" aria-hidden="true">
        {getIcon()}
      </div>
      <div className="toast__message">{toast.message}</div>
      <button
        type="button"
        className="toast__close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
