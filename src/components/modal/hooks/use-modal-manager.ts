/**
 * useModalManager Hook
 *
 * React hook that provides access to the modal manager and
 * subscribes to modal state changes for reactive updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { modalManager } from '../modal-manager';
import type { ModalState, ModalId } from '../types';

/**
 * Hook for managing modals with reactive state updates
 *
 * @returns Object containing modal state and control functions
 */
export function useModalManager() {
  const [modals, setModals] = useState<ModalState[]>([]);

  /**
   * Subscribe to modal state changes on mount
   */
  useEffect(() => {
    const unsubscribe = modalManager.subscribe((newModals) => {
      setModals(newModals);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Close a specific modal by ID
   */
  const closeModal = useCallback((id: ModalId) => {
    modalManager.close(id);
  }, []);

  /**
   * Close the topmost modal
   */
  const closeTopModal = useCallback(() => {
    modalManager.closeTop();
  }, []);

  /**
   * Close all open modals
   */
  const closeAllModals = useCallback(() => {
    modalManager.closeAll();
  }, []);

  return {
    /** Array of all active modals */
    modals,
    /** Close a specific modal by ID */
    closeModal,
    /** Close the topmost modal */
    closeTopModal,
    /** Close all modals */
    closeAllModals,
    /** Total number of active modals */
    modalCount: modals.length,
    /** Whether any modal is currently open */
    hasModals: modals.length > 0,
  };
}
