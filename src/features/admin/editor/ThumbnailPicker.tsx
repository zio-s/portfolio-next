'use client';

/**
 * Thumbnail picker (DESIGN_RESPONSE_R4.md §2.4)
 *
 * - 자동 추출: extractThumbnail로 본문 첫 이미지
 * - 미리보기 240×135 (16:9), --bg-soft placeholder
 * - 미설정 시: dashed border + "썸네일 없음"
 *
 * 현재 DB에 thumbnail 컬럼 없음 → 자동 추출 결과만 미리보기로 노출 (수동 업로드 UI는 mock)
 */

import { useMemo } from 'react';
import { ImagePlus } from 'lucide-react';
import { extractThumbnail } from '@/lib/blog';

interface ThumbnailPickerProps {
  /** 본문 markdown */
  content: string;
}

export function ThumbnailPicker({ content }: ThumbnailPickerProps) {
  const auto = useMemo(() => extractThumbnail(content), [content]);

  return (
    <div>
      {auto ? (
        <div
          className="relative w-full"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--blog-bg-soft)',
            border: '1px solid var(--blog-border)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={auto}
            alt="썸네일 미리보기"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center gap-1.5 text-center"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--blog-bg-soft)',
            border: '1px dashed var(--blog-border)',
            borderRadius: 6,
            color: 'var(--blog-fg-subtle)',
          }}
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-[11px]">썸네일 없음</span>
          <span className="blog-mono text-[10px]">본문에 이미지를 넣으면 자동 추출</span>
        </div>
      )}
    </div>
  );
}
