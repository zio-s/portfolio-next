import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { LottoBall } from './LottoBall';
import { Plus } from 'lucide-react';
import type { DrawingResult } from '../types/lotto.types';

interface LottoHistoryProps {
  results: DrawingResult[];
}

export function LottoHistory({ results }: LottoHistoryProps) {
  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-purple-400" />
        <h3 className="text-sm font-medium text-foreground">생성 이력</h3>
        <span className="text-xs text-muted-foreground">({results.length}건)</span>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {results.map((result, i) => (
          <motion.div
            key={result.timestamp}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-card/50 flex-wrap"
          >
            <span className="text-xs text-muted-foreground w-16 shrink-0">
              {new Date(result.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {result.main.map(num => (
                <LottoBall key={num} number={num} size="sm" delay={0} />
              ))}
              <Plus size={10} className="text-muted-foreground mx-0.5" />
              <LottoBall number={result.bonus} size="sm" delay={0} isBonus />
            </div>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {result.algorithm === 'smart' ? 'AI' : '랜덤'}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
