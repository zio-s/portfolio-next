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
