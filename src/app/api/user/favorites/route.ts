import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    if (detailed) {
      // Detaylı favori listesi - favoriler sayfası için
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          business: {
            include: {
              categoryRef: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                  color: true
                }
              },
              subcategory: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                  categoryId: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const businesses = favorites.map(fav => {
        const business = fav.business
        return {
          id: business.id,
          slug: business.slug,
          name: business.name,
          description: business.description,
          category: business.category,
          categoryName: business.categoryRef?.name || getCategoryName(business.category),
          subcategoryId: business.subcategoryId,
          subcategoryName: business.subcategory?.name || getSubcategoryName(business.subcategoryId || undefined),
          
          // Görseller
          image: business.profilePhotoUrl || business.logo || business.coverPhotoUrl || business.coverImage || '/default-business.svg',
          profileImage: business.profilePhotoUrl,
          logo: business.logo,
          coverPhotoUrl: business.coverPhotoUrl,
          
          // Lokasyon bilgileri
          address: business.address,
          province: business.province,
          district: business.district,
          provinceId: business.provinceId,
          districtId: business.districtId,
          latitude: business.latitude,
          longitude: business.longitude,
          
          // İletişim
          phone: business.phone,
          email: business.email,
          website: business.websiteUrl || business.website,
          
          // Durum bilgileri
          isActive: business.isActive,
          isVerified: business.isVerified,
          isPremium: business.isPremium,
          isOpen: true, // Geçici
          
          // Geçici veriler
          rating: 4.5,
          reviewCount: 0,
          nextAvailable: 'Bugün 14:00',
          priceRange: '₺₺',
          tags: [],
          services: [],
          staff: [],
          
          // Zaman damgaları
          createdAt: business.createdAt,
          updatedAt: business.updatedAt,
          favoriteDate: fav.createdAt
        }
      })

      return NextResponse.json({
        businesses,
        total: businesses.length
      })
    } else {
      // Sadece ID listesi - ana sayfa için
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          businessId: true
        }
      })

      const favoriteIds = favorites.map(fav => fav.businessId)

      return NextResponse.json({
        favorites: favoriteIds
      })
    }

  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json(
      { error: 'Favoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // İşletmenin var olduğunu kontrol et
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, isActive: true }
    })

    if (!business || !business.isActive) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      )
    }

    // Zaten favorilerde var mı kontrol et
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_businessId: {
          userId: session.user.id,
          businessId: businessId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Bu işletme zaten favorilerinizde' },
        { status: 400 }
      )
    }

    // Favorilere ekle
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        businessId: businessId
      }
    })

    return NextResponse.json({
      message: 'İşletme favorilere eklendi'
    })

  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json(
      { error: 'Favorilere eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Favorilerden çıkar
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        businessId: businessId
      }
    })

    if (deletedFavorite.count === 0) {
      return NextResponse.json(
        { error: 'Bu işletme favorilerinizde değil' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'İşletme favorilerden çıkarıldı'
    })

  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json(
      { error: 'Favorilerden çıkarılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Yardımcı fonksiyonlar
function getCategoryName(categoryId?: string): string {
  const categories: Record<string, string> = {
    'BARBER': 'Berber',
    'KUAFOR': 'Kuaför', 
    'BEAUTY_SALON': 'Güzellik Salonu',
    'DISHEKIMI': 'Diş Hekimi',
    'OTOYIKAMA': 'Oto Yıkama',
    'SPORSALONU': 'Spor Salonu',
    'GUZELLIKMERKEZI': 'Güzellik Merkezi',
    'VETERINER': 'Veteriner',
    'MASAJ': 'Masaj',
    'DUGUNSALONU': 'Düğün Salonu',
    'KURSMERKEZI': 'Kurs Merkezi',
    'beauty': 'Güzellik & Bakım',
    'health': 'Sağlık Hizmetleri',
    'automotive': 'Otomotiv & Hizmet',
    'events': 'Etkinlik & Mekan',
    'sports': 'Spor & Fitness',
    'education': 'Eğitim & Kurs'
  }
  return categories[categoryId || ''] || 'Diğer'
}

function getSubcategoryName(subcategoryId?: string): string {
  const subcategories: Record<string, string> = {
    'barber': 'Berber',
    'hairdresser': 'Kuaför',
    'beauty_center': 'Güzellik Merkezi',
    'nail_art': 'Nail Art',
    'massage': 'Masaj',
    'skincare': 'Cilt Bakımı',
    'dental': 'Diş Hekimi',
    'vet': 'Veteriner',
    'physiotherapy': 'Fizyoterapi',
    'psychology': 'Psikoloji',
    'optician': 'Optisyen',
    'general_health': 'Genel Sağlık',
    'car_wash': 'Oto Yıkama',
    'car_service': 'Oto Servis',
    'tire_service': 'Lastik Servisi',
    'car_rental': 'Araç Kiralama',
    'inspection': 'Muayene İstasyonu',
    'wedding_hall': 'Düğün Salonu',
    'restaurant': 'Restoran',
    'cafe': 'Kafe',
    'event_hall': 'Etkinlik Salonu',
    'meeting_room': 'Toplantı Salonu',
    'gym': 'Spor Salonu',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'swimming': 'Yüzme',
    'tennis': 'Tenis',
    'personal_trainer': 'Kişisel Antrenör',
    'language': 'Dil Kursu',
    'music': 'Müzik Dersi',
    'art': 'Sanat Dersi',
    'computer': 'Bilgisayar Kursu',
    'driving': 'Sürücü Kursu'
  }
  return subcategories[subcategoryId || ''] || subcategoryId || 'Diğer'
}
