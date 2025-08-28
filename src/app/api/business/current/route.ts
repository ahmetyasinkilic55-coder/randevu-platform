import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    // Kullanıcının işletmesini bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            description: true,
            phone: true,
            email: true,
            address: true
          },
          take: 1 // İlk işletmeyi al (çoğu kullanıcının tek işletmesi var)
        }
      }
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    const business = user.businesses[0]
    
    return NextResponse.json(business, { status: 200 })
  } catch (error) {
    console.error('Current business fetch error:', error)
    return NextResponse.json(
      { error: 'İşletme bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
