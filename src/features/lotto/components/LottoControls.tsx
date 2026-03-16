import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Hand } from 'lucide-react';
import type { DrawMode, DrawingState } from '../types/lotto.types';

interface LottoControlsProps {
  drawingState: DrawingState;
  mode: DrawMode;
  setCount: number;
  onModeChange: (mode: DrawMode) => void;
  onSetCountChange: (count: number) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function LottoControls({
  drawingState,
  mode,
  setCount,
  onModeChange,
  onSetCountChange,
  onStart,
  onStop,
  onReset,
}: LottoControlsProps) {
  const isIdle = drawingState === 'idle';
  const isComplete = drawingState === 'complete';
  const isWaitingStop = drawingState === 'waiting-stop';
  const isRunning = drawingState === 'spinning' || drawingState === 'selecting';

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <ModeButton
          active={mode === 'auto'}
          disabled={!isIdle}
          onClick={() => onModeChange('auto')}
          icon={<Play size={14} />}
          label="자동"
        />
        <ModeButton
          active={mode === 'manual'}
          disabled={!isIdle}
          onClick={() => onModeChange('manual')}
          icon={<Hand size={14} />}
          label="수동"
        />
      </div>

      {/* Set count selector */}
      {isIdle && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">세트 수</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => onSetCountChange(n)}
                className={`
                  w-8 h-8 rounded-lg text-sm font-medium transition-all
                  ${setCount === n
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'glass text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isIdle && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-shadow"
          >
            <Play size={18} />
            추첨 시작
          </motion.button>
        )}

        {isWaitingStop && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStop}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-shadow animate-pulse"
          >
            <Square size={18} />
            STOP
          </motion.button>
        )}

        {isRunning && (
          <div className="flex-1 h-12 rounded-xl glass flex items-center justify-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            추첨 중...
          </div>
        )}

        {isComplete && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex-1 h-12 rounded-xl glass text-foreground font-medium flex items-center justify-center gap-2 hover:bg-card transition-colors"
          >
            <RotateCcw size={18} />
            다시 추첨
          </motion.button>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all
        ${active
          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
          : 'glass text-muted-foreground hover:text-foreground'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
