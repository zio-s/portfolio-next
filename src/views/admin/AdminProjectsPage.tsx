/**
 * Admin Projects Page - Modern Tailwind v4 Version
 *
 * 프로젝트 관리 페이지 (관리자 전용)
 * h-creations.com 스타일의 미니멀한 디자인
 * 클릭으로 순번 변경 지원
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ProjectForm } from '../../components/admin/ProjectForm';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/modal/hooks/use-confirm-modal';
import type { Project } from '../../features/portfolio/types/Project';
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useCreateProjectMutation,
  useUpdateProjectsOrderMutation,
} from '../../features/portfolio/api/projectsApi';
import { Loader2, Plus, Edit2, Trash2, Star, Eye, Heart, MessageCircle, EyeOff } from 'lucide-react';

/**
 * 순번 편집 Input 컴포넌트
 */
interface OrderInputProps {
  currentOrder: number;
  maxOrder: number;
  onSave: (newOrder: number) => void;
  onCancel: () => void;
}

const OrderInput = ({ currentOrder, maxOrder, onSave, onCancel }: OrderInputProps) => {
  const [value, setValue] = useState(String(currentOrder));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 1 && num <= maxOrder) {
        onSave(num);
      }
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= maxOrder) {
      onSave(num);
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="number"
        min={1}
        max={maxOrder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-12 h-8 text-center text-sm border border-accent rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
        autoFocus
      />
    </div>
  );
};

/**
 * Table Row Component
 */
interface TableRowProps {
  project: Project;
  order: number;
  maxOrder: number;
  isEditingOrder: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onOrderClick: () => void;
  onOrderSave: (newOrder: number) => void;
  onOrderCancel: () => void;
}

const TableRow = ({
  project,
  order,
  maxOrder,
  isEditingOrder,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleHidden,
  onOrderClick,
  onOrderSave,
  onOrderCancel,
}: TableRowProps) => {
  return (
    <div className={`grid grid-cols-[50px_1fr_90px_80px_80px_110px_90px] items-center border-b border-border hover:bg-muted/30 transition-all ${project.hidden ? 'opacity-50' : ''}`}>
      {/* Order Number */}
      <div className="px-3 py-4 text-center">
        {isEditingOrder ? (
          <OrderInput
            currentOrder={order}
            maxOrder={maxOrder}
            onSave={onOrderSave}
            onCancel={onOrderCancel}
          />
        ) : (
          <button
            onClick={onOrderClick}
            className="w-10 h-8 inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors border border-transparent hover:border-accent/30"
            title="클릭하여 순번 변경"
          >
            {order}
          </button>
        )}
      </div>

      {/* Title & Description */}
      <div className="px-4 py-4">
        <div className="max-w-md">
          <div className="font-semibold text-sm mb-1">{project.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
          {project.category}
        </span>
      </div>

      {/* Featured Toggle */}
      <div className="px-2 py-4 text-center">
        <button
          onClick={() => onToggleFeatured(project.id, project.featured)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            project.featured
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          title={project.featured ? '대표 해제' : '대표로 설정'}
        >
          <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Hidden Toggle */}
      <div className="px-2 py-4 text-center">
        <button
          onClick={() => onToggleHidden(project.id, project.hidden)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            project.hidden
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
          }`}
          title={project.hidden ? '클릭하여 공개' : '클릭하여 숨기기'}
        >
          {project.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {project.stats.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {project.stats.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {project.stats.comments}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
            title="수정"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id, project.title)}
            className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Card Component
 */
interface MobileCardProps {
  project: Project;
  order: number;
  maxOrder: number;
  isEditingOrder: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onOrderClick: () => void;
  onOrderSave: (newOrder: number) => void;
  onOrderCancel: () => void;
}

const MobileCard = ({
  project,
  order,
  maxOrder,
  isEditingOrder,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleHidden,
  onOrderClick,
  onOrderSave,
  onOrderCancel,
}: MobileCardProps) => {
  return (
    <div className={`p-4 rounded-lg border bg-card border-border space-y-3 ${project.hidden ? 'opacity-50' : ''}`}>
      {/* Header with Order */}
      <div className="flex items-start justify-between gap-2">
        {isEditingOrder ? (
          <OrderInput
            currentOrder={order}
            maxOrder={maxOrder}
            onSave={onOrderSave}
            onCancel={onOrderCancel}
          />
        ) : (
          <button
            onClick={onOrderClick}
            className="w-10 h-8 inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-md transition-colors border border-muted hover:border-accent/30 flex-shrink-0"
            title="클릭하여 순번 변경"
          >
            {order}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 truncate">{project.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>
        {project.featured && (
          <Star className="w-4 h-4 text-accent fill-current flex-shrink-0" />
        )}
      </div>

      {/* Category */}
      <div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
          {project.category}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {project.stats.views}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {project.stats.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {project.stats.comments}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={() => onToggleFeatured(project.id, project.featured)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            project.featured
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Star className={`w-3 h-3 ${project.featured ? 'fill-current' : ''}`} />
          {project.featured ? '대표' : '일반'}
        </button>
        <button
          onClick={() => onToggleHidden(project.id, project.hidden)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            project.hidden
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <EyeOff className="w-3 h-3" />
          {project.hidden ? '숨김' : '공개'}
        </button>
        <button
          onClick={() => onEdit(project)}
          className="px-3 py-2 rounded-md hover:bg-muted transition-colors text-foreground"
          title="수정"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(project.id, project.title)}
          className="px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
          title="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const AdminProjectsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  // RTK Query hooks
  const { data, isLoading: loading, error } = useGetProjectsQuery({ limit: 100, sort: 'default', includeHidden: true });
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [createProject] = useCreateProjectMutation();
  const [updateProjectsOrder, { isLoading: isSavingOrder }] = useUpdateProjectsOrderMutation();

  // Projects list
  const projects = useMemo(() => data?.items || [], [data?.items]);

  // Handle order change
  const handleOrderChange = async (projectId: string, newOrder: number) => {
    setEditingOrderId(null);

    const currentIndex = projects.findIndex(p => p.id === projectId);
    if (currentIndex === -1) return;

    const targetIndex = newOrder - 1; // 1-based to 0-based index

    if (currentIndex === targetIndex) return; // No change needed

    // Reorder projects
    const newProjects = [...projects];
    const [movedProject] = newProjects.splice(currentIndex, 1);
    newProjects.splice(targetIndex, 0, movedProject);

    // Update sort_order in database
    const updates = newProjects.map((project, index) => ({
      id: project.id,
      sortOrder: index,
    }));

    try {
      await updateProjectsOrder(updates).unwrap();
      showAlert({
        title: '순서 저장',
        message: `프로젝트가 ${newOrder}번으로 이동되었습니다.`,
        type: 'success',
      });
    } catch {
      showAlert({
        title: '순서 저장 실패',
        message: '프로젝트 순서 저장에 실패했습니다.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    showConfirm({
      title: '프로젝트 삭제',
      message: `"${title}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteProject(id).unwrap();
          showAlert({
            title: '삭제 완료',
            message: '프로젝트가 삭제되었습니다.',
            type: 'success',
          });
        } catch {
          showAlert({
            title: '삭제 실패',
            message: '프로젝트 삭제에 실패했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateProject({
        id,
        featured: !currentFeatured,
      }).unwrap();

      showAlert({
        title: currentFeatured ? '고정 해제' : '고정 완료',
        message: currentFeatured
          ? '프로젝트 고정이 해제되었습니다.'
          : '프로젝트가 Featured로 고정되었습니다.',
        type: 'success',
      });
    } catch {
      showAlert({
        title: 'Featured 설정 실패',
        message: 'Featured 상태 변경에 실패했습니다.',
        type: 'error',
      });
    }
  };

  const toggleHidden = async (id: string, currentHidden: boolean) => {
    try {
      await updateProject({
        id,
        hidden: !currentHidden,
      }).unwrap();

      showAlert({
        title: currentHidden ? '공개 전환' : '숨김 처리',
        message: currentHidden
          ? '프로젝트가 공개되었습니다.'
          : '프로젝트가 숨김 처리되었습니다.',
        type: 'success',
      });
    } catch {
      showAlert({
        title: '숨김 설정 실패',
        message: '숨김 상태 변경에 실패했습니다.',
        type: 'error',
      });
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: Partial<Project>) => {
    try {
      if (editingProject) {
        await updateProject({
          id: editingProject.id,
          ...formData,
        }).unwrap();

        showAlert({
          title: '수정 완료',
          message: '프로젝트가 수정되었습니다.',
          type: 'success',
        });
      } else {
        await createProject(formData as Parameters<typeof createProject>[0]).unwrap();

        showAlert({
          title: '생성 완료',
          message: '프로젝트가 생성되었습니다.',
          type: 'success',
        });
      }

      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      showAlert({
        title: '저장 실패',
        message: '프로젝트 저장에 실패했습니다.',
        type: 'error',
      });

      throw err;
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
            <p className="text-sm text-muted-foreground mt-1">
              포트폴리오 프로젝트를 관리합니다
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              프로젝트를 불러올 수 없습니다. 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Saving indicator */}
        {isSavingOrder && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="text-sm text-accent">순서 저장 중...</span>
          </div>
        )}

        {/* Order Edit Help */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>순번 변경:</strong> 왼쪽 숫자를 클릭하면 순번을 직접 입력할 수 있습니다. (1 ~ {projects.length})
          </p>
        </div>

        {/* Projects Grid - Desktop */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
          {/* Header */}
          <div className="grid grid-cols-[50px_1fr_90px_80px_80px_110px_90px] items-center border-b border-border bg-muted/50">
            <div className="px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
              순번
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              제목
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              카테고리
            </div>
            <div className="px-2 py-3 text-xs font-semibold text-muted-foreground tracking-wider text-center">
              대표
            </div>
            <div className="px-2 py-3 text-xs font-semibold text-muted-foreground tracking-wider text-center">
              노출
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
              통계
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
              관리
            </div>
          </div>
          {/* Body */}
          <div>
            {projects.map((project, index) => (
              <TableRow
                key={project.id}
                project={project}
                order={index + 1}
                maxOrder={projects.length}
                isEditingOrder={editingOrderId === project.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFeatured={toggleFeatured}
                onToggleHidden={toggleHidden}
                onOrderClick={() => setEditingOrderId(project.id)}
                onOrderSave={(newOrder) => handleOrderChange(project.id, newOrder)}
                onOrderCancel={() => setEditingOrderId(null)}
              />
            ))}
          </div>
        </div>

        {/* Projects Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {projects.map((project, index) => (
            <MobileCard
              key={project.id}
              project={project}
              order={index + 1}
              maxOrder={projects.length}
              isEditingOrder={editingOrderId === project.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFeatured={toggleFeatured}
              onToggleHidden={toggleHidden}
              onOrderClick={() => setEditingOrderId(project.id)}
              onOrderSave={(newOrder) => handleOrderChange(project.id, newOrder)}
              onOrderCancel={() => setEditingOrderId(null)}
            />
          ))}
        </div>

        {/* Total Count */}
        <div className="text-sm text-muted-foreground">
          전체 <span className="font-semibold text-foreground">{projects.length}</span>개의
          프로젝트
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isOpen={isFormOpen}
      />
    </AdminLayout>
  );
};

export default AdminProjectsPage;
