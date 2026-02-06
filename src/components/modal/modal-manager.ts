/**
 * Modal Manager
 *
 * Singleton modal manager using the Observer pattern for state management.
 * Handles modal stack, browser history integration, and lifecycle management.
 * SSR-safe: No browser APIs accessed during module initialization.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ModalId,
  ModalState,
  ModalOptions,
  ModalObserver,
  ModalManagerActions,
  AlertModalOptions,
  ConfirmModalOptions,
  CustomModalOptions,
} from './types';

/**
 * Modal state key for browser history
 */
const MODAL_STATE_KEY = '__modal_state__';

/**
 * Check if we're running in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * ModalManager class implementing singleton pattern with observer capabilities
 */
class ModalManager implements ModalManagerActions {
  private static instance: ModalManager;
  private modals: ModalState[] = [];
  private observers: Set<ModalObserver> = new Set();
  private historyListenerActive = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Don't initialize history listener in constructor for SSR safety
    // It will be initialized lazily when needed
  }

  /**
   * Get singleton instance of ModalManager
   */
  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  /**
   * Initialize browser history listener for back button support (client-side only)
   */
  private initializeHistoryListener(): void {
    if (!isBrowser || this.historyListenerActive) return;

    window.addEventListener('popstate', this.handlePopState);
    this.historyListenerActive = true;
  }

  /**
   * Handle browser back/forward navigation
   */
  private handlePopState = (event: PopStateEvent): void => {
    const state = event.state;

    // Check if we should close the modal
    if (this.modals.length > 0 && !state?.[MODAL_STATE_KEY]) {
      // Close the topmost modal when back button is pressed
      this.closeTop();
    }
  };

  /**
   * Push modal state to browser history
   */
  private pushHistoryState(modalId: ModalId): void {
    if (!isBrowser) return;

    const currentState = window.history.state || {};
    const newState = {
      ...currentState,
      [MODAL_STATE_KEY]: modalId,
    };

    window.history.pushState(newState, '', window.location.href);
  }

  /**
   * Notify all observers of state change
   */
  private notifyObservers(): void {
    const modalsCopy = [...this.modals];
    this.observers.forEach((observer) => observer(modalsCopy));
  }

  /**
   * Add a modal to the stack
   */
  private addModal(type: 'alert' | 'confirm' | 'custom', options: ModalOptions): ModalId {
    // Ensure history listener is active when adding modals
    this.initializeHistoryListener();

    const id = options.id || uuidv4();
    const timestamp = Date.now();

    const modalState: ModalState = {
      id,
      type,
      options: { ...options, id },
      isVisible: true,
      timestamp,
    };

    this.modals.push(modalState);
    this.pushHistoryState(id);
    this.notifyObservers();

    return id;
  }

  /**
   * Open an alert modal
   */
  public alert(options: Omit<AlertModalOptions, 'id'>): ModalId {
    return this.addModal('alert', {
      closeOnBackdrop: true,
      closeOnEsc: true,
      confirmText: 'OK',
      type: 'info',
      ...options,
    } as AlertModalOptions);
  }

  /**
   * Open a confirm modal
   */
  public confirm(options: Omit<ConfirmModalOptions, 'id'>): ModalId {
    return this.addModal('confirm', {
      closeOnBackdrop: true,
      closeOnEsc: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'info',
      ...options,
    } as ConfirmModalOptions);
  }

  /**
   * Open a custom modal
   */
  public custom(options: Omit<CustomModalOptions, 'id'>): ModalId {
    return this.addModal('custom', {
      closeOnBackdrop: true,
      closeOnEsc: true,
      ...options,
    } as CustomModalOptions);
  }

  /**
   * Close a specific modal by ID
   */
  public close(id: ModalId): void {
    const index = this.modals.findIndex((modal) => modal.id === id);
    if (index === -1) return;

    const modal = this.modals[index];

    // Call onClose callback if it exists
    if (modal.type === 'custom') {
      const customOptions = modal.options as CustomModalOptions;
      customOptions.onClose?.();
    }

    // Remove modal from stack
    this.modals.splice(index, 1);

    // Go back in history if this was the topmost modal
    if (isBrowser && index === this.modals.length && window.history.state?.[MODAL_STATE_KEY] === id) {
      window.history.back();
    }

    this.notifyObservers();
  }

  /**
   * Close the topmost modal in the stack
   */
  public closeTop(): void {
    if (this.modals.length === 0) return;
    const topModal = this.modals[this.modals.length - 1];
    this.close(topModal.id);
  }

  /**
   * Close all modals
   */
  public closeAll(): void {
    const modalIds = this.modals.map((modal) => modal.id);

    // Call onClose for all custom modals
    this.modals.forEach((modal) => {
      if (modal.type === 'custom') {
        const customOptions = modal.options as CustomModalOptions;
        customOptions.onClose?.();
      }
    });

    // Clear all modals
    this.modals = [];

    // Navigate back through history for each modal
    if (isBrowser) {
      modalIds.forEach(() => {
        if (window.history.state?.[MODAL_STATE_KEY]) {
          window.history.back();
        }
      });
    }

    this.notifyObservers();
  }

  /**
   * Get all active modals (returns a copy)
   */
  public getModals(): ModalState[] {
    return [...this.modals];
  }

  /**
   * Subscribe to modal state changes
   * Returns unsubscribe function
   */
  public subscribe(observer: ModalObserver): () => void {
    this.observers.add(observer);

    // Immediately notify the new observer of current state
    observer([...this.modals]);

    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Cleanup method for testing or app teardown
   */
  public destroy(): void {
    this.closeAll();
    this.observers.clear();
    if (isBrowser) {
      window.removeEventListener('popstate', this.handlePopState);
    }
    this.historyListenerActive = false;
  }
}

/**
 * Export singleton instance
 */
export const modalManager = ModalManager.getInstance();

/**
 * Export class for testing purposes
 */
export { ModalManager };
