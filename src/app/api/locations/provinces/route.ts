import { NextRequest, NextResponse } from 'next/server'
import { getProvinces } from '@/lib/location/turkiye-api'

export async function GET(request: NextRequest) {
  try {
    const provinces = await getProvinces()
    
    return NextResponse.json({
      provinces: provinces.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    })
    
  } catch (error) {
    console.error('Provinces API error:', error)
    return NextResponse.json(
      { error: 'İller yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
