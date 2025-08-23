import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Önce veritabanı bağlantısını test edelim
    const testConnection = await prisma.business.count()
    console.log(`Database connection OK. Total businesses: ${testConnection}`)

    // Kategorileri de kontrol edelim
    const categoryCount = await prisma.category.count()
    const subcategoryCount = await prisma.subcategory.count()
    console.log(`Categories: ${categoryCount}, Subcategories: ${subcategoryCount}`)

    // İlk birkaç işletmeyi logla
    const sampleBusinesses = await prisma.business.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        categoryId: true,
        subcategoryId: true,
        province: true,
        district: true
      }
    })
    console.log('Sample businesses:', JSON.stringify(sampleBusinesses, null, 2))

    // İlk birkaç kategoriyi logla
    const sampleCategories = await prisma.category.findMany({
      take: 3,
      include: {
        subcategories: {
          take: 2
        }
      }
    })
    console.log('Sample categories:', JSON.stringify(sampleCategories, null, 2))

    return NextResponse.json({
      message: 'Database debug info logged to console',
      businessCount: testConnection,
      categoryCount,
      subcategoryCount
    })

  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: String(error) },
      { status: 500 }
    )
  }
}
