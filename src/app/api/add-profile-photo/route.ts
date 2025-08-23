import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Add a sample profile photo URL
    const updatedBusiness = await prisma.business.update({
      where: {
        id: business.id
      },
      data: {
        profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profile photo added',
      business: updatedBusiness
    })

  } catch (error) {
    console.error('Add profile photo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
