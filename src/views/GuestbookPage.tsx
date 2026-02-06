/**
 * 방문록 페이지
 * 2단 레이아웃의 방문록 시스템
 */

import * as React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MessageSquare, Loader2 } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { GuestbookForm } from '@/features/guestbook/components/GuestbookForm';
import { GuestbookCard } from '@/features/guestbook/components/GuestbookCard';
import {
  useGetGuestbookQuery,
  useGetTodayVisitorCountQuery,
  useIncrementVisitorCountMutation,
} from '@/features/guestbook/api/guestbookApi';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const GuestbookPage = () => {
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allEntries, setAllEntries] = React.useState<any[]>([]);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const prevTotalRef = React.useRef<number>(0);
  const registerAnimationRef = useScrollAnimation();

  const { data, isLoading, error, isFetching } = useGetGuestbookQuery({
    limit: 10,
    cursor,
    approvedOnly: true,
  });

  // 항상 최신 방문자 수 조회 (페이지 로드마다 갱신)
  const { data: visitorCount } = useGetTodayVisitorCountQuery();
  const [incrementVisitorCount] = useIncrementVisitorCountMutation();

  // 초기화: 오늘 첫 방문인지 확인하여 카운트 증가
  React.useEffect(() => {
    const VISIT_KEY = 'guestbook_last_visit';
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem(VISIT_KEY);

    // 오늘 첫 방문이면 카운트 증가
    if (lastVisit !== today) {
      incrementVisitorCount()
        .unwrap()
        .then(() => {
          localStorage.setItem(VISIT_KEY, today);
        })
        .catch(() => {
          // Error handled silently
        });
    }
  }, [incrementVisitorCount]);

  // 전체 카운트 변경 시 리셋 (새 글 추가됨)
  React.useEffect(() => {
    if (data?.total !== undefined && data.total !== prevTotalRef.current) {
      prevTotalRef.current = data.total;
      // 첫 페이지로 리셋
      setCursor(undefined);
      setAllEntries([]);
    }
  }, [data?.total]);

  // 추가 로드 시 항목 누적
  React.useEffect(() => {
    if (data?.items) {
      if (!cursor) {
        // 첫 페이지 - 모든 항목 교체
        setAllEntries(data.items);
      } else {
        // 추가 페이지 - 중복 제거하며 새 항목 추가
        setAllEntries(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = data.items.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data?.items, cursor]);

  // Intersection Observer를 사용한 무한 스크롤
  React.useEffect(() => {
    // 데이터 로드 및 항목 채워질 때까지 대기
    if (allEntries.length === 0) {
      return;
    }

    const currentRef = loadMoreRef.current;
    if (!currentRef) {
      return;
    }

    if (!data?.hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && !isFetching && data?.hasMore && data?.nextCursor) {
          setCursor(data.nextCursor);
        }
      },
      { threshold: 0.1 } // 더 나은 트리거를 위한 낮은 임계값
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [isFetching, data?.hasMore, data?.nextCursor, allEntries.length]);

  const guestbookEntries = allEntries;

  return (
    <MainLayout>
      <SEO
        title="방문록 | 변세민 | 프론트엔드 개발자 포트폴리오"
        description="여러분의 소중한 의견을 남겨주세요. 프론트엔드 개발자 변세민의 포트폴리오 방문록입니다."
        url="https://semincode.com/guestbook"
      />
      <div className="w-full px-4 sm:px-6 max-w-[1400px] mx-auto py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Header & List */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                여러분의 소중한 의견,<br />
                감사히 듣겠습니다
              </h1>
              <p className="text-base text-muted-foreground mb-6">
                함께 성장하는 개발자가 되고 싶습니다
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>오늘 방문자
                  <span className={'text-accent px-1 font-bold'}>
                    {visitorCount}명
                  </span>
                  </span>
                <span className="mx-2">|</span>
                <span>전체 댓글 <span className={'text-accent font-bold'}>{data?.total || 0}</span></span>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-sm text-destructive">방문록을 불러올 수 없습니다.</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && guestbookEntries.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">첫 방문록을 남겨보세요</p>
              </div>
            )}

            {/* Guestbook List */}
            {!isLoading && !error && guestbookEntries.length > 0 && (
              <>
                <div className="space-y-6">
                  {guestbookEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      ref={registerAnimationRef}
                      data-animate="true"
                      style={{
                        transitionDelay: `${(index % 10) * 0.05}s`,
                      }}
                    >
                      <GuestbookCard
                        guestbook={entry}
                        showAdminBadge={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Trigger - Always render for ref, hide with CSS if not needed */}
                <div
                  ref={loadMoreRef}
                  className="flex justify-center py-8"
                  style={{ display: data?.hasMore ? 'flex' : 'none' }}
                >
                  {isFetching && (
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  )}
                </div>

                {/* End Message */}
                {!data?.hasMore && allEntries.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">소중한 글 감사드립니다. 열심히 하겠습니다!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Form (Mobile First, Sticky on Desktop) */}
          <div className="w-full lg:w-[580px] order-1 lg:order-2">
            <div className="lg:sticky lg:top-[5rem] lg:max-h-[calc(100vh-6rem)]">
              <GuestbookForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuestbookPage;
