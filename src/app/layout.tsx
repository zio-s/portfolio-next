import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { generateSEOMetadata } from '@/components/common/SEO';
import { WebSiteJsonLd, PersonJsonLd, OrganizationJsonLd } from '@/components/common/JsonLd';
import './globals.css';

// 모노스페이스 폰트 — 라벨/코드성 UI 전용. next/font가 빌드 타임에 자체 호스팅한다.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  ...generateSEOMetadata(),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  // RSS 자동 발견 (DESIGN_RESPONSE_R4.md §5.5)
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'semincode RSS' },
      ],
    },
  },
  // 네이버 웹마스터 자격 확인
  verification: {
    other: {
      'naver-site-verification': '43dbc4d8839e76c8f81dc0aa32f98b1532037422',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        {/* Pretendard Variable — next/font 미지원 폰트라 CDN 링크로 로드 (variables.css의 --font-sans가 참조) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <WebSiteJsonLd />
        <PersonJsonLd />
        <OrganizationJsonLd />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
