/**
 * 기술 스택 데이터
 *
 * 쉽게 수정 가능한 스킬 관리
 * - name: 기술명
 * - icon: devicons-react 아이콘 이름
 * - color: 아이콘 색상
 * - tooltip: 마우스 호버 시 표시될 설명
 * - category: 카테고리 분류
 */

export interface Skill {
  name: string;
  icon: string;
  color: string;
  tooltip: string;
  category: 'Frontend' | 'Backend & Data' | 'Animation' | 'Tools';
}

export const skills: Skill[] = [
  // Frontend
  {
    name: 'React',
    icon: 'react',
    color: '#61DAFB',
    tooltip: '컴포넌트 기반 UI 라이브러리',
    category: 'Frontend'
  },
  {
    name: 'Next.js',
    icon: 'nextjs',
    color: '#000000',
    tooltip: 'React 기반 풀스택 프레임워크',
    category: 'Frontend'
  },
  {
    name: 'TypeScript',
    icon: 'typescript',
    color: '#3178C6',
    tooltip: '정적 타입 체크 JavaScript',
    category: 'Frontend'
  },
  {
    name: 'JavaScript',
    icon: 'javascript',
    color: '#F7DF1E',
    tooltip: '동적 프로그래밍 언어',
    category: 'Frontend'
  },
  {
    name: 'Tailwind CSS',
    icon: 'tailwindcss',
    color: '#06B6D4',
    tooltip: '유틸리티 우선 CSS 프레임워크',
    category: 'Frontend'
  },
  {
    name: 'SCSS',
    icon: 'sass',
    color: '#CC6699',
    tooltip: 'CSS 전처리기 (Sass)',
    category: 'Frontend'
  },
  {
    name: 'CSS3',
    icon: 'css3',
    color: '#1572B6',
    tooltip: '모던 CSS 스타일링',
    category: 'Frontend'
  },
  {
    name: 'Styled Components',
    icon: 'react',
    color: '#DB7093',
    tooltip: 'CSS-in-JS 라이브러리',
    category: 'Frontend'
  },

  // Backend & Data
  {
    name: 'Redux Toolkit',
    icon: 'redux',
    color: '#764ABC',
    tooltip: '예측 가능한 상태 컨테이너',
    category: 'Backend & Data'
  },
  {
    name: 'RTK Query',
    icon: 'redux',
    color: '#764ABC',
    tooltip: '서버 상태 관리 & 캐싱',
    category: 'Backend & Data'
  },
  {
    name: 'Axios',
    icon: 'axios',
    color: '#5A29E4',
    tooltip: 'Promise 기반 HTTP 클라이언트',
    category: 'Backend & Data'
  },
  {
    name: 'Supabase',
    icon: 'supabase',
    color: '#3ECF8E',
    tooltip: 'Backend as a Service (PostgreSQL)',
    category: 'Backend & Data'
  },

  // Animation
  {
    name: 'GSAP',
    icon: 'gsap',
    color: '#88CE02',
    tooltip: '강력한 웹 애니메이션 라이브러리',
    category: 'Animation'
  },
  {
    name: 'Framer Motion',
    icon: 'framermotion',
    color: '#0055FF',
    tooltip: 'React용 프로덕션 레디 모션 라이브러리',
    category: 'Animation'
  },
  {
    name: 'Swiper',
    icon: 'javascript',
    color: '#6332F6',
    tooltip: '터치 슬라이더 라이브러리',
    category: 'Animation'
  },

  // Tools
  {
    name: 'Git',
    icon: 'git',
    color: '#F05032',
    tooltip: '분산 버전 관리 시스템',
    category: 'Tools'
  },
  {
    name: 'Vite',
    icon: 'vite',
    color: '#646CFF',
    tooltip: '빠른 빌드 도구',
    category: 'Tools'
  },
  {
    name: 'Figma',
    icon: 'figma',
    color: '#F24E1E',
    tooltip: 'UI/UX 디자인 도구',
    category: 'Tools'
  },
  {
    name: 'Vercel',
    icon: 'vercel',
    color: '#000000',
    tooltip: '프론트엔드 배포 플랫폼',
    category: 'Tools'
  },
  {
    name: 'AWS',
    icon: 'amazonwebservices',
    color: '#FF9900',
    tooltip: '클라우드 컴퓨팅 플랫폼',
    category: 'Tools'
  },
  {
    name: 'Jira',
    icon: 'jiraalign',
    color: '#0052CC',
    tooltip: '애자일 프로젝트 관리 도구',
    category: 'Tools'
  },
  {
    name: 'Confluence',
    icon: 'confluence',
    color: '#172B4D',
    tooltip: '팀 협업 & 문서화 플랫폼',
    category: 'Tools'
  }
];
