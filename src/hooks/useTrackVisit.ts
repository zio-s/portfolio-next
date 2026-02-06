/**
 * useTrackVisit Hook
 *
 * 사용자가 페이지/프로젝트를 방문할 때 Recent Menu에 자동으로 추적하는 훅
 *
 * 사용 예:
 * ```tsx
 * const ProjectDetailPage = () => {
 *   const { data: project } = useGetProjectQuery(id);
 *   const trackVisit = useTrackVisit();
 *
 *   useEffect(() => {
 *     if (project) {
 *       trackVisit({
 *         id: project.id,
 *         type: 'project',
 *         title: project.title,
 *         path: `/projects/${project.id}`,
 *         thumbnail: project.thumbnail,
 *       });
 *     }
 *   }, [project]);
 * };
 * ```
 */

import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addRecentItem, type RecentMenuItem } from '../store/slices/recentMenuSlice';

export const useTrackVisit = () => {
  const dispatch = useAppDispatch();

  const trackVisit = useCallback(
    (item: Omit<RecentMenuItem, 'timestamp'>) => {
      dispatch(addRecentItem(item));
    },
    [dispatch]
  );

  return trackVisit;
};
