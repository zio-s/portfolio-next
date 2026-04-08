import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import HomePage from '@/views/HomePage';

export const metadata: Metadata = generateSEOMetadata();

export default function Home() {
  return <HomePage />;
}
