import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const {
      staffId,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      reason,
      notes,
      status
    } = await request.json()

    // Find the existing leave and check permissions
    const existingLeave = await prisma.staffLeave.findFirst({
      where: {
        id,
        staff: {
          business: {
            ownerId: session.user.id
          }
        }
      },
      include: {
        staff: {
          select: {
            businessId: true
          }
        }
      }
    })

    if (!existingLeave) {
      return NextResponse.json({ error: 'Staff leave not found' }, { status: 404 })
    }

    // Check if new staff belongs to the same business (if staffId is being changed)
    if (staffId && staffId !== existingLeave.staffId) {
      const staff = await prisma.staff.findFirst({
        where: {
          id: staffId,
          businessId: existingLeave.staff.businessId
        }
      })

      if (!staff) {
        return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
      }
    }

    const updatedLeave = await prisma.staffLeave.update({
      where: { id },
      data: {
        ...(staffId && { staffId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate || startDate) }),
        ...(type === 'PARTIAL' && startTime ? { startTime } : { startTime: null }),
        ...(type === 'PARTIAL' && endTime ? { endTime } : { endTime: null }),
        ...(type && { type }),
        ...(reason && { reason }),
        ...(status && { status }),
        notes: notes || null
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
      id: updatedLeave.id,
      staffId: updatedLeave.staffId,
      staffName: updatedLeave.staff.name,
      startDate: updatedLeave.startDate.toISOString().split('T')[0],
      endDate: updatedLeave.endDate.toISOString().split('T')[0],
      startTime: updatedLeave.startTime,
      endTime: updatedLeave.endTime,
      type: updatedLeave.type,
      reason: updatedLeave.reason,
      status: updatedLeave.status,
      notes: updatedLeave.notes,
      createdAt: updatedLeave.createdAt.toISOString()
    }

    return NextResponse.json({
      message: 'Staff leave updated successfully',
      leave: formattedLeave
    })
  } catch (error) {
    console.error('Error updating staff leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the existing leave and check permissions
    const existingLeave = await prisma.staffLeave.findFirst({
      where: {
        id,
        staff: {
          business: {
            ownerId: session.user.id
          }
        }
      }
    })

    if (!existingLeave) {
      return NextResponse.json({ error: 'Staff leave not found' }, { status: 404 })
    }

    await prisma.staffLeave.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Staff leave deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting staff leave:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
