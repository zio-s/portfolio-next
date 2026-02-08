/**
 * 로그인 페이지
 *
 * 이메일/비밀번호 로그인 페이지
 * 프로젝트 디자인 시스템 (Tailwind CSS + Lucide) 적용
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login,
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '@/store';
import { ROUTES } from '@/router/routes';
import { Loader2, AlertCircle, Lock, Mail, LogIn, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Hydration 안전: 클라이언트 마운트 후에만 Redux 상태 반영
  useEffect(() => {
    setMounted(true);
  }, []);

  // 이미 로그인 상태면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 언마운트 시 에러 클리어
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) return;

    try {
      await dispatch(login(formData)).unwrap();
    } catch {
      // 에러는 Redux store에서 관리됨
    }
  };

  // Hydration 안전: 마운트 전에는 loading=false로 처리
  const isLoading = mounted ? loading : false;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">로그인</h1>
          <p className="text-sm text-muted-foreground">
            계정에 로그인하세요
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
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
                  placeholder="email@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.REGISTER)}
                className="text-accent hover:underline font-medium"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>

        {/* Home Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
