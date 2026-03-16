import { useCallback, useState } from 'react';
import type { AlgorithmMode } from '../types/lotto.types';
import { generateNumbers } from '../utils/lottoAlgorithm';

export function useLottoAlgorithm() {
  const [algorithm, setAlgorithm] = useState<AlgorithmMode>('random');

  const generate = useCallback(() => {
    return generateNumbers(algorithm);
  }, [algorithm]);

  return { algorithm, setAlgorithm, generate };
}
