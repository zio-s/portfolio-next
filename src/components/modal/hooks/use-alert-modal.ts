/**
 * useAlertModal Hook
 *
 * Convenience hook for showing alert modals with simplified API.
 * Provides methods to display and close alert dialogs.
 */

import { useCallback } from 'react';
import { modalManager } from '../modal-manager';
import type { AlertModalOptions, ModalId, AlertModalHook } from '../types';

/**
 * Hook for displaying alert modals
 *
 * @returns Object with showAlert and closeAlert functions
 *
 * @example
 * ```tsx
 * const { showAlert } = useAlertModal();
 *
 * const handleClick = () => {
 *   showAlert({
 *     title: 'Success',
 *     message: 'Operation completed successfully',
 *     type: 'success',
 *     onConfirm: () => console.log('Alert confirmed')
 *   });
 * };
 * ```
 */
export function useAlertModal(): AlertModalHook {
  /**
   * Display an alert modal
   */
  const showAlert = useCallback((options: Omit<AlertModalOptions, 'id'>): ModalId => {
    return modalManager.alert(options);
  }, []);

  /**
   * Close a specific alert modal by ID
   */
  const closeAlert = useCallback((id: ModalId): void => {
    modalManager.close(id);
  }, []);

  return {
    showAlert,
    closeAlert,
  };
}
