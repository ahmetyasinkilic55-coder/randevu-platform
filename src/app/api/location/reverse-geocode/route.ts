import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude ve longitude gerekli' },
        { status: 400 }
      )
    }

    // OpenStreetMap Nominatim API kullanarak reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr&addressdetails=1&zoom=18`,
      {
        headers: {
          'User-Agent': 'RandeVur-Platform/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding API hatası')
    }

    const data = await response.json()
    
    // Türkiye'deki il ve ilçe bilgilerini çıkar
    const address = data.address || {}
    
    // İl belirleme - Türkiye için özel mapping
    let city = address.state || 
               address.province || 
               address.region || 
               address.admin_level_4 || 
               address.admin_level_2 || 
               address.city ||
               'Bilinmeyen'

    // İlçe belirleme - Türkiye'deki tüm olası alanları kontrol et
    let district = address.county || 
                   address.district || 
                   address.admin_level_6 || 
                   address.admin_level_5 || 
                   address.municipality || 
                   address.suburb || 
                   address.neighbourhood ||
                   address.quarter ||
                   address.city_district ||
                   'Merkez'

    // İl adını temizle ve standartlaştır
    city = city.replace(/\s+(Province|İli|Bölgesi|Region|Belediyesi)$/i, '').trim()
    
    // İlçe adını temizle ve standartlaştır
    district = district.replace(/\s+(İlçesi|District|County|Belediyesi|Municipality)$/i, '').trim()
    
    // Ankara özel durumları
    if (city.toLowerCase().includes('ankara')) {
      city = 'Ankara'
      
      // Ankara'nın merkez ilçeleri için özel kontrol
      const ankaraDistricts = {
        'çankaya': 'Çankaya',
        'keçiören': 'Keçiören', 
        'yenimahalle': 'Yenimahalle',
        'mamak': 'Mamak',
        'sincan': 'Sincan',
        'altındağ': 'Altındağ',
        'gölbaşı': 'Gölbaşı',
        'pursaklar': 'Pursaklar',
        'etimesgut': 'Etimesgut',
        'batıkent': 'Yenimahalle', // Batıkent Yenimahalle'ye bağlı
        'ümitköy': 'Yenimahalle', // Ümitköy Yenimahalle'ye bağlı
        'bilkent': 'Çankaya', // Bilkent Çankaya'ya bağlı
        'kızılay': 'Çankaya', // Kızılay Çankaya'ya bağlı
        'tunali': 'Çankaya', // Tunalı Çankaya'ya bağlı
        'bahçelievler': 'Çankaya' // Bahçelievler Çankaya'ya bağlı
      }
      
      const fullAddress = data.display_name?.toLowerCase() || ''
      
      for (const [key, value] of Object.entries(ankaraDistricts)) {
        if (fullAddress.includes(key) || district.toLowerCase().includes(key)) {
          district = value
          break
        }
      }
      
      // Eğer hala belirsizse, diğer adres alanlarını kontrol et
      if (district === 'Merkez' || district.toLowerCase() === 'ankara') {
        const otherPossibleDistrict = address.town || 
                                    address.village || 
                                    address.hamlet || 
                                    address.residential ||
                                    address.postcode
        
        if (otherPossibleDistrict && otherPossibleDistrict !== city) {
          district = otherPossibleDistrict.replace(/\s+(İlçesi|District|County|Belediyesi)$/i, '').trim()
        }
      }
    }

    // İstanbul özel durumları
    if (city.toLowerCase().includes('istanbul') || city.toLowerCase().includes('İstanbul')) {
      city = 'İstanbul'
      
      // İstanbul'un ilçeleri için mapping yapılabilir
      const istanbulDistricts = {
        'kadıköy': 'Kadıköy',
        'beşiktaş': 'Beşiktaş',
        'üsküdar': 'Üsküdar',
        'fatih': 'Fatih',
        'beyoğlu': 'Beyoğlu',
        'şişli': 'Şişli'
        // Daha fazla eklenebilir
      }
      
      const fullAddress = data.display_name?.toLowerCase() || ''
      
      for (const [key, value] of Object.entries(istanbulDistricts)) {
        if (fullAddress.includes(key) || district.toLowerCase().includes(key)) {
          district = value
          break
        }
      }
    }

    return NextResponse.json({
      city,
      district,
      fullAddress: data.display_name || '',
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      debug: {
        originalCity: address.state || address.province || address.city,
        originalDistrict: address.county || address.district,
        allAddressFields: process.env.NODE_ENV === 'development' ? address : undefined,
        detectedFromFullAddress: data.display_name
      }
    })

  } catch (error) {
    console.error('Reverse geocoding error:', error)
    
    return NextResponse.json(
      { 
        error: 'Konum bilgisi alınamadı',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
