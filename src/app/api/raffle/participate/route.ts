import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppointmentStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' }, 
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' }, 
        { status: 404 }
      )
    }

    const { rightsToUse } = await request.json()

    if (!rightsToUse || rightsToUse <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz hak sayısı' },
        { status: 400 }
      )
    }

    // Current month and year
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Start and end of current month
    const startOfMonth = new Date(currentYear, now.getMonth(), 1)
    const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get completed appointments for current month by email
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        customerEmail: session.user.email,
        status: AppointmentStatus.COMPLETED,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalRights = completedAppointments.length

    // Check existing participations
    const existingParticipations = await prisma.raffleParticipation.findMany({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear
      }
    })

    const usedRights = existingParticipations.reduce((sum, participation) => 
      sum + participation.rightsUsed, 0
    )
    const availableRights = Math.max(0, totalRights - usedRights)

    if (rightsToUse > availableRights) {
      return NextResponse.json(
        { error: `Sadece ${availableRights} adet hakkınız bulunuyor` },
        { status: 400 }
      )
    }

    // Get or create current month's raffle
    const drawDate = new Date(currentYear, now.getMonth() + 1, 0) // Last day of month
    
    let raffle = await prisma.raffle.findFirst({
      where: {
        month: currentMonth,
        year: currentYear
      }
    })

    if (!raffle) {
      // Create prize for this month (static as requested)
      const prize = await prisma.prize.create({
        data: {
          title: "iPhone 15 Pro Max",
          description: "256GB Titan Blue renk iPhone 15 Pro Max. En son teknoloji ve şık tasarımın buluştuğu bu telefon, günlük yaşamınızı kolaylaştıracak.",
          value: 65000,
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=512&h=512&fit=crop&crop=center",
          sponsor: "RandeVur",
          category: "Teknoloji"
        }
      })

      // Create raffle
      raffle = await prisma.raffle.create({
        data: {
          month: currentMonth,
          year: currentYear,
          prizeId: prize.id,
          drawDate,
          isActive: true,
          winnerAnnounced: false
        }
      })
    }

    // Create participation
    const participation = await prisma.raffleParticipation.create({
      data: {
        userId: user.id,
        raffleId: raffle.id,
        month: currentMonth,
        year: currentYear,
        rightsUsed: rightsToUse,
        participatedAt: new Date(),
        won: false // Will be updated when winner is drawn
      }
    })

    return NextResponse.json({
      success: true,
      rightsUsed: rightsToUse,
      participationId: participation.id,
      message: `${rightsToUse} adet hakkınızla çekilişe başarıyla katıldınız!`
    })

  } catch (error) {
    console.error('Raffle participation API error:', error)
    return NextResponse.json(
      { error: 'Çekilişe katılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
