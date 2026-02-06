/**
 * Admin Login Page - Modern Tailwind v4 Version
 *
 * Admin 전용 로그인 페이지
 * h-creations.com 스타일의 미니멀한 디자인
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearAuthError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@/store';
import { Loader2, AlertCircle, Lock, Mail, LogIn } from 'lucide-react';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Selector 패턴 사용 (Best Practice)
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 로그인되면 /admin으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]); // isAuthenticated 변경 시 실행

  // 에러 클리어
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // useEffect가 isAuthenticated 변경을 감지하여 자동 리다이렉트
    } catch {
      // 에러는 Redux state에서 처리
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground">
            관리자 전용 로그인
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              관리자만 접근 가능합니다. <br />
              계정이 없으신 경우 시스템 관리자에게 문의하세요.
            </p>
          </div>
        </div>

        {/* Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
