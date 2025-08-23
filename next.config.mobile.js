/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // API routes'ları static export'tan hariç tut
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/business': { page: '/business' },
      '/appointments': { page: '/appointments' },
      '/favorites': { page: '/favorites' },
      '/settings': { page: '/settings' },
      '/review': { page: '/review' },
      '/dashboard': { page: '/dashboard' },
      '/dashboard/appointments': { page: '/dashboard/appointments' },
      '/dashboard/services': { page: '/dashboard/services' },
      '/dashboard/staff': { page: '/dashboard/staff' },
      '/dashboard/analytics': { page: '/dashboard/analytics' },
      '/dashboard/reviews': { page: '/dashboard/reviews' },
      '/dashboard/settings': { page: '/dashboard/settings' },
      '/dashboard/website': { page: '/dashboard/website' },
      '/dashboard/setup': { page: '/dashboard/setup' },
      '/dashboard/gallery': { page: '/dashboard/gallery' },
      '/dashboard/inquiries': { page: '/dashboard/inquiries' },
      '/dashboard/project-requests': { page: '/dashboard/project-requests' },
      '/dashboard/staff-leave': { page: '/dashboard/staff-leave' },
      '/dashboard/customer-notes': { page: '/dashboard/customer-notes' },
      '/dashboard/advertising': { page: '/dashboard/advertising' },
      '/customer-panel/my-notes': { page: '/customer-panel/my-notes' },
      '/unauthorized': { page: '/unauthorized' },
    };
  },
  experimental: {
    esmExternals: true
  }
};

module.exports = nextConfig;