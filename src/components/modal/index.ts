/**
 * Modal System Exports
 *
 * Main export point for the modal management system.
 * Import everything you need from this single file.
 *
 * @example
 * ```tsx
 * // Import the container and hooks
 * import { ModalContainer, useAlertModal, useConfirmModal } from '@/components/modal';
 *
 * // Add ModalContainer to your app root
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <ModalContainer />
 *     </>
 *   );
 * }
 *
 * // Use hooks in your components
 * function MyComponent() {
 *   const { showAlert } = useAlertModal();
 *   const { showConfirm } = useConfirmModal();
 *
 *   return (
 *     <button onClick={() => showAlert({ message: 'Hello!' })}>
 *       Show Alert
 *     </button>
 *   );
 * }
 * ```
 */

// Core components
export { ModalContainer } from './ModalContainer';
export { AlertModal } from './AlertModal';
export { ConfirmModal } from './ConfirmModal';

// Modal manager
export { modalManager, ModalManager } from './modal-manager';

// Hooks
export { useModalManager, useAlertModal, useConfirmModal } from './hooks';

// Types
export type {
  ModalId,
  BaseModalOptions,
  AlertModalOptions,
  ConfirmModalOptions,
  CustomModalOptions,
  ModalOptions,
  ModalType,
  ModalState,
  ModalComponentProps,
  ModalObserver,
  ModalManagerActions,
  AlertModalHook,
  ConfirmModalHook,
} from './types';
