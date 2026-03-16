import { Sparkles, Shuffle } from 'lucide-react';
import type { AlgorithmMode } from '../types/lotto.types';

interface LottoAlgorithmSelectorProps {
  algorithm: AlgorithmMode;
  onChange: (mode: AlgorithmMode) => void;
  disabled: boolean;
}

export function LottoAlgorithmSelector({ algorithm, onChange, disabled }: LottoAlgorithmSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('random')}
        disabled={disabled}
        className={`
          flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all
          ${algorithm === 'random'
            ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
            : 'glass text-muted-foreground hover:text-foreground'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Shuffle size={14} />
        순수 랜덤
      </button>
      <button
        onClick={() => onChange('smart')}
        disabled={disabled}
        className={`
          flex-1 py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all
          ${algorithm === 'smart'
            ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
            : 'glass text-muted-foreground hover:text-foreground'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Sparkles size={14} />
        AI 추천
      </button>
    </div>
  );
}
