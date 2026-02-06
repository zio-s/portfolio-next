/**
 * useConfirmModal Hook
 *
 * Convenience hook for showing confirmation modals with simplified API.
 * Provides methods to display and close confirm dialogs.
 */

import { useCallback } from 'react';
import { modalManager } from '../modal-manager';
import type { ConfirmModalOptions, ModalId, ConfirmModalHook } from '../types';

/**
 * Hook for displaying confirmation modals
 *
 * @returns Object with showConfirm and closeConfirm functions
 *
 * @example
 * ```tsx
 * const { showConfirm } = useConfirmModal();
 *
 * const handleDelete = () => {
 *   showConfirm({
 *     title: 'Confirm Delete',
 *     message: 'Are you sure you want to delete this item?',
 *     type: 'danger',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *     onConfirm: () => {
 *       // Perform delete operation
 *       console.log('Item deleted');
 *     },
 *     onCancel: () => {
 *       console.log('Delete cancelled');
 *     }
 *   });
 * };
 * ```
 */
export function useConfirmModal(): ConfirmModalHook {
  /**
   * Display a confirmation modal
   */
  const showConfirm = useCallback((options: Omit<ConfirmModalOptions, 'id'>): ModalId => {
    return modalManager.confirm(options);
  }, []);

  /**
   * Close a specific confirmation modal by ID
   */
  const closeConfirm = useCallback((id: ModalId): void => {
    modalManager.close(id);
  }, []);

  return {
    showConfirm,
    closeConfirm,
  };
}
