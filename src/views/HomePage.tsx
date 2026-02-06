/**
 * Home/Landing Page
 *
 * Interactive portfolio landing page with animations
 * - GSAP ScrollTrigger animations
 * - Framer Motion 3D effects
 * - Shields.io badges with tooltips
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Github, MessageCircle, Mail, ArrowRight, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { SEO } from '@/components/common/SEO';
import { ProfilePageJsonLd } from '@/components/common/JsonLd';
import {useGetProjectsQuery} from "@/features/portfolio/api/projectsApi";
import {useGetGuestbookQuery} from "@/features/guestbook/api/guestbookApi";
import {useGetPostsQuery} from "@/store";
import {ROUTES} from "@/router";
import { skills, type Skill } from '@/data/skills';
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
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

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

/**
 * Background Particles Component
 * SSR-safe: 클라이언트에서만 랜덤 위치 생성
 */
const BackgroundParticles = () => {
  const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // 클라이언트에서만 랜덤 위치 생성
    const generated = [...Array(50)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(generated);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-foreground/20 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  // RTK Query로 프로젝트 목록 조회 (홈페이지에서는 featured만)
  const { data: projectsData } = useGetProjectsQuery({
    featured: true,
  });

  // 방명록 최근 3개 조회
  const { data: guestbookData } = useGetGuestbookQuery({
    limit: 3,
    approvedOnly: true,
  });

  // 블로그 최근 3개 조회
  const { data: postsData } = useGetPostsQuery({
    status: 'published',
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    // 스킬 섹션 스크롤 애니메이션
    const skillCards = skillsRef.current?.querySelectorAll('.skill-badge');

    if (skillCards) {
      gsap.fromTo(
        skillCards,
        {
          opacity: 0,
          y: 50,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'back.out(1.2)',
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
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
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
      <SEO />

      {/* JSON-LD 구조화 데이터 - 홈페이지용 ProfilePage 스키마 */}
      <ProfilePageJsonLd
        url="https://semincode.com"
        title="변세민 | 프론트엔드 개발자 포트폴리오"
        description="프론트엔드 개발자 변세민의 포트폴리오입니다. React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다."
      />

      {/* Hero Section with Parallax & 3D */}
      <motion.section
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-24 sm:pt-0 sm:pb-28"
      >
        {/* Animated background particles - SSR safe with fixed positions */}
        <BackgroundParticles />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-accent/60 via-accent to-purple-500 bg-clip-text text-transparent"
          >
            Frontend Developer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-muted-foreground mb-8 sm:mb-12 font-light"
          >
            사용자 경험을 최우선으로 생각하는 개발자
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            React와 TypeScript로 견고한 웹 애플리케이션을 만들고,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            세심한 애니메이션으로 사용자에게 즐거움을 전달합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12"
          >
            <Link to={ROUTES.PROJECTS}>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
                View Projects
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to={ROUTES.BLOG}>
              <Button variant="outline" size="lg" className="text-sm sm:text-base">
                Read Blog
              </Button>
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 justify-center"
          >
            {[
              { icon: Github, href: 'https://github.com/zio-s', label: '깃허브' },
              { icon: MessageCircle, href: 'https://open.kakao.com/o/sAtkrp1h', label: '오픈카톡' },
              { icon: Mail, href: 'mailto:zio.s.dev@gmail.com', label: '메일' }
            ].map(({ icon: Icon, href, label }) => (
              <Tooltip key={label} content={label} position="top">
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-card flex hover:bg-accent/10 transition-colors border border-border"
                  whileHover={{ y: 3 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              </Tooltip>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-24 sm:bottom-25 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-border rounded-full p-1">
            <motion.div
              className="w-1.5 h-1.5 bg-accent rounded-full mx-auto"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Skills Section */}
      <section ref={skillsRef} className="py-32 px-8 relative fade-in-section bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
          >
            제가 사용하는 <span className="text-accent">스킬</span>입니다.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-center mb-16 text-lg"
          >
          </motion.p>

          <div className="space-y-16">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const categoryDescriptions: Record<string, string> = {
                'Frontend': 'React와 TypeScript를 중심으로 컴포넌트 기반 아키텍처를 설계하고, 사용자 중심의 인터페이스를 구현합니다.',
                'Styling': 'Tailwind CSS와 SCSS로 확장 가능한 스타일 시스템을 구축합니다.',
                'State': 'Redux Toolkit과 RTK Query로 전역 상태와 서버 데이터를 효율적으로 관리합니다.',
                'Backend': 'Supabase로 빠른 백엔드 개발과 실시간 데이터 동기화를 구현합니다.',
                'Animation': 'GSAP과 Framer Motion으로 사용자의 시선을 사로잡는 인터랙티브한 경험을 만듭니다.',
                'Tools': 'Git, Vite, Vercel을 활용한 효율적인 개발 및 배포 워크플로우를 구축합니다.'
              };

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-foreground text-accent">
                      {category}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    {categoryDescriptions[category]}
                  </p>
                  <div className="grid grid-cols-3 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-3">
                    {categorySkills.map((skill) => {
                      const IconComponent = iconMap[skill.icon];
                      return (
                        <Tooltip key={skill.name} position="bottom" content={skill.tooltip}>
                          <div
                            className="skill-badge cursor-pointer flex justify-center items-center flex-col text-center p-2 rounded-lg border border-transparent hover:border-accent/50 transition-colors"
                          >
                            <div className="w-8 h-8 flex items-center justify-center">
                              {IconComponent ? (
                                <IconComponent size="32" />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center text-center leading-8 text-xs font-bold"
                                  style={{ backgroundColor: skill.color, color: 'white' }}
                                >
                                  {skill.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight flex items-center justify-center py-2">
                              {skill.name}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Showcase Section */}
      <section className="py-32 px-8 fade-in-section bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-accent">Featured</span> Projects
            </h2>
            <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto font-medium">
              정성스럽게 개발한 프로젝트
            </p>
          </div>

          {projectsData && projectsData.items.length > 0 && (
            <div className="relative px-4 sm:px-16">
              <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={1}
                centeredSlides={false}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                  disabledClass: 'swiper-button-disabled',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 1.5,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 2,
                    spaceBetween: 32,
                  },
                }}
                className="mb-8 home-projects-swiper"
              >
                {projectsData.items.map((project, index) => (
                  <SwiperSlide key={project.id}>
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
                      className={index === 0 ? 'ring-2 ring-accent/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev-custom absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-border bg-card hover:bg-accent hover:border-accent transition-all flex items-center justify-center shadow-lg">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="swiper-button-next-custom absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-border bg-card hover:bg-accent hover:border-accent transition-all flex items-center justify-center shadow-lg">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to={ROUTES.PROJECTS}>
              <Button variant="outline" size="lg" className="group">
                전체 프로젝트 보기
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Work & Guest Board Preview Section */}
      <section className="py-16 px-8 fade-in-section bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Work Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <Link
                to={ROUTES.BLOG}
                className="flex items-center justify-between group mb-4"
              >
                <h3 className="text-lg font-bold text-foreground">Blog</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>

              <div className="space-y-1.5">
                {postsData?.posts?.slice(0, 3).map((post: any) => {
                  const postDate = new Date(post.publishedAt || post.createdAt);
                  const daysDiff = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isNew = daysDiff >= 0 && daysDiff <= 3;

                  return (
                    <Link
                      key={post.id}
                      to={`/blog/${post.id}`}
                      className="block"
                    >
                      <div className="py-2 px-3 rounded border border-transparent hover:border-border/50 hover:bg-card/20 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between gap-3">
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
                          <span className="text-[11px] text-muted-foreground/70 shrink-0">
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
            </motion.div>

            {/* Guest Board Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <Link
                to={ROUTES.GUESTBOOK}
                className="flex items-center justify-between group mb-4"
              >
                <h3 className="text-lg font-bold text-foreground">Guest Board</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>

              <div className="space-y-1.5">
                {guestbookData?.items.slice(0, 3).map((entry) => {
                  const entryDate = new Date(entry.createdAt);
                  const daysDiff = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isNew = daysDiff >= 0 && daysDiff <= 3;

                  return (
                    <Link
                      key={entry.id}
                      to={ROUTES.GUESTBOOK}
                      className="block"
                    >
                      <div className="py-2 px-3 rounded border border-transparent hover:border-border/50 hover:bg-card/20 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between gap-3">
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
                          <span className="text-[11px] text-muted-foreground/70 shrink-0">
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
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
