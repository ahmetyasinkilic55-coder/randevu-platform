import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcının işletme bilgilerini getir
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      },
      include: {
        settings: true,
        workingHours: true
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
        address: business.address,
        phone: business.phone,
        email: business.email,
        description: business.description,
        website: business.website,
        profilePhotoUrl: business.profilePhotoUrl,
        coverPhotoUrl: business.coverPhotoUrl,
        isActive: business.isActive,
        settings: business.settings,
        workingHours: business.workingHours
      }
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Kullanıcının işletmesini bul
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // İşletme bilgilerini güncelle
    const updatedBusiness = await prisma.business.update({
      where: {
        id: business.id
      },
      data: {
        name: data.name,
        category: data.category,
        address: data.address,
        phone: data.phone,
        email: data.email,
        description: data.description,
        website: data.website,
        profilePhotoUrl: data.profilePhotoUrl,
        coverPhotoUrl: data.coverPhotoUrl,
        isActive: data.isActive,
        updatedAt: new Date()
      },
      include: {
        settings: true,
        workingHours: true
      }
    })

    return NextResponse.json({
      message: 'Business updated successfully',
      business: updatedBusiness
    })
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
