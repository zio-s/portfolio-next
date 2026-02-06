/**
 * Supabase Storage Service
 *
 * 이미지 및 동영상 파일을 Supabase Storage에 업로드
 */

import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  type: 'image' | 'video';
}

const BUCKET_NAME = 'portfolio-media';

/**
 * 파일을 Supabase Storage에 업로드하고 공개 URL 반환
 */
export const uploadToSupabase = async (
  file: File,
  folder: 'images' | 'videos' = 'images'
): Promise<UploadResult> => {
  try {
    // 파일 확장자 추출
    const extension = file.name.split('.').pop();

    // 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const filePath = `${folder}/${fileName}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1년 캐시
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      type: folder === 'videos' ? 'video' : 'image',
    };
  } catch {
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

/**
 * 여러 파일을 동시에 업로드
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: 'images' | 'videos' = 'images'
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadToSupabase(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * Supabase Storage에서 파일 삭제
 */
export const deleteFromSupabase = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw error;
  }
};

/**
 * 이미지 변환 URL 생성 (리사이징)
 */
export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): string => {
  if (!options) return url;

  const params = new URLSearchParams();
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());

  return `${url}?${params.toString()}`;
};
