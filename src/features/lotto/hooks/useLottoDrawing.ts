import { useReducer, useRef, useCallback, useEffect } from 'react';
import type {
  DrawMode,
  DrawingAction,
  DrawingReducerState,
  AlgorithmMode,
} from '../types/lotto.types';
import { LOTTO } from '../utils/lottoConstants';

const initialState: DrawingReducerState = {
  state: 'idle',
  mode: 'auto',
  preSelectedNumbers: [],
  revealedNumbers: [],
  currentIndex: 0,
  results: [],
};

function reducer(state: DrawingReducerState, action: DrawingAction): DrawingReducerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        state: 'spinning',
        mode: action.payload.mode,
        preSelectedNumbers: action.payload.numbers,
        revealedNumbers: [],
        currentIndex: 0,
      };
    case 'SPIN_COMPLETE':
      return {
        ...state,
        state: state.mode === 'auto' ? 'selecting' : 'waiting-stop',
      };
    case 'SELECT_NEXT': {
      const nextRevealed = [
        ...state.revealedNumbers,
        state.preSelectedNumbers[state.currentIndex],
      ];
      const nextIndex = state.currentIndex + 1;

      if (nextIndex >= LOTTO.TOTAL_PICK) {
        return {
          ...state,
          revealedNumbers: nextRevealed,
          currentIndex: nextIndex,
          state: 'complete',
        };
      }

      return {
        ...state,
        revealedNumbers: nextRevealed,
        currentIndex: nextIndex,
        state: state.mode === 'auto' ? 'selecting' : 'waiting-stop',
      };
    }
    case 'STOP_CLICK': {
      const nextRevealed = [
        ...state.revealedNumbers,
        state.preSelectedNumbers[state.currentIndex],
      ];
      const nextIndex = state.currentIndex + 1;

      if (nextIndex >= LOTTO.TOTAL_PICK) {
        return {
          ...state,
          revealedNumbers: nextRevealed,
          currentIndex: nextIndex,
          state: 'complete',
        };
      }

      return {
        ...state,
        revealedNumbers: nextRevealed,
        currentIndex: nextIndex,
        state: 'waiting-stop',
      };
    }
    case 'COMPLETE':
      return { ...state, state: 'complete' };
    case 'RESET':
      return { ...initialState, results: state.results };
    default:
      return state;
  }
}

export function useLottoDrawing() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    timerRef.current = null;
    autoTimerRef.current = null;
  }, []);

  const startDraw = useCallback(
    (numbers: number[], mode: DrawMode, _algorithm: AlgorithmMode) => {
      clearTimers();
      dispatch({ type: 'START', payload: { numbers, mode } });

      timerRef.current = setTimeout(() => {
        dispatch({ type: 'SPIN_COMPLETE' });

        if (mode === 'auto') {
          dispatch({ type: 'SELECT_NEXT' });

          let count = 1;
          autoTimerRef.current = setInterval(() => {
            count++;
            dispatch({ type: 'SELECT_NEXT' });
            if (count >= LOTTO.TOTAL_PICK) {
              if (autoTimerRef.current) clearInterval(autoTimerRef.current);
            }
          }, LOTTO.AUTO_SELECT_INTERVAL);
        }
      }, LOTTO.SPIN_DURATION);
    },
    [clearTimers]
  );

  const handleStop = useCallback(() => {
    if (state.state === 'waiting-stop') {
      dispatch({ type: 'STOP_CLICK' });
    }
  }, [state.state]);

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  return {
    drawingState: state.state,
    mode: state.mode,
    revealedNumbers: state.revealedNumbers,
    preSelectedNumbers: state.preSelectedNumbers,
    currentIndex: state.currentIndex,
    results: state.results,
    startDraw,
    handleStop,
    reset,
  };
}
