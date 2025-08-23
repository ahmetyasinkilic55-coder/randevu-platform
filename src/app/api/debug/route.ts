import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // User bilgilerini al
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // User'ın business'larını al
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        ownerId: true
      }
    })

    return NextResponse.json({
      userId,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } : null,
      businesses,
      businessCount: businesses.length
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
