export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  textColor: string;
  selected: boolean;
  opacity: number;
}

export type DrawMode = 'auto' | 'manual';
export type AlgorithmMode = 'random' | 'smart';

export type DrawingState =
  | 'idle'
  | 'spinning'
  | 'selecting'
  | 'waiting-stop'
  | 'complete';

export interface DrawingResult {
  main: number[];
  bonus: number;
  algorithm: AlgorithmMode;
  timestamp: number;
}

export type DrawingAction =
  | { type: 'START'; payload: { numbers: number[]; mode: DrawMode } }
  | { type: 'SPIN_COMPLETE' }
  | { type: 'SELECT_NEXT' }
  | { type: 'STOP_CLICK' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' };

export interface DrawingReducerState {
  state: DrawingState;
  mode: DrawMode;
  preSelectedNumbers: number[];
  revealedNumbers: number[];
  currentIndex: number;
  results: DrawingResult[];
}

export interface LottoHistoryEntry {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
}
