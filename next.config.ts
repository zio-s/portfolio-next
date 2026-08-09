import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16+
  turbopack: {
    resolveAlias: {
      // Redirect react-router-dom imports to our Next.js compatibility shim
      'react-router-dom': '@/lib/react-router-shim',
    },
  },
  // 트랜스파일이 필요한 패키지들
  transpilePackages: ['devicons-react'],
  async redirects() {
    return [
      // 프로젝트 상세 페이지 미구현 — 페이지 컴포넌트의 redirect()는 스트리밍 중이라
      // 200으로 나가 soft 404가 되므로, 라우팅 전에 확실한 308로 보낸다.
      // 상세 페이지를 실제로 만들면 이 항목을 제거할 것.
      {
        source: '/projects/:id',
        destination: '/projects',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
