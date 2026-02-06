/**
 * ProjectDetailModal Component
 *
 * Minimal, professional project detail modal
 * Inspired by h-creations.com aesthetic
 */

import * as React from 'react';
import {
  useGetProjectQuery,
  useIncrementViewsMutation,
  useLikeProjectMutation,
  useUnlikeProjectMutation,
} from '@/features/portfolio/api/projectsApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommentList } from '@/components/portfolio/CommentList';
import { VideoModal } from '@/components/portfolio/VideoModal';
import {
  Github,
  ExternalLink,
  Eye,
  Heart,
  Calendar,
  Play,
  FileText,
  Target,
  Code2,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ProjectDetailModalProps {
  projectId: string;
  close: () => void;
  modalId: string;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectId,
  close,
}) => {
  const { data: project, isLoading, error } = useGetProjectQuery(projectId);
  const [incrementViews] = useIncrementViewsMutation();
  const [likeProject, { isLoading: isLiking }] = useLikeProjectMutation();
  const [unlikeProject, { isLoading: isUnliking }] = useUnlikeProjectMutation();

  // Animation states
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null);

  // Like state (stored in localStorage)
  const [isLiked, setIsLiked] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    const likedProjects = localStorage.getItem('likedProjects');
    if (likedProjects) {
      const parsed = JSON.parse(likedProjects);
      return parsed.includes(projectId);
    }
    return false;
  });

  const isLikeLoading = isLiking || isUnliking;

  // Animation management - Trigger on mount
  React.useEffect(() => {
    // Trigger animation after render
    const timer = setTimeout(() => setIsAnimating(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      close();
    }, 200);
  };

  // Lock body scroll when modal is open
  React.useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store original styles for both html and body
    const originalBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    const originalHtmlStyles = {
      overflow: document.documentElement.style.overflow,
      paddingRight: document.documentElement.style.paddingRight,
    };

    // Lock both html and body with position: fixed for smooth animation
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Prevent touch scroll on mobile background, but allow scroll inside modal
    const preventScroll = (e: TouchEvent) => {
      // Allow scroll if touch is inside a scrollable element
      const target = e.target as HTMLElement;
      const scrollableElement = target.closest('.overflow-y-auto');

      // If touch is inside scrollable modal content, allow it
      if (scrollableElement) {
        return;
      }

      // Otherwise, prevent scroll on backdrop/background
      e.preventDefault();
    };
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      // Remove touch scroll prevention
      document.body.removeEventListener('touchmove', preventScroll);

      // Restore body styles first
      document.body.style.position = originalBodyStyles.position;
      document.body.style.top = originalBodyStyles.top;
      document.body.style.left = originalBodyStyles.left;
      document.body.style.right = originalBodyStyles.right;
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.width = originalBodyStyles.width;
      document.body.style.paddingRight = originalBodyStyles.paddingRight;

      // Restore html styles
      document.documentElement.style.overflow = originalHtmlStyles.overflow;
      document.documentElement.style.paddingRight = originalHtmlStyles.paddingRight;

      // Restore scroll position instantly on next frame
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          left: 0,
          behavior: 'instant'
        });
      });
    };
  }, []);

  // Increment views on mount (only once per session per project)
  React.useEffect(() => {
    const viewedProjects = sessionStorage.getItem('viewedProjects');
    const viewedList = viewedProjects ? JSON.parse(viewedProjects) : [];

    // Only increment if not viewed in this session
    if (!viewedList.includes(projectId)) {
      incrementViews(projectId);
      // Mark as viewed in this session
      sessionStorage.setItem('viewedProjects', JSON.stringify([...viewedList, projectId]));
    }
  }, [projectId, incrementViews]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    // Prevent multiple clicks while processing
    if (isLikeLoading) return;

    try {
      if (isLiked) {
        await unlikeProject(projectId).unwrap();
        setIsLiked(false);
        // Update localStorage
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        localStorage.setItem(
          'likedProjects',
          JSON.stringify(likedProjects.filter((id: string) => id !== projectId))
        );
      } else {
        await likeProject(projectId).unwrap();
        setIsLiked(true);
        // Update localStorage
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        localStorage.setItem('likedProjects', JSON.stringify([...likedProjects, projectId]));
      }
    } catch {
      // Error handled silently
    }
  };

  // Handle video click
  const handleVideoClick = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setVideoModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/98 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`max-w-md p-8 rounded-lg bg-card border border-border transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <p className="text-lg font-semibold mb-2 text-destructive">프로젝트를 불러올 수 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">나중에 다시 시도해주세요.</p>
          <Button onClick={handleClose} variant="outline" size="sm">
            닫기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Modal Container - Fixed Height with Internal Scroll */}
      <div
        className={`relative w-full max-w-5xl h-[92vh]  border border-border/50 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Content - All content including image */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="relative">
            {/* Main Image - Hero Section */}
            <div className="relative aspect-[21/9] bg-gradient-to-br from-card via-background to-card overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 bg-background">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {project.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {project.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{project.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{project.stats.views.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleLikeToggle}
                  disabled={isLikeLoading}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-accent/10 ${
                    isLiked ? 'text-accent' : 'text-muted-foreground'
                  } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      isLiked ? 'fill-accent' : ''
                    }`}
                  />
                  <span>{project.stats.likes.toLocaleString()}</span>
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b border-border/50">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size='sm' className="gap-2">
                    <Github className="w-4 h-4" />
                    소스코드
                  </Button>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    라이브 데모
                  </Button>
                </a>
              )}
            </div>

            {/* Project Details - Duration & Team Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border/50">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">작업 기간</h3>
                <p className="text-base font-medium">{project.duration}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">팀 규모</h3>
                <p className="text-base font-medium">
                  {!project.teamSize || project.teamSize === 1 ? '개인 프로젝트' : `${project.teamSize}명 팀`}
                </p>
              </div>
              {project.role && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">역할</h3>
                  <p className="text-base font-medium">{project.role}</p>
                </div>
              )}
            </div>

            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">기술 스택</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" size="sm" className="px-3 py-1.5 text-sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Project Content - Structured Sections */}
            <div className="space-y-10">
              {/* 📝 Overview Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">개요</h2>
                </div>
                <div className="text-muted-foreground leading-relaxed space-y-3 pl-[52px]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ node, href, children, ...props }) => {
                        const isVideoLink = href && /\.(mp4|webm|ogg|mov)$/i.test(href);
                        if (isVideoLink) {
                          return (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleVideoClick(href);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 my-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all cursor-pointer font-medium"
                            >
                              <Play className="w-4 h-4" fill="currentColor" />
                              {children}
                            </button>
                          );
                        }
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" {...props}>
                            {children}
                          </a>
                        );
                      },
                      img: ({ node, src, alt, ...props }) => {
                        const srcStr = typeof src === 'string' ? src : '';
                        const isVideo = srcStr && /\.(mp4|webm|ogg|mov)$/i.test(srcStr);
                        if (isVideo) {
                          return (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleVideoClick(srcStr);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 my-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all cursor-pointer font-medium"
                            >
                              <Play className="w-4 h-4" fill="currentColor" />
                              {alt || '영상 보기'}
                            </button>
                          );
                        }
                        return (
                          <img src={srcStr || undefined} alt={alt} className="rounded-lg max-w-full h-auto my-4" {...props} />
                        );
                      },
                      p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
                      h2: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-2">{children}</h3>,
                      h3: ({ children }) => <h4 className="text-sm font-semibold text-foreground mt-4 mb-2">{children}</h4>,
                      strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 ml-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 ml-2">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    }}
                  >
                    {project.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* 🎯 Achievements Section */}
              {project.achievements && project.achievements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold">주요 성과</h2>
                  </div>
                  <div className="space-y-4 pl-[52px]">
                    {project.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="text-accent font-bold text-lg shrink-0">{index + 1}.</span>
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed">{achievement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 💻 Tech Features Section (from techStack) */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold">기술 스택</h2>
                  </div>
                  <div className="pl-[52px]">
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech: string) => (
                        <Badge key={tech} variant="outline" className="px-3 py-1.5 bg-accent/5 border-accent/20 hover:bg-accent/10">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 💡 Challenges & Solutions Section */}
              {project.challenges && project.challenges.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold">기술적 도전 및 해결</h2>
                  </div>
                  <div className="space-y-6 pl-[52px]">
                    {project.challenges.map((challenge, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex gap-4">
                          <span className="text-accent font-bold text-lg shrink-0">{index + 1}.</span>
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">문제</h3>
                              <p className="text-foreground leading-relaxed">{challenge}</p>
                            </div>
                            {project.solutions && project.solutions[index] && (
                              <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">해결</h3>
                                <p className="text-muted-foreground leading-relaxed">{project.solutions[index]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media Gallery */}
            {project.images && project.images.length > 0 && (
              <div className="space-y-4 mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">갤러리</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-[52px]">
                  {project.images.map((mediaUrl, index) => {
                    // 파일 확장자로 video vs image 판단
                    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl);

                    return (
                      <div
                        key={index}
                        className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-card to-background border border-border/50 group shadow-md hover:shadow-xl transition-all ${
                          isVideo ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => isVideo && handleVideoClick(mediaUrl)}
                      >
                        {isVideo ? (
                          <>
                            {/* Video Thumbnail with Play Button Overlay */}
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all group-hover:bg-black/60">
                              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white shadow-lg">
                                <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`${project.title} screenshot ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="space-y-4 mt-10 pb-8 border-b border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold">댓글</h2>
              </div>
              <div className="pl-[52px]">
                <CommentList projectId={project.id} />
              </div>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold">태그</h2>
                </div>
                <div className="flex flex-wrap gap-2 pl-[52px]">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm text-muted-foreground px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed (Close 버튼) */}
        <div className="flex-shrink-0 px-8 py-5 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex justify-center">
            <Button onClick={handleClose} variant="outline" className="min-w-[180px] h-11 text-base">
              닫기
            </Button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo}
          isOpen={videoModalOpen}
          onClose={() => {
            setVideoModalOpen(false);
            setSelectedVideo(null);
          }}
          title={project.title}
        />
      )}
    </div>
  );
};
