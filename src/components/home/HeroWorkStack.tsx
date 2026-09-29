'use client';

/**
 * HeroWorkStack
 *
 * 히어로 오른쪽의 겹쳐 놓은 작업 미리보기 3장.
 * - 카드 위치는 고정하고, 몇 초마다 한 장씩 "앞으로" 나온다 (z-index + 살짝 떠오름)
 * - 마우스를 올리거나 포커스가 들어오면 멈추고, 올린 카드가 앞으로 나온다
 * - prefers-reduced-motion이면 자동 전환 없이 정지 상태로 둔다
 * - 카드를 누르면 해당 프로젝트 상세 모달이 열린다
 */

import { useEffect, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { openProjectModal } from '@/components/portfolio/openProjectModal';

export interface HeroStackItem {
  projectId: string;
  title: string;
  /** 저장소 캡처는 StaticImageData(next/image로 최적화), DB 썸네일은 외부 URL 문자열 */
  src: string | StaticImageData;
  alt: string;
  /** 세로 폰 화면 캡처 — 항상 맨 앞 폰 슬롯에 놓는다 */
  isPhone?: boolean;
}

interface HeroWorkStackProps {
  /** [뒤 오른쪽(세로), 가운데 왼쪽(가로), 앞 폰 화면] 순서 */
  items: HeroStackItem[];
  className?: string;
}

const ROTATE_MS = 3600;

// 620×640 기준 디자인을 퍼센트로 옮긴 슬롯 — 컨테이너 폭에 맞춰 같이 줄어든다
const SLOTS = [
  { className: 'right-0 top-0 w-[45%] aspect-[9/13] rotate-[7deg] rounded-2xl', frame: '', image: 'object-center' },
  { className: 'left-0 top-[17%] w-[72%] aspect-[16/10] -rotate-[5deg] rounded-2xl', frame: '', image: 'object-center' },
  {
    className: 'left-[38%] top-[19%] w-[38%] aspect-[585/1266] rotate-[3deg] rounded-[28px]',
    frame: 'border-[6px] border-[#2a2a27]',
    image: 'object-top',
  },
];

export function HeroWorkStack({ items, className }: HeroWorkStackProps) {
  const reduceMotion = useReducedMotion();
  // 카드는 뒤에서부터 슬롯을 채운다 — 폰 캡처가 맨 앞이면 [세로, 가로, 폰] 3칸,
  // 아니면 폰 슬롯을 비우고 [세로, 가로] 2칸만 쓴다. 장수가 모자라면 앞쪽 슬롯부터 비운다.
  const endsWithPhone = Boolean(items.at(-1)?.isPhone);
  const slotCount = endsWithPhone ? SLOTS.length : SLOTS.length - 1;
  const cards = items.slice(-slotCount).map((item, index, list) => ({
    item,
    slot: SLOTS[slotCount - list.length + index],
  }));
  // null이면 "맨 뒤 카드(폰 화면)가 앞" — 데이터가 늦게 바뀌어 카드 수가 달라져도 범위를 벗어나지 않게 매번 계산
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null && activeIndex < cards.length ? activeIndex : cards.length - 1;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || cards.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setActiveIndex((prev) => {
        const current = prev !== null && prev < cards.length ? prev : cards.length - 1;
        return (current + 1) % cards.length;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, cards.length]);

  if (cards.length === 0) return null;

  return (
    <div
      className={cn('relative w-full max-w-[620px] aspect-[620/640]', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {cards.map(({ item, slot }, index) => {
        const isActive = index === active;
        return (
          <button
            key={item.projectId}
            type="button"
            onClick={() => openProjectModal(item.projectId)}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            aria-label={`${item.title} 자세히 보기`}
            className={cn(
              'absolute overflow-hidden bg-card shadow-[0_32px_64px_rgba(0,0,0,0.55)] outline-none',
              'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background',
              'transition-[translate,scale,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              slot.className,
              slot.frame,
              isActive ? 'z-30 -translate-y-2 scale-[1.03] opacity-100' : 'z-10 opacity-80'
            )}
          >
            {typeof item.src === 'string' ? (
              <img
                src={item.src}
                alt={item.alt}
                className={cn('h-full w-full object-cover', slot.image)}
                loading="eager"
                fetchPriority="high"
                draggable={false}
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                priority
                sizes="(min-width: 1024px) 440px, 72vw"
                className={cn('object-cover', slot.image)}
                draggable={false}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default HeroWorkStack;
