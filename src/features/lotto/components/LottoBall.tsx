import { motion } from 'framer-motion';
import { getBallColor } from '../utils/lottoColors';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  isBonus?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function LottoBall({ number, size = 'md', delay = 0, isBonus = false }: LottoBallProps) {
  const { bg, text } = getBallColor(number);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
      className={`
        ${sizeMap[size]}
        rounded-full inline-flex items-center justify-center font-bold
        shadow-lg relative select-none
        ${isBonus ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
      `}
      style={{
        background: `radial-gradient(circle at 35% 35%, ${lighten(bg)}, ${bg}, ${darken(bg)})`,
        color: text,
      }}
    >
      {number}
    </motion.div>
  );
}

function lighten(hex: string): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + 50);
  const g = Math.min(255, ((num >> 8) & 0xff) + 50);
  const b = Math.min(255, (num & 0xff) + 50);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - 40);
  const g = Math.max(0, ((num >> 8) & 0xff) - 40);
  const b = Math.max(0, (num & 0xff) - 40);
  return `rgb(${r},${g},${b})`;
}
