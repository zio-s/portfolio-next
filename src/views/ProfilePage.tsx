/**
 * 프로필 페이지 - Modern Tailwind Version
 *
 * 로그인한 관리자의 프로필 정보를 확인하고 수정하는 페이지입니다.
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUser, selectAuthLoading, updateProfile, logout } from '../store/slices/authSlice';
import { ROUTES } from '../router/routes';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useConfirmModal } from '@/components/modal/hooks';
import { useAlertModal } from '@/components/modal/hooks';
import { User, Mail, Shield, Pencil, LogOut, Save, X, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector(selectAuthLoading);
  const { showConfirm } = useConfirmModal();
  const { showAlert } = useAlertModal();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showAlert({
        title: '입력 오류',
        message: '이름을 입력해주세요.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(updateProfile({ name: name.trim() })).unwrap();
      setIsEditing(false);
      showAlert({
        title: '저장 완료',
        message: '프로필이 업데이트되었습니다.',
        type: 'success',
      });
    } catch {
      showAlert({
        title: '저장 실패',
        message: '프로필 업데이트에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || '');
  };

  const handleLogout = () => {
    showConfirm({
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      type: 'warning',
      confirmText: '로그아웃',
      cancelText: '취소',
      onConfirm: async () => {
        await dispatch(logout());
        navigate(ROUTES.HOME);
      },
    });
  };

  // 로딩 중
  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  // 사용자 정보 없음
  if (!user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">프로필 정보를 불러올 수 없습니다</h1>
          <p className="text-muted-foreground">다시 로그인해주세요.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로필</h1>
          <p className="text-sm text-muted-foreground mt-1">
            계정 정보를 확인하고 수정합니다
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Avatar Section */}
          <div className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            {!isEditing ? (
              // 보기 모드
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      이름
                    </label>
                    <p className="text-foreground font-medium mt-1">{user.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      이메일
                    </label>
                    <p className="text-foreground font-medium mt-1">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      역할
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                        {user.role === 'admin' ? '관리자' : '사용자'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    프로필 수정
                  </button>
                </div>
              </div>
            ) : (
              // 수정 모드
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      이메일
                    </label>
                    <p className="mt-1 px-4 py-2.5 rounded-lg bg-muted/50 text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      이메일은 변경할 수 없습니다
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        저장
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-destructive mb-2">위험 영역</h3>
            <p className="text-sm text-muted-foreground mb-4">
              아래 작업은 신중하게 수행해야 합니다.
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-white font-medium text-sm hover:bg-destructive/90 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
