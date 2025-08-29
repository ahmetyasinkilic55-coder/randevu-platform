/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ]
  },
  // NextAuth secret'i environment variables ile inject et
  env: {
    NEXTAUTH_SECRET: 'randevu-platform-secret-key-2025-very-secure-production',
    NEXTAUTH_URL: 'https://randevu-platform.vercel.app'
  }
};

module.exports = nextConfig;