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
  location: 'Seoul',
  bio: '프론트엔드, 디자인, 일상에 대해 씁니다.',
  email: 'popqr1@gmail.com',
  github: 'https://github.com/seming2',
  twitter: undefined as string | undefined,
  rss: '/feed.xml',
  url: 'https://semincode.com',
  avatarUrl: undefined as string | undefined,
} as const;

export type Profile = typeof PROFILE;
