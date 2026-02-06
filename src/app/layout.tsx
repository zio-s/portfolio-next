import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import { generateSEOMetadata } from '@/components/common/SEO';
import { WebSiteJsonLd, PersonJsonLd, OrganizationJsonLd } from '@/components/common/JsonLd';
import './globals.css';

export const metadata: Metadata = generateSEOMetadata();

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
