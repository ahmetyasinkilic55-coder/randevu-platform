import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  promotionalMessages: z.boolean()
})

// GET - Bildirim ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Kullanıcının bildirim ayarlarını al
    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Eğer ayarlar yoksa varsayılan ayarları oluştur
    if (!notificationSettings) {
      notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          smsNotifications: true,
          appointmentReminders: true,
          promotionalMessages: false
        }
      })
    }

    return NextResponse.json({
      emailNotifications: notificationSettings.emailNotifications,
      smsNotifications: notificationSettings.smsNotifications,
      appointmentReminders: notificationSettings.appointmentReminders,
      promotionalMessages: notificationSettings.promotionalMessages
    })

  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: 'Bildirim ayarları alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT - Bildirim ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = notificationSettingsSchema.parse(body)

    // Bildirim ayarlarını güncelle veya oluştur
    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        ...validatedData
      }
    })

    return NextResponse.json({
      message: 'Bildirim ayarları başarıyla güncellendi',
      settings: {
        emailNotifications: notificationSettings.emailNotifications,
        smsNotifications: notificationSettings.smsNotifications,
        appointmentReminders: notificationSettings.appointmentReminders,
        promotionalMessages: notificationSettings.promotionalMessages
      }
    })

  } catch (error) {
    console.error('Update notification settings error:', error)

    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0]
      const errorMessage = firstError?.message || 'Geçersiz veri formatı'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Bildirim ayarları güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
