import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const websiteConfigs = await prisma.websiteConfig.findMany({
      select: {
        id: true,
        urlSlug: true,
        heroTitle: true,
        heroSubtitle: true,
        isPublished: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      count: websiteConfigs.length,
      configs: websiteConfigs
    })

  } catch (error) {
    console.error('Debug slugs error:', error)
    return NextResponse.json(
      { error: 'Debug failed' },
      { status: 500 }
    )
  }
}
