/**
 * Stagger Animation Component
 *
 * Animate children with staggered delays
 * Creates a cascading animation effect
 */

import { motion } from 'framer-motion';
import * as React from 'react';

export interface StaggerProps {
  children: React.ReactNode;
  /**
   * Delay between each child animation (in seconds)
   * @default 0.1
   */
  staggerDelay?: number;

  /**
   * Initial delay before first animation (in seconds)
   * @default 0
   */
  initialDelay?: number;

  /**
   * Whether to animate only once
   * @default true
   */
  once?: boolean;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  once = true,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
};
