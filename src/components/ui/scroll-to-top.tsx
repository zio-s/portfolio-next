/**
 * ScrollToTop Component
 *
 * Button that appears on scroll and smoothly scrolls to top on click
 * Minimal design inspired by h-creations.com aesthetic
 */

import * as React from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScrollToTopProps {
  /** Scroll threshold to show button (in pixels) */
  threshold?: number;
  /** Additional className */
  className?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  className,
}) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const showTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Show button when page is scrolled down
  React.useEffect(() => {
    const toggleVisibility = () => {
      // Clear all pending timeouts to prevent conflicts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (window.scrollY > threshold) {
        // Show: render first, then animate in
        setShouldRender(true);
        showTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
          showTimeoutRef.current = null;
        }, 10); // Small delay to ensure DOM update
      } else {
        // Hide: animate out first, then remove from DOM
        setIsVisible(false);
        hideTimeoutRef.current = setTimeout(() => {
          setShouldRender(false);
          hideTimeoutRef.current = null;
        }, 300); // Match transition duration
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [threshold]);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {shouldRender && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-8 right-8 z-50',
            'p-3 rounded-lg',
            'bg-accent text-white',
            'border border-accent shadow-lg',
            'hover:bg-accent/90 hover:shadow-xl',
            'transition-all duration-300 ease-out',
            'group',
            // Slide up animation from bottom
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12',
            className
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}
    </>
  );
};
