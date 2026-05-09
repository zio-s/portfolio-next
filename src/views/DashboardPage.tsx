'use client';

/**
 * Dashboard — 블로그 디자인 시스템과 통일 (Linear/Vercel 톤)
 *
 * 참조: claudedocs/ADMIN_REDESIGN_SPEC.md §2.3
 * - 4-stat 한 줄 (그라디언트 X)
 * - Quick Actions: 카드 X, row 리스트
 * - Recent Activity: row 리스트 (mono 시간 + 텍스트)
 * - 이모지 X, lucide 아이콘 단색, 단일 accent
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { ROUTES } from '../router/routes';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useGetAdminStatsQuery } from '../features/admin/api/adminApi';
import { useGetPostsQuery } from '../store';
import { AdminLayout } from '../components/layout/AdminLayout';
import { calcReadMinutes, deriveCategory, formatRelative } from '@/lib/blog';
import {
  Loader2,
  FolderOpen,
  MessageSquare,
  Eye,
  Heart,
  PenSquare,
  BookOpen,
  ExternalLink,
  ArrowUpRight,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';

// ─── 통계 ──────────────────────────────────────────────
interface StatProps {
  label: string;
  value: number | string;
  href?: string;
  loading?: boolean;
}

function Stat({ label, value, href, loading }: StatProps) {
  const content = (
    <div className="admin-stat">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">
        {loading ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--blog-fg-muted)' }} /> : value.toLocaleString()}
      </div>
    </div>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

// ─── 액션 row ──────────────────────────────────────────
interface ActionProps {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  external?: boolean;
}

function ActionRow({ icon, label, hint, onClick, external }: ActionProps) {
  return (
    <button type="button" className="admin-row" onClick={onClick}>
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>{hint}</span>
      )}
      {external ? (
        <ArrowUpRight className="admin-row-arrow" />
      ) : (
        <ChevronRight className="admin-row-arrow" />
      )}
    </button>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────
const DashboardPage = () => {
  const user = useAppSelector(selectUser);
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery(undefined, { skip: !isAdmin });
  const { data: postsData } = useGetPostsQuery({ status: undefined, page: 1, limit: 5 }, { skip: !isAdmin });
  const recentPosts = postsData?.posts ?? [];

  return (
    <AdminLayout>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        {/* Page header */}
        <header className="mb-10">
          <div className="blog-uppercase-label text-[10.5px] mb-3" style={{ color: 'var(--blog-fg-subtle)' }}>
            Overview
          </div>
          <h1 className="text-[32px] font-bold tracking-[-0.025em]" style={{ color: 'var(--blog-fg)' }}>
            대시보드
          </h1>
          <p className="blog-mono text-[12px] mt-1.5" style={{ color: 'var(--blog-fg-subtle)' }}>
            {user?.email ?? 'admin'}
          </p>
        </header>

        {/* Stats — 4-stat 한 줄 */}
        <section className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Projects"  value={stats?.totalProjects ?? 0}  href="/admin/projects" loading={statsLoading} />
            <Stat label="Comments"  value={stats?.totalComments ?? 0}  href="/admin/comments" loading={statsLoading} />
            <Stat label="Views"     value={stats?.totalViews ?? 0}     loading={statsLoading} />
            <Stat label="Likes"     value={stats?.totalLikes ?? 0}     loading={statsLoading} />
          </div>
        </section>

        {/* Two columns: Quick Actions + Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <section>
            <div className="admin-section-label">Quick Actions</div>
            <div className="admin-row-list">
              <ActionRow
                icon={<PenSquare />}
                label="새 게시글 작성"
                onClick={() => navigate(ROUTES.BLOG_CREATE)}
              />
              <ActionRow
                icon={<FileText />}
                label="블로그 글 관리"
                hint={stats?.totalProjects !== undefined ? `${recentPosts.length}+ posts` : undefined}
                onClick={() => navigate('/admin/posts')}
              />
              <ActionRow
                icon={<FolderOpen />}
                label="프로젝트 관리"
                onClick={() => navigate('/admin/projects')}
              />
              <ActionRow
                icon={<MessageSquare />}
                label="댓글 모더레이션"
                hint={stats?.totalComments ? `${stats.totalComments}건` : undefined}
                onClick={() => navigate('/admin/comments')}
              />
              <ActionRow
                icon={<BookOpen />}
                label="방문록 답글"
                onClick={() => navigate('/admin/guestbook')}
              />
              <ActionRow
                icon={<User />}
                label="프로필 설정"
                onClick={() => navigate(ROUTES.PROFILE)}
              />
              <ActionRow
                icon={<ExternalLink />}
                label="공개 사이트 보기"
                onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
                external
              />
            </div>
          </section>

          {/* Recent Posts */}
          <section>
            <div className="admin-section-label flex items-center justify-between">
              <span>Recent Posts</span>
              <Link
                to="/admin/posts"
                className="blog-mono text-[10.5px] normal-case tracking-normal"
                style={{ color: 'var(--blog-fg-subtle)' }}
              >
                모두 보기 →
              </Link>
            </div>
            <div className="admin-row-list">
              {recentPosts.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="blog-mono text-[12px]" style={{ color: 'var(--blog-fg-subtle)' }}>
                    아직 게시글이 없습니다
                  </div>
                </div>
              ) : (
                recentPosts.map((p) => {
                  const cat = deriveCategory(p);
                  const dateRaw = p.publishedAt || p.published_at || p.createdAt || p.created_at;
                  return (
                    <Link
                      key={p.id}
                      to={`/blog/${p.post_number}`}
                      className="admin-row"
                    >
                      <span
                        className="blog-mono text-[10px] uppercase tracking-[0.06em] shrink-0"
                        style={{ color: 'var(--blog-accent)', minWidth: 60 }}
                      >
                        {cat.label.slice(0, 8)}
                      </span>
                      <span className="flex-1 truncate text-[13px]" style={{ color: 'var(--blog-fg)' }}>
                        {p.title}
                      </span>
                      <span className="blog-mono text-[10.5px] shrink-0" style={{ color: 'var(--blog-fg-subtle)' }}>
                        {formatRelative(dateRaw)}
                      </span>
                      {p.status === 'draft' && (
                        <span className="admin-badge" data-tone="muted">초안</span>
                      )}
                      <ChevronRight className="admin-row-arrow" />
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* 통계 부가 정보 — 미세하게 */}
        {stats && (
          <section className="mt-10 pt-6" style={{ borderTop: '1px solid var(--blog-border)' }}>
            <div className="admin-section-label">Distribution</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 blog-mono text-[12px]">
              <DistRow icon={<FolderOpen />} label="projects" value={stats.totalProjects} />
              <DistRow icon={<MessageSquare />} label="comments" value={stats.totalComments} />
              <DistRow icon={<Eye />}     label="views"    value={stats.totalViews} />
              <DistRow icon={<Heart />}   label="likes"    value={stats.totalLikes} />
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

function DistRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ color: 'var(--blog-fg-muted)' }}>
      <span className="inline-flex" style={{ width: 12, color: 'var(--blog-fg-subtle)' }}>
        {icon}
      </span>
      <span className="uppercase">{label}</span>
      <span className="ml-auto" style={{ color: 'var(--blog-fg)' }}>{value.toLocaleString()}</span>
    </div>
  );
}

export default DashboardPage;
