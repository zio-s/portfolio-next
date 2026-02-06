import { useEffect, useState } from 'react';
import { Toast } from './Toast';
import { toastManager } from './toast-manager';
import type { ToastItem } from './types';
import './toast.css';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    toastManager.removeToast(id);
  };

  if (toasts.length === 0) {
    return <></>;
  }

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
