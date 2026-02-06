/**
 * SlideIn Animation Component
 *
 * Slide-in animation from various directions
 * Using Framer Motion
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

export interface SlideInProps extends HTMLMotionProps<'div'> {
  /**
   * Direction to slide from
   * @default 'left'
   */
  from?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;

  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number;

  /**
   * Distance to slide (in pixels)
   * @default 50
   */
  distance?: number;

  /**
   * Whether to animate only once
   * @default true
   */
  once?: boolean;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  from = 'left',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  ...props
}) => {
  const getInitialPosition = () => {
    switch (from) {
      case 'left':
        return { x: -distance, opacity: 0 };
      case 'right':
        return { x: distance, opacity: 0 };
      case 'top':
        return { y: -distance, opacity: 0 };
      case 'bottom':
        return { y: distance, opacity: 0 };
      default:
        return { x: -distance, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{
        x: 0,
        y: 0,
        opacity: 1,
      }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
