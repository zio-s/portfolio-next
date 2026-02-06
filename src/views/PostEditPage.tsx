/**
 * 게시글 수정 페이지
 *
 * 기존 게시글을 수정하는 페이지입니다.
 * Supabase 기반 RTK Query로 게시글을 가져와 수정합니다.
 */

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { routeHelpers } from '../router/routes';
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from '../store';
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
  BookOpen,
  AlertCircle
} from 'lucide-react';

const PostEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertModal();

  const { data: post, isLoading: loading, error } = useGetPostByIdQuery(id || '', {
    skip: !id,
  });
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // 폼 상태 초기화
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt);
      setTags(post.tags.join(', '));
      setStatus(post.status as 'draft' | 'published');
    }
  }, [post]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      // 태그 배열 생성
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 발췌 자동 생성 (입력 안 했으면)
      const finalExcerpt = excerpt || content.substring(0, 150);

      // 게시글 수정
      await updatePost({
        id,
        updates: {
          title,
          content,
          excerpt: finalExcerpt,
          status,
          tags: tagArray,
        }
      }).unwrap();

      showAlert({
        title: '완료',
        message: '게시글이 수정되었습니다!',
        type: 'success',
        onConfirm: () => {
          // 게시글 상세 페이지로 이동
          navigate(routeHelpers.blogDetail(id));
        },
      });
    } catch {
      showAlert({
        title: '오류',
        message: '게시글 수정에 실패했습니다',
        type: 'error',
      });
    }
  };

  // 로딩 상태
  if (loading && !post) {
    return (
      <MainLayout>
        <Section className="py-20">
          <Container>
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">게시글을 불러오는 중...</p>
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <MainLayout>
        <Section className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/30 mb-6">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="font-medium text-destructive mb-1 text-center">오류가 발생했습니다</p>
                <p className="text-sm text-muted-foreground text-center">
                  {'data' in error ? (error.data as any)?.message : '게시글을 불러올 수 없습니다'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(routeHelpers.blogDetail(id!))}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                게시글로 돌아가기
              </Button>
            </motion.div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  // 게시글이 없는 경우
  if (!post) {
    return (
      <MainLayout>
        <Section className="py-20">
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 max-w-md mx-auto"
            >
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-3">게시글을 찾을 수 없습니다</h2>
              <p className="text-muted-foreground mb-8">삭제되었거나 존재하지 않는 게시글입니다</p>
              <Button
                size="lg"
                onClick={() => navigate('/posts')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </motion.div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title={`${post.title} 수정 | Blog`}
        description="게시글을 수정하세요"
      />

      {/* Header */}
      <Section className="pt-8 pb-4">
        <Container>
          <Button
            variant="ghost"
            onClick={() => navigate(routeHelpers.blogDetail(id!))}
            className="group -ml-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            게시글로 돌아가기
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              게시글 수정
            </h1>
            <p className="text-muted-foreground text-lg">
              게시글 내용을 수정하고 저장할 수 있습니다.
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
                      발행
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-8 border-t border-border">
                <Button
                  type="submit"
                  disabled={loading || updating}
                  size="lg"
                  className={`flex-1 ${
                    status === 'published'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-accent hover:bg-accent/90'
                  } shadow-lg hover:shadow-xl transition-all group`}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : status === 'published' ? (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      저장 및 발행
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      저장
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(routeHelpers.blogDetail(id!))}
                  disabled={loading || updating}
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

export default PostEditPage;
