/**
 * useTooltip Hook
 *
 * Hook for managing tooltip state and interactions
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTooltipOptions {
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface UseTooltipReturn {
  isVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  tooltipProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export const useTooltip = (options: UseTooltipOptions = {}): UseTooltipReturn => {
  const { delay = 200 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    showTooltip,
    hideTooltip,
    tooltipProps: {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    },
  };
};
