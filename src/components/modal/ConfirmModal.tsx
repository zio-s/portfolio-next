/**
 * ConfirmModal Component
 *
 * A confirmation dialog component with confirm and cancel actions.
 * Supports different confirmation types (info, warning, danger).
 */

import React from 'react';
import type { ConfirmModalOptions } from './types';

interface ConfirmModalProps {
  modalId: string;
  options: ConfirmModalOptions;
  isVisible: boolean;
  zIndex: number;
  onClose: () => void;
  onBackdropClick: () => void;
}

/**
 * ConfirmModal component for displaying confirmation dialogs
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  options,
  isVisible,
  zIndex,
  onClose,
  onBackdropClick,
}) => {
  if (!isVisible) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    className,
    onConfirm,
    onCancel,
  } = options;

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onBackdropClick();
    }
  };

  /**
   * Get icon and color based on confirmation type
   */
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠',
          iconColor: '#f59e0b',
          confirmBgColor: '#f59e0b',
          confirmHoverBgColor: '#d97706',
        };
      case 'danger':
        return {
          icon: '⚠',
          iconColor: '#ef4444',
          confirmBgColor: '#ef4444',
          confirmHoverBgColor: '#dc2626',
        };
      case 'info':
      default:
        return {
          icon: '?',
          iconColor: '#3b82f6',
          confirmBgColor: '#3b82f6',
          confirmHoverBgColor: '#2563eb',
        };
    }
  };

  const typeStyles = getTypeStyles();

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
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={className}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '320px',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${typeStyles.iconColor}15`,
              color: typeStyles.iconColor,
              fontSize: '20px',
              fontWeight: 'bold',
              flexShrink: 0,
              marginRight: '12px',
            }}
          >
            {typeStyles.icon}
          </div>
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '40px',
              }}
            >
              {title}
            </h3>
          )}
        </div>

        {/* Message */}
        <div
          style={{
            marginBottom: '24px',
            marginLeft: title ? '52px' : '0',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5',
          }}
        >
          {message}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: typeStyles.confirmBgColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};
