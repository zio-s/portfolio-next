import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed hooks for Redux
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Custom hook for accessing dispatch and selector together
export const useRedux = () => {
  const dispatch = useAppDispatch();
  const selector = useAppSelector;

  return { dispatch, selector };
};
