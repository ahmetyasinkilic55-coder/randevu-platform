import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function checkBusinessOwnerAccess() {
  const session = await getServerSession(authOptions)
  
  // Giriş yapmamış kullanıcı
  if (!session || !session.user) {
    return {
      hasAccess: false,
      redirectTo: '/auth/signin',
      reason: 'NOT_AUTHENTICATED'
    }
  }

  // Role kontrolü - sadece BUSINESS_OWNER erişebilir
  if (session.user.role !== 'BUSINESS_OWNER') {
    return {
      hasAccess: false,
      redirectTo: '/unauthorized',
      reason: 'NOT_BUSINESS_OWNER'
    }
  }

  // İşletme sahipliği kontrolü
  try {
    const businessCount = await prisma.business.count({
      where: {
        ownerId: session.user.id
      }
    })

    if (businessCount === 0) {
      return {
        hasAccess: false,
        redirectTo: '/dashboard/setup',
        reason: 'NO_BUSINESS'
      }
    }

    return {
      hasAccess: true,
      user: session.user,
      businessCount
    }
  } catch (error) {
    console.error('Business check error:', error)
    return {
      hasAccess: false,
      redirectTo: '/error',
      reason: 'DATABASE_ERROR'
    }
  }
}

export function checkClientSideAccess(session: any) {
  // Client-side kontrolü (daha hızlı)
  if (!session || !session.user) {
    return {
      hasAccess: false,
      redirectTo: '/auth/signin',
      reason: 'NOT_AUTHENTICATED'
    }
  }

  if (session.user.role !== 'BUSINESS_OWNER') {
    return {
      hasAccess: false,
      redirectTo: '/unauthorized', 
      reason: 'NOT_BUSINESS_OWNER'
    }
  }

  return {
    hasAccess: true,
    user: session.user
  }
}