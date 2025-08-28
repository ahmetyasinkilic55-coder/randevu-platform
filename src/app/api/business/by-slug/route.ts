import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug gerekli' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        phone: true,
        email: true,
        address: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(business, { status: 200 })
  } catch (error) {
    console.error('Business by slug fetch error:', error)
    return NextResponse.json(
      { error: 'İşletme bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
