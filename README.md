# Portfolio CMS

Next.js 16 기반 포트폴리오 & 블로그 CMS

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zio-s/portfolio-next)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| State | Redux Toolkit + RTK Query |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Auth | HttpOnly Cookie 기반 |

## Features

### Portfolio
- 프로젝트 갤러리 (그리드/리스트 뷰)
- 프로젝트 상세 페이지 (비디오 모달)
- 좋아요 & 조회수 기능
- 드래그 앤 드롭 순서 변경 (Admin)

### Blog
- 마크다운 기반 블로그
- 태그 필터링
- 댓글 시스템 (대댓글 지원)
- n8n 연동 자동 포스팅

### Guestbook
- 방명록 작성/삭제
- 비속어 필터링

### Admin Dashboard
- 프로젝트/블로그/방명록 관리
- 통계 대시보드
- 댓글 관리

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
├── app/                    # Next.js App Router
│   ├── api/auth/          # Auth API Routes
│   ├── admin/             # Admin 페이지
│   ├── blog/              # 블로그 페이지
│   └── projects/          # 프로젝트 페이지
├── components/            # 재사용 컴포넌트
├── features/              # 기능별 모듈
├── hooks/                 # 커스텀 훅
├── lib/                   # 라이브러리 설정
├── services/              # API 서비스
├── store/                 # Redux Store
└── views/                 # 페이지 뷰 컴포넌트
```

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase 프로젝트

### Installation

```bash
# Clone
git clone https://github.com/zio-s/portfolio-next.git
cd portfolio-next

# Install dependencies
npm install

# Environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## Deployment

Vercel에 자동 배포:

1. GitHub 리포지토리 연결
2. 환경 변수 설정
3. Push 시 자동 배포

## License

MIT
