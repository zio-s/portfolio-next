'use client';

import { Suspense } from 'react';
import LottoPage from '@/views/LottoPage';

function LottoPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Lotto() {
  return (
    <Suspense fallback={<LottoPageFallback />}>
      <LottoPage />
    </Suspense>
  );
}
