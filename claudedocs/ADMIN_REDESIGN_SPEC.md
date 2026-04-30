# Admin Redesign Spec — 블로그 디자인 시스템과 통일

작성일: 2026-04-30
참조: `src/styles/blog.css` (라운드 5까지 정제된 토큰)

---

## 0. 진단

### 현재 어드민 페이지 문제점

| # | 위치 | 문제 |
|---|---|---|
| 1 | `views/DashboardPage.tsx` | `bg-gradient-to-br from-violet-500 to-purple-600` 등 11개 카드 모두 컬러 그라디언트 → 정보 위계 X, 시각적 노이즈 ↑ |
| 2 | `components/layout/AdminLayout.tsx` + `layout.css` | BEM CSS, `--blog-*` 토큰 미사용. 블로그 톤과 색상 분리 |
| 3 | DashboardPage 섹션 헤더 | 📊 ⚡ 📂 이모지 — 블로그의 mono uppercase 라벨과 톤 충돌 |
| 4 | StatCard / ActionCard / LinkCard 3종 모두 그라디언트 | 카드만 11개. 본문/비주얼 위계 없이 평탄 |
| 5 | `components/layout/Sidebar.tsx` | 디자인 시스템 분리 (active 컬러, 라벨 톤) |
| 6 | admin Header (mode='admin') | layout.css 그대로 — 블로그 PublicHeader 톤과 다름 |
| 7 | 댓글/방문록 테이블 | 비교적 정돈됨. row hover / 액션 아이콘만 톤 정리 |

### 설계 의도
- **블로그 디자인 시스템(라운드 5)을 어드민에도 그대로 적용** → 한 사람의 디자인으로 보이게
- 그라디언트 → 단일 `--blog-card` + accent 강조
- 정보 위계: **데이터 > UI** (카드 화려함보다 숫자/콘텐츠가 먼저 눈에 들어와야)
- 미니멀 톤 (mono uppercase 라벨, 절제된 accent)

---

## 1. 토큰 매핑

블로그와 동일한 변수 사용:

```
--blog-bg          #0a0a0f   배경
--blog-bg-soft     #0d1118   코드/내부 패널
--blog-card        #131824   카드/사이드바 패널
--blog-card-hover  #171d2c   카드 hover
--blog-border      #202d3f   기본 border
--blog-border-soft #1a2433   미세 border
--blog-fg          #f8f9fb   본문
--blog-fg-muted    #94a3b8   2차 텍스트
--blog-fg-subtle   #64748b   메타/플레이스홀더
--blog-accent      #8b5cf6   포인트 (단일)
--blog-accent-soft rgba(139,92,246,.12)  hover/active bg
--blog-heart       #f43f5e   삭제/위험 액션 only
```

추가 어드민 전용 (선택):

```
--admin-success    #10b981   "발행됨" / "처리됨" 배지
--admin-warning    #f59e0b   "초안" / "대기"
--admin-info       #06b6d4   "조회" / 정보성
```

→ admin 전용은 **상태 배지에만 사용**. 카드 배경에는 사용 X.

---

## 2. 페이지별 리디자인 명세

### 2.1 AdminSidebar (좌측 240px)

```
┌─────────────────────┐
│ [LOGO] semincode.    │  60px header
├─────────────────────┤
│ DASHBOARD            │  uppercase-label 10px mono
│   ▸ Home            │  active: --blog-accent-soft bg + accent text
│                      │
│ CONTENT              │
│   ▸ Projects        │
│   ▸ Posts           │
│   ▸ Comments        │
│   ▸ Guestbook       │
│                      │
│ ACCOUNT              │
│   ▸ Profile         │
│                      │
│ ─────────────────── │
│ [SM] admin@adm…      │  하단 사용자 + 로그아웃
└─────────────────────┘
```

- 폭 240px (현재 유사), 모바일 drawer (현재 유지)
- bg `--blog-bg` + 우측 1px `--blog-border`
- 섹션 라벨: `blog-uppercase-label` (mono 10px)
- active item: `bg: --blog-accent-soft, color: --blog-accent, font-weight: 600, border-left: 2px accent`
- 일반 item: `text-[13px] text-[var(--blog-fg)] hover: bg-[var(--blog-accent-soft)]`
- 아이콘: 14-16px 단색, 텍스트와 같은 색
- 하단 사용자 영역: 36px 아바타 + name + email (mono 11px subtle)

### 2.2 Admin Header (60px)

PublicHeader와 톤은 동일하되 admin 컨텍스트:

```
┌─────────────────────────────────────────────────────┐
│ [logo] Portfolio CMS    Admin              [Avatar▾]│
└─────────────────────────────────────────────────────┘
```

- 60px sticky / blur backdrop / `--blog-bg-soft` 80%
- 좌: `Portfolio CMS` + 작은 `Admin` 라벨 (mono accent)
- 우: UserMenu (PublicHeader의 UserMenu 재사용)
- 모바일: 햄버거 → Sidebar drawer

### 2.3 Dashboard

#### 2.3.1 페이지 헤더

```
대시보드
admin@admin.com
```

- 텍스트만, 이모지 X
- h1 28px bold tracking -0.025em
- 부제: mono 12px subtle

#### 2.3.2 통계 — 4-stat 한 줄 (그라디언트 X)

```
┌──────────┬──────────┬──────────┬──────────┐
│ PROJECTS │ COMMENTS │   VIEWS  │   LIKES  │
│      10  │       2  │     377  │      20  │
│  +2 7d   │  +0 7d   │  +89 7d  │  +3 7d   │
└──────────┴──────────┴──────────┴──────────┘
```

- 카드: `bg: --blog-card, border: 1px --blog-border, radius: 8`, 그라디언트 X
- 라벨: mono 11px uppercase muted (accent X)
- 값: 32px bold fg
- 변화량: mono 11px subtle (`+N` 7일 누적, 데이터 없으면 생략 OK)
- hover: `border: --blog-accent`, transition 150ms

#### 2.3.3 빠른 작업 — 카드 X, 텍스트 그리드

```
QUICK ACTIONS
─────────────────────────────────────────
✏  새 게시글 작성              →
📁  프로젝트 관리              →
💬  댓글 모더레이션 (2건 대기)  →
📖  방문록 답글 작성           →
🔗  공개 페이지 보기           ↗
```

- mono uppercase 섹션 라벨
- 행 row: `padding: 12 16, hover: --blog-accent-soft, border-bottom: --blog-border-soft`
- 좌측 14px lucide 아이콘 (이모지 X), 가운데 텍스트, 우측 → 화살표
- 알림 정보가 있으면 mono small `(2건 대기)` 형태로

#### 2.3.4 최근 활동 (있으면)

```
RECENT ACTIVITY
─────────────────────────────────────────
2시간 전   새 댓글 ‘React Query staleTime…’
3시간 전   글 자동 발행 ‘TypeScript 유틸리티 타입’
어제      방명록 답글 ‘동근’
```

- mono 11px 시간 + fg 12.5px 텍스트
- empty state: mono subtle 한 줄 “최근 활동 없음”

→ 카드 11개 → **2-3개 섹션 + row 리스트**로 정보 밀도 ↑, 시각적 노이즈 ↓

### 2.4 Comments 관리 (현재 구조 유지 + 톤 정리)

- 사이드바 active 색을 `--blog-accent-soft + accent`로
- 테이블 row hover `--blog-card-hover`
- 출처 칩(블로그/프로젝트): `--blog-accent-soft + accent text` (현재 보라 OK)
- 작성자 아바타: 28px 단색 원형
- 액션 아이콘: 14px subtle → hover시 각각 accent / heart
- 빈 상태: mono 12px muted

### 2.5 Guestbook 관리 (Comments와 동일 톤)

- 인라인 답글 input: `--blog-card bg + accent focus`
- 고정 토글 버튼: 활성 시 `--blog-accent-soft + accent text`
- 삭제: heart 컬러 hover

---

## 3. 컴포넌트 신규 / 수정 범위

### 신규
```
src/views/DashboardPage.tsx                         전면 재작성
src/components/layout/AdminSidebar.tsx              신규 (Sidebar 대체)
src/components/layout/AdminHeader.tsx               신규 또는 PublicHeader 재사용
```

### 수정
```
src/components/layout/AdminLayout.tsx               AdminSidebar/AdminHeader 사용
src/views/admin/AdminCommentsPage.tsx               톤 정돈
src/views/admin/AdminGuestbookPage.tsx              톤 정돈
src/styles/blog.css                                 .admin-* 추가 (sidebar item, stat-card, action-row)
```

### 제거 / deprecate
```
src/components/layout/Sidebar.tsx                   레거시 (또는 AdminSidebar로 흡수)
src/components/layout/layout.css                    admin 부분 제거
```

---

## 4. 작업 순서

| Phase | 작업 | 파일 | 추정 |
|---|---|---|---|
| 1 | blog.css에 admin 전용 클래스 추가 | blog.css | S |
| 2 | AdminSidebar 컴포넌트 신규 | AdminSidebar.tsx + AdminLayout.tsx | M |
| 3 | Admin Header 정돈 (mode='admin' 분기 또는 신규) | Header.tsx | S |
| 4 | DashboardPage 전면 재작성 | DashboardPage.tsx | M |
| 5 | Comments / Guestbook 톤 정리 | 2개 페이지 | S |
| 6 | 빌드 + 검수 + 스크린샷 갱신 | Playwright | S |

각 phase 별 단독 commit + push.

---

## 5. 디자인 원칙 (어드민 적용)

블로그에서 검증된 원칙 그대로 차용:

1. **mono + uppercase + tracking** — 섹션 라벨은 항상 이 조합
2. **단일 accent** — `--blog-accent`만 사용. 멀티컬러 금지
3. **데이터 > UI** — 숫자/콘텐츠가 먼저 눈에. 카드는 컨테이너일 뿐
4. **밀도** — 카드 X, row 리스트 우선. 어드민은 정보 작업 도구
5. **호버는 미세하게** — `--blog-accent-soft` bg / border 색 변경 정도
6. **위험은 heart** — 삭제·로그아웃만 `--blog-heart`, 나머지 X
7. **이모지 X** — lucide 아이콘 14-16px 단색

---

## 6. 변경 후 기대 효과

- 블로그 ↔ 어드민 톤 일관성 ↑↑ (포트폴리오 평가 ↑)
- 정보 밀도 ↑ (카드 11 → 섹션 3-4 + 행 리스트)
- 시각적 노이즈 ↓
- 디자인 시스템 자산 재사용 (blog.css 토큰 그대로)
- 추후 페이지 추가 시 같은 톤으로 빠르게 확장 가능
