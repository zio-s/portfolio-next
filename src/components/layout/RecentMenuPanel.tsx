/**
 * 최근 방문 항목 사이드 패널 (360px, 우측 슬라이드)
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  selectRecentItems,
  selectRecentItemsCount,
  clearRecentItems,
  removeRecentItem,
  type RecentMenuItem,
} from '../../store/slices/recentMenuSlice';
import { useConfirmModal } from '@/components/modal/hooks';
import './recentMenuPanel.css';

/**
 * 시간 포맷팅 - 더 자세한 버전
 */
const formatDetailedTime = (timestamp: number): { relative: string; absolute: string } => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  let relative = '';
  if (minutes < 1) relative = '방금 전';
  else if (minutes < 60) relative = `${minutes}분 전`;
  else if (hours < 24) relative = `${hours}시간 전`;
  else if (days < 7) relative = `${days}일 전`;
  else relative = '일주일 이상';

  const date = new Date(timestamp);
  const absolute = date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { relative, absolute };
};

/**
 * 타임라인 그룹핑 (오늘, 어제, 이번 주, 그 이전)
 */
const groupByTime = (items: RecentMenuItem[]) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  return {
    today: items.filter(item => item.timestamp >= today),
    yesterday: items.filter(item => item.timestamp >= yesterday && item.timestamp < today),
    thisWeek: items.filter(item => item.timestamp >= weekAgo && item.timestamp < yesterday),
    older: items.filter(item => item.timestamp < weekAgo),
  };
};

export const RecentMenuPanel = () => {
  const dispatch = useAppDispatch();
  const recentItems = useAppSelector(selectRecentItems);
  const itemsCount = useAppSelector(selectRecentItemsCount);
  const { showConfirm } = useConfirmModal();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 검색 필터링
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return recentItems;

    const query = searchQuery.toLowerCase();
    return recentItems.filter(
      (item: RecentMenuItem) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [recentItems, searchQuery]);

  /**
   * 타임라인 그룹핑
   */
  const groupedItems = useMemo(() => groupByTime(filteredItems), [filteredItems]);

  /**
   * 패널 열기/닫기
   */
  const togglePanel = () => setIsOpen(prev => !prev);

  const closePanel = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  /**
   * 전체 삭제
   */
  const handleClearAll = () => {
    showConfirm({
      title: '전체 삭제',
      message: '최근 방문 기록을 모두 삭제하시겠습니까?',
      type: 'warning',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: () => {
        dispatch(clearRecentItems());
        closePanel();
      },
    });
  };

  /**
   * 개별 삭제
   */
  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeRecentItem(id));
  };

  /**
   * ESC 키로 닫기
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  /**
   * 패널 열릴 때 body 스크롤 방지
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * 타임라인 섹션 렌더링
   */
  const renderTimelineSection = (title: string, items: RecentMenuItem[]) => {
    if (items.length === 0) return null;

    return (
      <div className="recent-panel__section">
        <h4 className="recent-panel__section-title">{title}</h4>
        <div className="recent-panel__timeline">
          {items.map(item => {
            const time = formatDetailedTime(item.timestamp);
            return (
              <Link
                key={item.id}
                to={item.path}
                className="recent-panel__card"
                onClick={closePanel}
              >
                {/* 타임라인 도트 */}
                <div className="recent-panel__timeline-dot" />

                {/* 썸네일 */}
                {item.thumbnail && (
                  <div className="recent-panel__thumbnail">
                    <img src={item.thumbnail} alt={item.title} />
                    <div className="recent-panel__thumbnail-overlay">
                      <svg
                        width="24"
                        height="24"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className="recent-panel__content">
                  <div className="recent-panel__header">
                    <h5 className="recent-panel__title">{item.title}</h5>
                    <button
                      className="recent-panel__remove"
                      onClick={e => handleRemoveItem(item.id, e)}
                      title="삭제"
                    >
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>

                  {item.description && (
                    <p className="recent-panel__description">{item.description}</p>
                  )}

                  <div className="recent-panel__meta">
                    <time className="recent-panel__time" title={time.absolute}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      {time.relative}
                    </time>

                    <span className="recent-panel__type">
                      {item.type === 'project' ? '프로젝트' : '페이지'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        className="recent-panel__trigger"
        onClick={togglePanel}
        aria-label="최근 방문 항목"
      >
        <svg
          className="recent-panel__trigger-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {itemsCount > 0 && (
          <span className="recent-panel__badge">{itemsCount}</span>
        )}
      </button>

      {/* 오버레이 */}
      <div
        className={`recent-panel__overlay ${isOpen ? 'recent-panel__overlay--visible' : ''}`}
        onClick={closePanel}
      />

      {/* 사이드 패널 */}
      <aside className={`recent-panel ${isOpen ? 'recent-panel--open' : ''}`}>
        {/* 헤더 */}
        <div className="recent-panel__header-section">
          <div className="recent-panel__header-top">
            <h2 className="recent-panel__main-title">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              최근 방문
            </h2>
            <button
              className="recent-panel__close"
              onClick={closePanel}
              aria-label="닫기"
            >
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* 검색바 */}
          <div className="recent-panel__search">
            <svg className="recent-panel__search-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              className="recent-panel__search-input"
              placeholder="프로젝트 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="recent-panel__search-clear"
                onClick={() => setSearchQuery('')}
              >
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>

          {/* 액션 버튼 */}
          {itemsCount > 0 && (
            <button className="recent-panel__clear-all" onClick={handleClearAll}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              전체 삭제
            </button>
          )}
        </div>

        {/* 타임라인 콘텐츠 */}
        <div className="recent-panel__body">
          {itemsCount === 0 ? (
            <div className="recent-panel__empty">
              <svg
                className="recent-panel__empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="recent-panel__empty-title">방문 기록이 없습니다</h3>
              <p className="recent-panel__empty-text">
                프로젝트를 방문하면 여기에 표시됩니다
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="recent-panel__empty">
              <svg
                className="recent-panel__empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="recent-panel__empty-title">검색 결과 없음</h3>
              <p className="recent-panel__empty-text">
                "{searchQuery}"에 해당하는 항목이 없습니다
              </p>
            </div>
          ) : (
            <>
              {renderTimelineSection('오늘', groupedItems.today)}
              {renderTimelineSection('어제', groupedItems.yesterday)}
              {renderTimelineSection('이번 주', groupedItems.thisWeek)}
              {renderTimelineSection('그 이전', groupedItems.older)}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default RecentMenuPanel;
