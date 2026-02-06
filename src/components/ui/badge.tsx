/**
 * Badge Component
 *
 * Minimal status indicator or label
 * Inspired by h-creations.com clean aesthetic
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    // Base styles - minimal and clean
    const baseStyles = 'inline-flex items-center rounded-md font-medium transition-colors';

    // Variant styles - subtle, no gradients, no effects
    const variantStyles = {
      default: 'bg-accent/10 text-accent',
      secondary: 'bg-card text-card-foreground',
      success: 'bg-green-500/10 text-green-500',
      warning: 'bg-orange-500/10 text-orange-500',
      error: 'bg-red-500/10 text-red-500',
      outline: 'border border-border text-foreground bg-transparent',
      gradient: 'bg-gradient-to-r from-accent to-accent-hover text-white',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
