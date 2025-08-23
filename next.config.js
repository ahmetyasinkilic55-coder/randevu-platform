/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
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