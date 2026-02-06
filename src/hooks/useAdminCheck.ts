/**
 * useAdminCheck Hook
 *
 * 관리자 권한 체크 Hook
 *
 * @returns {Object}
 * - isAdmin: 관리자 여부
 * - isAuthenticated: 로그인 여부
 * - user: 현재 사용자 정보
 */

import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAuthenticated, selectIsAdmin } from '../store';

export const useAdminCheck = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  return {
    isAdmin,
    isAuthenticated,
    user,
  };
};

export default useAdminCheck;
