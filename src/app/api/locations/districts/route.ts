import { NextRequest, NextResponse } from 'next/server'
import { getDistricts } from '@/lib/location/turkiye-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provinceId = searchParams.get('provinceId')
    
    if (!provinceId) {
      return NextResponse.json(
        { error: 'provinceId parametresi gerekli' },
        { status: 400 }
      )
    }
    
    const districts = await getDistricts(parseInt(provinceId))
    
    return NextResponse.json({
      districts: districts.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    })
    
  } catch (error) {
    console.error('Districts API error:', error)
    return NextResponse.json(
      { error: 'İlçeler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
