/**
 * AlertModal Component
 *
 * Minimal alert dialog matching h-creations.com aesthetic
 * Dark theme with deep purple accent
 */

import React from 'react';
import {AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { AlertModalOptions } from './types';

interface AlertModalProps {
  modalId: string;
  options: AlertModalOptions;
  isVisible: boolean;
  zIndex: number;
  onClose: () => void;
  onBackdropClick: () => void;
}

/**
 * AlertModal component for displaying alert messages
 */
export const AlertModal: React.FC<AlertModalProps> = ({
  options,
  isVisible,
  zIndex,
  onClose,
  onBackdropClick,
}) => {
  if (!isVisible) return null;

  const { title, message, confirmText = '확인', type = 'info', className, onConfirm } = options;

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    onConfirm?.();
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
   * Get icon and styles based on alert type
   */
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          Icon: CheckCircle,
          iconClass: 'text-green-500',
          bgClass: 'bg-green-500/10',
        };
      case 'warning':
        return {
          Icon: AlertTriangle,
          iconClass: 'text-yellow-500',
          bgClass: 'bg-yellow-500/10',
        };
      case 'error':
        return {
          Icon: AlertCircle,
          iconClass: 'text-red-500',
          bgClass: 'bg-red-500/10',
        };
      case 'info':
      default:
        return {
          Icon: Info,
          iconClass: 'text-accent',
          bgClass: 'bg-accent/10',
        };
    }
  };

  const { Icon, iconClass, bgClass } = getTypeConfig();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-background/98 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-card border border-border rounded-lg shadow-lg min-w-[320px] max-w-[480px] animate-in slide-in-from-bottom-4 duration-300 ${className || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgClass} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconClass}`} />
            </div>

            {/* Title */}
            {title && (
              <h3 className="text-lg font-semibold text-foreground leading-tight pt-2">
                {title}
              </h3>
            )}
          </div>

          {/*/!* Close button *!/*/}
          {/*<button*/}
          {/*  onClick={onClose}*/}
          {/*  className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"*/}
          {/*  aria-label="닫기"*/}
          {/*>*/}
          {/*  <X className="w-5 h-5" />*/}
          {/*</button>*/}
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed ml-[52px]">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity min-w-[80px]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
