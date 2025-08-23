import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Capacitor için static export gerekli
  trailingSlash: true, // Capacitor için önerilen
  images: {
    unoptimized: true, // Static export için gerekli
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
  serverExternalPackages: ['fs', 'path'],
  // Capacitor için asset path
  assetPrefix: '',
  basePath: '',
  // API routes mobilde çalışmayacak, bu yüzden sadece static export
  experimental: {
    esmExternals: true
  }
};

export default nextConfig;
