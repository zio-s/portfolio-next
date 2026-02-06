import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PostsState, Post, ApiError, PaginatedResponse } from '../types';

// localStorage 키
const POSTS_STORAGE_KEY = 'cms_posts';

// localStorage에서 게시글 로드 (클라이언트 전용)
const loadPostsFromStorage = (): Post[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// localStorage에 게시글 저장 (클라이언트 전용)
const savePostsToStorage = (posts: Post[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // Silent fail - localStorage might be disabled
  }
};

// 초기 샘플 데이터 생성
const initializeSamplePosts = (): Post[] => {
  const samplePosts: Post[] = [
    {
      id: '1',
      title: 'React와 TypeScript로 CMS 만들기',
      content: '이 프로젝트는 React와 TypeScript를 사용하여 만든 포트폴리오용 CMS입니다.\n\n## 주요 기능\n\n- 게시글 CRUD (생성, 조회, 수정, 삭제)\n- 사용자 관리 시스템\n- Redux Toolkit을 활용한 상태 관리\n- localStorage 기반 데이터 저장\n\n## 기술 스택\n\n- React 18\n- TypeScript\n- Redux Toolkit\n- React Router v6\n- Vite',
      excerpt: 'React와 TypeScript를 사용한 포트폴리오 CMS 프로젝트입니다.',
      slug: 'react-typescript-cms',
      status: 'published',
      authorId: '1',
      tags: ['React', 'TypeScript', 'CMS', 'Redux'],
      createdAt: new Date('2024-01-15T10:00:00').toISOString(),
      updatedAt: new Date('2024-01-15T10:00:00').toISOString(),
      publishedAt: new Date('2024-01-15T10:00:00').toISOString(),
    },
    {
      id: '2',
      title: 'Redux Toolkit 완벽 가이드',
      content: 'Redux Toolkit은 Redux를 더 쉽게 사용할 수 있게 해주는 공식 도구입니다.\n\n## 주요 특징\n\n### 1. createSlice\n간편한 리듀서 작성이 가능합니다.\n\n### 2. createAsyncThunk\n비동기 처리를 쉽게 할 수 있습니다.\n\n### 3. Immer 내장\n불변성 관리를 자동으로 해줍니다.',
      excerpt: 'Redux Toolkit 사용법과 주요 기능을 소개합니다.',
      slug: 'redux-toolkit-guide',
      status: 'published',
      authorId: '1',
      tags: ['Redux', 'State Management', 'Tutorial'],
      createdAt: new Date('2024-01-20T14:30:00').toISOString(),
      updatedAt: new Date('2024-01-20T14:30:00').toISOString(),
      publishedAt: new Date('2024-01-20T14:30:00').toISOString(),
    },
    {
      id: '3',
      title: '[임시 저장] Vite vs Create React App',
      content: 'Vite와 CRA의 차이점을 비교하는 글입니다.\n\n## 개요\n\n아직 작성 중인 글입니다...\n\n- TODO: Vite 장점 정리\n- TODO: CRA 비교\n- TODO: 성능 벤치마크',
      excerpt: 'Vite와 Create React App을 비교 분석합니다.',
      slug: 'vite-vs-cra-draft',
      status: 'draft',
      authorId: '1',
      tags: ['Vite', 'CRA', 'Build Tools'],
      createdAt: new Date('2024-01-25T09:00:00').toISOString(),
      updatedAt: new Date('2024-01-25T09:00:00').toISOString(),
    },
  ];

  savePostsToStorage(samplePosts);
  return samplePosts;
};

// Initial State
const initialState: PostsState = {
  posts: loadPostsFromStorage().length > 0 ? loadPostsFromStorage() : initializeSamplePosts(),
  currentPost: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async Thunks

/**
 * 모든 게시글 조회 (localStorage)
 */
export const fetchPosts = createAsyncThunk<
  PaginatedResponse<Post>,
  { page?: number; limit?: number; status?: string; search?: string; tag?: string },
  { rejectValue: ApiError }
>('posts/fetchPosts', async (params, { rejectWithValue }) => {
  try {
    const allPosts = loadPostsFromStorage();

    // 필터링
    let filteredPosts = [...allPosts];

    if (params.status) {
      filteredPosts = filteredPosts.filter(p => p.status === params.status);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower) ||
        p.excerpt.toLowerCase().includes(searchLower)
      );
    }

    if (params.tag) {
      const tag = params.tag; // 타입 체크를 위해 변수에 할당
      filteredPosts = filteredPosts.filter(p => p.tags.includes(tag));
    }

    // 페이지네이션
    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = filteredPosts.slice(start, end);

    return {
      data: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 조회 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * ID로 특정 게시글 조회 (localStorage)
 */
export const fetchPostById = createAsyncThunk<
  Post,
  string,
  { rejectValue: ApiError }
>('posts/fetchPostById', async (id, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();
    const post = posts.find(p => p.id === id);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    return post;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 조회 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * Slug로 게시글 조회 (localStorage)
 */
export const fetchPostBySlug = createAsyncThunk<
  Post,
  string,
  { rejectValue: ApiError }
>('posts/fetchPostBySlug', async (slug, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    return post;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 조회 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * 게시글 생성 (localStorage)
 */
export const createPost = createAsyncThunk<
  Post,
  Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>,
  { rejectValue: ApiError }
>('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();

    // 새 게시글 생성
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(), // 간단한 ID 생성
      authorId: '1', // 현재 로그인한 사용자 (localStorage에서 가져올 수도 있음)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: postData.status === 'published' ? new Date().toISOString() : undefined,
    };

    // 배열 맨 앞에 추가 (최신글이 위로)
    const updatedPosts = [newPost, ...posts];
    savePostsToStorage(updatedPosts);

    return newPost;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 생성 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * 게시글 수정 (localStorage)
 */
export const updatePost = createAsyncThunk<
  Post,
  { id: string; updates: Partial<Post> },
  { rejectValue: ApiError }
>('posts/updatePost', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    // 게시글 업데이트
    const updatedPost: Post = {
      ...posts[index],
      ...updates,
      id, // ID는 변경 불가
      updatedAt: new Date().toISOString(),
      publishedAt: updates.status === 'published' && !posts[index].publishedAt
        ? new Date().toISOString()
        : posts[index].publishedAt,
    };

    const updatedPosts = [...posts];
    updatedPosts[index] = updatedPost;
    savePostsToStorage(updatedPosts);

    return updatedPost;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 수정 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * 게시글 삭제 (localStorage)
 */
export const deletePost = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('posts/deletePost', async (id, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = posts.filter(p => p.id !== id);

    if (posts.length === updatedPosts.length) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    savePostsToStorage(updatedPosts);
    return id;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 삭제 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

/**
 * 게시글 발행 (localStorage)
 */
export const publishPost = createAsyncThunk<
  Post,
  string,
  { rejectValue: ApiError }
>('posts/publishPost', async (id, { rejectWithValue }) => {
  try {
    const posts = loadPostsFromStorage();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    // 게시글 발행 처리
    const updatedPost: Post = {
      ...posts[index],
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPosts = [...posts];
    updatedPosts[index] = updatedPost;
    savePostsToStorage(updatedPosts);

    return updatedPost;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '게시글 발행 실패';
    return rejectWithValue({
      message: errorMessage,
    });
  }
});

// Slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    setFilters: (state, action: PayloadAction<PostsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch posts';
      });

    // Fetch Post By ID
    builder
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch post';
      });

    // Fetch Post By Slug
    builder
      .addCase(fetchPostBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch post';
      });

    // Create Post
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.currentPost = action.payload;
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create post';
      });

    // Update Post
    builder
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update post';
      });

    // Delete Post
    builder
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
        state.pagination.total -= 1;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete post';
      });

    // Publish Post
    builder
      .addCase(publishPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.posts.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
        state.error = null;
      })
      .addCase(publishPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to publish post';
      });
  },
});

// Actions
export const { clearError, setCurrentPost, setFilters, clearFilters, setPage } = postsSlice.actions;

// Selectors
export const selectPosts = (state: { posts: PostsState }) => state.posts.posts;
export const selectCurrentPost = (state: { posts: PostsState }) => state.posts.currentPost;
export const selectPostsLoading = (state: { posts: PostsState }) => state.posts.loading;
export const selectPostsError = (state: { posts: PostsState }) => state.posts.error;
export const selectPostsFilters = (state: { posts: PostsState }) => state.posts.filters;
export const selectPostsPagination = (state: { posts: PostsState }) => state.posts.pagination;

// Memoized Selectors
export const selectPostById = (postId: string) => (state: { posts: PostsState }) =>
  state.posts.posts.find((post) => post.id === postId);

export const selectFilteredPosts = (state: { posts: PostsState }) => {
  const { posts, filters } = state.posts;

  return posts.filter((post) => {
    if (filters.status && post.status !== filters.status) return false;
    if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.tag && !post.tags.includes(filters.tag)) return false;
    return true;
  });
};

export default postsSlice.reducer;
