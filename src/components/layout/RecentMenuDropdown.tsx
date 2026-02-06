/**
 * Recent Menu Dropdown Component
 *
 * 사용자가 최근 방문한 프로젝트/페이지를 드롭다운으로 표시합니다.
 *
 * 주요 기능:
 * - 최근 10개 항목 표시
 * - 썸네일 + 제목 + 시간 표시
 * - 빈 상태 처리
 * - 전체 삭제 기능
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  selectRecentItems,
  selectRecentItemsCount,
  clearRecentItems,
  removeRecentItem,
} from '../../store/slices/recentMenuSlice';
import { useConfirmModal } from '@/components/modal/hooks';
import './recentMenu.css';

/**
 * 시간 포맷팅 유틸리티
 */
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString('ko-KR');
};

export const RecentMenuDropdown = () => {
  const dispatch = useAppDispatch();
  const recentItems = useAppSelector(selectRecentItems);
  const itemsCount = useAppSelector(selectRecentItemsCount);
  const { showConfirm } = useConfirmModal();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * 드롭다운 토글
   */
  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  /**
   * 전체 항목 삭제
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
        setIsOpen(false);
      },
    });
  };

  /**
   * 개별 항목 삭제
   */
  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeRecentItem(id));
  };

  /**
   * 외부 클릭 시 드롭다운 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="recent-menu" ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        className="recent-menu__trigger"
        onClick={handleToggle}
        aria-label="최근 방문 항목"
        aria-expanded={isOpen}
      >
        <svg
          className="recent-menu__icon"
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
          <span className="recent-menu__badge">{itemsCount}</span>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      <div className={`recent-menu__dropdown ${isOpen ? 'recent-menu__dropdown--open' : ''}`}>
        {/* 헤더 */}
        <div className="recent-menu__header">
          <h3 className="recent-menu__title">최근 방문</h3>
          {itemsCount > 0 && (
            <button
              className="recent-menu__clear-button"
              onClick={handleClearAll}
              title="전체 삭제"
            >
              전체 삭제
            </button>
          )}
        </div>

        {/* 항목 리스트 */}
        <div className="recent-menu__list">
          {itemsCount === 0 ? (
            <div className="recent-menu__empty">
              <svg
                className="recent-menu__empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="recent-menu__empty-text">최근 방문한 항목이 없습니다</p>
            </div>
          ) : (
            recentItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className="recent-menu__item"
                onClick={() => setIsOpen(false)}
              >
                {/* 썸네일 */}
                {item.thumbnail && (
                  <div className="recent-menu__item-thumbnail">
                    <img src={item.thumbnail} alt={item.title} />
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className="recent-menu__item-content">
                  <div className="recent-menu__item-title">{item.title}</div>
                  {item.description && (
                    <div className="recent-menu__item-description">{item.description}</div>
                  )}
                  <div className="recent-menu__item-time">
                    {formatTimeAgo(item.timestamp)}
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button
                  className="recent-menu__item-remove"
                  onClick={(e) => handleRemoveItem(item.id, e)}
                  title="삭제"
                  aria-label={`${item.title} 삭제`}
                >
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentMenuDropdown;
