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
};

module.exports = nextConfig;