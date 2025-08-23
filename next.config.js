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
  // NextAuth secret'i webpack ile inject et
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'process.env.NEXTAUTH_SECRET': JSON.stringify('randevu-platform-secret-key-2025-very-secure-production'),
          'process.env.NEXTAUTH_URL': JSON.stringify('https://randevu-platform.vercel.app')
        })
      )
    }
    return config
  }
};

module.exports = nextConfig;