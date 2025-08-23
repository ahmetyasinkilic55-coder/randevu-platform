import type { NextConfig } from "next";

// Web deployment için - API routes destekli
const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/uploads/**',
      }
    ]
  },
  serverExternalPackages: ['fs', 'path']
};

export default nextConfig;
