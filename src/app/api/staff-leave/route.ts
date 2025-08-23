import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    // Check if user owns the business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const leaves = await prisma.staffLeave.findMany({
      where: {
        staff: {
          businessId: businessId
        }
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      staffId: leave.staffId,
      staffName: leave.staff.name,
      startDate: leave.startDate.toISOString().split('T')[0],
      endDate: leave.endDate.toISOString().split('T')[0],
      startTime: leave.startTime,
      endTime: leave.endTime,
      type: leave.type,
      reason: leave.reason,
      status: leave.status,
      notes: leave.notes,
      createdAt: leave.createdAt.toISOString()
    }))

    return NextResponse.json({
      leaves: formattedLeaves
    })
  } catch (error) {
    console.error('Error fetching staff leaves:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      businessId,
      staffId,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      reason,
      notes,
      status = 'APPROVED'
    } = await request.json()

    // Validate required fields
    if (!businessId || !staffId || !startDate || !type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user owns the business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if staff belongs to the business
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        businessId: businessId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    const leave = await prisma.staffLeave.create({
      data: {
        staffId,
        startDate: new Date(startDate),
        endDate: new Date(endDate || startDate),
        startTime: type === 'PARTIAL' ? startTime : null,
        endTime: type === 'PARTIAL' ? endTime : null,
        type,
        reason,
        status,
        notes
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const formattedLeave = {
      id: leave.id,
      staffId: leave.staffId,
      staffName: leave.staff.name,
      startDate: leave.startDate.toISOString().split('T')[0],
      endDate: leave.endDate.toISOString().split('T')[0],
      startTime: leave.startTime,
      endTime: leave.endTime,
      type: leave.type,
      reason: leave.reason,
      status: leave.status,
      notes: leave.notes,
      createdAt: leave.createdAt.toISOString()
    }

    return NextResponse.json({
      message: 'Staff leave created successfully',
      leave: formattedLeave
    })
  } catch (error) {
    console.error('Error creating staff leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
