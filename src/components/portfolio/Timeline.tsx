/**
 * Timeline Component
 *
 * Display chronological events (experience, education, etc.)
 * with a visual timeline
 */

import * as React from 'react';
import { FadeIn } from '@/components/animations/FadeIn';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  period: string;
  description?: string;
  tags?: string[];
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline items */}
      <div className="space-y-8">
        {items.map((item, index) => (
          <FadeIn key={item.id} delay={index * 0.1}>
            <div className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 flex items-center justify-center">
                {item.icon ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {item.icon}
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                )}
              </div>

              {/* Content */}
              <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{item.period}</p>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
};
