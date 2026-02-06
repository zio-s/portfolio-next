# Common UI Components

프론트엔드 포트폴리오 CMS의 재사용 가능한 공통 UI 컴포넌트 라이브러리입니다.

## 목차

- [설치 및 사용](#설치-및-사용)
- [컴포넌트 목록](#컴포넌트-목록)
  - [Button](#button)
  - [Input](#input)
  - [Card](#card)
  - [LoadingSpinner](#loadingspinner)
  - [Table](#table)
  - [Pagination](#pagination)
  - [SearchBar](#searchbar)
  - [Dropdown](#dropdown)
  - [Badge](#badge)
  - [EmptyState](#emptystate)
  - [ErrorBoundary](#errorboundary)
- [디자인 원칙](#디자인-원칙)
- [접근성](#접근성)

## 설치 및 사용

### 가져오기

```tsx
import { Button, Input, Card } from '@/components/common';
```

### 스타일

각 컴포넌트는 자체 CSS 파일을 가지고 있으며, 컴포넌트를 import하면 자동으로 스타일이 적용됩니다.

## 컴포넌트 목록

### Button

다양한 스타일과 상태를 지원하는 버튼 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'danger' \| 'outline' \| 'ghost'` | `'primary'` | 버튼 스타일 변형 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 버튼 크기 |
| loading | `boolean` | `false` | 로딩 상태 |
| fullWidth | `boolean` | `false` | 전체 너비 사용 여부 |
| leftIcon | `ReactNode` | - | 왼쪽 아이콘 |
| rightIcon | `ReactNode` | - | 오른쪽 아이콘 |

#### 사용 예제

```tsx
// 기본 버튼
<Button variant="primary">저장하기</Button>

// 로딩 상태
<Button loading>처리 중...</Button>

// 아이콘 포함
<Button leftIcon={<SaveIcon />}>저장</Button>

// 전체 너비
<Button fullWidth>전체 너비 버튼</Button>
```

---

### Input

폼 입력을 위한 텍스트 필드 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| label | `string` | - | 레이블 텍스트 |
| error | `string` | - | 에러 메시지 |
| helperText | `string` | - | 도움말 텍스트 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 입력 필드 크기 |
| fullWidth | `boolean` | `false` | 전체 너비 사용 여부 |
| leftIcon | `ReactNode` | - | 왼쪽 아이콘 |
| rightIcon | `ReactNode` | - | 오른쪽 아이콘 |
| required | `boolean` | `false` | 필수 입력 여부 |

#### 사용 예제

```tsx
// 기본 입력
<Input
  label="이메일"
  type="email"
  placeholder="example@email.com"
/>

// 에러 표시
<Input
  label="비밀번호"
  type="password"
  error="비밀번호가 일치하지 않습니다"
/>

// 아이콘 포함
<Input
  label="검색"
  leftIcon={<SearchIcon />}
  placeholder="검색어를 입력하세요"
/>

// 필수 입력
<Input
  label="사용자명"
  required
  helperText="4-20자 사이로 입력해주세요"
/>
```

---

### Card

카드 레이아웃을 위한 컨테이너 컴포넌트입니다.

#### Props

##### Card

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| hoverable | `boolean` | `false` | 호버 효과 활성화 |
| clickable | `boolean` | `false` | 클릭 가능 여부 |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 카드 패딩 크기 |
| shadow | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 그림자 크기 |

##### CardHeader

| Prop | 타입 | 설명 |
|------|------|------|
| title | `ReactNode` | 헤더 제목 |
| action | `ReactNode` | 헤더 액션 (오른쪽 영역) |

#### 사용 예제

```tsx
// 기본 카드
<Card>
  <CardHeader title="사용자 정보" />
  <CardBody>
    <p>카드 내용이 들어갑니다.</p>
  </CardBody>
  <CardFooter>
    <Button variant="ghost">취소</Button>
    <Button>저장</Button>
  </CardFooter>
</Card>

// 호버 효과가 있는 카드
<Card hoverable shadow="md">
  <CardBody>호버 시 강조 효과</CardBody>
</Card>

// 클릭 가능한 카드
<Card clickable onClick={() => console.log('클릭!')}>
  <CardBody>클릭해보세요</CardBody>
</Card>
```

---

### LoadingSpinner

로딩 상태를 표시하는 스피너 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 스피너 크기 |
| color | `'primary' \| 'secondary' \| 'white' \| 'current'` | `'primary'` | 스피너 색상 |
| fullScreen | `boolean` | `false` | 전체 화면 모드 |
| text | `string` | - | 로딩 텍스트 |
| overlay | `boolean` | `true` | 오버레이 표시 (전체 화면일 때만) |

#### 사용 예제

```tsx
// 인라인 스피너
<LoadingSpinner size="sm" />

// 로딩 텍스트 포함
<LoadingSpinner text="데이터를 불러오는 중..." />

// 전체 화면 스피너
<LoadingSpinner fullScreen text="처리 중입니다..." />

// 버튼 내 스피너
<Button disabled>
  <LoadingSpinner size="xs" color="white" />
  로딩 중...
</Button>
```

---

### Table

데이터를 테이블 형식으로 표시하는 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| data | `T[]` | - | 테이블 데이터 |
| columns | `TableColumn<T>[]` | - | 컬럼 정의 |
| loading | `boolean` | `false` | 로딩 상태 |
| emptyText | `string` | `'데이터가 없습니다'` | 빈 상태 메시지 |
| onRowClick | `(row: T, index: number) => void` | - | 행 클릭 이벤트 |
| rowKey | `(row: T, index: number) => string \| number` | - | 행 키 추출 함수 |
| striped | `boolean` | `false` | 스트라이프 스타일 |
| hoverable | `boolean` | `true` | 호버 효과 |
| bordered | `boolean` | `false` | 테두리 표시 |
| compact | `boolean` | `false` | 컴팩트 모드 |

#### 사용 예제

```tsx
const columns: TableColumn<User>[] = [
  {
    key: 'name',
    header: '이름',
    sortable: true
  },
  {
    key: 'email',
    header: '이메일',
    sortable: true
  },
  {
    key: 'status',
    header: '상태',
    render: (value) => <Badge variant={value === 'active' ? 'success' : 'default'}>{value}</Badge>
  },
  {
    key: 'actions',
    header: '액션',
    align: 'center',
    render: (_, row) => (
      <Button size="sm" onClick={() => handleEdit(row)}>편집</Button>
    )
  }
];

<Table
  data={users}
  columns={columns}
  striped
  hoverable
  onRowClick={(row) => console.log(row)}
/>
```

---

### Pagination

페이지네이션을 위한 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| currentPage | `number` | - | 현재 페이지 (1부터 시작) |
| totalPages | `number` | - | 전체 페이지 수 |
| onPageChange | `(page: number) => void` | - | 페이지 변경 콜백 |
| siblingCount | `number` | `1` | 현재 페이지 양옆에 표시할 페이지 수 |
| showText | `boolean` | `true` | 이전/다음 버튼 텍스트 표시 |
| showFirstLast | `boolean` | `true` | 처음/마지막 버튼 표시 |
| showInfo | `boolean` | `false` | 페이지 정보 표시 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |

#### 사용 예제

```tsx
const [currentPage, setCurrentPage] = useState(1);
const totalPages = 10;

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showInfo
/>
```

---

### SearchBar

디바운스 기능이 내장된 검색 바 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| onChange | `(value: string) => void` | - | 검색 값 변경 콜백 |
| debounceDelay | `number` | `300` | 디바운스 지연 시간 (ms) |
| onSearch | `(value: string) => void` | - | 검색 제출 콜백 |
| showClearButton | `boolean` | `true` | 초기화 버튼 표시 |
| showSearchButton | `boolean` | `false` | 검색 버튼 표시 |
| showSearchIcon | `boolean` | `true` | 검색 아이콘 표시 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| fullWidth | `boolean` | `false` | 전체 너비 사용 |

#### 사용 예제

```tsx
// 기본 검색 바
<SearchBar
  placeholder="검색어를 입력하세요"
  onChange={(value) => console.log('검색:', value)}
/>

// 검색 버튼 포함
<SearchBar
  showSearchButton
  onSearch={(value) => handleSearch(value)}
/>

// 전체 너비 + 빠른 디바운스
<SearchBar
  fullWidth
  debounceDelay={150}
  onChange={handleQuickSearch}
/>
```

---

### Dropdown

드롭다운 메뉴 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| trigger | `ReactNode` | - | 드롭다운 트리거 버튼 |
| items | `DropdownItem[]` | - | 드롭다운 메뉴 아이템 |
| placement | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | 위치 |
| fullWidth | `boolean` | `false` | 트리거 버튼 전체 너비 |
| onOpen | `() => void` | - | 메뉴 열림 콜백 |
| onClose | `() => void` | - | 메뉴 닫힘 콜백 |

#### 사용 예제

```tsx
const items: DropdownItem[] = [
  {
    key: 'edit',
    label: '편집',
    icon: <EditIcon />,
    onClick: () => handleEdit()
  },
  {
    key: 'delete',
    label: '삭제',
    icon: <DeleteIcon />,
    divider: true,
    onClick: () => handleDelete()
  },
  {
    key: 'archive',
    label: '보관',
    disabled: true
  }
];

<Dropdown
  trigger={<Button>액션</Button>}
  items={items}
/>

// 아이콘 버튼으로 트리거
<Dropdown
  trigger={<button>⋮</button>}
  items={items}
  placement="bottom-end"
/>
```

---

### Badge

상태나 카테고리를 표시하는 배지 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| variant | `'success' \| 'warning' \| 'error' \| 'info' \| 'default'` | `'default'` | 배지 변형 (상태별 색상) |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 배지 크기 |
| dot | `boolean` | `false` | 점(dot) 표시 |
| icon | `ReactNode` | - | 아이콘 |
| rounded | `boolean` | `false` | 라운드 스타일 (pill) |
| outlined | `boolean` | `false` | 외곽선 스타일 |

#### 사용 예제

```tsx
// 기본 배지
<Badge variant="success">활성</Badge>
<Badge variant="warning">대기</Badge>
<Badge variant="error">오류</Badge>

// 점 표시
<Badge variant="info" dot>진행중</Badge>

// 아이콘 포함
<Badge variant="success" icon={<CheckIcon />}>완료</Badge>

// 라운드 스타일
<Badge variant="default" rounded>태그</Badge>

// 외곽선 스타일
<Badge variant="primary" outlined>강조</Badge>
```

---

### EmptyState

데이터가 없을 때 표시하는 빈 상태 컴포넌트입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| title | `string` | `'데이터가 없습니다'` | 제목 |
| description | `string` | - | 설명 |
| icon | `ReactNode` | - | 아이콘 또는 이미지 |
| action | `ReactNode` | - | 액션 버튼 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |

#### 사용 예제

```tsx
// 기본 빈 상태
<EmptyState />

// 상세 설명 포함
<EmptyState
  title="프로젝트가 없습니다"
  description="새로운 프로젝트를 추가하여 시작하세요."
/>

// 아이콘과 액션 포함
<EmptyState
  title="검색 결과 없음"
  description="다른 검색어로 다시 시도해보세요."
  icon={<SearchIcon />}
  action={
    <Button onClick={handleClearSearch}>검색 초기화</Button>
  }
/>
```

---

### ErrorBoundary

React 컴포넌트 트리에서 발생하는 에러를 캐치하는 에러 경계 컴포넌트입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| children | `ReactNode` | 자식 컴포넌트 |
| fallback | `ReactNode \| ((error: Error, reset: () => void) => ReactNode)` | 폴백 UI (커스텀) |
| onError | `(error: Error, errorInfo: ErrorInfo) => void` | 에러 발생 시 콜백 |
| onReset | `() => void` | 에러 리셋 콜백 |

#### 사용 예제

```tsx
// 기본 에러 경계
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// 커스텀 폴백 UI
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>에러가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>

// 에러 로깅
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('에러 발생:', error);
    // 에러 추적 서비스로 전송
    trackError(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>

// 앱 전체 감싸기
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* 라우트들 */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

---

## 디자인 원칙

### 일관성

모든 컴포넌트는 일관된 디자인 시스템을 따릅니다:

- **색상**: Primary, Secondary, Success, Warning, Error, Info
- **크기**: Small (sm), Medium (md), Large (lg)
- **간격**: 4px 기반 그리드 시스템
- **타이포그래피**: 시스템 폰트 스택 사용

### 반응형

모든 컴포넌트는 다양한 화면 크기에서 적절하게 동작합니다:

- **모바일**: 320px 이상
- **태블릿**: 768px 이상
- **데스크톱**: 1024px 이상

### 다크 모드

모든 컴포넌트는 자동으로 다크 모드를 지원합니다:

```css
@media (prefers-color-scheme: dark) {
  /* 다크 모드 스타일 자동 적용 */
}
```

## 접근성

모든 컴포넌트는 웹 접근성 표준(WCAG 2.1 AA)을 준수합니다:

### ARIA 속성

적절한 ARIA 속성을 사용하여 스크린 리더 지원:

```tsx
// 예시
<button aria-label="닫기" aria-expanded={isOpen}>
  <CloseIcon />
</button>
```

### 키보드 네비게이션

모든 인터랙티브 요소는 키보드로 조작 가능:

- **Tab**: 포커스 이동
- **Enter/Space**: 활성화
- **Escape**: 닫기
- **Arrow Keys**: 메뉴 네비게이션

### 포커스 관리

명확한 포커스 표시:

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### 색상 대비

충분한 색상 대비율 유지:

- **일반 텍스트**: 최소 4.5:1
- **큰 텍스트**: 최소 3:1
- **인터랙티브 요소**: 최소 3:1

### 고대비 모드

고대비 설정을 준수하는 사용자를 위한 스타일:

```css
@media (prefers-contrast: high) {
  /* 고대비 모드 스타일 */
}
```

### 애니메이션 감소

애니메이션 감소를 선호하는 사용자를 위한 설정:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```

---

## 개발 가이드

### 새 컴포넌트 추가

1. 컴포넌트 파일 생성: `ComponentName.tsx`
2. 스타일 파일 생성: `ComponentName.css`
3. Props 인터페이스 정의 (TypeScript)
4. 한글 주석 작성
5. `index.ts`에 export 추가
6. 이 README에 문서 추가

### 코딩 컨벤션

- **네이밍**: PascalCase for components, camelCase for functions
- **주석**: 모든 주석은 한글로 작성
- **타입**: 명시적 타입 정의 필수
- **접근성**: ARIA 속성 및 키보드 네비게이션 필수

### 테스팅

```tsx
// 컴포넌트 테스트 예시
describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByText('클릭')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 라이선스

이 컴포넌트 라이브러리는 프로젝트 내부에서 사용하기 위한 것입니다.
