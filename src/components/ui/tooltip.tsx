'use client';

/**
 * Tooltip Component
 *
 * 데스크톱: hover anchored tooltip (top/bottom/left/right) — viewport edge 자동 보정
 * 모바일 (<768px): tap 시 화면 하단 fixed mini toast — 1.5s 자동 사라짐, 짤림 X
 *
 * 모바일에서는 미니멀 (padding 작고, 한 줄)로.
 */

import * as React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const POS_CLASSES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const;

const ARROW_CLASSES = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
} as const;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [edgeOffset, setEdgeOffset] = React.useState(0); // 데스크톱 viewport edge 보정 px
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const showTimerRef = React.useRef<number | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);
  const dismissTimerRef = React.useRef<number | null>(null);

  const clearTimers = () => {
    if (showTimerRef.current) { window.clearTimeout(showTimerRef.current); showTimerRef.current = null; }
    if (hideTimerRef.current) { window.clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    if (dismissTimerRef.current) { window.clearTimeout(dismissTimerRef.current); dismissTimerRef.current = null; }
  };

  const open = (autoDismissMs?: number) => {
    clearTimers();
    setShouldRender(true);
    showTimerRef.current = window.setTimeout(() => setIsVisible(true), delay);
    if (autoDismissMs) {
      dismissTimerRef.current = window.setTimeout(() => close(), autoDismissMs + delay);
    }
  };

  const close = () => {
    clearTimers();
    setIsVisible(false);
    hideTimerRef.current = window.setTimeout(() => setShouldRender(false), 150);
  };

  // 데스크톱: 보일 때 viewport edge 보정 계산
  React.useLayoutEffect(() => {
    if (!isVisible || isMobile || !tooltipRef.current) return;
    if (position !== 'top' && position !== 'bottom') return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;
    let offset = 0;
    if (rect.left < margin) offset = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) offset = (window.innerWidth - margin) - rect.right;
    setEdgeOffset(offset);
  }, [isVisible, isMobile, position, content]);

  // 모바일 — 외부 탭하면 닫기
  React.useEffect(() => {
    if (!isMobile || !shouldRender) return;
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, shouldRender]);

  React.useEffect(() => () => clearTimers(), []);

  // 데스크톱 hover, 모바일 tap
  const desktopHandlers = !isMobile ? {
    onMouseEnter: () => open(),
    onMouseLeave: () => close(),
    onFocus: () => open(),
    onBlur: () => close(),
  } : {};

  const mobileHandlers = isMobile ? {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      shouldRender ? close() : open(1500);
    },
  } : {};

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      {...desktopHandlers}
      {...mobileHandlers}
    >
      {children}

      {shouldRender && content && !isMobile && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-1.5 rounded-lg pointer-events-none',
            'bg-accent/90 backdrop-blur-sm border border-accent shadow-lg',
            'text-sm text-white font-medium',
            'transition-all duration-150',
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1',
            POS_CLASSES[position],
            className
          )}
          style={{
            maxWidth: 'min(280px, calc(100vw - 16px))',
            whiteSpace: 'normal',
            wordBreak: 'keep-all',
            transform: edgeOffset
              ? `translateX(calc(-50% + ${edgeOffset}px))`
              : undefined,
          }}
        >
          {content}
          {/* 화살표는 위치 보정과 충돌 가능 → edgeOffset이 있을 땐 숨김 */}
          {edgeOffset === 0 && (
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-accent/90',
                ARROW_CLASSES[position]
              )}
            />
          )}
        </div>
      )}

      {/* 모바일 — fixed bottom toast */}
      {shouldRender && content && isMobile && (
        <div
          role="tooltip"
          className={cn(
            'fixed left-1/2 z-[1100] px-3 py-1.5 rounded-md pointer-events-none',
            'bg-accent/95 backdrop-blur-sm shadow-lg',
            'text-[12px] text-white font-medium',
            'transition-all duration-150',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
            className
          )}
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            transform: 'translateX(-50%)',
            maxWidth: 'calc(100vw - 32px)',
            whiteSpace: 'normal',
            wordBreak: 'keep-all',
            textAlign: 'center',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
