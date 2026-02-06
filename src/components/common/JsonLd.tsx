/**
 * JSON-LD 구조화 데이터 컴포넌트
 *
 * 구글 리치 결과(Rich Results)를 위한 Schema.org 구조화 데이터를 생성합니다.
 * - WebSite: 사이트 전체 정보 + 검색 기능
 * - Organization/Person: 사이트 소유자 정보
 * - Article: 블로그 글 정보
 * - BreadcrumbList: 페이지 경로 정보
 * - ProfilePage: 포트폴리오 페이지 정보
 */

import Script from 'next/script';

// 사이트 기본 정보
const SITE_CONFIG = {
  name: '변세민 포트폴리오',
  alternateName: 'SeminCode',
  url: 'https://semincode.com',
  description: '프론트엔드 개발자 변세민의 포트폴리오입니다. React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다.',
  logo: 'https://semincode.com/android-chrome-512x512.png',
  language: 'ko-KR',
};

// 작성자 정보
const AUTHOR_INFO = {
  name: '변세민',
  alternateName: 'Semin Byun',
  jobTitle: '프론트엔드 개발자',
  email: 'tpals3548@gmail.com',
  url: 'https://semincode.com',
  image: 'https://semincode.com/android-chrome-512x512.png',
  sameAs: [
    'https://github.com/semin-B',
  ],
  knowsAbout: [
    'React',
    'TypeScript',
    'JavaScript',
    'Redux',
    'Next.js',
    'Tailwind CSS',
    'Web Development',
    'Frontend Development',
  ],
};

/**
 * WebSite 스키마 - 사이트 전체 정보
 * 구글 검색에서 사이트 이름과 검색 기능을 표시합니다.
 */
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateName,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.language,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#person`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Person 스키마 - 사이트 소유자/작성자 정보
 * 구글 지식 패널에 개인 정보를 표시합니다.
 */
export function PersonJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.url}/#person`,
    name: AUTHOR_INFO.name,
    alternateName: AUTHOR_INFO.alternateName,
    jobTitle: AUTHOR_INFO.jobTitle,
    description: `${AUTHOR_INFO.jobTitle} - React, TypeScript 전문`,
    email: AUTHOR_INFO.email,
    url: AUTHOR_INFO.url,
    image: {
      '@type': 'ImageObject',
      url: AUTHOR_INFO.image,
      width: 512,
      height: 512,
    },
    sameAs: AUTHOR_INFO.sameAs,
    knowsAbout: AUTHOR_INFO.knowsAbout,
    worksFor: {
      '@type': 'Organization',
      name: SITE_CONFIG.alternateName,
    },
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Organization 스키마 - 조직/브랜드 정보
 */
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.alternateName,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: SITE_CONFIG.logo,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.description,
    founder: {
      '@id': `${SITE_CONFIG.url}/#person`,
    },
    sameAs: AUTHOR_INFO.sameAs,
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Article 스키마 Props
 */
export interface ArticleJsonLdProps {
  /** 글 제목 */
  title: string;
  /** 글 설명/요약 */
  description: string;
  /** 글 URL (절대 경로) */
  url: string;
  /** 대표 이미지 URL */
  image?: string;
  /** 발행일 (ISO 8601) */
  datePublished: string;
  /** 수정일 (ISO 8601) */
  dateModified?: string;
  /** 작성자 이름 */
  authorName?: string;
  /** 태그/키워드 */
  keywords?: string[];
  /** 본문 내용 (처음 일부) */
  articleBody?: string;
  /** 읽기 예상 시간 (분) */
  readingTime?: number;
}

/**
 * Article 스키마 - 블로그 글 정보
 * 구글 검색에서 글 제목, 작성자, 날짜, 썸네일을 표시합니다.
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = AUTHOR_INFO.name,
  keywords = [],
  articleBody,
  readingTime,
}: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}/#article`,
    headline: title,
    description: description,
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: image ? {
      '@type': 'ImageObject',
      url: image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`,
      width: 1200,
      height: 630,
    } : {
      '@type': 'ImageObject',
      url: SITE_CONFIG.logo,
      width: 512,
      height: 512,
    },
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      '@id': `${SITE_CONFIG.url}/#person`,
      name: authorName,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.alternateName,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.logo,
        width: 512,
        height: 512,
      },
    },
    inLanguage: SITE_CONFIG.language,
    keywords: keywords.join(', '),
    ...(articleBody && { articleBody: articleBody.slice(0, 500) }),
    ...(readingTime && { timeRequired: `PT${readingTime}M` }),
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * BreadcrumbList 스키마 Props
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList 스키마 - 페이지 경로 정보
 * 구글 검색에서 페이지 경로를 표시합니다.
 * 예: 홈 > 블로그 > 글 제목
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * ProfilePage 스키마 Props
 */
export interface ProfilePageJsonLdProps {
  /** 페이지 URL */
  url: string;
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description: string;
}

/**
 * ProfilePage 스키마 - 포트폴리오/프로필 페이지
 */
export function ProfilePageJsonLd({ url, title, description }: ProfilePageJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}/#webpage`,
    url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
    name: title,
    description: description,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`,
    },
    about: {
      '@id': `${SITE_CONFIG.url}/#person`,
    },
    mainEntity: {
      '@id': `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: SITE_CONFIG.language,
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * CollectionPage 스키마 Props
 */
export interface CollectionPageJsonLdProps {
  /** 페이지 URL */
  url: string;
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description: string;
  /** 컬렉션 타입 (blog, projects 등) */
  collectionType?: string;
}

/**
 * CollectionPage 스키마 - 목록 페이지 (블로그 목록, 프로젝트 목록)
 */
export function CollectionPageJsonLd({ url, title, description }: CollectionPageJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}/#webpage`,
    url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
    name: title,
    description: description,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`,
    },
    inLanguage: SITE_CONFIG.language,
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQPage 스키마 Props
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageJsonLdProps {
  items: FAQItem[];
}

/**
 * FAQPage 스키마 - FAQ 페이지
 * 구글 검색에서 질문-답변을 직접 표시합니다.
 */
export function FAQPageJsonLd({ items }: FAQPageJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id={schema['@type'].toLowerCase() + '-jsonld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 편의를 위한 통합 export
export const JsonLd = {
  WebSite: WebSiteJsonLd,
  Person: PersonJsonLd,
  Organization: OrganizationJsonLd,
  Article: ArticleJsonLd,
  Breadcrumb: BreadcrumbJsonLd,
  ProfilePage: ProfilePageJsonLd,
  CollectionPage: CollectionPageJsonLd,
  FAQPage: FAQPageJsonLd,
};

export default JsonLd;
