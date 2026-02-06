/**
 * 파일 업로드 서비스
 *
 * 이미지, 문서 등의 파일 업로드 기능을 제공합니다.
 * 진행률 표시 및 요청 취소를 지원합니다.
 */

import apiClient, { createCancelToken } from './api';
import { UPLOAD_ENDPOINTS } from './endpoints';
import type {
  UploadedFile,
  UploadOptions,
  ApiResponse,
} from './types';

/**
 * 파일 업로드 (공통 함수)
 *
 * @param endpoint - 업로드 엔드포인트
 * @param file - 업로드할 파일
 * @param options - 업로드 옵션 (진행률 콜백, 취소 토큰 등)
 * @returns 업로드된 파일 정보
 */
async function uploadFile(
  endpoint: string,
  file: File,
  options?: UploadOptions
): Promise<UploadedFile> {
  // FormData 생성
  const formData = new FormData();
  formData.append('file', file);

  // Axios 설정
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 업로드 진행률 추적
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (options?.onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        options.onProgress(progress);
      }
    },
    // 요청 취소 지원
    signal: options?.signal,
  };

  const response = await apiClient.post<ApiResponse<UploadedFile>>(
    endpoint,
    formData,
    config
  );

  return response.data.data;
}

/**
 * 이미지 업로드
 *
 * 이미지 파일을 업로드하고 URL을 반환합니다.
 *
 * @param file - 이미지 파일
 * @param options - 업로드 옵션
 * @returns 업로드된 이미지 정보
 *
 * @example
 * ```ts
 * const file = document.querySelector('input[type="file"]').files[0];
 *
 * const uploadedImage = await uploadService.uploadImage(file, {
 *   onProgress: (progress) => {
 *     console.log(`업로드 진행: ${progress}%`);
 *   }
 * });
 *
 * console.log(uploadedImage.url);
 * ```
 */
export async function uploadImage(
  file: File,
  options?: UploadOptions
): Promise<UploadedFile> {
  // 이미지 파일 유효성 검사
  validateImageFile(file);

  return uploadFile(UPLOAD_ENDPOINTS.IMAGE, file, options);
}

/**
 * 문서 업로드
 *
 * PDF, Word 등의 문서 파일을 업로드합니다.
 *
 * @param file - 문서 파일
 * @param options - 업로드 옵션
 * @returns 업로드된 문서 정보
 *
 * @example
 * ```ts
 * const file = document.querySelector('input[type="file"]').files[0];
 *
 * const uploadedDoc = await uploadService.uploadDocument(file, {
 *   onProgress: (progress) => {
 *     setUploadProgress(progress);
 *   }
 * });
 * ```
 */
export async function uploadDocument(
  file: File,
  options?: UploadOptions
): Promise<UploadedFile> {
  // 문서 파일 유효성 검사
  validateDocumentFile(file);

  return uploadFile(UPLOAD_ENDPOINTS.DOCUMENT, file, options);
}

/**
 * 일반 파일 업로드
 *
 * 모든 타입의 파일을 업로드합니다.
 *
 * @param file - 파일
 * @param options - 업로드 옵션
 * @returns 업로드된 파일 정보
 *
 * @example
 * ```ts
 * const file = document.querySelector('input[type="file"]').files[0];
 * const uploadedFile = await uploadService.uploadGeneralFile(file);
 * ```
 */
export async function uploadGeneralFile(
  file: File,
  options?: UploadOptions
): Promise<UploadedFile> {
  // 파일 크기 검사
  validateFileSize(file);

  return uploadFile(UPLOAD_ENDPOINTS.FILE, file, options);
}

/**
 * 여러 파일 동시 업로드
 *
 * 여러 파일을 한 번에 업로드합니다.
 *
 * @param files - 파일 목록
 * @param options - 업로드 옵션
 * @returns 업로드된 파일 정보 목록
 *
 * @example
 * ```ts
 * const files = Array.from(document.querySelector('input[type="file"]').files);
 *
 * const uploadedFiles = await uploadService.uploadMultipleFiles(files, {
 *   onProgress: (progress) => {
 *     console.log(`전체 진행률: ${progress}%`);
 *   }
 * });
 * ```
 */
export async function uploadMultipleFiles(
  files: File[],
  options?: UploadOptions
): Promise<UploadedFile[]> {
  // FormData 생성
  const formData = new FormData();

  files.forEach((file) => {
    validateFileSize(file);
    formData.append('files', file);
  });

  // Axios 설정
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (options?.onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        options.onProgress(progress);
      }
    },
    signal: options?.signal,
  };

  const response = await apiClient.post<ApiResponse<UploadedFile[]>>(
    UPLOAD_ENDPOINTS.MULTIPLE,
    formData,
    config
  );

  return response.data.data;
}

/**
 * Base64로 인코딩된 이미지 업로드
 *
 * Base64 문자열을 파일로 변환하여 업로드합니다.
 *
 * @param base64String - Base64 인코딩된 이미지 문자열
 * @param filename - 파일명
 * @param options - 업로드 옵션
 * @returns 업로드된 이미지 정보
 *
 * @example
 * ```ts
 * const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...';
 * const uploadedImage = await uploadService.uploadBase64Image(
 *   base64,
 *   'screenshot.png'
 * );
 * ```
 */
export async function uploadBase64Image(
  base64String: string,
  filename: string,
  options?: UploadOptions
): Promise<UploadedFile> {
  // Base64를 Blob으로 변환
  const blob = base64ToBlob(base64String);

  // Blob을 File 객체로 변환
  const file = new File([blob], filename, { type: blob.type });

  return uploadImage(file, options);
}

// ========== 유효성 검사 함수 ==========

/**
 * 이미지 파일 유효성 검사
 *
 * @param file - 검사할 파일
 * @throws 유효하지 않은 파일인 경우 에러
 */
function validateImageFile(file: File): void {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    throw new Error('이미지 파일만 업로드 가능합니다. (JPEG, PNG, GIF, WebP)');
  }

  // 파일 크기 제한: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('이미지 파일 크기는 10MB를 초과할 수 없습니다.');
  }
}

/**
 * 문서 파일 유효성 검사
 *
 * @param file - 검사할 파일
 * @throws 유효하지 않은 파일인 경우 에러
 */
function validateDocumentFile(file: File): void {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error('문서 파일만 업로드 가능합니다. (PDF, Word, Excel)');
  }

  // 파일 크기 제한: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('문서 파일 크기는 50MB를 초과할 수 없습니다.');
  }
}

/**
 * 파일 크기 검사
 *
 * @param file - 검사할 파일
 * @throws 파일 크기가 너무 큰 경우 에러
 */
function validateFileSize(file: File): void {
  // 일반 파일 크기 제한: 100MB
  const maxSize = 100 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error('파일 크기는 100MB를 초과할 수 없습니다.');
  }
}

// ========== 유틸리티 함수 ==========

/**
 * Base64 문자열을 Blob으로 변환
 *
 * @param base64String - Base64 문자열
 * @returns Blob 객체
 */
function base64ToBlob(base64String: string): Blob {
  // Data URL에서 Base64 부분만 추출
  const parts = base64String.split(',');
  const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const raw = window.atob(parts[1]);

  // Uint8Array로 변환
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; i++) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param bytes - 바이트 크기
 * @returns 포맷팅된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 파일 업로드 서비스 객체
 */
const uploadService = {
  uploadImage,
  uploadDocument,
  uploadGeneralFile,
  uploadMultipleFiles,
  uploadBase64Image,
  formatFileSize,
  createCancelToken,
};

export default uploadService;
