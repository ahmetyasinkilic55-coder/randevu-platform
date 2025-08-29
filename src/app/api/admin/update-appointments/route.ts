import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get all appointments to check their dates
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        date: true,
        customerName: true
      }
    })

    return NextResponse.json({
      success: true,
      totalCount: appointments.length,
      appointments: appointments.slice(0, 10), // Return first 10 for preview
      message: `Found ${appointments.length} appointments`
    })

  } catch (error) {
    console.error('Fetch appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
