'use client';

/**
 * Home/Landing Page
 *
 * 에디토리얼 벤토(Editorial Bento) 리디자인
 * - 대담한 디스플레이 타이포 + 벤토 그리드 레이아웃
 * - GSAP ScrollTrigger 스크롤 애니메이션
 * - 실제 데이터 기반 카운트업(경력/프로젝트 수) — 하드코딩 없이 자동 계산
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, MessageCircle, Mail, ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { CountUp } from '@/components/home/CountUp';
import { ProfilePageJsonLd } from '@/components/common/JsonLd';
import {useGetProjectsQuery} from "@/features/portfolio/api/projectsApi";
import {useGetGuestbookQuery} from "@/features/guestbook/api/guestbookApi";
import {useGetPostsQuery} from "@/store";
import type { ProjectsResponse } from '@/features/portfolio/types/Project';
import type { GuestbookListResponse } from '@/features/guestbook/types/Guestbook';
import type { Post } from '@/store/types';
import {ROUTES} from "@/router";
import { skills, type Skill } from '@/data/skills';
import { getYearsOfExperience } from '@/data/experience';
// 개별 아이콘 직접 import (Tree-shaking 지원)
import AmazonwebservicesOriginalWordmark from 'devicons-react/lib/icons/AmazonwebservicesOriginalWordmark';
import AxiosPlain from 'devicons-react/lib/icons/AxiosPlain';
import ConfluenceOriginal from 'devicons-react/lib/icons/ConfluenceOriginal';
import Css3Original from 'devicons-react/lib/icons/Css3Original';
import FigmaOriginal from 'devicons-react/lib/icons/FigmaOriginal';
import FramermotionOriginal from 'devicons-react/lib/icons/FramermotionOriginal';
import GitOriginal from 'devicons-react/lib/icons/GitOriginal';
import JavascriptOriginal from 'devicons-react/lib/icons/JavascriptOriginal';
import JiraalignOriginal from 'devicons-react/lib/icons/JiraalignOriginal';
import NextjsOriginal from 'devicons-react/lib/icons/NextjsOriginal';
import ReactOriginal from 'devicons-react/lib/icons/ReactOriginal';
import ReduxOriginal from 'devicons-react/lib/icons/ReduxOriginal';
import SassOriginal from 'devicons-react/lib/icons/SassOriginal';
import SupabaseOriginal from 'devicons-react/lib/icons/SupabaseOriginal';
import TailwindcssOriginal from 'devicons-react/lib/icons/TailwindcssOriginal';
import TypescriptOriginal from 'devicons-react/lib/icons/TypescriptOriginal';
import VercelOriginal from 'devicons-react/lib/icons/VercelOriginal';
import ViteOriginal from 'devicons-react/lib/icons/ViteOriginal';
import { GsapIcon } from '@/components/icons/GsapIcon';

gsap.registerPlugin(ScrollTrigger);

// 정적 아이콘 매핑 (Tree-shaking 최적화)
const iconMap: Record<string, React.ComponentType<{ size?: string }>> = {
  amazonwebservices: AmazonwebservicesOriginalWordmark,
  axios: AxiosPlain,
  confluence: ConfluenceOriginal,
  css3: Css3Original,
  figma: FigmaOriginal,
  framermotion: FramermotionOriginal,
  git: GitOriginal,
  gsap: GsapIcon,
  javascript: JavascriptOriginal,
  jiraalign: JiraalignOriginal,
  nextjs: NextjsOriginal,
  react: ReactOriginal,
  redux: ReduxOriginal,
  sass: SassOriginal,
  supabase: SupabaseOriginal,
  tailwindcss: TailwindcssOriginal,
  typescript: TypescriptOriginal,
  vercel: VercelOriginal,
  vite: ViteOriginal,
};

// 스킬 카테고리별 벤토 폭 — Frontend/Tools는 넓게, 나머지는 절반
const WIDE_CATEGORIES = new Set(['Frontend', 'Tools']);

const categoryDescriptions: Record<string, string> = {
  'Frontend': 'React, TypeScript, Next.js로 UI를 만듭니다.',
  'Styling': 'Tailwind CSS, SCSS로 디자인 토큰 기반 스타일을 작성합니다.',
  'State': 'Redux Toolkit과 RTK Query로 클라이언트·서버 상태를 다룹니다.',
  'Backend & Data': 'Supabase의 Postgres, Auth, Edge Functions를 사용합니다.',
  'Animation': 'GSAP, Framer Motion으로 인터랙션과 페이지 전환을 다룹니다.',
  'Tools': 'Git, Vite, Vercel 환경에서 개발·배포합니다.',
};

interface HomePageProps {
  /** 서버에서 미리 가져온 데이터 — 크롤러가 목록 내용을 읽을 수 있도록 첫 HTML에 포함 */
  initialProjects?: ProjectsResponse;
  initialPosts?: Post[];
  initialGuestbook?: GuestbookListResponse;
  /** 전체(비공개 제외) 프로젝트 수 — 히어로의 "완성한 프로젝트" 카운터용 */
  initialProjectsTotal?: number;
}

const HomePage = ({ initialProjects, initialPosts, initialGuestbook, initialProjectsTotal }: HomePageProps) => {
  const skillsRef = useRef<HTMLDivElement>(null);

  // RTK Query로 프로젝트 목록 조회 (홈페이지에서는 featured만)
  // 클라이언트 fetch가 끝나기 전(및 SSR)에는 서버에서 내려준 initial 데이터로 렌더
  const { data: projectsQuery } = useGetProjectsQuery({
    featured: true,
  });
  const projectsData = projectsQuery ?? initialProjects;

  // 전체 프로젝트 수 — limit:1로 개수만 저렴하게 조회 (카운트업 카드용)
  const { data: projectsTotalQuery } = useGetProjectsQuery({ limit: 1 });
  const projectsTotal = projectsTotalQuery?.pagination.total ?? initialProjectsTotal;

  // 방명록 최근 3개 조회
  const { data: guestbookQuery } = useGetGuestbookQuery({
    limit: 3,
    approvedOnly: true,
  });
  const guestbookData = guestbookQuery ?? initialGuestbook;

  // 블로그 최근 3개 조회
  const { data: postsQuery } = useGetPostsQuery({
    status: 'published',
  });
  const postsData = postsQuery ?? (initialPosts ? { posts: initialPosts } : undefined);

  const yearsOfExperience = getYearsOfExperience();
  // "새 글" 배지 판정 기준 시각 — 렌더 중 Date.now()를 직접 호출하지 않도록 마운트 시 한 번만 고정
  const [now] = useState(() => Date.now());

  useEffect(() => {
    // 스킬 섹션 스크롤 애니메이션
    const skillCards = skillsRef.current?.querySelectorAll('.skill-chip');

    if (skillCards) {
      gsap.fromTo(
        skillCards,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: skillsRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // 섹션 페이드인 애니메이션
    gsap.utils.toArray<Element>('.fade-in-section').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }, []);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <MainLayout>
      {/* JSON-LD 구조화 데이터 - 홈페이지용 ProfilePage 스키마 */}
      <ProfilePageJsonLd
        url="https://semincode.com"
        title="변세민 | 프론트엔드 개발자 포트폴리오"
        description="프론트엔드 개발자 변세민의 포트폴리오입니다. React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다."
      />

      {/* Hero Section — 대담한 에디토리얼 타이포 + 개인 대시보드형 벤토 카드 */}
      <section id="hero" className="relative overflow-hidden">
        {/* 은은한 배경 블롭 — 과한 그라데이션 대신 절제된 앰비언트 라이팅 정도만 */}
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-24 -right-40 w-[560px] h-[560px] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-28 sm:pt-36 pb-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-start">
          {/* Left: 헤드라인 */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2.5 mb-6"
            >
              <span className="w-6 h-px bg-accent" />
              <span className="font-mono text-xs tracking-[0.16em] text-accent font-semibold">
                FRONTEND DEVELOPER — SEOUL, KR
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[15vw] sm:text-7xl md:text-8xl font-extrabold leading-[0.95] tracking-tight"
            >
              Build.
              <br />
              Refine.
              <br />
              <span className="text-transparent [-webkit-text-stroke:2px_var(--color-accent)]">
                Delight.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-lg"
            >
              정교한 인터랙션과 견고한 아키텍처로, 사용자가 오래 머무르고 싶은 웹을 만드는
              프론트엔드 개발자 <span className="text-foreground font-semibold">변세민</span>입니다.
              React와 TypeScript로 기반을 다지고, 애니메이션으로 완성도를 더합니다.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-wrap items-center gap-3 mt-10"
            >
              <Link to={ROUTES.PROJECTS}>
                <Button size="lg" className="group rounded-full">
                  프로젝트 보기
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={ROUTES.BLOG}>
                <Button variant="outline" size="lg" className="rounded-full">
                  블로그 읽기
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex gap-3 mt-8"
            >
              {[
                { icon: Github, href: 'https://github.com/zio-s', label: '깃허브' },
                { icon: MessageCircle, href: 'https://open.kakao.com/o/sAtkrp1h', label: '오픈카톡' },
                { icon: Mail, href: 'mailto:popqr1@gmail.com', label: '메일' }
              ].map(({ icon: Icon, href, label }) => (
                <Tooltip key={label} content={label} position="top">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card/60 hover:border-accent/50 hover:bg-card transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </a>
                </Tooltip>
              ))}
            </motion.div>
          </div>

          {/* Right: 개인 대시보드형 벤토 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-4 lg:mt-2"
          >
            <div className="col-span-2 rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-border/80">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                NOW BUILDING
              </span>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
                Next.js App Router 기반 개인 포트폴리오를 SSR·SEO 관점에서 계속 다듬는 중입니다.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col justify-between min-h-[148px] transition-colors hover:border-border/80">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                EXPERIENCE
              </span>
              <CountUp
                target={yearsOfExperience}
                className="text-4xl font-extrabold tracking-tight tabular-nums"
              />
              <span className="text-[13px] text-muted-foreground">년차 프론트엔드</span>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col justify-between min-h-[148px] transition-colors hover:border-border/80">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                SHIPPED
              </span>
              {projectsTotal !== undefined ? (
                <CountUp target={projectsTotal} className="text-4xl font-extrabold tracking-tight tabular-nums" />
              ) : (
                <span className="text-4xl font-extrabold tracking-tight text-muted-foreground">–</span>
              )}
              <span className="text-[13px] text-muted-foreground">완성한 프로젝트</span>
            </div>

            <div className="col-span-2 rounded-2xl border border-border bg-card/60 px-6 py-5 flex items-center justify-between transition-colors hover:border-border/80">
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                DAILY DRIVERS
              </span>
              <div className="flex items-center gap-3">
                {['react', 'nextjs', 'typescript', 'tailwindcss'].map((key) => {
                  const Icon = iconMap[key];
                  return Icon ? <Icon key={key} size="20" /> : null;
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 기술 스택 마퀴 티커 — 화면 폭이 복사본 1개 너비보다 넓으면 루프 리셋 시 빈 공간이 보이므로,
            어떤 화면 크기에서도 항상 화면 폭보다 훨씬 넓게 렌더되도록 넉넉히 반복한다 */}
        <div
          className="relative w-full max-w-full border-t border-b border-border py-6 overflow-hidden whitespace-nowrap"
          aria-hidden="true"
        >
          <div className="marquee-track inline-flex w-max">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="shrink-0 font-mono text-sm tracking-wider text-muted-foreground/50">
                REACT&nbsp;&nbsp;·&nbsp;&nbsp;NEXT.JS&nbsp;&nbsp;·&nbsp;&nbsp;TYPESCRIPT&nbsp;&nbsp;·&nbsp;&nbsp;REDUX TOOLKIT&nbsp;&nbsp;·&nbsp;&nbsp;SUPABASE&nbsp;&nbsp;·&nbsp;&nbsp;GSAP&nbsp;&nbsp;·&nbsp;&nbsp;FRAMER MOTION&nbsp;&nbsp;·&nbsp;&nbsp;TAILWIND CSS&nbsp;&nbsp;·&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section — 카테고리별 벤토 카드 */}
      <section ref={skillsRef} className="py-24 sm:py-32 px-4 sm:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <span className="font-mono text-xs tracking-[0.16em] text-accent font-semibold">01 — STACK</span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">제가 다루는 기술입니다</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs sm:text-right">
              일상적으로 쓰는 도구부터 프로젝트 상황에 맞춰 골라 쓰는 도구까지, 카테고리별로 정리했습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div
                key={category}
                className={`min-w-0 rounded-2xl border border-border bg-card/40 p-7 sm:p-8 ${
                  WIDE_CATEGORIES.has(category) ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-accent">{category}</h3>
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(categorySkills.length).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {categoryDescriptions[category]}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {categorySkills.map((skill) => {
                    const IconComponent = iconMap[skill.icon];
                    return (
                      <Tooltip key={skill.name} position="bottom" content={skill.tooltip}>
                        <div className="skill-chip flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full border border-border bg-background/60">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            {IconComponent ? (
                              <IconComponent size="20" />
                            ) : (
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center text-center text-[8px] font-bold text-white"
                                style={{ backgroundColor: skill.color }}
                              >
                                {skill.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-foreground/90">{skill.name}</span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase Section — 벤토 모자이크 */}
      <section id="work" className="py-24 sm:py-32 px-4 sm:px-8 fade-in-section bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <span className="font-mono text-xs tracking-[0.16em] text-accent font-semibold">02 — SELECTED WORK</span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">인상 깊은 프로젝트들</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs sm:text-right">
              기획부터 배포까지, 직접 완성도를 끌어올린 프로젝트 위주로 골랐습니다.
            </p>
          </div>

          {projectsData && projectsData.items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projectsData.items.map((project, index) => (
                <div key={project.id} className="min-w-0 relative">
                  {index === 0 && (
                    <span className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-[0.1em] text-white bg-accent/90 px-2.5 py-1 rounded-full pointer-events-none">
                      FEATURED
                    </span>
                  )}
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    thumbnail={project.thumbnail}
                    tags={[project.category]}
                    techStack={project.techStack}
                    githubUrl={project.githubUrl}
                    liveUrl={project.liveUrl}
                    stats={project.stats}
                    featured={project.featured}
                    className={index === 0 ? 'ring-2 ring-accent/50' : ''}
                  />
                </div>
              ))}
            </div>
          )}

          <Link
            to={ROUTES.PROJECTS}
            className="group mt-5 flex items-center justify-between rounded-2xl border border-border bg-card/40 px-7 py-6 transition-colors hover:border-accent/40"
          >
            <span className="text-base font-semibold">전체 프로젝트 보기</span>
            <span className="flex items-center gap-2 font-mono text-xs text-accent">
              VIEW ALL
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Work & Guest Board Preview Section */}
      <section id="journal" className="py-24 sm:py-32 px-4 sm:px-8 fade-in-section">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs tracking-[0.16em] text-accent font-semibold">03 — WRITING &amp; VOICES</span>
          <h2 className="mt-4 mb-12 sm:mb-16 text-3xl sm:text-5xl font-extrabold tracking-tight">기록하고, 나눈 이야기들</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Work Section */}
            <div className="rounded-2xl border border-border bg-card/40 p-3">
              <Link
                to={ROUTES.BLOG}
                className="flex items-center justify-between group px-4 pt-3 pb-2"
              >
                <h3 className="text-lg font-bold text-foreground">Blog</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>

              <div>
                {postsData?.posts?.slice(0, 3).map((post: Post) => {
                  const postDate = new Date(post.publishedAt || post.createdAt);
                  const daysDiff = Math.floor((now - postDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isNew = daysDiff >= 0 && daysDiff <= 3;

                  return (
                    <Link
                      key={post.id}
                      to={`/blog/${post.post_number}`}
                      className="block"
                    >
                      <div className="py-3 px-4 rounded-xl hover:bg-background/60 transition-colors cursor-pointer group">
                        <div className="h-6 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                              {post.title}
                            </h4>
                            {isNew && (
                              <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fuchsia-600"></span>
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground/70 shrink-0">
                            {postDate.toLocaleDateString('ko-KR', {
                              year: '2-digit',
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Guest Board Section */}
            <div className="rounded-2xl border border-border bg-card/40 p-3">
              <Link
                to={ROUTES.GUESTBOOK}
                className="flex items-center justify-between group px-4 pt-3 pb-2"
              >
                <h3 className="text-lg font-bold text-foreground">Guest Board</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </Link>

              <div>
                {guestbookData?.items.slice(0, 3).map((entry) => {
                  const entryDate = new Date(entry.createdAt);
                  const daysDiff = Math.floor((now - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isNew = daysDiff >= 0 && daysDiff <= 3;

                  return (
                    <Link
                      key={entry.id}
                      to={ROUTES.GUESTBOOK}
                      className="block"
                    >
                      <div className="py-3 px-4 rounded-xl hover:bg-background/60 transition-colors cursor-pointer group">
                        <div className="h-6 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/60 flex items-center justify-center text-white font-semibold text-[10px] shrink-0">
                              {entry.authorName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                              {entry.authorName}
                            </span>
                            {isNew && (
                              <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fuchsia-600"></span>
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground/70 shrink-0">
                            {entryDate.toLocaleDateString('ko-KR', {
                              year: '2-digit',
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="px-4 sm:px-8 pb-24 sm:pb-32 fade-in-section">
        <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-card/40 px-8 py-16 sm:py-20 text-center">
          <span className="font-mono text-xs tracking-[0.16em] text-accent font-semibold">04 — CONTACT</span>
          <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight">함께 만들어봐요</h2>
          <a
            href="mailto:popqr1@gmail.com"
            className="inline-block mt-6 font-mono text-lg sm:text-xl text-accent border-b border-accent/40 pb-1 hover:border-accent transition-colors"
          >
            popqr1@gmail.com
          </a>

          <div className="flex items-center justify-center gap-3 mt-10">
            {[
              { icon: Github, href: 'https://github.com/zio-s', label: '깃허브' },
              { icon: MessageCircle, href: 'https://open.kakao.com/o/sAtkrp1h', label: '오픈카톡' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:border-accent/50 transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground/90">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
