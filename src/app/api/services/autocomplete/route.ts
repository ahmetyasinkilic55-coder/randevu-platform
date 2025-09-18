import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    console.log('Autocomplete API - Query:', query) // DEBUG
    
    if (!query || query.length < 2) {
      console.log('Query too short or empty') // DEBUG
      return NextResponse.json({ services: [] })
    }

    // Hizmetlerde arama yap - büyük/küçük harf duyarsız
    const services = await prisma.service.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        businessId: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 10 // Maksimum 10 öneri
    })

    console.log('Found services:', services.length) // DEBUG
    
    // Her hizmet için business count hesapla
    const servicesWithCount = await Promise.all(
      services.map(async (service) => {
        // Aynı isimde kaç farklı business'ta bu hizmet var
        const distinctBusinesses = await prisma.service.findMany({
          where: {
            name: {
              equals: service.name,
              mode: 'insensitive'
            }
          },
          select: {
            businessId: true
          },
          distinct: ['businessId']
        })
        
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          businessCount: distinctBusinesses.length
        }
      })
    )

    // Unique hizmet isimleri için dedupe yap
    const uniqueServices = servicesWithCount.reduce((acc, service) => {
      const existing = acc.find(s => s.name.toLowerCase() === service.name.toLowerCase())
      if (!existing) {
        acc.push(service)
      }
      return acc
    }, [] as typeof servicesWithCount)

    console.log('Final unique services:', uniqueServices.length) // DEBUG

    return NextResponse.json({
      services: uniqueServices,
      query: query
    })

  } catch (error) {
    console.error('Services autocomplete API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Hizmetler yüklenirken bir hata oluştu',
        services: []
      },
      { status: 500 }
    )
  }
}
