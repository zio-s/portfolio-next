import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { LottoBall } from './LottoBall';
import { LOTTO } from '../utils/lottoConstants';
import type { DrawingResult } from '../types/lotto.types';

interface LottoResultsProps {
  revealedNumbers: number[];
  isComplete: boolean;
  results: DrawingResult[];
}

export function LottoResults({ revealedNumbers, isComplete, results }: LottoResultsProps) {
  const mainNumbers = revealedNumbers.slice(0, LOTTO.MAIN_COUNT).sort((a, b) => a - b);
  const bonusNumber = revealedNumbers.length > LOTTO.MAIN_COUNT ? revealedNumbers[LOTTO.MAIN_COUNT] : null;

  if (revealedNumbers.length === 0 && results.length === 0) return null;

  return (
    <div className="space-y-4">
      {revealedNumbers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {isComplete ? '추첨 결과' : '추첨 중...'}
          </h3>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <AnimatePresence mode="popLayout">
              {mainNumbers.map((num, i) => (
                <LottoBall key={num} number={num} size="lg" delay={i * 0.1} />
              ))}
              {bonusNumber !== null && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground mx-1"
                  >
                    <Plus size={16} />
                  </motion.div>
                  <LottoBall
                    key={`bonus-${bonusNumber}`}
                    number={bonusNumber}
                    size="lg"
                    delay={0.7}
                    isBonus
                  />
                </>
              )}
            </AnimatePresence>
          </div>
          {isComplete && (
            <CopyButton
              numbers={mainNumbers}
              bonus={bonusNumber}
              className="mt-3"
            />
          )}
        </motion.div>
      )}

      {results.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">이전 결과</h3>
          {results.slice(1, 6).map((result, i) => (
            <ResultRow key={result.timestamp} result={result} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ result, index }: { result: DrawingResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-lg p-3 flex items-center gap-2 flex-wrap"
    >
      <span className="text-xs text-muted-foreground w-8 shrink-0">
        #{index + 2}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {result.main.map(num => (
          <LottoBall key={num} number={num} size="sm" delay={0} />
        ))}
        <Plus size={12} className="text-muted-foreground mx-0.5" />
        <LottoBall number={result.bonus} size="sm" delay={0} isBonus />
      </div>
      <CopyButton
        numbers={result.main}
        bonus={result.bonus}
        className="ml-auto"
        compact
      />
    </motion.div>
  );
}

function CopyButton({
  numbers,
  bonus,
  className = '',
  compact = false,
}: {
  numbers: number[];
  bonus: number | null;
  className?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = bonus !== null
      ? `${numbers.join(', ')} + ${bonus}`
      : numbers.join(', ');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [numbers, bonus]);

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1 text-xs text-muted-foreground
        hover:text-foreground transition-colors ${className}
      `}
    >
      {copied ? (
        <Check size={compact ? 14 : 16} className="text-green-400" />
      ) : (
        <Copy size={compact ? 14 : 16} />
      )}
      {!compact && (copied ? '복사됨' : '복사')}
    </button>
  );
}
