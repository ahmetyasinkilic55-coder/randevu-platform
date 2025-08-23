import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const staffSchema = z.object({
  name: z.string().min(2, 'Personel adı en az 2 karakter olmalı'),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir email adresi girin').optional().or(z.literal('')),
  specialty: z.string().optional(),
  experience: z.number().min(0, 'Deneyim 0\'dan küçük olamaz').optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  businessId: z.string()
})

// GET - İşletmenin tüm personellerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'İşletme ID gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Personelleri getir
    const staff = await prisma.staff.findMany({
      where: {
        businessId: businessId
      },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                date: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ staff })

  } catch (error) {
    console.error('Get staff error:', error)
    return NextResponse.json(
      { error: 'Personeller alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Yeni personel oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = staffSchema.parse(body)

    // Kullanıcının bu işletmenin sahibi olduğunu kontrol et
    const business = await prisma.business.findFirst({
      where: {
        id: validatedData.businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Personeli oluştur
    const staff = await prisma.staff.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        specialty: validatedData.specialty || null,
        experience: validatedData.experience || null,
        bio: validatedData.bio || null,
        photoUrl: validatedData.photoUrl || null,
        isActive: validatedData.isActive,
        businessId: validatedData.businessId
      }
    })

    return NextResponse.json(
      { 
        message: 'Personel başarıyla oluşturuldu',
        staff
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create staff error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Personel oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
