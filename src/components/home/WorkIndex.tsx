'use client';

/**
 * WorkIndex
 *
 * 홈의 "다른 작업" 목록.
 * - 큰 글자 목록이고, 데스크톱에서는 마우스를 올린 줄의 화면이 커서 옆에 떠오른다
 * - 태블릿 이하(터치)에서는 떠오르는 미리보기 대신 줄마다 작은 썸네일을 보여준다
 * - 자리표시 이미지(placehold.co)는 실제 화면이 아니므로 미리보기에서 뺀다
 */

import { useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/features/portfolio/types/Project';
import { getProjectCoverUrl, isPlaceholderImage, splitProjectTitle } from '@/data/projectShowcase';
import { openProjectModal } from '@/components/portfolio/openProjectModal';

interface WorkIndexProps {
  projects: Project[];
}

const PREVIEW_W = 400;
const PREVIEW_H = 250;

export function WorkIndex({ projects }: WorkIndexProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 커서 위치는 React state가 아니라 motion value로 추적해 리렌더 없이 따라가게 한다
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 40, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 400, damping: 40, mass: 0.6 });

  const rows = projects.map((project) => {
    const cover = getProjectCoverUrl(project);
    return {
      project,
      ...splitProjectTitle(project.title),
      preview: isPlaceholderImage(cover) ? undefined : cover,
    };
  });
  const hovered = rows.find((row) => row.project.id === hoveredId);
  // 미리보기가 새로 나타날 때는 스프링을 커서 위치로 바로 옮겨, 구석에서 날아오지 않게 한다

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    // 오른쪽 끝에서 미리보기가 화면 밖으로 나가 가로 스크롤이 생기지 않도록 폭 안에 가둔다
    const nextX = Math.min(event.clientX - bounds.left + 24, bounds.width - PREVIEW_W);
    const nextY = event.clientY - bounds.top - PREVIEW_H / 2;
    x.set(nextX);
    y.set(nextY);
    if (!hovered?.preview) {
      springX.jump(nextX);
      springY.jump(nextY);
    }
  };

  return (
    <div
      className="relative"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoveredId(null)}
    >
      <ul className="border-t border-border">
        {rows.map(({ project, name, subtitle, preview }) => {
          const isHovered = hoveredId === project.id;
          return (
            <li key={project.id} className="border-b border-border">
              <button
                type="button"
                onClick={() => openProjectModal(project.id)}
                onPointerEnter={(event) => event.pointerType === 'mouse' && setHoveredId(project.id)}
                onFocus={() => setHoveredId(null)}
                className="group flex w-full items-center gap-4 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent sm:gap-6 sm:py-8 lg:items-baseline lg:justify-between lg:gap-10"
              >
                {preview && (
                  <img
                    src={preview}
                    alt=""
                    aria-hidden="true"
                    className="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-20 sm:w-32 lg:hidden"
                  />
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-10">
                  <span
                    className={`font-display text-[26px] font-bold leading-none tracking-[-0.035em] transition-colors duration-200 sm:text-4xl lg:text-[4.5rem] ${
                      isHovered ? 'text-accent' : 'text-foreground'
                    } group-focus-visible:text-accent`}
                  >
                    {name}
                  </span>
                  <span
                    className={`text-sm leading-snug transition-colors duration-200 line-clamp-2 sm:text-base lg:max-w-[26rem] lg:shrink-0 lg:text-right lg:text-lg lg:line-clamp-1 ${
                      isHovered ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {subtitle ?? project.description}
                  </span>
                </span>
                <ArrowUpRight
                  className="hidden h-6 w-6 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-accent lg:block"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {/* 커서를 따라다니는 미리보기 (마우스 전용, 장식이라 스크린리더에서 숨김) */}
      <AnimatePresence>
        {hovered?.preview && (
          <motion.img
            key={hovered.project.id}
            src={hovered.preview}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 hidden rounded-xl object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] lg:block"
            style={{
              width: PREVIEW_W,
              height: PREVIEW_H,
              x: reduceMotion ? x : springX,
              y: reduceMotion ? y : springY,
              rotate: -3,
            }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkIndex;
