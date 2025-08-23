import { NextRequest, NextResponse } from 'next/server'
import { getProvinces, getDistricts } from '@/lib/location/turkiye-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'provinces' or 'districts' 
    const provinceId = searchParams.get('provinceId')

    if (type === 'provinces') {
      const provinces = await getProvinces()
      return NextResponse.json({ provinces })
    }

    if (type === 'districts' && provinceId) {
      const districts = await getDistricts(parseInt(provinceId))
      return NextResponse.json({ districts })
    }

    return NextResponse.json(
      { error: 'Geçersiz parametreler' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Location API error:', error)
    return NextResponse.json(
      { error: 'Konum bilgileri yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
