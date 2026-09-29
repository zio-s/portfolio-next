/**
 * 프로젝트 상세 모달 열기
 *
 * 프로젝트 카드, 홈의 작업 목록·히어로 미리보기가 같은 모달을 쓰도록 한곳에 둔다.
 */

import type * as React from 'react';
import { modalManager } from '@/components/modal/modal-manager';
import { ProjectDetailModal } from './ProjectDetailModal';

export const openProjectModal = (projectId: string) => {
  modalManager.custom({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: ProjectDetailModal as React.ComponentType<any>,
    props: { projectId },
    closeOnBackdrop: true,
    closeOnEsc: true,
  });
};
