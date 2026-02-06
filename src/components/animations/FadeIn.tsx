/**
 * FadeIn Animation Component
 *
 * Smooth fade-in animation using Framer Motion
 * Can be used to wrap any content for entrance animations
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

export interface FadeInProps extends HTMLMotionProps<'div'> {
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;

  /**
   * Animation duration in seconds
   * @default 0.5
   */
  duration?: number;

  /**
   * Animation direction
   * @default 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';

  /**
   * Distance to travel during animation (in pixels)
   * @default 20
   */
  distance?: number;

  /**
   * Whether to animate only once (when in view)
   * @default true
   */
  once?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  once = true,
  ...props
}) => {
  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
        return {};
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...getInitialPosition(),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
