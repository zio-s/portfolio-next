/**
 * Modal Types and Interfaces
 *
 * Defines the core types for the modal management system including
 * modal options, actions, and observer patterns.
 */

/**
 * Unique identifier for modal instances
 */
export type ModalId = string;

/**
 * Base modal options shared across all modal types
 */
export interface BaseModalOptions {
  /** Unique identifier for the modal */
  id?: ModalId;
  /** Modal title */
  title?: string;
  /** Whether clicking backdrop closes the modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing ESC closes the modal */
  closeOnEsc?: boolean;
  /** Additional CSS classes for modal wrapper */
  className?: string;
  /** Z-index for modal stacking */
  zIndex?: number;
}

/**
 * Alert modal specific options
 */
export interface AlertModalOptions extends BaseModalOptions {
  /** Alert message content */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Alert type for styling */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Callback when modal is confirmed/closed */
  onConfirm?: () => void;
}

/**
 * Confirm modal specific options
 */
export interface ConfirmModalOptions extends BaseModalOptions {
  /** Confirmation message content */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirmation type for styling */
  type?: 'info' | 'warning' | 'danger';
  /** Callback when confirmed */
  onConfirm?: () => void;
  /** Callback when cancelled */
  onCancel?: () => void;
}

/**
 * Custom modal options for generic modals
 */
export interface CustomModalOptions extends BaseModalOptions {
  /** React component to render */
  component: React.ComponentType<ModalComponentProps>;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Callback when modal closes */
  onClose?: () => void;
}

/**
 * Union type for all modal options
 */
export type ModalOptions = AlertModalOptions | ConfirmModalOptions | CustomModalOptions;

/**
 * Modal types for type discrimination
 */
export type ModalType = 'alert' | 'confirm' | 'custom';

/**
 * Internal modal state representation
 */
export interface ModalState {
  /** Unique modal identifier */
  id: ModalId;
  /** Type of modal */
  type: ModalType;
  /** Modal configuration options */
  options: ModalOptions;
  /** Whether modal is currently visible */
  isVisible: boolean;
  /** Creation timestamp for ordering */
  timestamp: number;
}

/**
 * Props passed to custom modal components
 */
export interface ModalComponentProps {
  /** Function to close the modal */
  close: () => void;
  /** Modal ID for reference */
  modalId: ModalId;
  /** Any custom props passed to the modal */
  [key: string]: unknown;
}

/**
 * Observer pattern callback for modal state changes
 */
export type ModalObserver = (modals: ModalState[]) => void;

/**
 * Modal manager actions interface
 */
export interface ModalManagerActions {
  /** Open an alert modal */
  alert: (options: Omit<AlertModalOptions, 'id'>) => ModalId;
  /** Open a confirm modal */
  confirm: (options: Omit<ConfirmModalOptions, 'id'>) => ModalId;
  /** Open a custom modal */
  custom: (options: Omit<CustomModalOptions, 'id'>) => ModalId;
  /** Close a specific modal by ID */
  close: (id: ModalId) => void;
  /** Close the topmost modal */
  closeTop: () => void;
  /** Close all modals */
  closeAll: () => void;
  /** Get all active modals */
  getModals: () => ModalState[];
  /** Subscribe to modal state changes */
  subscribe: (observer: ModalObserver) => () => void;
}

/**
 * Alert modal hook return type
 */
export interface AlertModalHook {
  /** Show an alert modal */
  showAlert: (options: Omit<AlertModalOptions, 'id'>) => ModalId;
  /** Close the alert modal by ID */
  closeAlert: (id: ModalId) => void;
}

/**
 * Confirm modal hook return type
 */
export interface ConfirmModalHook {
  /** Show a confirm modal */
  showConfirm: (options: Omit<ConfirmModalOptions, 'id'>) => ModalId;
  /** Close the confirm modal by ID */
  closeConfirm: (id: ModalId) => void;
}
