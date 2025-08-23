import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, appointmentId, timestamp, participant, role } = body

    console.log('Video call tracking:', { action, appointmentId, participant, role })

    switch (action) {
      case 'START':
        // Video call başladığında kaydet
        await prisma.videoCall.upsert({
          where: { appointmentId },
          update: {
            startedAt: new Date(timestamp),
            status: 'LIVE',
            updatedAt: new Date()
          },
          create: {
            appointmentId,
            startedAt: new Date(timestamp),
            status: 'LIVE',
            participants: [participant],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        // Appointment'ın video call field'ini güncelle
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { 
            status: 'IN_PROGRESS',
            updatedAt: new Date()
          }
        })
        
        console.log('Video call started for appointment:', appointmentId)
        break

      case 'JOIN':
        // Katılımcı katıldığında
        const existingCall = await prisma.videoCall.findUnique({
          where: { appointmentId }
        })
        
        if (existingCall) {
          const currentParticipants = existingCall.participants as string[] || []
          if (!currentParticipants.includes(participant)) {
            await prisma.videoCall.update({
              where: { appointmentId },
              data: {
                participants: [...currentParticipants, participant],
                updatedAt: new Date()
              }
            })
          }
        }
        
        console.log('Participant joined:', participant)
        break

      case 'END':
        // Video call bittiğinde
        const videoCall = await prisma.videoCall.findUnique({
          where: { appointmentId }
        })
        
        if (videoCall) {
          const duration = videoCall.startedAt 
            ? Math.round((new Date(timestamp).getTime() - videoCall.startedAt.getTime()) / 1000 / 60)
            : 0
          
          await prisma.videoCall.update({
            where: { appointmentId },
            data: {
              endedAt: new Date(timestamp),
              duration,
              status: 'COMPLETED',
              updatedAt: new Date()
            }
          })
          
          // Appointment'ı tamamla
          await prisma.appointment.update({
            where: { id: appointmentId },
            data: { 
              status: 'COMPLETED',
              updatedAt: new Date()
            }
          })
          
          console.log('Video call ended. Duration:', duration, 'minutes')
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true,
      message: `Video call ${action.toLowerCase()} tracked successfully`
    })

  } catch (error) {
    console.error('Video call tracking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Video call tracking failed',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const userId = searchParams.get('userId') || session.user.id

    if (appointmentId) {
      // Specific appointment video call info
      const videoCall = await prisma.videoCall.findUnique({
        where: { appointmentId },
        include: {
          appointment: {
            select: {
              id: true,
              customerName: true,
              business: {
                select: {
                  name: true
                }
              },
              date: true,
              status: true
            }
          }
        }
      })

      return NextResponse.json({ videoCall })
    }

    if (userId) {
      // User's video call history
      const videoCalls = await prisma.videoCall.findMany({
        where: {
          appointment: {
            OR: [
              { customerEmail: session.user.email },
              { business: { ownerId: userId } }
            ]
          }
        },
        include: {
          appointment: {
            select: {
              id: true,
              customerName: true,
              business: {
                select: {
                  name: true
                }
              },
              date: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })

      return NextResponse.json({ videoCalls })
    }

    return NextResponse.json(
      { error: 'appointmentId or userId required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Video call get error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch video call data' },
      { status: 500 }
    )
  }
}
