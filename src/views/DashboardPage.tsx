/**
 * 대시보드 페이지 - Modern Tailwind Version
 *
 * 로그인한 관리자의 메인 대시보드 화면입니다.
 * 주요 통계와 빠른 액션을 제공합니다.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { ROUTES } from '../router/routes';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useGetAdminStatsQuery } from '../features/admin/api/adminApi';
import { AdminLayout } from '../components/layout/AdminLayout';
import {
  Loader2,
  FolderOpen,
  MessageCircle,
  Eye,
  Heart,
  FileText,
  PenSquare,
  User,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

/**
 * 통계 카드 컴포넌트
 */
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  link?: string;
}

const StatCard = ({ title, value, icon, gradient, link }: StatCardProps) => {
  const content = (
    <div
      className={`p-5 rounded-xl ${gradient} text-white transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm opacity-90 font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

/**
 * 빠른 액션 카드 컴포넌트
 */
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

const ActionCard = ({ title, description, icon, gradient, onClick }: ActionCardProps) => (
  <button
    onClick={onClick}
    className={`p-5 rounded-xl ${gradient} text-white text-left transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer w-full`}
  >
    <div className="text-2xl mb-2">{icon}</div>
    <div className="font-semibold mb-1">{title}</div>
    <div className="text-sm opacity-90">{description}</div>
  </button>
);

/**
 * 링크 카드 컴포넌트
 */
interface LinkCardProps {
  to: string;
  title: string;
  description: string;
  gradient: string;
}

const LinkCard = ({ to, title, description, gradient }: LinkCardProps) => (
  <Link
    to={to}
    className={`block p-6 ${gradient} text-white rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg`}
  >
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="opacity-90">{description}</p>
  </Link>
);

const DashboardPage = () => {
  const user = useAppSelector(selectUser);
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const { data: stats, isLoading: loading } = useGetAdminStatsQuery(undefined, {
    skip: !isAdmin,
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            환영합니다, {user?.name || user?.email}님!
          </p>
        </div>

        {/* Admin Stats Section */}
        {isAdmin && (
          <>
            {/* 통계 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📊 통계
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <span className="ml-2 text-muted-foreground">통계 로딩 중...</span>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="전체 프로젝트"
                    value={stats.totalProjects}
                    icon={<FolderOpen className="w-8 h-8" />}
                    gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                    link="/admin/projects"
                  />
                  <StatCard
                    title="전체 댓글"
                    value={stats.totalComments}
                    icon={<MessageCircle className="w-8 h-8" />}
                    gradient="bg-gradient-to-br from-pink-500 to-rose-500"
                    link="/admin/comments"
                  />
                  <StatCard
                    title="전체 조회수"
                    value={stats.totalViews}
                    icon={<Eye className="w-8 h-8" />}
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                  />
                  <StatCard
                    title="전체 좋아요"
                    value={stats.totalLikes}
                    icon={<Heart className="w-8 h-8" />}
                    gradient="bg-gradient-to-br from-orange-500 to-amber-500"
                  />
                </div>
              ) : null}
            </section>

            {/* 빠른 작업 */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚡ 빠른 작업
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                  title="프로젝트 관리"
                  description="프로젝트 생성, 수정, 삭제"
                  icon={<FolderOpen className="w-6 h-6" />}
                  gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                  onClick={() => navigate('/admin/projects')}
                />
                <ActionCard
                  title="댓글 관리"
                  description="댓글 모더레이션 및 삭제"
                  icon={<MessageCircle className="w-6 h-6" />}
                  gradient="bg-gradient-to-br from-pink-500 to-rose-500"
                  onClick={() => navigate('/admin/comments')}
                />
                <ActionCard
                  title="방문록 관리"
                  description="방문록 확인 및 답글 작성"
                  icon={<BookOpen className="w-6 h-6" />}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                  onClick={() => navigate('/admin/guestbook')}
                />
                <ActionCard
                  title="공개 페이지 보기"
                  description="포트폴리오 공개 페이지로 이동"
                  icon={<ExternalLink className="w-6 h-6" />}
                  gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                  onClick={() => navigate('/projects')}
                />
              </div>
            </section>
          </>
        )}

        {/* 주요 메뉴 */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📂 주요 메뉴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LinkCard
              to="/blog"
              title="블로그"
              description="게시글 목록 보기"
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <LinkCard
              to={ROUTES.BLOG_CREATE}
              title="새 게시글"
              description="게시글 작성하기"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
            />
            <LinkCard
              to={ROUTES.PROFILE}
              title="프로필"
              description="내 정보 관리"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
          </div>
        </section>

        {/* 최근 활동 */}
        <section className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-3">최근 활동</h3>
          <p className="text-muted-foreground text-sm">
            최근 활동 내역이 여기에 표시됩니다.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
