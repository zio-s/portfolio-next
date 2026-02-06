/**
 * 사용자 관리 서비스
 *
 * 사용자 CRUD 및 관리 API를 제공합니다.
 * (관리자 기능 포함)
 */

import { get, post, put, del } from './api';
import { USER_ENDPOINTS } from './endpoints';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from './types';

/**
 * 사용자 목록 조회 (페이지네이션)
 *
 * 관리자 권한으로 전체 사용자 목록을 조회합니다.
 *
 * @param params - 페이지네이션 파라미터
 * @returns 페이지네이션된 사용자 목록
 *
 * @example
 * ```ts
 * const result = await usersService.getUsers({
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'createdAt',
 *   order: 'desc'
 * });
 * console.log(result.items, result.meta);
 * ```
 */
export async function getUsers(
  params?: PaginationParams
): Promise<PaginatedResponse<User>> {
  const response = await get<ApiResponse<PaginatedResponse<User>>>(
    USER_ENDPOINTS.LIST,
    { params }
  );
  return response.data;
}

/**
 * 사용자 상세 조회
 *
 * 특정 사용자의 상세 정보를 조회합니다.
 *
 * @param id - 사용자 ID
 * @returns 사용자 상세 정보
 *
 * @example
 * ```ts
 * const user = await usersService.getUser('123');
 * console.log(user.name, user.email, user.role);
 * ```
 */
export async function getUser(id: string | number): Promise<User> {
  const response = await get<ApiResponse<User>>(USER_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * 사용자 생성 (관리자)
 *
 * 관리자 권한으로 새 사용자를 생성합니다.
 *
 * @param userData - 사용자 생성 정보
 * @returns 생성된 사용자
 *
 * @example
 * ```ts
 * const newUser = await usersService.createUser({
 *   email: 'newuser@example.com',
 *   password: 'password123',
 *   name: '김철수',
 *   role: UserRole.EDITOR
 * });
 * ```
 */
export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await post<ApiResponse<User>>(USER_ENDPOINTS.CREATE, userData);
  return response.data;
}

/**
 * 사용자 수정 (관리자)
 *
 * 관리자 권한으로 사용자 정보를 수정합니다.
 *
 * @param id - 사용자 ID
 * @param userData - 수정할 사용자 정보
 * @returns 수정된 사용자
 *
 * @example
 * ```ts
 * const updated = await usersService.updateUser('123', {
 *   role: UserRole.ADMIN,
 *   isActive: true
 * });
 * ```
 */
export async function updateUser(
  id: string | number,
  userData: UpdateUserRequest
): Promise<User> {
  const response = await put<ApiResponse<User>>(
    USER_ENDPOINTS.UPDATE(id),
    userData
  );
  return response.data;
}

/**
 * 사용자 삭제 (관리자)
 *
 * 관리자 권한으로 사용자를 삭제합니다.
 *
 * @param id - 사용자 ID
 *
 * @example
 * ```ts
 * await usersService.deleteUser('123');
 * ```
 */
export async function deleteUser(id: string | number): Promise<void> {
  await del<ApiResponse<void>>(USER_ENDPOINTS.DELETE(id));
}

/**
 * 사용자 검색
 *
 * 이름, 이메일 등으로 사용자를 검색합니다.
 *
 * @param query - 검색어
 * @param params - 추가 검색 파라미터
 * @returns 검색된 사용자 목록
 *
 * @example
 * ```ts
 * const results = await usersService.searchUsers('김철수', {
 *   page: 1,
 *   limit: 10
 * });
 * ```
 */
export async function searchUsers(
  query: string,
  params?: PaginationParams
): Promise<PaginatedResponse<User>> {
  const response = await get<ApiResponse<PaginatedResponse<User>>>(
    USER_ENDPOINTS.LIST,
    {
      params: {
        ...params,
        search: query,
      },
    }
  );
  return response.data;
}

/**
 * 역할별 사용자 조회
 *
 * 특정 역할을 가진 사용자 목록을 조회합니다.
 *
 * @param role - 사용자 역할
 * @param params - 페이지네이션 파라미터
 * @returns 사용자 목록
 *
 * @example
 * ```ts
 * const admins = await usersService.getUsersByRole(UserRole.ADMIN, {
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function getUsersByRole(
  role: string,
  params?: PaginationParams
): Promise<PaginatedResponse<User>> {
  const response = await get<ApiResponse<PaginatedResponse<User>>>(
    USER_ENDPOINTS.LIST,
    {
      params: {
        ...params,
        role,
      },
    }
  );
  return response.data;
}

/**
 * 사용자 활성화/비활성화
 *
 * 사용자 계정의 활성화 상태를 변경합니다.
 *
 * @param id - 사용자 ID
 * @param isActive - 활성화 여부
 * @returns 수정된 사용자
 *
 * @example
 * ```ts
 * // 사용자 비활성화
 * await usersService.toggleUserStatus('123', false);
 * ```
 */
export async function toggleUserStatus(
  id: string | number,
  isActive: boolean
): Promise<User> {
  return updateUser(id, { isActive });
}

/**
 * 사용자 서비스 객체
 */
const usersService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersByRole,
  toggleUserStatus,
};

export default usersService;
