import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeSubcategories = searchParams.get('include') === 'subcategories'

    if (includeSubcategories) {
      // Alt kategoriler ile birlikte getir
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          subcategories: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      })

      return NextResponse.json({ categories })
    } else {
      // Sadece ana kategoriler
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' }
      })

      return NextResponse.json({ categories })
    }

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
