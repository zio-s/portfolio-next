/**
 * 프로젝트 쇼케이스 이미지
 *
 * DB의 thumbnail/images는 외부 URL이라, 저장소에 둔 실제 캡처 화면을 쓰고 싶은
 * 프로젝트만 여기서 프로젝트 id로 덮어쓴다. (Mooda는 DB 썸네일이 placehold.co 자리표시 이미지)
 * 텍스트·문제 해결 내용은 여전히 DB(관리자 폼)에서 관리한다.
 */

import type { StaticImageData } from 'next/image';
import type { Project } from '@/features/portfolio/types/Project';
import moodaCover from '@/assets/showcase/mooda-cover.jpg';
import moodaList from '@/assets/showcase/mooda-list.jpg';
import moodaDetail from '@/assets/showcase/mooda-detail.jpg';
import moodaTags from '@/assets/showcase/mooda-tags.jpg';
import oheshioCover from '@/assets/showcase/oheshio-cover.jpg';
import semincodeCover from '@/assets/showcase/semincode-cover.jpg';

export interface ShowcaseImage {
  src: StaticImageData;
  alt: string;
}

export interface ProjectShowcase {
  /** 카드·모달 등 16:9 대표 이미지 */
  cover: ShowcaseImage;
  /** 모바일 화면 캡처 (홈 대표 작업 섹션의 폰 목업) */
  screens?: ShowcaseImage[];
  /** 핵심 기능 확대 이미지 + 한 줄 설명 */
  detail?: ShowcaseImage & { caption: string };
}

const MOODA_ID = 'ea563e22-5e55-4b6a-82e6-d6620e93bfdb';
const OHESHIO_ID = 'b9b296e8-ccc1-4c02-95bd-ddbaf5811fc7';
const GENIE_ID = 'a1e6df90-f67a-4698-b657-a98ccbee12d3';
const SEMINCODE_ID = 'f81c0279-de82-4ace-bfe0-1eef5bd587d4';

const SITE_HOST = 'semincode.com';

/**
 * 홈 히어로에 겹쳐 놓을 작업 (뒤 세로 카드, 가운데 가로 카드 순).
 * 맨 앞 폰 화면은 대표 작업의 screens[0]이 자동으로 들어간다.
 * 여기 없는 id이거나 비공개가 되면 다른 featured 프로젝트로 채운다.
 */
export const HOME_HERO_STACK_IDS = [GENIE_ID, OHESHIO_ID];

export const projectShowcase: Record<string, ProjectShowcase> = {
  [MOODA_ID]: {
    cover: {
      src: moodaCover,
      alt: 'Mooda 카페 상세 화면: 매장 사진과 카페 이름',
    },
    screens: [
      { src: moodaList, alt: 'Mooda 모바일 카페 목록: 카페 사진, 거리, 분위기 태그가 붙은 카드' },
      { src: moodaDetail, alt: 'Mooda 모바일 카페 상세: 매장 사진과 투표 수가 붙은 분위기 태그' },
    ],
    detail: {
      src: moodaTags,
      alt: '분위기 태그 확대: 조용한 72, 브런치 62, 주차가능 52 등 태그별 투표 수',
      caption: '사용자가 태그에 투표하면 숫자가 쌓이고, 많이 받은 태그가 그 카페의 분위기가 됩니다.',
    },
  },
  // DB 썸네일은 로고 배지라, 라이브 사이트 첫 화면 캡처를 대표 이미지로 쓴다
  [OHESHIO_ID]: {
    cover: {
      src: oheshioCover,
      alt: 'OHESHIO 리뉴얼 첫 화면: 교복 룩북 영상 위의 브랜드 로고와 메뉴',
    },
  },
  // 이 사이트 자체(React → Next.js 마이그레이션)라 따로 준비한 이미지가 없어, 현재 홈 화면 캡처를 쓴다
  [SEMINCODE_ID]: {
    cover: {
      src: semincodeCover,
      alt: 'semincode.com 홈 화면: 이름과 한 줄 소개, 겹쳐 놓은 작업 미리보기',
    },
  },
};

export const getProjectShowcase = (projectId: string): ProjectShowcase | undefined =>
  projectShowcase[projectId];

/**
 * 라이브 주소가 이 사이트인 프로젝트인지 — 방문자가 이미 보고 있는 사이트라
 * 홈의 대표 작업·다른 작업·히어로 미리보기에서는 뺀다 (/projects 목록에는 남는다)
 */
export const isThisSite = (project: Pick<Project, 'liveUrl'>): boolean => {
  if (!project.liveUrl) return false;
  try {
    const { hostname } = new URL(project.liveUrl);
    return hostname === SITE_HOST || hostname === `www.${SITE_HOST}`;
  } catch {
    return false;
  }
};

/** placehold.co 같은 자리표시 이미지는 실제 작업 화면이 아니므로 미리보기에서 제외한다 */
export const isPlaceholderImage = (url: string | undefined): boolean =>
  !url || url.includes('placehold.co');

/** 쇼케이스 대표 이미지가 있으면 그것을, 없으면 DB 썸네일을 쓴다 */
export const getProjectCoverUrl = (project: Pick<Project, 'id' | 'thumbnail'>): string =>
  projectShowcase[project.id]?.cover.src.src ?? project.thumbnail;

/** "Mooda — 분위기로 찾는 카페"처럼 제목에 붙은 부제를 분리한다 */
export const splitProjectTitle = (title: string): { name: string; subtitle?: string } => {
  const [name, ...rest] = title.split(/\s+[—–-]\s+/);
  return { name: name.trim(), subtitle: rest.length ? rest.join(' ').trim() : undefined };
};
