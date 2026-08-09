import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import GuestbookPage from '@/views/GuestbookPage';

export const metadata: Metadata = generateSEOMetadata({
  title: '방명록 | 변세민 | 프론트엔드 개발자',
  description: '프론트엔드 개발자 변세민의 포트폴리오 방명록입니다. 여러분의 소중한 의견을 남겨주세요.',
  url: 'https://semincode.com/guestbook',
});

export default function Guestbook() {
  return <GuestbookPage />;
}
