/**
 * 사이트 운영자 프로필 (정적 자기소개)
 *
 * DESIGN_RESPONSE.md §3.3 — 1인 블로그이므로 정적값을 한 곳에서 관리.
 * 사이드바, About author 카드, OG 메타 등에서 import해서 사용.
 */

export const PROFILE = {
  name: '변세민',
  initials: 'SM',
  role: 'Frontend Developer',
  bio: '사용자에게 즐거움을 주는 인터페이스를 만듭니다. React · TypeScript · Next.js.',
  email: 'popqr1@gmail.com',
  github: 'https://github.com/seming2',
  url: 'https://semincode.com',
  avatarUrl: undefined as string | undefined,
} as const;

export type Profile = typeof PROFILE;
