/**
 * SkillBadge Component
 *
 * Badge component for displaying skills/technologies
 * with optional icon and proficiency level
 */

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SkillBadgeProps {
  name: string;
  icon?: React.ReactNode;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: 'frontend' | 'backend' | 'devops' | 'design' | 'other';
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  icon,
  proficiency,
  category,
  className,
}) => {
  // Proficiency colors
  const proficiencyColors = {
    beginner: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    intermediate: 'bg-green-500/10 text-green-500 border-green-500/20',
    advanced: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    expert: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  // Category colors
  const categoryColors = {
    frontend: 'bg-primary/10 text-primary border-primary/20',
    backend: 'bg-secondary/10 text-secondary border-secondary/20',
    devops: 'bg-green-500/10 text-green-500 border-green-500/20',
    design: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    other: 'bg-muted text-muted-foreground border-border',
  };

  const colorClass = proficiency
    ? proficiencyColors[proficiency]
    : category
      ? categoryColors[category]
      : 'bg-muted text-muted-foreground border-border';

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 border',
        colorClass,
        className
      )}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{name}</span>
    </Badge>
  );
};
