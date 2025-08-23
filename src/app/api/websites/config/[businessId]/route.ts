import { NextRequest, NextResponse } from 'next/server'
import { BusinessService } from '@/lib/business-service'

// PUT /api/websites/[businessId] - Update website configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params
    const body = await request.json()

    const updatedConfig = await BusinessService.updateWebsiteConfig(businessId, body)

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error updating website config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
