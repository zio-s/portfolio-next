/**
 * SEO 유틸리티
 *
 * Next.js App Router에서는 Metadata API를 사용합니다.
 * 이 파일은 기본 SEO 설정을 export합니다.
 */

import type { Metadata } from 'next';

export interface SEOProps {
  /** 페이지 제목 */
  title?: string;
  /** 페이지 설명 */
  description?: string;
  /** 페이지 키워드 */
  keywords?: string;
  /** 페이지 URL (절대 경로) */
  url?: string;
  /** OG 이미지 URL (절대 경로) */
  image?: string;
  /** 페이지 타입 (website, article 등) */
  type?: 'website' | 'article';
  /** 작성자 */
  author?: string;
  /** 작성일 (ISO 8601 형식) */
  publishedTime?: string;
  /** 수정일 (ISO 8601 형식) */
  modifiedTime?: string;
}

export const DEFAULT_SEO = {
  title: '변세민 | 프론트엔드 개발자 포트폴리오 | React, TypeScript',
  description: '프론트엔드 개발자 변세민의 포트폴리오입니다. React, TypeScript, Redux를 활용한 웹 애플리케이션 개발 프로젝트를 소개합니다.',
  keywords: '프론트엔드 개발자, Frontend Developer, React, TypeScript, Redux, 포트폴리오, 변세민, Semin Byun',
  url: 'https://semincode.com',
  image: 'https://semincode.com/android-chrome-512x512.png',
  type: 'website' as const,
  author: '변세민 (Semin Byun)',
};

/**
 * Next.js Metadata 생성 함수
 */
export function generateSEOMetadata(props?: SEOProps): Metadata {
  const seo = {
    title: props?.title || DEFAULT_SEO.title,
    description: props?.description || DEFAULT_SEO.description,
    keywords: props?.keywords || DEFAULT_SEO.keywords,
    url: props?.url || DEFAULT_SEO.url,
    image: props?.image || DEFAULT_SEO.image,
    author: props?.author || DEFAULT_SEO.author,
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.split(', '),
    authors: [{ name: seo.author }],
    metadataBase: new URL(DEFAULT_SEO.url),
    alternates: {
      canonical: seo.url,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      siteName: '변세민 포트폴리오',
      images: [
        {
          url: seo.image,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
      locale: 'ko_KR',
      type: props?.type === 'article' ? 'article' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.image],
    },
  };
}

/**
 * 레거시 호환을 위한 SEO 컴포넌트
 * Next.js에서는 각 페이지의 metadata export를 사용하세요.
 */
export function SEO(_props: SEOProps) {
  // Next.js App Router에서는 metadata export를 사용합니다.
  // 이 컴포넌트는 호환성을 위해 null을 반환합니다.
  console.warn('SEO component is deprecated in Next.js. Use metadata export instead.');
  return null;
}
