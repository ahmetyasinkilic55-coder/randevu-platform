import { NextRequest, NextResponse } from 'next/server'
import { BusinessService } from '@/lib/business-service'
import { prisma } from '@/lib/prisma'

// GET /api/businesses/[slug] - Handle both slug and ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    console.log('🔍 [API] Fetching business data for slug/id:', slug)
    
    let business
    
    // Check if it's a CUID (ID) or a slug
    if (slug.startsWith('c') && slug.length > 20) {
      // It's likely a CUID (ID)
      console.log('🔍 [API] Treating as ID:', slug)
      business = await prisma.business.findUnique({
        where: { id: slug },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { popularity: 'desc' }
          },
          staff: {
            where: { isActive: true }
          },
          settings: true,
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' }
          },
          workingHours: {
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      })
    } else {
      // It's a slug, use existing BusinessService
      console.log('🔍 [API] Treating as slug:', slug)
      business = await BusinessService.getBySlug(slug)
    }
    
    if (!business) {
      console.log('❌ [API] Business not found for:', slug)
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Found business:', {
      name: business.name,
      servicesCount: business.services?.length || 0,
      staffCount: business.staff?.length || 0,
      hasSettings: !!business.settings
    })

    // For ID requests, return simplified format for AppointmentModal
    if (slug.startsWith('c') && slug.length > 20) {
      const businessData = {
        id: business.id,
        name: business.name,
        phone: business.phone,
        services: business.services || [],
        staff: business.staff || [],
        settings: business.settings || undefined
      }
      return NextResponse.json(businessData)
    }

    // For slug requests, return full format
    const averageRating = BusinessService.calculateAverageRating(business.reviews)
    const formattedWorkingHours = BusinessService.formatWorkingHours(business.workingHours)

    const response = {
      ...business,
      averageRating,
      formattedWorkingHours
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [API] Error fetching business:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    if (errorStack) {
      console.error('❌ [API] Error stack:', errorStack)
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
