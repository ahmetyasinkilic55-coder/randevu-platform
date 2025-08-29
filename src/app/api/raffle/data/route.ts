import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppointmentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
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

    // Current month and year
    const now = new Date()
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0')
    const currentYear = now.getFullYear()

    // Start and end of current month
    const startOfMonth = new Date(currentYear, now.getMonth(), 1)
    const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get completed appointments for current month by email
    const eligibleAppointments = await prisma.appointment.findMany({
      where: {
        customerEmail: session.user.email,
        status: AppointmentStatus.COMPLETED,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        business: {
          select: {
            name: true,
            slug: true,
            profilePhotoUrl: true,
            category: true
          }
        },
        service: {
          select: {
            name: true,
            price: true,
            duration: true
          }
        },
        staff: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Calculate raffle rights
    const totalRights = eligibleAppointments.length
    
    // Get used rights for current month
    const raffleParticipations = await prisma.raffleParticipation.findMany({
      where: {
        userId: user.id,
        month: parseInt(currentMonth),
        year: currentYear
      }
    })

    const usedRights = raffleParticipations.reduce((sum, participation) => 
      sum + participation.rightsUsed, 0
    )
    const availableRights = Math.max(0, totalRights - usedRights)

    // Get current month's prize (static for now as requested)
    const currentPrize = {
      id: `prize-${currentMonth}-${currentYear}`,
      title: "iPhone 15 Pro Max",
      description: "256GB Titan Blue renk iPhone 15 Pro Max. En son teknoloji ve şık tasarımın buluştuğu bu telefon, günlük yaşamınızı kolaylaştıracak.",
      value: 65000,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=512&h=512&fit=crop&crop=center",
      sponsor: "RandeVur",
      category: "Teknoloji"
    }

    // Get raffle history
    const raffleHistory = await prisma.raffleParticipation.findMany({
      where: {
        userId: user.id,
        NOT: {
          AND: [
            { month: parseInt(currentMonth) },
            { year: currentYear }
          ]
        }
      },
      include: {
        raffle: {
          include: {
            prize: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    // Format raffle history
    const formattedHistory = raffleHistory.map(participation => ({
      id: participation.id,
      month: participation.month.toString(),
      year: participation.year,
      participatedRights: participation.rightsUsed,
      won: participation.won || false,
      prize: participation.raffle?.prize ? {
        title: participation.raffle.prize.title,
        description: participation.raffle.prize.description,
        value: participation.raffle.prize.value,
        image: participation.raffle.prize.image
      } : undefined,
      winnerAnnounced: participation.raffle?.winnerAnnounced || false,
      drawDate: participation.raffle?.drawDate?.toISOString() || new Date().toISOString()
    }))

    // Format eligible appointments
    const formattedAppointments = eligibleAppointments.map(appointment => {
      // Extract time from date field (appointment.date is DateTime)
      const appointmentTime = appointment.date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return {
        id: appointment.id,
        date: appointment.date.toISOString(),
        time: appointmentTime, // Extract time from DateTime
        business: {
          name: appointment.business.name,
          slug: appointment.business.slug,
          profilePhotoUrl: appointment.business.profilePhotoUrl,
          category: appointment.business.category
        },
        service: {
          name: appointment.service.name,
          price: appointment.service.price,
          duration: appointment.service.duration
        },
        staff: appointment.staff ? {
          name: appointment.staff.name
        } : undefined,
        completedAt: appointment.updatedAt.toISOString(),
        raffleRightEarned: true
      }
    })

    // Next draw date (last day of current month)
    const nextDrawDate = new Date(currentYear, now.getMonth() + 1, 0)

    const responseData = {
      currentMonth,
      year: currentYear,
      totalRights,
      usedRights,
      availableRights,
      eligibleAppointments: formattedAppointments,
      currentPrize,
      raffleHistory: formattedHistory,
      nextDrawDate: nextDrawDate.toISOString()
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Raffle data API error:', error)
    return NextResponse.json(
      { error: 'Çekiliş bilgileri yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
