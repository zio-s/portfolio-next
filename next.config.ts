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
};

export default nextConfig;
