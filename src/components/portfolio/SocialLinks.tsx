/**
 * SocialLinks Component
 *
 * Display social media links with icons
 * Supports various platforms with customizable styling
 */

import * as React from 'react';
import { Github, Linkedin, Mail, Twitter, Globe, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SocialPlatform = 'github' | 'linkedin' | 'twitter' | 'email' | 'website' | 'instagram';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface SocialLinksProps {
  links: SocialLink[];
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.FC<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  website: Globe,
  instagram: Instagram,
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  github: 'hover:text-gray-900 dark:hover:text-white',
  linkedin: 'hover:text-blue-600',
  twitter: 'hover:text-blue-400',
  email: 'hover:text-red-500',
  website: 'hover:text-green-500',
  instagram: 'hover:text-pink-500',
};

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    default:
      'inline-flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200',
    minimal: 'inline-flex items-center justify-center text-muted-foreground transition-colors',
    pill: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {links.map((link) => {
        const Icon = PLATFORM_ICONS[link.platform];
        const href = link.platform === 'email' ? `mailto:${link.url}` : link.url;

        return (
          <a
            key={link.platform}
            href={href}
            target={link.platform !== 'email' ? '_blank' : undefined}
            rel={link.platform !== 'email' ? 'noopener noreferrer' : undefined}
            aria-label={link.label || link.platform}
            className={cn(
              variantClasses[variant],
              variant === 'minimal' && PLATFORM_COLORS[link.platform],
              variant !== 'pill' && sizeClasses[size]
            )}
          >
            <Icon className={iconSizeClasses[size]} />
            {variant === 'pill' && link.label && (
              <span className="text-sm font-medium">{link.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
};
