/**
 * ProjectCard Component
 *
 * Minimal, professional project card with slide-up animation on hover
 * Click to open modal with full details
 */

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExternalLink, Github, Eye, Heart } from 'lucide-react';
import { modalManager } from '@/components/modal/modal-manager';
import { ProjectDetailModal } from './ProjectDetailModal';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags?: string[];
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
  stats?: {
    views?: number;
    likes?: number;
  };
  featured?: boolean;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  techStack = [],
  githubUrl,
  liveUrl,
  stats,
  featured = false,
  className,
}) => {
  const handleCardClick = () => {
    modalManager.custom({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: ProjectDetailModal as React.ComponentType<any>,
      props: {
        projectId: id,
      },
      closeOnBackdrop: true,
      closeOnEsc: true,
    });
  };

  return (
    <Card
      hover
      className={cn(
        'group cursor-pointer overflow-hidden h-full relative',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Background Image - Full Card */}
      <div className="relative aspect-video overflow-hidden bg-card">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark Overlay - appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content Overlay - slides up slightly from bottom on hover */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-[30%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
          {/* Title */}
          <h3 className="text-xl font-bold mb-2 leading-tight text-white">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-white/90 line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="text-xs text-white/80 px-2 py-1 rounded bg-white/10 backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 5 && (
                <span className="text-xs text-white/80 px-2 py-1 rounded bg-white/10 backdrop-blur-sm">
                  +{techStack.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Footer: Links & Stats */}
          <div className="flex items-center justify-between">
            {/* Links */}
            <div className="flex gap-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View on GitHub"
                >
                  <Github className="w-4 h-4 text-white" />
                </a>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View live demo"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex gap-3 text-xs text-white/80">
                {stats.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {stats.views}
                  </span>
                )}
                {stats.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {stats.likes}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
