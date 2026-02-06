# Layout Components

Portfolio CMS의 레이아웃 컴포넌트 모음입니다.

## 📁 파일 구조

```
layout/
├── layout.css           # 레이아웃 스타일 (다크모드, 반응형)
├── Header.tsx          # 헤더 컴포넌트
├── Sidebar.tsx         # 사이드바 컴포넌트
├── Footer.tsx          # 푸터 컴포넌트
├── MainLayout.tsx      # 메인 레이아웃 (Header + Sidebar + Content + Footer)
├── AuthLayout.tsx      # 인증 레이아웃 (로그인/회원가입)
├── index.ts            # Export 파일
└── README.md           # 이 파일
```

## 🎨 컴포넌트 목록

### 1. MainLayout

메인 애플리케이션 레이아웃 (헤더 + 사이드바 + 컨텐츠 + 푸터)

**기능:**
- 반응형 디자인 (모바일/데스크톱)
- 사이드바 접기/펴기
- 다크모드 지원
- 로컬 스토리지에 상태 저장

**사용 예시:**

```tsx
import { MainLayout } from '@/components/layout';

function App() {
  return (
    <MainLayout
      showSidebar={true}
      showFooter={true}
      user={{
        name: '홍길동',
        email: 'hong@example.com'
      }}
      logoText="My CMS"
    >
      {/* 페이지 콘텐츠 */}
      <h1>대시보드</h1>
    </MainLayout>
  );
}
```

**React Router와 함께 사용:**

```tsx
import { MainLayout } from '@/components/layout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/posts" element={<Posts />} />
      </Routes>
    </MainLayout>
  );
}
```

### 2. AuthLayout

인증 페이지 레이아웃 (로그인, 회원가입 등)

**특징:**
- 중앙 정렬 카드 디자인
- 그라데이션 배경
- 반응형 디자인

**사용 예시:**

```tsx
import { AuthLayout, LoginLayout, RegisterLayout } from '@/components/layout';

// 기본 사용
function LoginPage() {
  return (
    <AuthLayout
      title="로그인"
      subtitle="계정에 로그인하세요"
      footerText="계정이 없으신가요?"
      footerLinkText="회원가입"
      footerLinkPath="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}

// 간편 래퍼 사용
function LoginPage() {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}

function RegisterPage() {
  return (
    <RegisterLayout>
      <RegisterForm />
    </RegisterLayout>
  );
}
```

**사용 가능한 래퍼:**
- `LoginLayout` - 로그인
- `RegisterLayout` - 회원가입
- `ForgotPasswordLayout` - 비밀번호 찾기
- `ResetPasswordLayout` - 비밀번호 재설정

### 3. Header

상단 네비게이션 헤더

**기능:**
- 로고 및 브랜드명
- 모바일 메뉴 토글
- 다크모드 토글
- 사용자 프로필 드롭다운

**독립적으로 사용:**

```tsx
import { Header } from '@/components/layout';

function MyHeader() {
  return (
    <Header
      onMenuToggle={() => console.log('메뉴 토글')}
      user={{
        name: '홍길동',
        email: 'hong@example.com',
        avatar: '/avatar.jpg' // 선택사항
      }}
      logoText="My CMS"
    />
  );
}
```

### 4. Sidebar

좌측 네비게이션 사이드바

**기능:**
- 접기/펴기 기능
- 모바일 대응 (오버레이)
- 현재 페이지 하이라이트
- 배지 표시

**독립적으로 사용:**

```tsx
import { Sidebar } from '@/components/layout';

const navigationSections = [
  {
    title: '메인',
    items: [
      {
        id: 'home',
        label: '홈',
        path: '/',
        icon: <HomeIcon />,
      },
      {
        id: 'projects',
        label: '프로젝트',
        path: '/projects',
        icon: <ProjectIcon />,
        badge: 5, // 배지 숫자
      }
    ]
  }
];

function MySidebar() {
  return (
    <Sidebar
      isCollapsed={false}
      onToggle={() => console.log('토글')}
      sections={navigationSections}
    />
  );
}
```

### 5. Footer

하단 푸터

**독립적으로 사용:**

```tsx
import { Footer } from '@/components/layout';

const footerLinks = [
  { label: '개인정보처리방침', path: '/privacy' },
  { label: '이용약관', path: '/terms' },
  { label: '고객지원', path: '/support', external: true }
];

function MyFooter() {
  return (
    <Footer
      isCollapsed={false}
      showSidebar={true}
      copyright="© 2025 My Company"
      links={footerLinks}
    />
  );
}
```

## 🎨 다크모드

다크모드는 자동으로 지원되며 다음과 같이 작동합니다:

1. **자동 감지**: 시스템 다크모드 설정을 감지
2. **로컬 스토리지**: 사용자 선택을 저장
3. **토글 버튼**: 헤더의 태양/달 아이콘으로 전환

**CSS 변수:**

```css
/* 라이트 모드 */
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --accent-primary: #0d6efd;
}

/* 다크 모드 */
[data-theme="dark"] {
  --bg-primary: #1a1d23;
  --text-primary: #e9ecef;
  --accent-primary: #3d8bfd;
}
```

## 📱 반응형 디자인

모든 컴포넌트는 반응형으로 설계되었습니다:

### 브레이크포인트
- **데스크톱**: > 768px
- **모바일**: ≤ 768px

### 모바일 동작
- **헤더**: 햄버거 메뉴 표시
- **사이드바**: 오버레이 형태로 열림
- **푸터**: 세로 스택 레이아웃

## 🎯 사용 패턴

### 패턴 1: 기본 앱 구조

```tsx
import { MainLayout } from '@/components/layout';
import { Routes, Route } from 'react-router-dom';

function App() {
  const user = {
    name: '사용자',
    email: 'user@example.com'
  };

  return (
    <MainLayout user={user} logoText="Portfolio CMS">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}
```

### 패턴 2: 인증 페이지 분리

```tsx
import { MainLayout, LoginLayout } from '@/components/layout';
import { Routes, Route } from 'react-router-dom';

function App() {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={
          <LoginLayout>
            <LoginForm />
          </LoginLayout>
        } />
        <Route path="/register" element={
          <RegisterLayout>
            <RegisterForm />
          </RegisterLayout>
        } />
      </Routes>
    );
  }

  return (
    <MainLayout>
      {/* 인증된 사용자용 라우트 */}
    </MainLayout>
  );
}
```

### 패턴 3: 커스텀 네비게이션

```tsx
import { MainLayout } from '@/components/layout';

const customNavigation = [
  {
    title: '대시보드',
    items: [
      {
        id: 'home',
        label: '홈',
        path: '/',
        icon: <HomeIcon />
      }
    ]
  },
  {
    title: '콘텐츠',
    items: [
      {
        id: 'projects',
        label: '프로젝트',
        path: '/projects',
        icon: <ProjectIcon />,
        badge: 5
      }
    ]
  }
];

function App() {
  return (
    <MainLayout navigationSections={customNavigation}>
      {/* 콘텐츠 */}
    </MainLayout>
  );
}
```

## 🛠️ 커스터마이징

### CSS 변수 오버라이드

```css
/* custom.css */
:root {
  --header-height: 72px;          /* 기본: 64px */
  --sidebar-width: 320px;         /* 기본: 280px */
  --accent-primary: #ff6b6b;      /* 기본: #0d6efd */
}
```

### 스타일 확장

```css
/* 헤더 커스터마이징 */
.header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* 사이드바 커스터마이징 */
.sidebar__nav-item--active {
  background-color: #ff6b6b;
}
```

## 🔧 Props 레퍼런스

### MainLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | 메인 콘텐츠 |
| `showSidebar` | `boolean` | `true` | 사이드바 표시 여부 |
| `showFooter` | `boolean` | `true` | 푸터 표시 여부 |
| `user` | `UserInfo` | - | 사용자 정보 |
| `logoText` | `string` | `'Portfolio CMS'` | 로고 텍스트 |
| `navigationSections` | `NavSection[]` | 기본 네비게이션 | 네비게이션 섹션 |
| `footerLinks` | `FooterLink[]` | 기본 링크 | 푸터 링크 |
| `copyright` | `string` | 자동 생성 | 저작권 텍스트 |

### AuthLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | 폼 콘텐츠 |
| `title` | `string` | - | 페이지 제목 |
| `subtitle` | `string` | - | 부제목 |
| `logoText` | `string` | `'Portfolio CMS'` | 로고 텍스트 |
| `footerText` | `string` | - | 푸터 텍스트 |
| `footerLinkText` | `string` | - | 푸터 링크 텍스트 |
| `footerLinkPath` | `string` | - | 푸터 링크 경로 |

## 📝 타입 정의

```typescript
// 사용자 정보
interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

// 네비게이션 아이템
interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

// 네비게이션 섹션
interface NavSection {
  title: string;
  items: NavItem[];
}

// 푸터 링크
interface FooterLink {
  label: string;
  path: string;
  external?: boolean;
}
```

## 🎓 베스트 프랙티스

1. **일관성 유지**: 앱 전체에서 동일한 레이아웃 사용
2. **네비게이션 구조화**: 논리적인 섹션으로 그룹화
3. **배지 사용**: 알림이나 카운트를 명확하게 표시
4. **반응형 테스트**: 다양한 화면 크기에서 테스트
5. **접근성**: 키보드 네비게이션 및 스크린 리더 지원 확인

## 🐛 트러블슈팅

### 사이드바가 표시되지 않음
- `showSidebar` prop이 `true`인지 확인
- CSS가 올바르게 import되었는지 확인

### 다크모드가 작동하지 않음
- `layout.css`가 import되었는지 확인
- 브라우저의 로컬 스토리지 확인

### 모바일에서 사이드바가 닫히지 않음
- React Router를 사용하는 경우 자동으로 닫힘
- 수동으로 닫으려면 `onMobileClose` prop 사용

## 📄 라이선스

이 컴포넌트는 프로젝트의 라이선스를 따릅니다.
