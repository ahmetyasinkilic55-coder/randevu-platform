import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only initialize Prisma on server-side
let prisma: PrismaClient

if (typeof window === 'undefined') {
  // Server-side: Use environment variable DATABASE_URL (Vercel Postgres Accelerate)
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  prisma = globalForPrisma.prisma ??
    new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} else {
  // Client-side: Create a dummy object
  prisma = {} as PrismaClient
}

export { prisma }