/**
 * Section Component
 *
 * Semantic section wrapper with consistent spacing
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'lg', ...props }, ref) => {
    const spacingStyles = {
      none: 'py-0',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
      '2xl': 'py-32',
      '3xl': 'py-40',
    };

    return <section ref={ref} className={cn(spacingStyles[spacing], className)} {...props} />;
  }
);

Section.displayName = 'Section';

export { Section };
