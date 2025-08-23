import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Dashboard sayfalarına erişim kontrolü
    if (pathname.startsWith('/dashboard')) {
      // Giriş yapmamış kullanıcı
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }

      // Sadece BUSINESS_OWNER erişebilir
      if (token.role !== 'BUSINESS_OWNER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Dashboard dışındaki sayfalara erişim serbest
        if (!pathname.startsWith('/dashboard')) {
          return true
        }

        // Dashboard için token gerekli
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    // Diğer korunması gereken rotalar buraya eklenebilir
  ]
}