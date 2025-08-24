import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createGallerySchema = z.object({
  businessId: z.string(),
  imageUrl: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number(),
  isActive: z.boolean()
})

// POST - Yeni galeri fotoğrafı ekle
export async function POST(request: NextRequest) {
  try {
    // Debug: Log database connection info
    const dbUrl = process.env.DATABASE_URL
    const dbInfo = dbUrl ? dbUrl.split('@')[1]?.split('/')[0] || 'Unknown' : 'Not set'
    console.log('🔧 Gallery POST: Using database at:', dbInfo)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createGallerySchema.parse(body)

    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const newPhoto = await prisma.galleryItem.create({
      data: {
        businessId: validatedData.businessId,
        imageUrl: validatedData.imageUrl,
        title: validatedData.title || '',
        description: validatedData.description || '',
        order: validatedData.order,
        isActive: validatedData.isActive,
        type: 'WORK'
      }
    })

    return NextResponse.json({
      message: 'Success',
      photo: newPhoto
    })

  } catch (error) {
    console.error('Gallery error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
