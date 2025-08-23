import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Production için secret override
const authConfig = {
  ...authOptions,
  secret: process.env.NEXTAUTH_SECRET || "randevu-platform-secret-key-2025-very-secure"
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
