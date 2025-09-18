import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parametrelerini al
    const provinceId = searchParams.get('provinceId') // Artık ID ile çalışıyoruz
    const districtId = searchParams.get('districtId') // Artık ID ile çalışıyoruz
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    console.log('API Request params:', { provinceId, districtId, category, subcategory, search })

    // Prisma query builder
    const whereClause: any = {
      isActive: true,
    }

    // İl filtresi - artık ID ile
    if (provinceId) {
      whereClause.provinceId = parseInt(provinceId)
    }

    // İlçe filtresi - artık ID ile
    if (districtId) {
      whereClause.districtId = parseInt(districtId)
    }

    // Alt kategori filtresi
    if (subcategory) {
      whereClause.subcategoryId = subcategory
    }

    // Ana kategori filtresi
    if (category && !subcategory) {
      whereClause.categoryId = category
    }

    // Arama filtresi - büyük/küçük harf duyarsız ve hizmetlerde arama
    if (search) {
      const searchLower = search.toLowerCase();
      whereClause.OR = [
        {
          name: {
            contains: searchLower,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: searchLower,
            mode: 'insensitive'
          }
        },
        // Hizmetlerde arama
        {
          services: {
            some: {
              name: {
                contains: searchLower,
                mode: 'insensitive'
              }
            }
          }
        },
        // Kategori adında arama
        {
          categoryRef: {
            name: {
              contains: searchLower,
              mode: 'insensitive'
            }
          }
        },
        // Alt kategori adında arama
        {
          subcategory: {
            name: {
              contains: searchLower,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    console.log('Where clause:', JSON.stringify(whereClause, null, 2))

    // İşletmeleri getir - kategoriler ve alt kategoriler ile birlikte
    const businesses = await prisma.business.findMany({
      where: whereClause,
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
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: [
        { isPremium: 'desc' },
        { isVerified: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    })

    console.log(`Found ${businesses.length} businesses`)

    // Basit veriler ile response döndür
    const enrichedBusinesses = businesses.map(business => ({
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      category: business.category,
      categoryName: business.categoryRef?.name || getCategoryName(business.category),
      subcategoryId: business.subcategoryId,
      subcategoryName: business.subcategory?.name || getSubcategoryName(business.subcategoryId || undefined),
      
      // Görseller - öncelik sırası
      image: business.profilePhotoUrl || business.logo || business.coverPhotoUrl || business.coverImage || '/default-business.svg',
      profileImage: business.profilePhotoUrl,
      logo: business.logo,
      coverPhotoUrl: business.coverPhotoUrl,
      
      // Lokasyon bilgileri - Artık ID'ler ve gerçek isimler
      address: business.address,
      province: business.province, // İl adı (string)
      district: business.district, // İlçe adı (string)
      provinceId: business.provinceId, // İl ID (number)
      districtId: business.districtId, // İlçe ID (number)
      latitude: business.latitude,
      longitude: business.longitude,
      
      // İletişim
      phone: business.phone,
      email: business.email,
      website: business.websiteUrl || business.website,
      
      // Sosyal medya
      instagramUrl: business.instagramUrl,
      facebookUrl: business.facebookUrl,
      tiktokUrl: business.tiktokUrl,
      
      // İş bilgileri
      established: business.established,
      languages: business.languages ? tryParseJSON(business.languages) : [],
      
      // Durum bilgileri
      isActive: business.isActive,
      isVerified: business.isVerified,
      isPremium: business.isPremium,
      isOpen: true, // Geçici - çalışma saatleri olmadan
      
      // Dinamik veriler
      rating: 4.5,
      reviewCount: 0,
      nextAvailable: 'Bugün 14:00',
      priceRange: '₺₺',
      tags: [],
      services: business.services || [],
      staff: [],
      
      // Zaman damgaları
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }))

    return NextResponse.json({
      businesses: enrichedBusinesses,
      total: enrichedBusinesses.length,
      hasMore: enrichedBusinesses.length === 50,
      filters: {
        provinceId,
        districtId,
        category,
        subcategory,
        search
      }
    })

  } catch (error) {
    console.error('Public businesses API error:', error)
    
    return NextResponse.json(
      { 
        error: 'İşletmeler yüklenirken bir hata oluştu',
        businesses: [],
        total: 0,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Yardımcı fonksiyonlar
function tryParseJSON(jsonString: string | null) {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return []
  }
}

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
