/**
 * Project Detail Page
 *
 * 프로젝트 상세 페이지
 *
 * 주요 기능:
 * - RTK Query로 프로젝트 상세 정보 조회
 * - Recent Menu 자동 추적
 * - 조회수 자동 증가
 * - 좋아요 기능
 * - 댓글 시스템
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProjectQuery,
  useIncrementViewsMutation,
  useLikeProjectMutation,
  useUnlikeProjectMutation,
} from '../features/portfolio/api/projectsApi';
import { useTrackVisit } from '../hooks/useTrackVisit';
import { CommentForm } from '../features/comments/components/CommentForm';
import { CommentList } from '../features/comments/components/CommentList';
import { MainLayout } from '@/components/layout/MainLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/animations/FadeIn';
import { SlideIn } from '@/components/animations/SlideIn';
import { SEO } from '@/components/common/SEO';
import { ArrowLeft, Github, ExternalLink, Eye, Heart, MessageCircle, Loader2 } from 'lucide-react';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackVisit = useTrackVisit();

  // RTK Query hooks
  const { data: project, isLoading, error } = useGetProjectQuery(id!);
  const [incrementViews] = useIncrementViewsMutation();
  const [likeProject] = useLikeProjectMutation();
  const [unlikeProject] = useUnlikeProjectMutation();

  // LocalStorage 키
  const VIEW_KEY = `project_viewed_${id}`;
  const LIKE_KEY = `project_liked_${id}`;

  // 좋아요 상태 (localStorage에서 초기화)
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LIKE_KEY) === 'true';
  });

  // UI 표시용 likes 카운트 (즉시 반영)
  const [displayedLikes, setDisplayedLikes] = useState<number>(0);

  // 프로젝트 로드 시 실제 likes 값으로 초기화
  useEffect(() => {
    if (project) {
      setDisplayedLikes(project.stats.likes);
    }
  }, [project]);

  // Debounce 타이머 관리
  const likeTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Recent Menu 추적 + 조회수 증가 (한 번만)
   */
  useEffect(() => {
    if (!project || !id) return;

    // Recent Menu에 자동 추적
    trackVisit({
      id: project.id,
      type: 'project',
      title: project.title,
      path: `/projects/${project.id}`,
      thumbnail: project.thumbnail,
      description: project.description,
    });

    // 조회수 증가: localStorage로 중복 방지
    const hasViewed = localStorage.getItem(VIEW_KEY);
    if (!hasViewed) {
      incrementViews(id);
      localStorage.setItem(VIEW_KEY, 'true');
    }
  }, [id, project, trackVisit, incrementViews, VIEW_KEY]);

  /**
   * 좋아요 토글 핸들러 (UI 즉시 반영 + 1초 debounce)
   */
  const handleLikeToggle = () => {
    // 1. UI 즉시 토글 (버튼 상태 + 숫자)
    const newLikedState = !hasLiked;
    setHasLiked(newLikedState);

    // 숫자도 즉시 증가/감소
    setDisplayedLikes((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    if (newLikedState) {
      localStorage.setItem(LIKE_KEY, 'true');
    } else {
      localStorage.removeItem(LIKE_KEY);
    }

    // 2. 이전 타이머 취소
    if (likeTimerRef.current) {
      clearTimeout(likeTimerRef.current);
    }

    // 3. 1초 후 서버 요청
    likeTimerRef.current = setTimeout(async () => {
      try {
        if (newLikedState) {
          await likeProject(id!).unwrap();
        } else {
          await unlikeProject(id!).unwrap();
        }
      } catch {
        // 실패 시 상태 복원 (버튼 + 숫자)
        setHasLiked(!newLikedState);
        setDisplayedLikes((prev) => (newLikedState ? Math.max(0, prev - 1) : prev + 1));
        if (!newLikedState) {
          localStorage.setItem(LIKE_KEY, 'true');
        } else {
          localStorage.removeItem(LIKE_KEY);
        }
      }
    }, 1000);
  };

  // Cleanup: 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) {
        clearTimeout(likeTimerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
          <p className="text-xl font-medium text-muted-foreground">Loading project...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <Container>
          <FadeIn>
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
              <Card className="max-w-xl text-center">
                <CardContent className="py-16 px-10">
                  <p className="text-4xl font-bold mb-6">Project not found</p>
                  <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                    The project you're looking for doesn't exist or has been removed.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" size="lg" onClick={() => navigate('/projects')}>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Projects
                    </Button>
                    <Button variant="gradient" size="lg" onClick={() => navigate('/')}>
                      Go Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title={`${project.title} | 프로젝트 | 변세민 포트폴리오`}
        description={project.description}
        keywords={`${project.title}, ${project.techStack?.join(', ')}, 프로젝트, 포트폴리오`}
        url={`https://semincode.com/projects/${project.id}`}
        image={project.thumbnail || undefined}
        type="article"
        publishedTime={project.createdAt}
      />
      <Container>
        {/* Navigation Bar */}
        <FadeIn>
          <div className="flex items-center justify-between py-8 border-b-2 border-border/50">
            <Button
              variant="ghost"
              size="md"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </FadeIn>

        <Section>
          {/* Header */}
          <FadeIn direction="up" delay={0.1}>
            <header className="mb-12">
              <div className="mb-6">
                {project.featured && (
                  <Badge variant="gradient" size="lg" className="mb-6 shadow-lg shadow-primary/50">
                    ⭐ Featured Project
                  </Badge>
                )}
                <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                  {project.title}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Stats + Like Button */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t-2 border-border/50">
                <div className="flex items-center gap-8 text-muted-foreground text-lg font-medium">
                  <span className="flex items-center gap-2.5">
                    <Eye className="w-6 h-6" />
                    {project.stats.views}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-6 h-6" />
                    {displayedLikes}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <MessageCircle className="w-6 h-6" />
                    {project.stats.comments}
                  </span>
                </div>

                <Button
                  variant={hasLiked ? 'destructive' : 'gradient'}
                  size="lg"
                  onClick={handleLikeToggle}
                  leftIcon={<Heart className={hasLiked ? 'fill-current w-5 h-5' : 'w-5 h-5'} />}
                >
                  {hasLiked ? 'Liked' : 'Like'}
                </Button>
              </div>
            </header>
          </FadeIn>

          {/* Thumbnail */}
          <SlideIn from="bottom" delay={0.2}>
            <div className="aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-primary/20 border-2 border-border/30">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </SlideIn>

          {/* Tech Stack & Links */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FadeIn direction="left" delay={0.3}>
              <Card hover className="h-full">
                <CardHeader>
                  <CardTitle className="text-3xl">Tech Stack</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="flex flex-wrap gap-3">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" size="lg" className="text-base font-medium px-4 py-2">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {(project.githubUrl || project.liveUrl) && (
              <FadeIn direction="right" delay={0.3}>
                <Card hover className="h-full">
                  <CardHeader>
                    <CardTitle className="text-3xl">Links</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="flex flex-wrap gap-4">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="lg" leftIcon={<Github className="w-5 h-5" />}>
                            GitHub Repository
                          </Button>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="gradient" size="lg" leftIcon={<ExternalLink className="w-5 h-5" />}>
                            Live Demo
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>

          {/* Content */}
          <FadeIn delay={0.4}>
            <Card hover className="mb-12">
              <CardHeader>
                <CardTitle className="text-3xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div
                  className="prose prose-invert prose-lg max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: project.content.replace(/\n/g, '<br />'),
                  }}
                />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Comments Section */}
          <FadeIn delay={0.5}>
            <Card hover>
              <CardHeader>
                <CardTitle className="text-3xl">Comments</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {/* Comment Form */}
                <div className="mb-8">
                  <CommentForm projectId={project.id} />
                </div>

                {/* Comment List */}
                <CommentList projectId={project.id} maxDepth={3} />
              </CardContent>
            </Card>
          </FadeIn>
        </Section>
      </Container>
    </MainLayout>
  );
};

export default ProjectDetailPage;
