/**
 * Axios 인스턴스 설정
 *
 * JWT 토큰 인터셉터, 에러 핸들링, 요청/응답 변환을 포함한 Axios 클라이언트입니다.
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from './endpoints';
import { handleApiError, logError } from './errorHandler';

/**
 * 토큰 저장소 키
 */
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
  // 자동으로 JSON 변환
  transformResponse: [
    (data) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    },
  ],
});

// ========== 요청 인터셉터 ==========

/**
 * 요청 전처리 인터셉터
 *
 * 모든 요청에 JWT 토큰을 자동으로 추가합니다.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰 가져오기
    const token = getAccessToken();

    // 토큰이 있으면 Authorization 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 요청 에러 처리
    const apiError = handleApiError(error);
    logError(apiError, '요청 인터셉터');
    return Promise.reject(apiError);
  }
);

// ========== 응답 인터셉터 ==========

/**
 * 응답 후처리 인터셉터
 *
 * 성공 응답을 처리하고, 에러 발생시 자동 재시도 및 토큰 갱신을 수행합니다.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 데이터 반환 (ApiResponse<T> 형태)
    return response;
  },
  async (error) => {
    const apiError = handleApiError(error);
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러 (인증 실패) 처리
    if (apiError.statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const newToken = await refreshAccessToken();

        if (newToken) {
          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        clearTokens();

        // 로그인 페이지로 리다이렉트 (선택사항)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(handleApiError(refreshError));
      }
    }

    // 에러 로깅
    logError(apiError, `${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);

    return Promise.reject(apiError);
  }
);

// ========== 토큰 관리 함수 ==========

/**
 * 액세스 토큰 가져오기
 *
 * @returns 액세스 토큰 또는 null
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * 리프레시 토큰 가져오기
 *
 * @returns 리프레시 토큰 또는 null
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

/**
 * 토큰 저장
 *
 * @param accessToken - 액세스 토큰
 * @param refreshToken - 리프레시 토큰 (선택)
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
}

/**
 * 토큰 제거
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

/**
 * 액세스 토큰 갱신
 *
 * @returns 새로운 액세스 토큰 또는 null
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    // 토큰 갱신 API 호출 (인터셉터 적용 안됨)
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // 새 토큰 저장
    setTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch {
    // 토큰 갱신 실패
    clearTokens();
    return null;
  }
}

// ========== API 클라이언트 헬퍼 함수 ==========

/**
 * GET 요청
 *
 * @param url - 요청 URL
 * @param config - Axios 설정
 * @returns 응답 데이터
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * POST 요청
 *
 * @param url - 요청 URL
 * @param data - 요청 데이터
 * @param config - Axios 설정
 * @returns 응답 데이터
 */
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * PUT 요청
 *
 * @param url - 요청 URL
 * @param data - 요청 데이터
 * @param config - Axios 설정
 * @returns 응답 데이터
 */
export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * PATCH 요청
 *
 * @param url - 요청 URL
 * @param data - 요청 데이터
 * @param config - Axios 설정
 * @returns 응답 데이터
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

/**
 * DELETE 요청
 *
 * @param url - 요청 URL
 * @param config - Axios 설정
 * @returns 응답 데이터
 */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/**
 * 요청 취소 토큰 생성
 *
 * @returns AbortController
 */
export function createCancelToken(): AbortController {
  return new AbortController();
}

/**
 * 기본 Axios 인스턴스 export
 */
export default apiClient;
