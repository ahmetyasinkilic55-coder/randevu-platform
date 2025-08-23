// Türkiye il/ilçe API servisleri

export interface Province {
  id: number
  name: string
  latitude: string
  longitude: string
}

export interface District {
  id: number
  name: string
  province_id: number
  latitude: string
  longitude: string
}

// Fallback il verileri (API çalışmazsa)
function getFallbackProvinces(): Province[] {
  return [
    { id: 1, name: 'Adana', latitude: '37.0000', longitude: '35.3213' },
    { id: 2, name: 'Adıyaman', latitude: '37.7648', longitude: '38.2786' },
    { id: 3, name: 'Afyonkarahisar', latitude: '38.7507', longitude: '30.5567' },
    { id: 4, name: 'Ağrı', latitude: '39.7191', longitude: '43.0503' },
    { id: 5, name: 'Amasya', latitude: '40.6499', longitude: '35.8353' },
    { id: 6, name: 'Ankara', latitude: '39.9334', longitude: '32.8597' },
    { id: 7, name: 'Antalya', latitude: '36.8969', longitude: '30.7133' },
    { id: 8, name: 'Artvin', latitude: '41.1828', longitude: '41.8183' },
    { id: 9, name: 'Aydın', latitude: '37.8560', longitude: '27.8416' },
    { id: 10, name: 'Balıkesir', latitude: '39.6484', longitude: '27.8826' },
    { id: 11, name: 'Bilecik', latitude: '40.1553', longitude: '29.9833' },
    { id: 12, name: 'Bingöl', latitude: '38.8938', longitude: '40.4967' },
    { id: 13, name: 'Bitlis', latitude: '38.4006', longitude: '42.1069' },
    { id: 14, name: 'Bolu', latitude: '40.5760', longitude: '31.5788' },
    { id: 15, name: 'Burdur', latitude: '37.4613', longitude: '30.0665' },
    { id: 16, name: 'Bursa', latitude: '40.1826', longitude: '29.0665' },
    { id: 17, name: 'Çanakkale', latitude: '40.1553', longitude: '26.4142' },
    { id: 18, name: 'Çankırı', latitude: '40.6013', longitude: '33.6134' },
    { id: 19, name: 'Çorum', latitude: '40.5506', longitude: '34.9556' },
    { id: 20, name: 'Denizli', latitude: '37.7765', longitude: '29.0864' },
    { id: 21, name: 'Diyarbakır', latitude: '37.9144', longitude: '40.2306' },
    { id: 22, name: 'Edirne', latitude: '41.6818', longitude: '26.5623' },
    { id: 23, name: 'Elazığ', latitude: '38.6810', longitude: '39.2264' },
    { id: 24, name: 'Erzincan', latitude: '39.7500', longitude: '39.5000' },
    { id: 25, name: 'Erzurum', latitude: '39.9000', longitude: '41.2700' },
    { id: 26, name: 'Eskişehir', latitude: '39.7667', longitude: '30.5256' },
    { id: 27, name: 'Gaziantep', latitude: '37.0662', longitude: '37.3833' },
    { id: 28, name: 'Giresun', latitude: '40.9128', longitude: '38.3895' },
    { id: 29, name: 'Gümüşhane', latitude: '40.4602', longitude: '39.5081' },
    { id: 30, name: 'Hakkari', latitude: '37.5744', longitude: '43.7408' },
    { id: 31, name: 'Hatay', latitude: '36.4018', longitude: '36.3498' },
    { id: 32, name: 'Isparta', latitude: '37.7648', longitude: '30.5566' },
    { id: 33, name: 'Mersin', latitude: '36.8121', longitude: '34.6415' },
    { id: 34, name: 'İstanbul', latitude: '41.0082', longitude: '28.9784' },
    { id: 35, name: 'İzmir', latitude: '38.4192', longitude: '27.1287' },
    { id: 36, name: 'Kars', latitude: '40.6167', longitude: '43.1167' },
    { id: 37, name: 'Kastamonu', latitude: '41.3887', longitude: '33.7827' },
    { id: 38, name: 'Kayseri', latitude: '38.7312', longitude: '35.4787' },
    { id: 39, name: 'Kırklareli', latitude: '41.7333', longitude: '27.2167' },
    { id: 40, name: 'Kırşehir', latitude: '39.1425', longitude: '34.1709' },
    { id: 41, name: 'Kocaeli', latitude: '40.8533', longitude: '29.8815' },
    { id: 42, name: 'Konya', latitude: '37.8667', longitude: '32.4833' },
    { id: 43, name: 'Kütahya', latitude: '39.4167', longitude: '29.9833' },
    { id: 44, name: 'Malatya', latitude: '38.3552', longitude: '38.3095' },
    { id: 45, name: 'Manisa', latitude: '38.6191', longitude: '27.4289' },
    { id: 46, name: 'Kahramanmaraş', latitude: '37.5858', longitude: '36.9371' },
    { id: 47, name: 'Mardin', latitude: '37.3212', longitude: '40.7245' },
    { id: 48, name: 'Muğla', latitude: '37.2153', longitude: '28.3636' },
    { id: 49, name: 'Muş', latitude: '38.9462', longitude: '41.7539' },
    { id: 50, name: 'Nevşehir', latitude: '38.6939', longitude: '34.6857' },
    { id: 51, name: 'Niğde', latitude: '37.9667', longitude: '34.6833' },
    { id: 52, name: 'Ordu', latitude: '40.9839', longitude: '37.8764' },
    { id: 53, name: 'Rize', latitude: '41.0201', longitude: '40.5234' },
    { id: 54, name: 'Sakarya', latitude: '40.6940', longitude: '30.4358' },
    { id: 55, name: 'Samsun', latitude: '41.2928', longitude: '36.3313' },
    { id: 56, name: 'Siirt', latitude: '37.9333', longitude: '41.9500' },
    { id: 57, name: 'Sinop', latitude: '42.0231', longitude: '35.1531' },
    { id: 58, name: 'Sivas', latitude: '39.7477', longitude: '37.0179' },
    { id: 59, name: 'Tekirdağ', latitude: '40.9833', longitude: '27.5167' },
    { id: 60, name: 'Tokat', latitude: '40.3167', longitude: '36.5500' },
    { id: 61, name: 'Trabzon', latitude: '41.0015', longitude: '39.7178' },
    { id: 62, name: 'Tunceli', latitude: '39.3074', longitude: '39.4388' },
    { id: 63, name: 'Şanlıurfa', latitude: '37.1591', longitude: '38.7969' },
    { id: 64, name: 'Uşak', latitude: '38.6823', longitude: '29.4082' },
    { id: 65, name: 'Van', latitude: '38.4891', longitude: '43.4089' },
    { id: 66, name: 'Yozgat', latitude: '39.8181', longitude: '34.8147' },
    { id: 67, name: 'Zonguldak', latitude: '41.4564', longitude: '31.7987' },
    { id: 68, name: 'Aksaray', latitude: '38.3687', longitude: '34.0370' },
    { id: 69, name: 'Bayburt', latitude: '40.2552', longitude: '40.2249' },
    { id: 70, name: 'Karaman', latitude: '37.1759', longitude: '33.2287' },
    { id: 71, name: 'Kırıkkale', latitude: '39.8468', longitude: '33.5153' },
    { id: 72, name: 'Batman', latitude: '37.8812', longitude: '41.1351' },
    { id: 73, name: 'Şırnak', latitude: '37.4187', longitude: '42.4918' },
    { id: 74, name: 'Bartın', latitude: '41.5811', longitude: '32.4610' },
    { id: 75, name: 'Ardahan', latitude: '41.1105', longitude: '42.7022' },
    { id: 76, name: 'Iğdır', latitude: '39.8880', longitude: '44.0048' },
    { id: 77, name: 'Yalova', latitude: '40.6500', longitude: '29.2667' },
    { id: 78, name: 'Karabük', latitude: '41.2061', longitude: '32.6204' },
    { id: 79, name: 'Kilis', latitude: '36.7184', longitude: '37.1212' },
    { id: 80, name: 'Osmaniye', latitude: '37.2130', longitude: '36.1763' },
    { id: 81, name: 'Düzce', latitude: '40.8438', longitude: '31.1565' }
  ]
}

// Fallback ilçe verileri (sadece başlıca şehirler için)
function getFallbackDistricts(provinceId: number): District[] {
  const districts: { [key: number]: District[] } = {
    6: [ // Ankara
      { id: 1434, name: 'Altındağ', province_id: 6, latitude: '39.9334', longitude: '32.8597' },
      { id: 1396, name: 'Çankaya', province_id: 6, latitude: '39.9334', longitude: '32.8597' },
      { id: 1418, name: 'Keçiören', province_id: 6, latitude: '39.9334', longitude: '32.8597' },
      { id: 1444, name: 'Yenimahalle', province_id: 6, latitude: '39.9334', longitude: '32.8597' },
      { id: 1403, name: 'Etimesgut', province_id: 6, latitude: '39.9334', longitude: '32.8597' },
      { id: 1441, name: 'Sincan', province_id: 6, latitude: '39.9334', longitude: '32.8597' }
    ],
    34: [ // İstanbul 
      { id: 449, name: 'Fatih', province_id: 34, latitude: '41.0082', longitude: '28.9784' },
      { id: 447, name: 'Beyoğlu', province_id: 34, latitude: '41.0082', longitude: '28.9784' },
      { id: 463, name: 'Üsküdar', province_id: 34, latitude: '41.0082', longitude: '28.9784' },
      { id: 450, name: 'Kadıköy', province_id: 34, latitude: '41.0082', longitude: '28.9784' },
      { id: 448, name: 'Beşiktaş', province_id: 34, latitude: '41.0082', longitude: '28.9784' }
    ],
    35: [ // İzmir
      { id: 490, name: 'Konak', province_id: 35, latitude: '38.4192', longitude: '27.1287' },
      { id: 482, name: 'Bornova', province_id: 35, latitude: '38.4192', longitude: '27.1287' },
      { id: 485, name: 'Karşıyaka', province_id: 35, latitude: '38.4192', longitude: '27.1287' }
    ]
  }
  
  return districts[provinceId] || []
}

// Türkiye'deki tüm illeri getir
export async function getProvinces(): Promise<Province[]> {
  try {
    console.log('🔄 İller yükleniyor...')
    const response = await fetch('https://turkiyeapi.dev/api/v1/provinces')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📡 İller API Response:', {
      status: response.status,
      dataType: typeof data,
      hasStatus: 'status' in data,
      apiStatus: data.status,
      hasData: 'data' in data,
      dataLength: data.data?.length,
      isArray: Array.isArray(data),
      arrayLength: Array.isArray(data) ? data.length : 'N/A'
    })
    
    // API response'da status: "OK" ve data array'i var
    if (data.status === 'OK' && Array.isArray(data.data)) {
      console.log('✅ İller başarıyla yüklendi:', data.data.length)
      return data.data.map((province: any) => ({
        id: province.id,
        name: province.name,
        latitude: province.coordinates?.latitude?.toString() || '0',
        longitude: province.coordinates?.longitude?.toString() || '0'
      }))
    }
    
    console.warn('⚠️ API response yapısı beklenenden farklı:', data)
    console.log('🛡️ Fallback sisteme geçiliyor...')
    return getFallbackProvinces()
  } catch (error) {
    console.error('❌ İller yüklenirken hata:', error)
    console.log('🛡️ Fallback sisteme geçiliyor...')
    return getFallbackProvinces()
  }
}

// Belirli bir ile ait ilçeleri getir
export async function getDistricts(provinceId: number): Promise<District[]> {
  try {
    console.log(`🔄 İlçeler yükleniyor... ProvinceID: ${provinceId}`)
    
    // İl bilgisini çek (çünkü districts arrayi il içinde)
    const url = `https://turkiyeapi.dev/api/v1/provinces/${provinceId}`
    console.log('🌍 API URL:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('📡 Province API Response:', {
      status: response.status,
      dataType: typeof data,
      hasStatus: 'status' in data,
      apiStatus: data.status,
      hasData: 'data' in data,
      hasDistricts: data.data?.districts ? true : false,
      districtsLength: data.data?.districts?.length,
      provinceName: data.data?.name
    })
    
    // API response'da status: "OK", data var ve data.districts array'i var
    if (data.status === 'OK' && data.data && Array.isArray(data.data.districts)) {
      console.log(`✅ İlçeler başarıyla yüklendi (${data.data.name}):`, data.data.districts.length)
      return data.data.districts.map((district: any) => ({
        id: district.id,
        name: district.name,
        province_id: provinceId,
        latitude: district.coordinates?.latitude?.toString() || '0',
        longitude: district.coordinates?.longitude?.toString() || '0'
      }))
    }
    
    console.warn(`⚠️ Province API response yapısı beklenenden farklı (ProvinceID: ${provinceId}):`, data)
    console.log(`🛡️ Fallback sisteme geçiliyor... ProvinceID: ${provinceId}`)
    return getFallbackDistricts(provinceId)
  } catch (error) {
    console.error(`❌ İlçeler yüklenirken hata (ProvinceID: ${provinceId}):`, error)
    console.log(`🛡️ Fallback sisteme geçiliyor... ProvinceID: ${provinceId}`)
    return getFallbackDistricts(provinceId)
  }
}

// İl adından ID bul
export async function getProvinceByName(name: string): Promise<Province | null> {
  const provinces = await getProvinces()
  return provinces.find(p => p.name.toLowerCase() === name.toLowerCase()) || null
}

// İlçe adından ID bul
export async function getDistrictByName(name: string, provinceId: number): Promise<District | null> {
  const districts = await getDistricts(provinceId)
  return districts.find(d => d.name.toLowerCase() === name.toLowerCase()) || null
}
