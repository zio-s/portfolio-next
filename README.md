# Portfolio & Blog CMS

Next.js 16 기반 개인 포트폴리오 & 블로그 CMS. 프로젝트 갤러리, 마크다운 블로그, 방명록, 관리자 대시보드를 포함한 풀스택 웹 애플리케이션입니다.

**Live**: https://semincode.com

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| State | Redux Toolkit + RTK Query |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Auth | HttpOnly Cookie 기반 (Access + Refresh Token) |
| Auto Posting | Supabase Edge Functions + Gemini AI |

## Features

### Portfolio
- 프로젝트 갤러리 (그리드 레이아웃)
- 프로젝트 상세 모달 (이미지, 기술 스택, 도전/해결 과정)
- 비디오 모달 플레이어
- 좋아요 & 조회수 트래킹
- 드래그 앤 드롭 순서 변경 (Admin)

### Blog
- 마크다운 기반 블로그 에디터
- 태그 필터링 + 검색
- 댓글 시스템 (대댓글 지원, 관리자 배지)
- 게시글 번호 기반 URL (`/blog/1`, `/blog/2`)
- Supabase Edge Functions + Gemini AI 자동 포스팅

### Guestbook
- 방명록 작성/삭제
- 비속어 필터링
- localStorage 기반 본인 글 관리

### Admin Dashboard
- 프로젝트/블로그/방명록 CRUD 관리
- 통계 대시보드 (조회수, 좋아요 집계)
- 댓글 관리 (승인/삭제)

## Authentication

HttpOnly 쿠키 기반 인증으로 보안 강화:

```
Client → API Routes → Supabase Auth
              ↓
   HttpOnly Cookie (Access + Refresh Token)
```

- XSS 공격 방어 (JavaScript에서 토큰 접근 불가)
- 새로고침해도 세션 유지
- 자동 토큰 갱신

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # 인증 (로그인, 로그아웃, 토큰 갱신)
│   │   └── admin/            # 관리자 API
│   ├── admin/                # 관리자 대시보드
│   ├── blog/                 # 블로그 페이지
│   ├── guestbook/            # 방명록
│   ├── projects/             # 프로젝트 갤러리
│   └── profile/              # 프로필
├── components/               # 재사용 컴포넌트
├── features/                 # 기능별 모듈
│   ├── comments/             # 프로젝트 댓글
│   ├── post-comments/        # 블로그 댓글 (대댓글)
│   ├── guestbook/            # 방명록
│   ├── portfolio/            # 포트폴리오
│   ├── posts/                # 블로그
│   └── users/                # 사용자
├── hooks/                    # 커스텀 훅
├── store/                    # Redux Store + RTK Query
├── services/                 # API 서비스 레이어
├── lib/                      # Supabase, Auth 설정
└── views/                    # 페이지 뷰 컴포넌트
```

## Development

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

## Deployment

Vercel에 자동 배포 (GitHub Push → Build → Deploy)
