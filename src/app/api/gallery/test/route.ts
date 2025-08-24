import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Test gallery data retrieval
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      },
      include: {
        gallery: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        websiteConfig: {
          select: {
            showGallery: true,
            urlSlug: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Gallery test data',
      business: {
        id: business.id,
        name: business.name,
        galleryCount: business.gallery.length,
        galleryItems: business.gallery,
        websiteConfig: business.websiteConfig,
        showGallery: business.websiteConfig?.showGallery || false,
        urlSlug: business.websiteConfig?.urlSlug || null
      }
    })

  } catch (error) {
    console.error('Gallery test error:', error)
    return NextResponse.json({ error: 'Failed to get gallery data' }, { status: 500 })
  }
}
