/**
 * Comment Tree Utility
 *
 * 댓글 목록을 트리 구조로 변환하는 유틸리티
 *
 * 주요 기능:
 * - Nested comments (대댓글) 트리 구조 생성
 * - 깊이 계산 (depth)
 * - 부모-자식 관계 매핑
 */

import type { Comment, CommentTreeItem } from '../types/Comment';

/**
 * 댓글 목록을 트리 구조로 변환
 *
 * @example
 * const comments = [
 *   { id: '1', parentId: null, ... },
 *   { id: '2', parentId: '1', ... },
 *   { id: '3', parentId: '1', ... },
 *   { id: '4', parentId: '2', ... },
 * ];
 *
 * const tree = buildCommentTree(comments);
 * // [
 * //   {
 * //     ...comment1,
 * //     depth: 0,
 * //     replies: [
 * //       { ...comment2, depth: 1, replies: [{ ...comment4, depth: 2 }] },
 * //       { ...comment3, depth: 1, replies: [] }
 * //     ]
 * //   }
 * // ]
 */
export const buildCommentTree = (comments: Comment[]): CommentTreeItem[] => {
  // ID로 빠른 조회를 위한 Map 생성
  const commentMap = new Map<string, CommentTreeItem>();

  // 모든 댓글을 Map에 추가 (replies 초기화)
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      depth: 0,
      replies: [],
    });
  });

  // 트리 구조 생성
  const tree: CommentTreeItem[] = [];

  comments.forEach((comment) => {
    const treeItem = commentMap.get(comment.id)!;

    if (comment.parentId) {
      // 대댓글인 경우: 부모 댓글의 replies에 추가
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        treeItem.depth = parent.depth + 1;
        parent.replies.push(treeItem);
      } else {
        // 부모를 찾을 수 없는 경우 최상위에 추가
        tree.push(treeItem);
      }
    } else {
      // 최상위 댓글인 경우
      tree.push(treeItem);
    }
  });

  // 각 레벨에서 생성일 기준 정렬 (최신순)
  const sortReplies = (items: CommentTreeItem[]) => {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    items.forEach((item) => {
      if (item.replies.length > 0) {
        sortReplies(item.replies);
      }
    });
  };

  sortReplies(tree);

  return tree;
};

/**
 * 댓글 트리를 평면 배열로 변환 (DFS)
 *
 * @example
 * const tree = buildCommentTree(comments);
 * const flatList = flattenCommentTree(tree);
 * // 모든 댓글이 depth 정보와 함께 평면 배열로 반환
 */
export const flattenCommentTree = (tree: CommentTreeItem[]): CommentTreeItem[] => {
  const result: CommentTreeItem[] = [];

  const traverse = (items: CommentTreeItem[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.replies.length > 0) {
        traverse(item.replies);
      }
    });
  };

  traverse(tree);
  return result;
};

/**
 * 특정 댓글의 모든 자식 댓글 ID 가져오기
 *
 * @example
 * const descendants = getDescendantIds(tree, 'comment1');
 * // ['comment2', 'comment3', 'comment4']
 */
export const getDescendantIds = (tree: CommentTreeItem[], commentId: string): string[] => {
  const descendants: string[] = [];

  const findAndCollect = (items: CommentTreeItem[]) => {
    items.forEach((item) => {
      if (item.id === commentId) {
        const collectIds = (replies: CommentTreeItem[]) => {
          replies.forEach((reply) => {
            descendants.push(reply.id);
            collectIds(reply.replies);
          });
        };
        collectIds(item.replies);
      } else {
        findAndCollect(item.replies);
      }
    });
  };

  findAndCollect(tree);
  return descendants;
};

/**
 * 댓글 개수 계산 (대댓글 포함)
 *
 * @example
 * const totalCount = countComments(tree);
 */
export const countComments = (tree: CommentTreeItem[]): number => {
  let count = 0;

  const traverse = (items: CommentTreeItem[]) => {
    items.forEach((item) => {
      count++;
      traverse(item.replies);
    });
  };

  traverse(tree);
  return count;
};

/**
 * 최대 댓글 깊이 계산
 *
 * @example
 * const maxDepth = getMaxDepth(tree); // 3
 */
export const getMaxDepth = (tree: CommentTreeItem[]): number => {
  let maxDepth = 0;

  const traverse = (items: CommentTreeItem[], currentDepth: number) => {
    items.forEach((item) => {
      maxDepth = Math.max(maxDepth, currentDepth);
      traverse(item.replies, currentDepth + 1);
    });
  };

  traverse(tree, 0);
  return maxDepth;
};
