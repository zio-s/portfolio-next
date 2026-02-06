/**
 * Projects List Page
 *
 * Minimal, professional projects showcase
 * Inspired by h-creations.com aesthetic
 */

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { useGetProjectsQuery } from '../features/portfolio/api/projectsApi';
import type { ProjectCategory, ProjectFilters } from '../features/portfolio/types/Project';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { Tooltip } from '@/components/ui/tooltip';
import { Pagination } from '@/components/common/Pagination';
import { SEO } from '@/components/common/SEO';
import { CollectionPageJsonLd, BreadcrumbJsonLd } from '@/components/common/JsonLd';
import { Loader2, Check } from 'lucide-react';

const CATEGORIES: Array<{ value: ProjectCategory | undefined; label: string }> = [
  { value: undefined, label: '전체' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
];

type SortOption = NonNullable<ProjectFilters['sort']>;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'default', label: '추천순' },
  { value: 'recent', label: '최신순' },
  { value: 'views', label: '조회순' },
  { value: 'likes', label: '인기순' },
];

export const ProjectsPage = () => {
  const [category, setCategory] = useState<ProjectCategory | undefined>();
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);

  // RTK Query로 프로젝트 목록 조회
  const { data, isLoading, error } = useGetProjectsQuery({
    category,
    sort,
    page,
    limit: 6,
  });

  // 필터 변경 시 페이지 초기화
  const handleCategoryChange = (newCategory: ProjectCategory | undefined) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MainLayout>
      <SEO
        title="프로젝트 | 변세민 | 프론트엔드 개발자 포트폴리오"
        description="React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다. 실무 경험과 학습 과정을 담은 포트폴리오입니다."
        url="https://semincode.com/projects"
      />

      {/* JSON-LD 구조화 데이터 */}
      <CollectionPageJsonLd
        url="https://semincode.com/projects"
        title="프로젝트 | 변세민 | 프론트엔드 개발자 포트폴리오"
        description="React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다."
      />

      <BreadcrumbJsonLd
        items={[
          { name: '홈', url: '/' },
          { name: '프로젝트', url: '/projects' },
        ]}
      />
      {/* Header - Minimal */}
      <Section className="py-20 bg-background">
        <Container>
          <div className="max-w-3xl mb-16">
            <p className="text-sm text-muted-foreground mb-4 tracking-wide">Portfolio</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              시간과 노력을 담은 작업
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              하나하나 정성스럽게 개발한 프로젝트입니다
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12 pb-6 border-b border-border">
            {/* Category filters */}
            <div className="flex items-center gap-2">
              {CATEGORIES.map(({ value, label }, index) => (
                <Tooltip
                  key={label}
                  content={value ? `${label} 프로젝트 보기` : '전체 프로젝트 보기'}
                  position={index % 2 === 0 ? 'top' : 'bottom'}
                >
                  <button
                    onClick={() => handleCategoryChange(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      category === value
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                </Tooltip>
              ))}
            </div>

            {/* Sort filters */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {SORT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSortChange(value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer rounded-md ${
                    sort === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sort === value && <Check className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Loading State */}
      {isLoading && (
        <Section className="py-20">
          <Container>
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-3" />
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            </div>
          </Container>
        </Section>
      )}

      {/* Error State */}
      {error && (
        <Section className="py-20">
          <Container>
            <div className="flex flex-col items-center justify-center">
              <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center max-w-md">
                <p className="font-medium text-destructive mb-1">Failed to load projects</p>
                <p className="text-sm text-muted-foreground">Please try again later.</p>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Projects Grid - Clean layout */}
      {data && data.items.length > 0 && (
        <Section className="py-12 bg-background">
          <Container>
            <LayoutGroup>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {data.items.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }}
                    >
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
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                />
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* Empty State */}
      {data && data.items.length === 0 && (
        <Section className="py-20">
          <Container>
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <p className="text-xl font-semibold mb-2">프로젝트가 없습니다</p>
              <p className="text-muted-foreground mb-6">
                필터를 변경해보세요
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCategory(undefined);
                  setSort('recent');
                  setPage(1);
                }}
              >
                필터 초기화
              </Button>
            </div>
          </Container>
        </Section>
      )}
    </MainLayout>
  );
};

export default ProjectsPage;
