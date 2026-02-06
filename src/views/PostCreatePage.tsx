/**
 * 게시글 작성 페이지
 *
 * 새로운 게시글을 작성하는 페이지입니다.
 * Supabase 기반 RTK Query로 게시글을 저장합니다.
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, routeHelpers } from '../router/routes';
import { useCreatePostMutation } from '../store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { useAlertModal } from '@/components/modal/hooks';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  FileText,
  Tag,
  BookOpen
} from 'lucide-react';

const PostCreatePage = () => {
  const navigate = useNavigate();
  const [createPost, { isLoading: loading }] = useCreatePostMutation();
  const { showAlert } = useAlertModal();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // 태그 배열 생성
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 발췌 자동 생성 (입력 안 했으면)
      const finalExcerpt = excerpt || content.substring(0, 150);

      // 게시글 생성 (Supabase가 자동으로 UUID 생성)
      const result = await createPost({
        title,
        content,
        excerpt: finalExcerpt,
        status,
        tags: tagArray,
      }).unwrap();

      showAlert({
        title: '완료',
        message: `게시글이 ${status === 'published' ? '발행' : '임시저장'}되었습니다!`,
        type: 'success',
        onConfirm: () => {
          // 생성된 게시글 상세 페이지로 이동
          navigate(routeHelpers.blogDetail(result.id));
        },
      });
    } catch {
      showAlert({
        title: '오류',
        message: '게시글 작성에 실패했습니다',
        type: 'error',
      });
    }
  };

  return (
    <MainLayout>
      <SEO
        title="새 게시글 작성 | Blog"
        description="새로운 블로그 게시글을 작성하세요"
      />

      {/* Header */}
      <Section className="pt-8 pb-4">
        <Container>
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="group -ml-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              새 게시글 작성
            </h1>
            <p className="text-muted-foreground text-lg">
              게시글을 작성하고 발행하거나 임시저장할 수 있습니다.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Form */}
      <Section className="py-8">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="flex items-center text-sm font-semibold text-foreground">
                  <FileText className="w-4 h-4 mr-2 text-accent" />
                  제목 <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="게시글 제목을 입력하세요"
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label htmlFor="excerpt" className="flex items-center text-sm font-semibold text-foreground">
                  <BookOpen className="w-4 h-4 mr-2 text-accent" />
                  발췌 <span className="text-muted-foreground text-xs font-normal ml-2">(선택사항)</span>
                </label>
                <input
                  id="excerpt"
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  disabled={loading}
                  placeholder="게시글 요약 (미입력 시 본문 앞 150자 자동 추출)"
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="flex items-center text-sm font-semibold text-foreground">
                  <FileText className="w-4 h-4 mr-2 text-accent" />
                  내용 <span className="text-destructive ml-1">*</span>
                  <span className="text-muted-foreground text-xs font-normal ml-2">(Markdown 지원)</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="게시글 내용을 입력하세요&#10;&#10;# 마크다운 문법 사용 가능&#10;- **굵게**, *기울임*, `코드`&#10;- [링크](https://example.com)&#10;- 목록, 표, 코드 블록 등"
                  rows={20}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    resize-vertical font-mono text-sm
                    transition-all duration-200"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label htmlFor="tags" className="flex items-center text-sm font-semibold text-foreground">
                  <Tag className="w-4 h-4 mr-2 text-accent" />
                  태그
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={loading}
                  placeholder="쉼표로 구분 (예: React, TypeScript, CMS)"
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                />
              </div>

              {/* Status Selection */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-foreground">
                  발행 상태 <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={(e) => setStatus(e.target.value as 'draft')}
                      disabled={loading}
                      className="w-4 h-4 text-accent border-border focus:ring-2 focus:ring-accent/50 cursor-pointer"
                    />
                    <span className="ml-2 text-foreground group-hover:text-accent transition-colors">
                      임시저장
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === 'published'}
                      onChange={(e) => setStatus(e.target.value as 'published')}
                      disabled={loading}
                      className="w-4 h-4 text-accent border-border focus:ring-2 focus:ring-accent/50 cursor-pointer"
                    />
                    <span className="ml-2 text-foreground group-hover:text-accent transition-colors">
                      바로 발행
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-8 border-t border-border">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className={`flex-1 ${
                    status === 'published'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-accent hover:bg-accent/90'
                  } shadow-lg hover:shadow-xl transition-all group`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      작성 중...
                    </>
                  ) : status === 'published' ? (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      발행하기
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      임시저장
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/blog')}
                  disabled={loading}
                  size="lg"
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </motion.div>
        </Container>
      </Section>
    </MainLayout>
  );
};

export default PostCreatePage;
