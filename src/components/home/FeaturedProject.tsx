'use client';

/**
 * FeaturedProject
 *
 * 홈의 대표 작업 섹션.
 * - 이름·설명·기술·링크·문제 해결 표는 DB(관리자 폼)의 값을 그대로 쓴다
 * - 화면 이미지는 projectShowcase에 등록된 캡처가 있으면 폰 화면 2장 + 확대 이미지로,
 *   없으면 대표 이미지 1장으로 보여준다
 */

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/features/portfolio/types/Project';
import { getProjectCoverUrl, getProjectShowcase, isPlaceholderImage, splitProjectTitle } from '@/data/projectShowcase';
import { openProjectModal } from '@/components/portfolio/openProjectModal';

interface FeaturedProjectProps {
  project: Project;
  /** 홈에 보여줄 문제 해결 줄 수 */
  maxChallenges?: number;
}

const pillLink =
  'inline-flex items-center gap-1.5 h-12 px-5 rounded-full border border-[#3a3935] text-[15px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export function FeaturedProject({ project, maxChallenges = 3 }: FeaturedProjectProps) {
  const { name, subtitle } = splitProjectTitle(project.title);
  const showcase = getProjectShowcase(project.id);
  const coverUrl = getProjectCoverUrl(project);
  const hasScreens = Boolean(showcase?.screens?.length);
  const hasVisual = hasScreens || !isPlaceholderImage(coverUrl);
  const challenges = (project.challenges ?? [])
    .map((problem, index) => ({ problem, solution: project.solutions?.[index] }))
    .filter((row) => row.problem.trim())
    .slice(0, maxChallenges);

  return (
    <section
      id="work"
      aria-labelledby="featured-title"
      className="scroll-mt-20 border-t border-border bg-[#171715] px-4 py-20 sm:px-8 sm:py-28 lg:py-32"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-14 lg:gap-18">
        {/* 제목 */}
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <p className="text-[15px] font-semibold text-accent">대표 작업</p>
            <h2
              id="featured-title"
              className="mt-4 font-display text-[clamp(4rem,11vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]"
            >
              {name}
            </h2>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-5 lg:pb-3">
            {/* 부제가 없으면 설명은 아래 본문에만 쓴다 (같은 문단이 두 번 나오지 않게) */}
            {(subtitle || project.duration) && (
              <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl text-pretty">
                {subtitle}
                {project.duration ? (
                  <span className="text-muted-foreground">
                    {subtitle ? ' · ' : ''}
                    {project.duration}
                  </span>
                ) : null}
              </p>
            )}
            {project.techStack.length > 0 && (
              <p className="font-mono text-[13px] leading-relaxed text-muted-foreground">
                {project.techStack.slice(0, 6).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* 화면 + 설명 */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          {hasScreens && showcase?.screens ? (
            <div className="relative overflow-hidden rounded-[20px] bg-[#efe3d3] lg:col-span-7">
              <div className="grid grid-cols-2 items-start gap-4 px-5 pb-10 pt-8 sm:gap-8 sm:px-12 sm:pb-16 sm:pt-12">
                {showcase.screens.slice(0, 2).map((screen, index) => (
                  <Image
                    key={screen.alt}
                    src={screen.src}
                    alt={screen.alt}
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className={`h-auto w-full rounded-[22px] border-[5px] border-[#1b1b1a] shadow-[0_30px_60px_rgba(80,45,10,0.25)] sm:rounded-[30px] sm:border-[7px] ${
                      index === 1 ? 'mt-12 sm:mt-16' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : hasVisual ? (
            <img
              src={coverUrl}
              alt={`${name} 화면`}
              className="aspect-video w-full rounded-[20px] border border-border object-cover lg:col-span-7"
            />
          ) : null}

          <div
            className={`flex flex-col justify-between gap-10 ${hasVisual ? 'lg:col-span-5 lg:pl-4' : 'lg:col-span-8'}`}
          >
            <div className="flex flex-col gap-8">
              <p className="max-w-[60ch] text-[17px] leading-[1.8] text-[#d6d4ce] sm:text-lg text-pretty">
                {project.description}
              </p>
              {showcase?.detail && (
                <figure className="flex flex-col gap-3">
                  <Image
                    src={showcase.detail.src}
                    alt={showcase.detail.alt}
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="h-auto w-full rounded-2xl"
                  />
                  <figcaption className="text-[15px] leading-relaxed text-muted-foreground">
                    {showcase.detail.caption}
                  </figcaption>
                </figure>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={pillLink}>
                  라이브 데모
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={pillLink}>
                  소스 코드
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <button type="button" onClick={() => openProjectModal(project.id)} className={pillLink}>
                자세히 보기
              </button>
            </div>
          </div>
        </div>

        {/* 문제 해결 표 — 관리자 폼의 "문제 / 해결" 항목 */}
        {challenges.length > 0 && (
          <div>
            <h3 className="sr-only">{name}에서 해결한 문제</h3>
            <div className="hidden grid-cols-12 gap-6 border-b border-border pb-4 font-mono text-[13px] text-muted-foreground md:grid">
              <span className="col-span-5">문제</span>
              <span className="col-span-7">해결</span>
            </div>
            <ol>
              {challenges.map((row, index) => (
                <li
                  key={index}
                  className="grid grid-cols-1 gap-3 border-b border-border py-7 md:grid-cols-12 md:gap-6 md:py-9"
                >
                  <p className="text-lg font-bold leading-snug tracking-[-0.01em] text-foreground md:col-span-5 md:text-[22px] text-pretty">
                    {row.problem}
                  </p>
                  {row.solution && (
                    <p className="text-[16px] leading-[1.75] text-[#c9c7c1] md:col-span-7 md:text-[17px] text-pretty">
                      <span className="mr-2 font-mono text-[13px] text-accent md:hidden">해결</span>
                      {row.solution}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProject;
