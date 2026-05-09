import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import { generateSEOMetadata } from '@/components/common/SEO';
import { WebSiteJsonLd, PersonJsonLd, OrganizationJsonLd } from '@/components/common/JsonLd';
import './globals.css';

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
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
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
