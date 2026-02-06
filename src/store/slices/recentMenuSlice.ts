/**
 * Recent Menu Slice
 *
 * 사용자가 최근 방문한 페이지/프로젝트를 추적하고 관리합니다.
 *
 * 주요 기능:
 * 1. 프로젝트 상세 페이지 방문 시 자동 추적
 * 2. 중복 제거 (같은 프로젝트 재방문 시 최신으로 갱신)
 * 3. 최대 10개 항목 유지
 * 4. LocalStorage 영속성 (브라우저 재시작 후에도 유지)
 * 5. Header의 드롭다운에서 빠른 재접근 제공
 *
 * @architecture-decision
 * Redux를 선택한 이유:
 * - Header 컴포넌트에서 전역 접근 필요
 * - LocalStorage와 동기화 필요
 * - Context API보다 명확한 상태 흐름
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/**
 * Recent Menu 아이템 타입
 */
export interface RecentMenuItem {
  id: string;
  type: 'project' | 'page';
  title: string;
  path: string;
  thumbnail?: string;
  description?: string;
  timestamp: number;
}

/**
 * Recent Menu State
 */
interface RecentMenuState {
  items: RecentMenuItem[];
  maxItems: number;
}

// LocalStorage 키
const STORAGE_KEY = 'portfolio:recentMenu';

/**
 * LocalStorage에서 초기 상태 로드 (클라이언트 전용)
 */
const loadInitialState = (): RecentMenuItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored) as RecentMenuItem[];
      // 7일 이상 된 항목 필터링
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return items.filter(item => item.timestamp > sevenDaysAgo);
    }
  } catch {
    // Error handled silently
  }
  return [];
};

/**
 * LocalStorage에 저장 (클라이언트 전용)
 */
const saveToStorage = (items: RecentMenuItem[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Error handled silently
  }
};

const initialState: RecentMenuState = {
  items: loadInitialState(),
  maxItems: 10,
};

/**
 * Recent Menu Slice
 */
const recentMenuSlice = createSlice({
  name: 'recentMenu',
  initialState,
  reducers: {
    /**
     * 최근 방문 항목 추가
     *
     * 로직:
     * 1. 기존에 같은 ID가 있으면 제거 (중복 방지)
     * 2. 새 항목을 맨 앞에 추가 (최신순)
     * 3. maxItems를 초과하면 오래된 항목 제거
     * 4. LocalStorage에 저장
     */
    addRecentItem: (state, action: PayloadAction<Omit<RecentMenuItem, 'timestamp'>>) => {
      const newItem: RecentMenuItem = {
        ...action.payload,
        timestamp: Date.now(),
      };

      // 중복 제거
      state.items = state.items.filter(item => item.id !== newItem.id);

      // 맨 앞에 추가
      state.items.unshift(newItem);

      // 최대 개수 제한
      if (state.items.length > state.maxItems) {
        state.items = state.items.slice(0, state.maxItems);
      }

      // LocalStorage 저장
      saveToStorage(state.items);
    },

    /**
     * 특정 항목 제거
     */
    removeRecentItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveToStorage(state.items);
    },

    /**
     * 모든 항목 제거
     */
    clearRecentItems: state => {
      state.items = [];
      saveToStorage([]);
    },

    /**
     * 최대 항목 수 변경
     */
    setMaxItems: (state, action: PayloadAction<number>) => {
      state.maxItems = action.payload;

      // 최대 개수를 초과하면 오래된 항목 제거
      if (state.items.length > state.maxItems) {
        state.items = state.items.slice(0, state.maxItems);
        saveToStorage(state.items);
      }
    },
  },
});

// Actions
export const { addRecentItem, removeRecentItem, clearRecentItems, setMaxItems } =
  recentMenuSlice.actions;

// Selectors
export const selectRecentItems = (state: RootState) => state.recentMenu.items;
export const selectRecentItemsCount = (state: RootState) => state.recentMenu.items.length;
export const selectMaxItems = (state: RootState) => state.recentMenu.maxItems;

// Reducer
export default recentMenuSlice.reducer;
