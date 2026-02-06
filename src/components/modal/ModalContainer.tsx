/**
 * ModalContainer Component
 *
 * Root container for rendering all active modals.
 * Handles modal stacking, backdrop clicks, and keyboard events.
 * Should be placed at the root of your application.
 */

import React, { useEffect, useCallback } from 'react';
import { useModalManager } from './hooks/use-modal-manager';
import { AlertModal } from './AlertModal';
import { ConfirmModal } from './ConfirmModal';
import type { ModalState, AlertModalOptions, ConfirmModalOptions, CustomModalOptions } from './types';

/**
 * Base z-index for modal overlays
 */
const BASE_Z_INDEX = 1000;

/**
 * ModalContainer component for rendering all active modals
 */
export const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useModalManager();

  /**
   * Handle ESC key press to close topmost modal
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.options.closeOnEsc !== false) {
          closeModal(topModal.id);
        }
      }
    },
    [modals, closeModal]
  );

  /**
   * Register ESC key listener
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback(
    (modalId: string, closeOnBackdrop: boolean) => {
      if (closeOnBackdrop !== false) {
        closeModal(modalId);
      }
    },
    [closeModal]
  );

  /**
   * Render individual modal based on type
   */
  const renderModal = (modal: ModalState, index: number) => {
    const zIndex = (modal.options.zIndex || BASE_Z_INDEX) + index;

    const commonProps = {
      modalId: modal.id,
      isVisible: modal.isVisible,
      zIndex,
      onClose: () => closeModal(modal.id),
      onBackdropClick: () => handleBackdropClick(modal.id, modal.options.closeOnBackdrop ?? true),
    };

    switch (modal.type) {
      case 'alert':
        return <AlertModal key={modal.id} {...commonProps} options={modal.options as AlertModalOptions} />;

      case 'confirm':
        return <ConfirmModal key={modal.id} {...commonProps} options={modal.options as ConfirmModalOptions} />;

      case 'custom': {
        const customOptions = modal.options as CustomModalOptions;
        const CustomComponent = customOptions.component;
        return (
          <ModalWrapper key={modal.id} {...commonProps}>
            <CustomComponent
              close={() => closeModal(modal.id)}
              modalId={modal.id}
              {...(customOptions.props || {})}
            />
          </ModalWrapper>
        );
      }

      default:
        return null;
    }
  };

  return <>{modals.map(renderModal)}</>;
};

/**
 * ModalWrapper component for custom modals
 */
interface ModalWrapperProps {
  children: React.ReactNode;
  modalId: string;
  isVisible: boolean;
  zIndex: number;
  onBackdropClick: () => void;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  isVisible,
  zIndex,
  onBackdropClick,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onBackdropClick();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
};
