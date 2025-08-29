import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Production için kesin secret - hem hardcoded hem env
const NEXTAUTH_SECRET = "randevu-platform-secret-key-2025-very-secure-production"

// NextAuth handler
const handler = NextAuth({
  ...authOptions,
  secret: NEXTAUTH_SECRET,
  // Production overrides
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
