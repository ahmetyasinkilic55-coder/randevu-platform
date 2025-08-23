import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Production için kesin secret
const NEXTAUTH_SECRET = "randevu-platform-secret-key-2025-very-secure-production"

// Debug log
console.log('NextAuth Secret Status:', {
  hasEnvSecret: !!process.env.NEXTAUTH_SECRET,
  hasHardcodedSecret: !!NEXTAUTH_SECRET,
  nodeEnv: process.env.NODE_ENV
})

// Basitleştirilmiş NextAuth config
const authConfig: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { businesses: true }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
          } as any
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  }
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
