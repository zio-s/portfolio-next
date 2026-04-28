'use client';

/**
 * EditorPage — create / edit 모드 통합 (DESIGN_RESPONSE_R4.md §2)
 *
 * lg+ : 3-pane (MetaPanel 280 + Editor 1fr + Preview 1fr)
 * mobile : 탭 3개 (메타 / 작성 / 미리보기) + fixed bottom 발행 FAB
 *
 * 자동저장:
 * - edit 모드: 1500ms debounce → updatePost (savedAt 갱신)
 * - create 모드: 비활성 (첫 발행/저장 시 createPost로 새 글 생성, 이후 edit 라우트로 replace)
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useGetPostByIdQuery, useGetPostsQuery, useCreatePostMutation, useUpdatePostMutation } from '@/store';
import { useAlertModal } from '@/components/modal/hooks';
import { routeHelpers } from '@/router/routes';
import { aggregateTags } from '@/lib/blog';
import { DEFAULT_CATEGORY, isValidCategorySlug, type BlogCategorySlug } from '@/config/categories';
import { EditorToolbar } from './EditorToolbar';
import { MetaPanel } from './MetaPanel';
import { MarkdownEditor } from './MarkdownEditor';
import { Preview } from './Preview';
import { useAutosave } from './useAutosave';
import { useDirtyGuard } from './useDirtyGuard';

export type EditorMode = 'create' | 'edit';

interface EditorPageProps {
  mode: EditorMode;
}

type Tab = 'meta' | 'edit' | 'preview';

export function EditorPage({ mode }: EditorPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showAlert } = useAlertModal();

  // edit 모드: 기존 post 로딩
  const { data: existing, isLoading: loadingExisting, error: loadError } = useGetPostByIdQuery(id || '', {
    skip: mode !== 'edit' || !id,
  });
  // 자동완성용 전체 태그
  const { data: allData } = useGetPostsQuery({ status: 'published', page: 1, limit: 200 });
  const tagSuggestions = useMemo(
    () => aggregateTags(allData?.posts ?? []).map(({ tag }) => tag),
    [allData]
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<BlogCategorySlug>(DEFAULT_CATEGORY);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tab, setTab] = useState<Tab>('edit');

  // edit 모드: 초기값 hydration
  useEffect(() => {
    if (mode === 'edit' && existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setExcerpt(existing.excerpt);
      setCategory(isValidCategorySlug(existing.category) ? existing.category : DEFAULT_CATEGORY);
      setTags(existing.tags ?? []);
      setStatus(existing.status === 'published' ? 'published' : 'draft');
    }
  }, [mode, existing]);

  const [createPost, { isLoading: creating }] = useCreatePostMutation();
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation();

  // dirty key (debounce 비교용) — content/title/etc 합쳐 hash 대신 stringify
  const dirtyKey = useMemo(
    () => JSON.stringify({ title, content, excerpt, category, tags, status }),
    [title, content, excerpt, category, tags, status]
  );

  // 자동저장 — edit 모드만
  const { status: saveStatus, savedAt, saveNow, isDirty } = useAutosave({
    data: { title, content, excerpt, category, tags, status },
    enabled: mode === 'edit' && !!id,
    dirtyKey,
    delay: 1500,
    onSave: async (data) => {
      if (!id) return;
      await updatePost({
        id,
        updates: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || data.content.slice(0, 150),
          category: data.category,
          tags: data.tags,
          status: data.status,
        },
      }).unwrap();
    },
  });

  useDirtyGuard(isDirty);

  // 발행 핸들러
  const handlePublish = async () => {
    const finalExcerpt = excerpt || content.slice(0, 150);
    try {
      if (mode === 'create') {
        const created = await createPost({
          title,
          content,
          excerpt: finalExcerpt,
          category,
          tags,
          status: 'published',
        }).unwrap();
        showAlert({
          title: '완료',
          message: '게시글이 발행되었습니다',
          type: 'success',
          onConfirm: () => navigate(routeHelpers.blogDetail(created.post_number)),
        });
      } else if (id) {
        // 첫 발행(draft → published 또는 publishedAt이 NULL)이면 시점 set, 아니면 보존
        const isFirstPublish =
          existing?.status !== 'published' || !(existing?.publishedAt || existing?.published_at);
        await updatePost({
          id,
          updates: {
            title,
            content,
            excerpt: finalExcerpt,
            category,
            tags,
            status: 'published',
            ...(isFirstPublish && { publishedAt: new Date().toISOString() }),
          },
        }).unwrap();
        setStatus('published');
        showAlert({
          title: '완료',
          message: '수정 사항이 발행되었습니다',
          type: 'success',
          onConfirm: () => existing && navigate(routeHelpers.blogDetail(existing.post_number)),
        });
      }
    } catch {
      showAlert({ title: '오류', message: '저장에 실패했습니다', type: 'error' });
    }
  };

  // edit 로딩
  if (mode === 'edit' && loadingExisting && !existing) {
    return (
      <MainLayout>
        <div className="max-w-[720px] mx-auto py-20 flex flex-col items-center">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--blog-accent)] mb-3" />
          <p className="text-[var(--blog-fg-muted)] text-sm">불러오는 중…</p>
        </div>
      </MainLayout>
    );
  }
  if (mode === 'edit' && loadError) {
    return (
      <MainLayout>
        <div className="max-w-[720px] mx-auto py-20 px-4 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--blog-heart)' }} />
          <p className="text-[var(--blog-fg-muted)]">게시글을 불러올 수 없습니다</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <EditorToolbar
          title={title}
          status={status}
          saveStatus={saveStatus}
          savedAt={savedAt}
          onRetrySave={saveNow}
          onPublish={handlePublish}
          publishing={creating || updating}
        />

        {/* Mobile tab control (lg 미만) */}
        <div className="lg:hidden flex" style={{ borderBottom: '1px solid var(--blog-border)' }}>
          {([
            { k: 'meta', l: '메타' },
            { k: 'edit', l: '작성' },
            { k: 'preview', l: '미리보기' },
          ] as const).map((t) => {
            const active = t.k === tab;
            return (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className="flex-1 text-[13px] py-2.5 transition-colors"
                style={{
                  background: active ? 'var(--blog-bg)' : 'transparent',
                  color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--blog-accent)' : '2px solid transparent',
                }}
              >
                {t.l}
              </button>
            );
          })}
        </div>

        {/* Title input — 항상 노출 (lg+ Editor 패널에 위치, mobile은 작성 탭에서) */}
        {/* 3-pane layout (lg+) */}
        <div className="hidden lg:flex flex-1 min-h-0">
          <MetaPanel
            category={category} onCategoryChange={setCategory}
            tags={tags} onTagsChange={setTags}
            excerpt={excerpt} onExcerptChange={setExcerpt}
            status={status} onStatusChange={setStatus}
            tagSuggestions={tagSuggestions}
            content={content}
          />
          <div className="flex-1 min-w-0 flex flex-col">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              className="px-6 py-4 text-[24px] font-bold outline-none border-0"
              style={{
                background: 'var(--blog-bg)',
                color: 'var(--blog-fg)',
                borderBottom: '1px solid var(--blog-border)',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--blog-font-sans)',
              }}
            />
            <div className="flex-1 min-h-0">
              <MarkdownEditor value={content} onChange={setContent} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Preview title={title} content={content} />
          </div>
        </div>

        {/* Mobile tab panels */}
        <div className="lg:hidden flex-1 min-h-0 flex flex-col">
          {tab === 'meta' && (
            <MetaPanel
              category={category} onCategoryChange={setCategory}
              tags={tags} onTagsChange={setTags}
              excerpt={excerpt} onExcerptChange={setExcerpt}
              status={status} onStatusChange={setStatus}
              tagSuggestions={tagSuggestions}
              content={content}
            />
          )}
          {tab === 'edit' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="px-4 py-3 text-[20px] font-bold outline-none border-0"
                style={{
                  background: 'var(--blog-bg)',
                  color: 'var(--blog-fg)',
                  borderBottom: '1px solid var(--blog-border)',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--blog-font-sans)',
                }}
              />
              <div className="flex-1 min-h-0">
                <MarkdownEditor value={content} onChange={setContent} />
              </div>
            </div>
          )}
          {tab === 'preview' && (
            <div className="flex-1 min-h-0">
              <Preview title={title} content={content} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
