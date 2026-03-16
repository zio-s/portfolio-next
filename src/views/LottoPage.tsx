import { useState, useCallback, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEO } from '@/components/common/SEO';
import { LottoMachine } from '@/features/lotto/components/LottoMachine';
import { LottoControls } from '@/features/lotto/components/LottoControls';
import { LottoResults } from '@/features/lotto/components/LottoResults';
import { LottoHistory } from '@/features/lotto/components/LottoHistory';
import { LottoAlgorithmSelector } from '@/features/lotto/components/LottoAlgorithmSelector';
import { useLottoDrawing } from '@/features/lotto/hooks/useLottoDrawing';
import { useLottoAlgorithm } from '@/features/lotto/hooks/useLottoAlgorithm';
import type { DrawMode, DrawingResult } from '@/features/lotto/types/lotto.types';
import { LOTTO } from '@/features/lotto/utils/lottoConstants';

const LottoPage = () => {
  const [drawMode, setDrawMode] = useState<DrawMode>('auto');
  const [setCount, setSetCount] = useState(1);
  const [allResults, setAllResults] = useState<DrawingResult[]>([]);
  const currentSetRef = useRef(0);

  const { algorithm, setAlgorithm, generate } = useLottoAlgorithm();
  const {
    drawingState,
    revealedNumbers,
    preSelectedNumbers,
    results,
    startDraw,
    handleStop,
    reset,
  } = useLottoDrawing();

  const isSpinning = drawingState === 'spinning';
  const isRunning = drawingState !== 'idle' && drawingState !== 'complete';

  const algorithmRef = useRef(algorithm);
  algorithmRef.current = algorithm;

  // Auto-save result when drawing completes
  const savedRef = useRef(false);
  useEffect(() => {
    if (drawingState === 'complete' && revealedNumbers.length >= LOTTO.TOTAL_PICK && !savedRef.current) {
      savedRef.current = true;
      const main = revealedNumbers.slice(0, LOTTO.MAIN_COUNT).sort((a, b) => a - b);
      const bonus = revealedNumbers[LOTTO.MAIN_COUNT];
      setAllResults(prev => [{
        main,
        bonus,
        algorithm: algorithmRef.current,
        timestamp: Date.now(),
      }, ...prev]);
    }
    if (drawingState === 'idle') {
      savedRef.current = false;
    }
  }, [drawingState, revealedNumbers]);

  const handleStart = useCallback(() => {
    currentSetRef.current = 0;
    const numbers = generate();
    startDraw(numbers, drawMode, algorithm);
  }, [generate, startDraw, drawMode, algorithm]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <MainLayout>
      <SEO
        title="로또 번호 생성기"
        description="인터랙티브 로또 번호 생성기 - 물리 시뮬레이션 추첨기와 AI 추천 알고리즘"
      />

      <div className="min-h-screen py-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary">
              로또 번호 생성기
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              물리 시뮬레이션 기반 추첨기
            </p>
          </div>

          {/* Algorithm Selector */}
          <LottoAlgorithmSelector
            algorithm={algorithm}
            onChange={setAlgorithm}
            disabled={isRunning}
          />

          {/* Lotto Machine Canvas */}
          <LottoMachine
            isSpinning={isSpinning || drawingState === 'selecting' || drawingState === 'waiting-stop'}
            selectedIds={revealedNumbers}
          />

          {/* Controls */}
          <LottoControls
            drawingState={drawingState}
            mode={drawMode}
            setCount={setCount}
            onModeChange={setDrawMode}
            onSetCountChange={setSetCount}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
          />

          {/* Results */}
          <LottoResults
            revealedNumbers={revealedNumbers}
            isComplete={drawingState === 'complete'}
            results={allResults}
          />

          {/* History */}
          <LottoHistory results={allResults} />
        </div>
      </div>
    </MainLayout>
  );
};

export default LottoPage;
