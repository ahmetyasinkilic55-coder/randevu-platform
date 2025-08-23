import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Create test consultation requests
    const consultationRequests = await Promise.all([
      prisma.consultationRequest.create({
        data: {
          businessId,
          customerName: 'Ahmet Yılmaz',
          customerPhone: '0532 123 45 67',
          customerEmail: 'ahmet@example.com',
          consultationTopic: 'Web sitesi tasarımı hakkında bilgi almak istiyorum',
          preferredDateTime: new Date('2024-12-25T14:00:00Z'),
          meetingType: 'ONLINE',
          status: 'PENDING',
          notes: 'E-ticaret sitesi için modern bir tasarım istiyorum. Örnekleri görmek isterim.'
        }
      }),
      prisma.consultationRequest.create({
        data: {
          businessId,
          customerName: 'Ayşe Kaya',
          customerPhone: '0505 987 65 43',
          customerEmail: 'ayse@example.com',
          consultationTopic: 'Mobil uygulama geliştirme danışmanlığı',
          preferredDateTime: new Date('2024-12-26T10:30:00Z'),
          meetingType: 'FACE_TO_FACE',
          status: 'RESPONDED',
          notes: 'iOS ve Android uygulaması geliştirmek istiyorum. Süreç ve maliyetler hakkında bilgi almak istiyorum.',
          businessResponse: 'Merhaba Ayşe Hanım, mobil uygulama geliştirme konusunda detaylı görüşmek için randevunuzu onaylıyorum. Yarın saat 10:30\'da ofisimizde buluşabiliriz.',
          responseDate: new Date()
        }
      }),
      prisma.consultationRequest.create({
        data: {
          businessId,
          customerName: 'Mehmet Demir',
          customerPhone: '0543 876 54 32',
          customerEmail: 'mehmet@example.com',
          consultationTopic: 'SEO ve dijital pazarlama stratejisi',
          preferredDateTime: new Date('2024-12-24T16:00:00Z'),
          meetingType: 'PHONE',
          status: 'COMPLETED',
          notes: 'Mevcut web sitem var ama Google\'da çıkmıyor. SEO çalışması yaptırmak istiyorum.',
          businessResponse: 'Mehmet Bey ile görüşmemiz tamamlandı. SEO analizi yapıldı ve 3 aylık strateji planı hazırlandı.',
          responseDate: new Date()
        }
      })
    ])

    // Create test project requests
    const projectRequests = await Promise.all([
      prisma.projectRequest.create({
        data: {
          businessId,
          customerName: 'Fatma Özkan',
          customerPhone: '0533 456 78 90',
          customerEmail: 'fatma@example.com',
          projectDescription: 'Restoran işletmem için kapsamlı bir web sitesi ve online sipariş sistemi geliştirmek istiyorum. Menü yönetimi, sipariş takibi ve ödeme entegrasyonu olmalı.',
          estimatedBudget: 15000,
          preferredDate: new Date('2025-01-15T00:00:00Z'),
          location: 'İstanbul, Kadıköy',
          status: 'PENDING'
        }
      }),
      prisma.projectRequest.create({
        data: {
          businessId,
          customerName: 'Can Arslan',
          customerPhone: '0544 321 98 76',
          customerEmail: 'can@example.com',
          projectDescription: 'Muhasebe firması için müşteri yönetim sistemi geliştirmek istiyorum. Fatura oluşturma, müşteri takibi ve raporlama özellikleri olmalı.',
          estimatedBudget: 25000,
          preferredDate: new Date('2025-02-01T00:00:00Z'),
          location: 'Ankara, Çankaya',
          status: 'RESPONDED',
          businessResponse: 'Can Bey, projeniz için detaylı teklifimizi hazırladık. Muhasebe sisteminde 20 yıllık deneyimimizle size en uygun çözümü sunabiliriz. 22.500 TL + KDV ile projeyi teslim edebiliriz.',
          estimatedPrice: 22500,
          responseDate: new Date()
        }
      }),
      prisma.projectRequest.create({
        data: {
          businessId,
          customerName: 'Zeynep Yıldız',
          customerPhone: '0555 789 12 34',
          customerEmail: 'zeynep@example.com',
          projectDescription: 'E-ticaret sitesi için envanter yönetim sistemi geliştirmek istiyorum. Stok takibi, otomatik sipariş alma ve tedarikçi entegrasyonu gerekli.',
          estimatedBudget: 30000,
          preferredDate: new Date('2025-01-20T00:00:00Z'),
          location: 'İzmir, Bornova',
          status: 'COMPLETED',
          businessResponse: 'Zeynep Hanım, projeniz başarıyla tamamlandı. Envanter sistemi aktif olarak çalışıyor ve eğitimler verildi.',
          estimatedPrice: 28000,
          responseDate: new Date()
        }
      }),
      prisma.projectRequest.create({
        data: {
          businessId,
          customerName: 'Burak Şahin',
          customerPhone: '0534 567 89 01',
          customerEmail: 'burak@example.com',
          projectDescription: 'Spor salonu üye yönetim sistemi geliştirmek istiyorum. Üyelik takibi, ödeme yönetimi, kişisel antrenör rezervasyonu ve beslenme programı özellikleri olmalı.',
          estimatedBudget: 18000,
          preferredDate: new Date('2025-03-01T00:00:00Z'),
          location: 'Bursa, Nilüfer',
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: 'Test data created successfully',
      data: {
        consultationRequests: consultationRequests.length,
        projectRequests: projectRequests.length
      }
    })

  } catch (error) {
    console.error('Error creating test data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
