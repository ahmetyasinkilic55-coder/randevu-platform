import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "randevu-platform-secret-key-2025-very-secure",
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            businesses: true
          }
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
          name: user.name || user.email, // null ise email kullan
          role: user.role,
          businesses: user.businesses,
          phone: user.phone || undefined, // null → undefined
          birthDate: user.birthDate?.toISOString().split('T')[0] || undefined,
          gender: user.gender || undefined,
          city: user.city || undefined,
          district: user.district || undefined
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.businesses = user.businesses
        token.phone = user.phone
        token.birthDate = user.birthDate
        token.gender = user.gender
        token.city = user.city
        token.district = user.district
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.businesses = token.businesses as any[]
        session.user.phone = token.phone as string
        session.user.birthDate = token.birthDate as string
        session.user.gender = token.gender as 'MALE' | 'FEMALE' | 'OTHER'
        session.user.city = token.city as string
        session.user.district = token.district as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  // secret zaten 8. satırda tanımlanmış, burayı sil
}
