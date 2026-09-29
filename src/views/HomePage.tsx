'use client';

/**
 * Home/Landing Page
 *
 * 2026-09 리디자인 (웜 뉴트럴 다크 + 오렌지 단일 포인트)
 * - 히어로: 이름과 한 줄 소개 + 작업 화면 3장을 겹친 미리보기
 * - 대표 작업: 첫 번째 featured 프로젝트의 실제 화면과 문제 해결 표
 * - 다른 작업: 큰 글자 목록 + 커서를 따라오는 미리보기
 * - 최근 글, 연락처
 * 텍스트·프로젝트 순서는 DB(관리자 화면)에서 바꾸고, 실제 캡처 이미지는 data/projectShowcase.ts에서 관리한다.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfilePageJsonLd } from '@/components/common/JsonLd';
import { HeroWorkStack, type HeroStackItem } from '@/components/home/HeroWorkStack';
import { FeaturedProject } from '@/components/home/FeaturedProject';
import { WorkIndex } from '@/components/home/WorkIndex';
import { useGetProjectsQuery } from '@/features/portfolio/api/projectsApi';
import { useGetPostsQuery } from '@/store';
import type { Project, ProjectsResponse } from '@/features/portfolio/types/Project';
import type { Post } from '@/store/types';
import { ROUTES } from '@/router';
import { formatBlogDate } from '@/lib/blog';
import {
  HOME_HERO_STACK_IDS,
  getProjectCoverUrl,
  getProjectShowcase,
  isPlaceholderImage,
  isThisSite,
  splitProjectTitle,
} from '@/data/projectShowcase';

const EMAIL = 'popqr1@gmail.com';
const GITHUB_URL = 'https://github.com/zio-s';
const KAKAO_URL = 'https://open.kakao.com/o/sAtkrp1h';

interface HomePageProps {
  /** 서버에서 미리 가져온 데이터 — 크롤러가 목록 내용을 읽을 수 있도록 첫 HTML에 포함 */
  initialProjects?: ProjectsResponse;
  initialPosts?: Post[];
}

const toStackItem = (project: Project): HeroStackItem => ({
  projectId: project.id,
  title: splitProjectTitle(project.title).name,
  src: getProjectShowcase(project.id)?.cover.src ?? project.thumbnail,
  alt: `${splitProjectTitle(project.title).name} 화면`,
});

/** 히어로 겹침 카드: [뒤 세로, 가운데 가로, 앞 폰 화면] */
const buildHeroStack = (spotlight: Project | undefined, others: Project[]): HeroStackItem[] => {
  const withCover = others.filter((project) => !isPlaceholderImage(getProjectCoverUrl(project)));
  const curated = HOME_HERO_STACK_IDS.map((id) => withCover.find((project) => project.id === id)).filter(
    (project): project is Project => Boolean(project)
  );
  const fillers = withCover.filter((project) => !HOME_HERO_STACK_IDS.includes(project.id));
  const back = [...curated, ...fillers].slice(0, 2).map(toStackItem);

  if (!spotlight) return back;
  const screen = getProjectShowcase(spotlight.id)?.screens?.[0];
  const front: HeroStackItem = screen
    ? {
        projectId: spotlight.id,
        title: splitProjectTitle(spotlight.title).name,
        src: screen.src,
        alt: screen.alt,
        isPhone: true,
      }
    : toStackItem(spotlight);
  const frontUrl = typeof front.src === 'string' ? front.src : front.src.src;
  return isPlaceholderImage(frontUrl) ? back : [...back, front];
};

const underlineLink =
  'border-b border-[#55534e] pb-0.5 text-[15px] text-foreground transition-colors hover:border-accent hover:text-accent sm:text-base';

const HomePage = ({ initialProjects, initialPosts }: HomePageProps) => {
  // 클라이언트 fetch가 끝나기 전(및 SSR)에는 서버에서 내려준 initial 데이터로 렌더
  const { data: projectsQuery } = useGetProjectsQuery({ featured: true });
  // 이 사이트 자체(semincode.com)는 방문자가 이미 보고 있으므로 홈 목록에서 뺀다
  const projects = ((projectsQuery ?? initialProjects)?.items ?? []).filter((project) => !isThisSite(project));

  const { data: postsQuery } = useGetPostsQuery({ status: 'published' });
  const posts = (postsQuery?.posts ?? initialPosts ?? []).slice(0, 3);

  const [spotlight, ...otherProjects] = projects;
  const heroStack = buildHeroStack(spotlight, otherProjects);

  return (
    <MainLayout>
      {/* JSON-LD 구조화 데이터 - 홈페이지용 ProfilePage 스키마 */}
      <ProfilePageJsonLd
        url="https://semincode.com"
        title="변세민 | 프론트엔드 개발자 포트폴리오"
        description="프론트엔드 개발자 변세민의 포트폴리오입니다. React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다."
      />

      {/* Hero */}
      <section id="hero" className="overflow-hidden px-4 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 pb-20 pt-14 sm:pt-20 lg:min-h-[calc(100dvh-60px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-10 lg:pb-24 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
          <div className="flex flex-col gap-7 sm:gap-8">
            <p className="text-[15px] text-muted-foreground sm:text-[17px]">프론트엔드 개발자 · React / Next.js</p>
            <h1 className="whitespace-nowrap text-[clamp(4.5rem,19vw,10.75rem)] font-bold leading-[0.95] tracking-[-0.06em] lg:text-[clamp(6.5rem,11vw,10.75rem)]">
              변세민
            </h1>
            <p className="max-w-[34rem] text-[21px] font-medium leading-[1.55] tracking-[-0.02em] text-foreground sm:text-[26px] text-pretty">
              화면만이 아니라 데이터 설계와 배포까지, 서비스를{' '}
              <span className="text-accent">처음부터 끝까지</span> 만들어 봤습니다.
            </p>
            <div className="mt-1 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <a
                href="#work"
                className="group inline-flex h-14 shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-accent px-7 text-[17px] font-bold text-accent-foreground transition-[background-color,scale] duration-150 hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                작업 보기
                <ArrowRight
                  className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
              <div className="flex items-center justify-center gap-6 sm:justify-start">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                  GitHub
                </a>
                <a href={`mailto:${EMAIL}`} className={underlineLink}>
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>

          {heroStack.length > 0 && (
            <div className="mx-auto flex w-[88%] max-w-[620px] flex-col gap-4 sm:w-full lg:mr-0">
              <HeroWorkStack items={heroStack} />
              {/* 겹친 카드가 무엇인지 알려주는 캡션 — 히어로 문장은 사람 소개, 대표작은 여기서 연결 */}
              {spotlight && (
                <a
                  href="#work"
                  className="self-end text-[14px] text-muted-foreground transition-colors hover:text-accent sm:text-[15px]"
                >
                  최근 작업 · {splitProjectTitle(spotlight.title).name}
                  {splitProjectTitle(spotlight.title).subtitle ? `, ${splitProjectTitle(spotlight.title).subtitle}` : ''}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 대표 작업 */}
      {spotlight && <FeaturedProject project={spotlight} />}

      {/* 다른 작업 */}
      {otherProjects.length > 0 && (
        <section aria-labelledby="other-work-title" className="px-4 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:gap-12">
            <div className="flex items-end justify-between gap-6">
              <h2 id="other-work-title" className="text-3xl font-bold tracking-[-0.03em] sm:text-[44px]">
                다른 작업
              </h2>
              <Link
                to={ROUTES.PROJECTS}
                className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground transition-colors hover:text-accent"
              >
                전체 프로젝트
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <WorkIndex projects={otherProjects} />
          </div>
        </section>
      )}

      {/* 최근 글 */}
      {posts.length > 0 && (
        <section aria-labelledby="posts-title" className="px-4 pb-20 sm:px-8 sm:pb-28 lg:pb-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
            <h2 id="posts-title" className="text-3xl font-bold tracking-[-0.03em] sm:text-[44px] lg:col-span-4">
              최근 글
            </h2>
            <div className="lg:col-span-8">
              <ul className="border-t border-border">
                {posts.map((post) => (
                  <li key={post.id} className="border-b border-border">
                    <Link
                      to={`/blog/${post.post_number}`}
                      className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-6"
                    >
                      <span className="text-[17px] font-medium leading-snug text-foreground transition-colors group-hover:text-accent sm:text-xl text-pretty">
                        {post.title}
                      </span>
                      <time
                        dateTime={post.publishedAt || post.createdAt}
                        className="shrink-0 font-mono text-[13px] text-muted-foreground"
                      >
                        {formatBlogDate(post.publishedAt || post.createdAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.BLOG}
                className="mt-7 inline-flex items-center gap-1.5 text-[15px] text-muted-foreground transition-colors hover:text-accent"
              >
                글 전체 보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 연락처 */}
      <section id="contact" aria-labelledby="contact-title" className="bg-accent px-4 text-accent-foreground sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12 pt-16 sm:gap-14 sm:pb-14 sm:pt-24 lg:pt-28">
          <h2 id="contact-title" className="text-xl font-semibold tracking-[-0.02em] sm:text-[28px]">
            함께 일할 팀을 찾고 있습니다.
          </h2>
          <a
            href={`mailto:${EMAIL}`}
            className="w-fit font-display text-[clamp(2.1rem,9.2vw,8.25rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-accent-foreground decoration-[0.06em] underline-offset-[0.12em] hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {EMAIL}
          </a>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#111110]/25 pt-6 text-[15px] font-semibold sm:text-base">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-accent-foreground hover:underline">
              GitHub
            </a>
            <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="text-accent-foreground hover:underline">
              오픈카톡
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
