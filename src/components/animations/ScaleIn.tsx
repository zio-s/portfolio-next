/**
 * ScaleIn Animation Component
 *
 * Scale-in animation with fade effect
 * Perfect for cards, images, and emphasis elements
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

export interface ScaleInProps extends HTMLMotionProps<'div'> {
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
   * Initial scale value
   * @default 0.8
   */
  initialScale?: number;

  /**
   * Whether to animate only once
   * @default true
   */
  once?: boolean;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  initialScale = 0.8,
  once = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{
        scale: initialScale,
        opacity: 0,
      }}
      whileInView={{
        scale: 1,
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
