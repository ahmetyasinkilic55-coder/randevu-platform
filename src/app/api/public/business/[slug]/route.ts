import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'İşletme slug\'ı gerekli' },
        { status: 400 }
      )
    }

    // İşletmeyi slug ile bul
    const business = await prisma.business.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        profilePhotoUrl: true,
        logo: true,
        coverImage: true,
        coverPhotoUrl: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        websiteUrl: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        latitude: true,
        longitude: true,
        established: true,
        languages: true,
        instagramUrl: true,
        facebookUrl: true,
        tiktokUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // İşletme bilgilerini zenginleştir
    const enrichedBusiness = {
      ...business,
      profileImage: business.profilePhotoUrl || business.logo || business.coverPhotoUrl || business.coverImage,
      // Kategori adını ekle
      categoryName: getCategoryName(business.category),
    }

    return NextResponse.json({
      business: enrichedBusiness
    })

  } catch (error) {
    console.error('Business detail API error:', error)
    
    return NextResponse.json(
      { 
        error: 'İşletme bilgileri yüklenirken bir hata oluştu',
      },
      { status: 500 }
    )
  }
}

// Kategori çeviri fonksiyonu
function getCategoryName(categoryId?: string): string {
  const categories: Record<string, string> = {
    'beauty': 'Güzellik & Bakım',
    'health': 'Sağlık Hizmetleri',
    'automotive': 'Otomotiv & Hizmet',
    'events': 'Etkinlik & Mekan',
    'sports': 'Spor & Fitness',
    'education': 'Eğitim & Kurs'
  }
  return categories[categoryId || ''] || 'Diğer'
}