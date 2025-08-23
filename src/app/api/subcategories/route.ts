import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori ID gerekli' },
        { status: 400 }
      )
    }

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId,
        isActive: true
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({ subcategories })

  } catch (error) {
    console.error('Subcategories fetch error:', error)
    return NextResponse.json(
      { error: 'Alt kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
