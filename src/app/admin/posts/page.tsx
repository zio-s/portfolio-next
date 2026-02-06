'use client';

import { Suspense } from 'react';
import PostsPage from '@/views/PostsPage';

function PostsPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function AdminPosts() {
  return (
    <Suspense fallback={<PostsPageFallback />}>
      <PostsPage />
    </Suspense>
  );
}
