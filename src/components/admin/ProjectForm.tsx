/**
 * ProjectForm Component - Modern Tailwind v4 Version
 *
 * 프로젝트 생성/수정 폼 컴포넌트
 * h-creations.com 스타일의 미니멀한 모달 디자인
 */

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Project, ProjectCategory, ProjectStatus } from '../../features/portfolio/types/Project';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export const ProjectForm = ({ project, onSubmit, onCancel, isOpen }: ProjectFormProps) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    content: string;
    thumbnail: string;
    images: string;
    techStack: string;
    category: ProjectCategory;
    tags: string;
    githubUrl: string;
    liveUrl: string;
    status: ProjectStatus;
    featured: boolean;
  }>({
    title: '',
    description: '',
    content: '',
    thumbnail: '',
    images: '',
    techStack: '',
    category: 'web',
    tags: '',
    githubUrl: '',
    liveUrl: '',
    status: 'public',
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        content: project.content || '',
        thumbnail: project.thumbnail || '',
        images: project.images?.join('\n') || '',
        techStack: project.techStack?.join(', ') || '',
        category: project.category || 'web',
        tags: project.tags?.join(', ') || '',
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        status: project.status || 'public',
        featured: project.featured || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        thumbnail: '',
        images: '',
        techStack: '',
        category: 'web',
        tags: '',
        githubUrl: '',
        liveUrl: '',
        status: 'public',
        featured: false,
      });
    }
    setErrors({});
  }, [project, isOpen]);

  // Animation management
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after render
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Unmount after animation completes
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }
    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = '썸네일 URL을 입력해주세요';
    }
    if (!formData.techStack.trim()) {
      newErrors.techStack = '기술 스택을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        thumbnail: formData.thumbnail,
        images: formData.images
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean),
        techStack: formData.techStack
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        githubUrl: formData.githubUrl || undefined,
        liveUrl: formData.liveUrl || undefined,
        status: formData.status,
        featured: formData.featured,
      };

      await onSubmit(submitData);
    } catch {
      // Error handling is done by parent component
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onCancel}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-border">
          <h2 className="text-2xl font-bold tracking-tight">
            {project ? '프로젝트 수정' : '새 프로젝트 생성'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-md hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer hover:rotate-90"
            disabled={loading}
          >
            <X className="w-5 h-5 transition-transform duration-200" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              제목 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border bg-muted text-foreground transition-colors placeholder:text-muted-foreground ${
                errors.title
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-accent focus:ring-accent/20'
              } focus:outline-none focus:ring-2`}
              placeholder="프로젝트 제목"
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              설명 <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border bg-muted text-foreground transition-colors resize-none placeholder:text-muted-foreground ${
                errors.description
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-accent focus:ring-accent/20'
              } focus:outline-none focus:ring-2`}
              placeholder="간단한 프로젝트 설명"
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Content (Markdown) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              내용 (Markdown) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className={`w-full px-4 py-2.5 rounded-lg border bg-muted text-foreground transition-colors resize-vertical font-mono text-sm placeholder:text-muted-foreground ${
                errors.content
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-accent focus:ring-accent/20'
              } focus:outline-none focus:ring-2`}
              placeholder="Markdown 형식으로 프로젝트 상세 내용 작성"
              disabled={loading}
            />
            {errors.content && (
              <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Two Column Layout for URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                썸네일 URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border bg-muted text-foreground transition-colors placeholder:text-muted-foreground ${
                  errors.thumbnail
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    : 'border-border focus:border-accent focus:ring-accent/20'
                } focus:outline-none focus:ring-2`}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
              {errors.thumbnail && (
                <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.thumbnail}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                카테고리 <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors cursor-pointer"
                disabled={loading}
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              추가 이미지 URLs <span className="text-xs text-muted-foreground font-normal">(한 줄에 하나씩)</span>
            </label>
            <textarea
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors resize-vertical font-mono text-sm placeholder:text-muted-foreground"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              disabled={loading}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              기술 스택 <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal">(쉼표로 구분)</span>
            </label>
            <input
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border bg-muted text-foreground transition-colors placeholder:text-muted-foreground ${
                errors.techStack
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  : 'border-border focus:border-accent focus:ring-accent/20'
              } focus:outline-none focus:ring-2`}
              placeholder="React, TypeScript, Vite"
              disabled={loading}
            />
            {errors.techStack && (
              <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.techStack}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              태그 <span className="text-xs text-muted-foreground font-normal">(쉼표로 구분)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors placeholder:text-muted-foreground"
              placeholder="portfolio, interactive, rtk-query"
              disabled={loading}
            />
          </div>

          {/* GitHub & Live URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors placeholder:text-muted-foreground"
                placeholder="https://github.com/username/repo"
                disabled={loading}
              />
            </div>

            {/* Live URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Live URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors placeholder:text-muted-foreground"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Status */}
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">
                공개 상태 <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors cursor-pointer"
                disabled={loading}
              >
                <option value="public">Public (공개)</option>
                <option value="private">Private (비공개)</option>
              </select>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm font-semibold text-foreground">Featured 프로젝트로 표시</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? '저장 중...' : project ? '수정하기' : '생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
