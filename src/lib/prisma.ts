import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production için hard-coded DATABASE_URL (geçici çözüm)
const databaseUrl = process.env.DATABASE_URL || 
  "postgresql://c66f332901e55d5ffbbfd4dd9e5c432121bb8842a192a556708158ea29c85d92:sk_NIMf_YB6citjSXnq3asJX@db.prisma.io:5432?sslmode=require"

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma