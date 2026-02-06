/**
 * 중앙 집중식 에러 핸들러
 *
 * API 에러를 처리하고 사용자 친화적인 한글 메시지로 변환합니다.
 */

import type { AxiosError } from 'axios';
import type { ApiError } from './types';

/**
 * HTTP 상태 코드별 기본 에러 메시지 (한글)
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다. 다시 로그인해주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '이미 존재하는 데이터입니다.',
  422: '입력한 정보를 확인해주세요.',
  429: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다.',
  502: '서버 연결에 실패했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
  504: '서버 응답 시간이 초과되었습니다.',
};

/**
 * 네트워크 에러 메시지
 */
const NETWORK_ERROR_MESSAGE = '네트워크 연결을 확인해주세요.';

/**
 * 기본 에러 메시지
 */
const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다.';

/**
 * API 에러 클래스
 *
 * AxiosError를 확장하여 추가 정보를 제공합니다.
 */
export class ApiErrorClass extends Error {
  /** HTTP 상태 코드 */
  public statusCode: number;
  /** 에러 코드 */
  public errorCode?: string;
  /** 유효성 검사 에러 목록 */
  public errors?: ApiError['errors'];
  /** 원본 에러 */
  public originalError?: AxiosError;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    errors?: ApiError['errors'],
    originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.originalError = originalError;

    // TypeScript에서 Error를 상속할 때 필요한 설정
    Object.setPrototypeOf(this, ApiErrorClass.prototype);
  }

  /**
   * 유효성 검사 에러 메시지 포맷팅
   */
  public getValidationMessages(): string[] {
    if (!this.errors || this.errors.length === 0) {
      return [];
    }

    return this.errors.map((error) => `${error.field}: ${error.message}`);
  }

  /**
   * 전체 에러 메시지 (유효성 검사 에러 포함)
   */
  public getFullMessage(): string {
    const validationMessages = this.getValidationMessages();

    if (validationMessages.length > 0) {
      return `${this.message}\n${validationMessages.join('\n')}`;
    }

    return this.message;
  }
}

/**
 * AxiosError를 ApiError로 변환
 *
 * @param error - Axios 에러 객체
 * @returns ApiError 객체
 */
export function handleApiError(error: unknown): ApiErrorClass {
  // AxiosError가 아닌 경우
  if (!isAxiosError(error)) {
    if (error instanceof Error) {
      return new ApiErrorClass(error.message || DEFAULT_ERROR_MESSAGE, 0);
    }
    return new ApiErrorClass(DEFAULT_ERROR_MESSAGE, 0);
  }

  const axiosError = error as AxiosError<ApiError>;

  // 네트워크 에러 (서버 응답 없음)
  if (!axiosError.response) {
    return new ApiErrorClass(
      NETWORK_ERROR_MESSAGE,
      0,
      'NETWORK_ERROR',
      undefined,
      axiosError
    );
  }

  const { status, data } = axiosError.response;

  // 서버에서 보낸 에러 메시지 우선 사용
  const message = data?.message || ERROR_MESSAGES[status] || DEFAULT_ERROR_MESSAGE;

  return new ApiErrorClass(
    message,
    status,
    data?.errorCode,
    data?.errors,
    axiosError
  );
}

/**
 * AxiosError 타입 가드
 *
 * @param error - 에러 객체
 * @returns AxiosError 여부
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}

/**
 * 에러 로깅
 *
 * 개발 환경에서는 콘솔에 출력하고, 프로덕션 환경에서는 에러 추적 서비스로 전송할 수 있습니다.
 *
 * @param error - 에러 객체
 * @param context - 에러 발생 컨텍스트 (선택)
 */
export function logError(error: ApiErrorClass, context?: string): void {
  // 프로덕션 환경: 에러 추적 서비스로 전송
  // 예: Sentry, LogRocket, Datadog 등
  // sendToErrorTrackingService(error, context);
}

/**
 * 토스트 메시지용 에러 메시지 추출
 *
 * @param error - 에러 객체
 * @returns 사용자에게 표시할 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiErrorClass) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * 재시도 가능한 에러인지 확인
 *
 * @param error - 에러 객체
 * @returns 재시도 가능 여부
 */
export function isRetryableError(error: ApiErrorClass): boolean {
  // 네트워크 에러 또는 5xx 서버 에러는 재시도 가능
  return error.statusCode === 0 || (error.statusCode >= 500 && error.statusCode < 600);
}

/**
 * 인증 에러인지 확인
 *
 * @param error - 에러 객체
 * @returns 인증 에러 여부
 */
export function isAuthError(error: ApiErrorClass): boolean {
  return error.statusCode === 401 || error.statusCode === 403;
}

/**
 * 유효성 검사 에러인지 확인
 *
 * @param error - 에러 객체
 * @returns 유효성 검사 에러 여부
 */
export function isValidationError(error: ApiErrorClass): boolean {
  return error.statusCode === 422 && !!error.errors && error.errors.length > 0;
}

/**
 * 에러 메시지 포맷팅 (유효성 검사 에러용)
 *
 * @param error - 에러 객체
 * @returns 포맷팅된 에러 메시지 배열
 */
export function formatValidationErrors(error: ApiErrorClass): string[] {
  if (!isValidationError(error)) {
    return [error.message];
  }

  return error.getValidationMessages();
}
