'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CloudinaryImage } from '@/components/cloudinary'
import AuthModal from '@/components/AuthModal'
import Footer from '@/components/Footer'
import MainHeader from '@/components/MainHeader'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon,
  HeartIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

// Premium glow animation CSS
const premiumStyles = `
  @keyframes emerald-glow {
    0% {
      box-shadow: 
        0 0 15px rgba(16, 185, 129, 0.4), 
        0 0 30px rgba(16, 185, 129, 0.2), 
        0 0 45px rgba(16, 185, 129, 0.1);
    }
    50% {
      box-shadow: 
        0 0 25px rgba(5, 150, 105, 0.6), 
        0 0 50px rgba(5, 150, 105, 0.4), 
        0 0 75px rgba(5, 150, 105, 0.2);
    }
    100% {
      box-shadow: 
        0 0 15px rgba(16, 185, 129, 0.4), 
        0 0 30px rgba(16, 185, 129, 0.2), 
        0 0 45px rgba(16, 185, 129, 0.1);
    }
  }
  
  @keyframes emerald-border {
    0% {
      border-color: #10b981;
    }
    50% {
      border-color: #059669;
    }
    100% {
      border-color: #10b981;
    }
  }
  
  .premium-card {
    border: 3px solid #10b981;
    animation: emerald-border 2s ease-in-out infinite alternate,
               emerald-glow 2s ease-in-out infinite alternate;
    position: relative;
  }
  
  .premium-card::before {
    content: '♦';
    position: absolute;
    top: -8px;
    left: -8px;
    font-size: 12px;
    color: #059669;
    z-index: 10;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
    animation: emerald-glow 2s ease-in-out infinite alternate;
  }
  
  .premium-card::after {
    content: '♦';
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 12px;
    color: #059669;
    z-index: 10;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
    animation: emerald-glow 2s ease-in-out infinite alternate;
  }
`

// Types
interface Business {
  id: string
  name: string
  slug?: string
  category: string
  categoryName?: string
  subcategoryId?: string
  subcategoryName?: string
  image: string
  profileImage?: string
  logo?: string
  coverPhotoUrl?: string
  rating: number
  reviewCount: number
  distance?: string
  priceRange: string
  address: string
  province?: string
  district?: string
  provinceId?: number
  districtId?: number
  isActive: boolean
  isOpen: boolean
  nextAvailable: string
  tags: string[]
  liked?: boolean
  services?: Service[]
  staff?: Staff[]
  phone: string
  email?: string
  description?: string
  latitude?: number
  longitude?: number
  isPremium?: boolean
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string
}

interface Staff {
  id: string
  name: string
  specialties: string[]
  rating: number
  image?: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  orderIndex: number
  isActive: boolean
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
  icon?: string
  orderIndex: number
  isActive: boolean
  categoryId: string
}

interface Province {
  id: number
  name: string
  latitude: string
  longitude: string
}

interface District {
  id: number
  name: string
  province_id: number
  latitude: string
  longitude: string
}

function HomeContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State Management
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter States - URL'den başlangıç değerleri al
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    searchParams.get('provinceId') ? parseInt(searchParams.get('provinceId')!) : null
  )
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : null
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '')
  const [expandedCategory, setExpandedCategory] = useState('')
  
  // UI States
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<'customer' | 'business'>('customer')
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false) // Kampanya popup state
  const [businessLoading, setBusinessLoading] = useState<string | null>(null) // Business navigation loading
  
  // User States
  const [favorites, setFavorites] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // URL güncelleme fonksiyonu
  const updateURL = useCallback((params: {
    provinceId?: number | null
    districtId?: number | null
    search?: string
    category?: string
    subcategory?: string
  }) => {
    const newSearchParams = new URLSearchParams()
    
    if (params.provinceId) newSearchParams.set('provinceId', params.provinceId.toString())
    if (params.districtId) newSearchParams.set('districtId', params.districtId.toString())
    if (params.search && params.search.trim()) newSearchParams.set('search', params.search.trim())
    if (params.category) newSearchParams.set('category', params.category)
    if (params.subcategory) newSearchParams.set('subcategory', params.subcategory)
    
    const newURL = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '/'
    router.push(newURL, { scroll: false })
  }, [router])

  // API Functions
  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch('/api/categories?include=subcategories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Categories API hatası: ${response.status}`)
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
      
    } catch (err) {
      console.error('Categories fetch error:', err)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchProvinces = async () => {
    setProvincesLoading(true)
    try {
      const response = await fetch('/api/locations/provinces', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Provinces API hatası: ${response.status}`)
      }
      
      const data = await response.json()
      setProvinces(data.provinces || [])
      
    } catch (err) {
      console.error('Provinces fetch error:', err)
      setProvinces([])
    } finally {
      setProvincesLoading(false)
    }
  }

  const fetchDistricts = async (provinceId: number) => {
    try {
      const response = await fetch(`/api/locations/districts?provinceId=${provinceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Districts API hatası: ${response.status}`)
      }
      
      const data = await response.json()
      setDistricts(data.districts || [])
      
    } catch (err) {
      console.error('Districts fetch error:', err)
      setDistricts([])
    }
  }

  const fetchBusinesses = useCallback(async (filters: {
    provinceId?: number | null
    districtId?: number | null
    category?: string
    subcategory?: string
    search?: string
    lat?: number
    lng?: number
  } = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filters.provinceId) params.append('provinceId', filters.provinceId.toString())
      if (filters.districtId) params.append('districtId', filters.districtId.toString())
      if (filters.category) params.append('category', filters.category)
      if (filters.subcategory) params.append('subcategory', filters.subcategory)
      if (filters.search) params.append('search', filters.search)
      if (filters.lat && filters.lng) {
        params.append('lat', filters.lat.toString())
        params.append('lng', filters.lng.toString())
      }

      const response = await fetch(`/api/public/businesses?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`İşletmeler API hatası: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Distance hesaplama (eğer kullanıcı konumu varsa)
      if (userLocation && data.businesses) {
        const businessesWithDistance = data.businesses.map((business: any) => ({
          ...business,
          distance: calculateDistance(userLocation, {
            lat: business.latitude || 0,
            lng: business.longitude || 0
          })
        }))
        setBusinesses(businessesWithDistance)
      } else {
        setBusinesses(data.businesses || [])
      }
      
    } catch (err) {
      console.error('Businesses fetch error:', err)
      setError(err instanceof Error ? err.message : 'İşletmeler yüklenirken bir hata oluştu')
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [userLocation])

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavorites([])
      return
    }
    
    try {
      const response = await fetch('/api/user/favorites', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      } else {
        setFavorites([])
      }
    } catch (err) {
      console.error('Favoriler yüklenirken hata:', err)
      setFavorites([])
    }
  }

  const toggleFavorite = async (businessId: string) => {
    if (!session) {
      toast.error('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    try {
      const method = favorites.includes(businessId) ? 'DELETE' : 'POST'
      const response = await fetch('/api/user/favorites', {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId })
      })

      if (response.ok) {
        if (method === 'POST') {
          setFavorites(prev => [...prev, businessId])
          toast.success('Favorilere eklendi')
        } else {
          setFavorites(prev => prev.filter(id => id !== businessId))
          toast.success('Favorilerden çıkarıldı')
        }
      } else {
        throw new Error('İşlem başarısız')
      }
    } catch (err) {
      toast.error('Favoriler güncellenirken bir hata oluştu')
    }
  }

  // Location Functions
  const getCurrentLocation = useCallback(() => {
    return new Promise<{lat: number, lng: number}>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tarayıcınız konum servisini desteklemiyor'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error('Konum erişimi reddedildi'))
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }, [])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`)
      if (response.ok) {
        const data = await response.json()
        return { city: data.city, district: data.district }
      }
    } catch (err) {
      console.error('Reverse geocoding hatası:', err)
    }
    return null
  }

  const handleUseMyLocation = async () => {
    try {
      setLoading(true)
      const location = await getCurrentLocation()
      setUserLocation(location)
      
      const address = await reverseGeocode(location.lat, location.lng)
      if (address) {
        console.log('Reverse geocoding result:', address) // Debug için
        
        // İl adından ID bul - büyük/küçük harf duyarsız ve esnek eşleştirme
        const province = provinces.find(p => 
          p.name.toLowerCase().trim() === address.city.toLowerCase().trim() ||
          p.name.toLowerCase().includes(address.city.toLowerCase()) ||
          address.city.toLowerCase().includes(p.name.toLowerCase())
        )
        
        if (province) {
          setSelectedProvinceId(province.id)
          
          // İlçe listesini getir
          try {
            const districtsResponse = await fetch(`/api/locations/districts?provinceId=${province.id}`)
            const districtsData = await districtsResponse.json()
            const districtsList = districtsData.districts || []
            
            // İlçe adını eşleştir - önce tam eşleşme, sonra kısmi eşleştirme
            let matchedDistrict = districtsList.find((d: any) => 
              d.name.toLowerCase().trim() === address.district.toLowerCase().trim()
            )
            
            // Tam eşleşme bulunamazsa, kısmi eşleştirme dene
            if (!matchedDistrict) {
              matchedDistrict = districtsList.find((d: any) => 
                d.name.toLowerCase().includes(address.district.toLowerCase()) ||
                address.district.toLowerCase().includes(d.name.toLowerCase())
              )
            }
            
            // Türkçe karakter dönüşümü ile eşleştirme
            if (!matchedDistrict) {
              const turkishToEnglish = (str: string) => {
                return str.toLowerCase()
                  .replace(/ğ/g, 'g')
                  .replace(/ü/g, 'u')
                  .replace(/ş/g, 's')
                  .replace(/ı/g, 'i')
                  .replace(/ö/g, 'o')
                  .replace(/ç/g, 'c')
              }
              
              matchedDistrict = districtsList.find((d: any) => 
                turkishToEnglish(d.name) === turkishToEnglish(address.district) ||
                turkishToEnglish(d.name).includes(turkishToEnglish(address.district)) ||
                turkishToEnglish(address.district).includes(turkishToEnglish(d.name))
              )
            }
            
            if (matchedDistrict) {
              setSelectedDistrictId(matchedDistrict.id)
              console.log('District matched:', matchedDistrict.name) // Debug için
            } else {
              console.log('No district match found for:', address.district) // Debug için
              console.log('Available districts:', districtsList.map((d: any) => d.name)) // Debug için
            }
            
            setDistricts(districtsList)
            
          } catch (districtError) {
            console.error('District fetch error:', districtError)
          }
        } else {
          console.log('No province match found for:', address.city) // Debug için
          console.log('Available provinces:', provinces.map(p => p.name)) // Debug için
        }
        
        toast.success(`Konumunuz belirlendi: ${address.city}${address.district && address.district !== 'Merkez' ? ', ' + address.district : ''}`)
      }
    } catch (err) {
      console.error('Location error:', err) // Debug için
      toast.error(err instanceof Error ? err.message : 'Konum alınamadı')
    } finally {
      setLoading(false)
    }
  }

  // Utility Functions
  const calculateDistance = (pos1: {lat: number, lng: number}, pos2: {lat: number, lng: number}) => {
    const R = 6371 // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  const clearLocation = () => {
    setSelectedProvinceId(null)
    setSelectedDistrictId(null)
    setDistricts([])
    setUserLocation(null)
    
    // URL'yi güncelle
    updateURL({
      provinceId: null,
      districtId: null,
      search: searchQuery,
      category: selectedCategory,
      subcategory: selectedSubcategory
    })
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSubcategory('')
    setExpandedCategory('')
    setSearchQuery('')
    
    // URL'yi güncelle
    updateURL({
      provinceId: selectedProvinceId,
      districtId: selectedDistrictId,
      search: '',
      category: '',
      subcategory: ''
    })
  }

  const resetForm = () => {
    // AuthModal için form reset fonksiyonu
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setFavorites([])
    setIsDropdownOpen(false)
    toast.success('Başarıyla çıkış yaptınız')
  }

  // Category/Subcategory handlers
  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory('')
      setSelectedCategory('')
    } else {
      setExpandedCategory(categoryId)
      setSelectedCategory(categoryId)
      setSelectedSubcategory('') // Alt kategori seçimini temizle
    }
  }

  const handleSubcategoryClick = (subcategoryId: string) => {
    const newSubcategoryId = selectedSubcategory === subcategoryId ? '' : subcategoryId
    setSelectedSubcategory(newSubcategoryId)
    setShowMobileSidebar(false) // Mobil sidebar'ı kapat
    
    // URL'yi güncelle
    updateURL({
      provinceId: selectedProvinceId,
      districtId: selectedDistrictId,
      search: searchQuery,
      category: selectedCategory,
      subcategory: newSubcategoryId
    })
    // fetchBusinesses otomatik olarak useEffect ile çağrılacak
  }

  // Province/District handlers
  const handleProvinceChange = async (provinceId: number) => {
    setSelectedProvinceId(provinceId)
    setSelectedDistrictId(null) // İlçe seçimini temizle
    setDistricts([]) // İlçe listesini temizle
    
    if (provinceId) {
      await fetchDistricts(provinceId)
    }
    
    // URL'yi güncelle
    updateURL({
      provinceId: provinceId || null,
      districtId: null,
      search: searchQuery,
      category: selectedCategory,
      subcategory: selectedSubcategory
    })
  }

  const handleDistrictChange = (districtId: number) => {
    setSelectedDistrictId(districtId)
    
    // URL'yi güncelle
    updateURL({
      provinceId: selectedProvinceId,
      districtId: districtId || null,
      search: searchQuery,
      category: selectedCategory,
      subcategory: selectedSubcategory
    })
  }

  // Get category icon (fallback to emoji)
  const getCategoryIcon = (category: Category) => {
    if (category.icon) return category.icon
    
    // Fallback emojiler
    const iconMap: Record<string, string> = {
      'beauty': '💇‍♀️',
      'health': '🏥',
      'automotive': '🚗',
      'events': '🎉',
      'sports': '💪',
      'education': '📚'
    }
    
    return iconMap[category.slug] || '🏢'
  }

  // Get subcategory icon (fallback to emoji)
  const getSubcategoryIcon = (subcategory: Subcategory) => {
    if (subcategory.icon) return subcategory.icon
    
    // Fallback emojiler
    const iconMap: Record<string, string> = {
      'barber': '💇‍♂️',
      'hairdresser': '💇‍♀️',
      'beauty_center': '💅',
      'nail_art': '💅',
      'massage': '🤲',
      'skincare': '✨',
      'dental': '🦷',
      'vet': '🐕',
      'physiotherapy': '🤸‍♂️',
      'psychology': '🧠',
      'car_wash': '🚿',
      'car_service': '🔧',
      'tire_service': '🛞',
      'wedding_hall': '💒',
      'restaurant': '🍽️',
      'cafe': '☕',
      'gym': '🏋️‍♂️',
      'yoga': '🧘‍♀️',
      'language': '🗣️',
      'music': '🎵'
    }
    
    return iconMap[subcategory.slug] || '📋'
  }

  // Kampanya popup kontrolü
  const checkCampaignModalDisplay = useCallback(() => {
    try {
      const lastShown = localStorage.getItem('campaignModalLastShown')
      const today = new Date().toDateString()
      
      // Eğer bugün gösterilmediyse göster
      if (lastShown !== today) {
        setShowCampaignModal(true)
        localStorage.setItem('campaignModalLastShown', today)
      }
    } catch (error) {
      // LocalStorage hatası durumunda varsayılan olarak gösterme
      console.warn('LocalStorage error:', error)
    }
  }, [])

  // Kampanya modalını kapatma
  const handleCloseCampaignModal = () => {
    setShowCampaignModal(false)
    // Kapattığında da bugünün tarihini kaydet (tekrar açmasın)
    try {
      localStorage.setItem('campaignModalLastShown', new Date().toDateString())
    } catch (error) {
      console.warn('LocalStorage error:', error)
    }
  }

  // Business navigation handler
  const handleBusinessClick = async (businessId: string, businessSlug?: string) => {
    setBusinessLoading(businessId)
    const url = `/${businessSlug || businessId}`
    try {
      await router.push(url)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      // Loading state will be cleared when component unmounts
      setTimeout(() => setBusinessLoading(null), 100)
    }
  }

  // Debounced search URL update
  const debouncedUpdateSearchURL = useCallback(
    debounce((searchValue: string) => {
      updateURL({
        provinceId: selectedProvinceId,
        districtId: selectedDistrictId,
        search: searchValue,
        category: selectedCategory,
        subcategory: selectedSubcategory
      })
    }, 500),
    [selectedProvinceId, selectedDistrictId, selectedCategory, selectedSubcategory, updateURL]
  )

  // Search handler
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedUpdateSearchURL(value)
  }

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Effects
  useEffect(() => {
    // Check geolocation support
    if ('geolocation' in navigator) {
      setLocationEnabled(true)
    }
    
    // Kategorileri, illeri ve işletmeleri yükle
    fetchCategories()
    fetchProvinces()
    fetchBusinesses()
    
    // Kampanya modal kontrolü - sayfa yüklendikten 2 saniye sonra
    const timer = setTimeout(() => {
      checkCampaignModalDisplay()
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [checkCampaignModalDisplay]) // eslint-disable-line react-hooks/exhaustive-deps

  // URL'den gelen provinceId için ilçeleri yükle
  useEffect(() => {
    if (selectedProvinceId && provinces.length > 0) {
      fetchDistricts(selectedProvinceId)
    }
  }, [selectedProvinceId, provinces.length])

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Debounced business fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses({
        provinceId: selectedProvinceId,
        districtId: selectedDistrictId,
        subcategory: selectedSubcategory,
        search: searchQuery,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      })
    }, searchQuery ? 500 : 0) // Hemen fetch et eğer search yoksa

    return () => clearTimeout(timer)
  }, [selectedProvinceId, selectedDistrictId, selectedSubcategory, searchQuery, userLocation]) // fetchBusinesses'i kaldırdık

  // Fetch user favorites when logged in
  useEffect(() => {
    if (session) {
      fetchFavorites()
    } else {
      setFavorites([])
    }
  }, [session?.user?.id]) // fetchFavorites dependency'sini kaldırdık

  return (
    <>
      {/* Premium Glow Animation Styles */}
      <style jsx>{premiumStyles}</style>
      
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainHeader
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
        userType={userType}
        setUserType={setUserType}
        authMode={authMode}
        setAuthMode={setAuthMode}
        setShowAuthModal={setShowAuthModal}
        resetForm={resetForm}
      />

      {/* Mobile Sidebar Overlay - Sadece ana sayfa için */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
                Kategoriler
              </h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Categories Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {categoriesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 last:border-b-0 pb-2">
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 ${
                          expandedCategory === category.id ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-700 hover:text-emerald-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getCategoryIcon(category)}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <ChevronRightIcon 
                          className={`w-5 h-5 transition-transform ${
                            expandedCategory === category.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleSubcategoryClick(subcategory.id)}
                              className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                                selectedSubcategory === subcategory.id 
                                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-medium border border-emerald-200' 
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              <span className="text-lg">{getSubcategoryIcon(subcategory)}</span>
                              <span>{subcategory.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {(selectedCategory || selectedSubcategory || searchQuery) && (
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    clearFilters()
                    setShowMobileSidebar(false)
                  }}
                  className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Bar Section */}
      <section className="bg-gradient-to-br from-slate-50 to-gray-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Location Selectors */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Province Selector */}
              <div className="relative">
                <select
                  value={selectedProvinceId || ''}
                  onChange={(e) => handleProvinceChange(e.target.value ? parseInt(e.target.value) : 0)}
                  disabled={provincesLoading}
                  className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:min-w-[140px] disabled:opacity-50 shadow-sm hover:border-slate-400 transition-colors"
                >
                  <option value="">
                    {provincesLoading ? 'Yükleniyor...' : 'İl seçin'}
                  </option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>{province.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              {/* District Selector */}
              {selectedProvinceId && districts.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedDistrictId || ''}
                    onChange={(e) => handleDistrictChange(e.target.value ? parseInt(e.target.value) : 0)}
                    className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:min-w-[140px] shadow-sm hover:border-slate-400 transition-colors"
                  >
                    <option value="">Tüm ilçeler</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              )}

              {/* My Location Button */}
              {locationEnabled && (
                <button
                  onClick={handleUseMyLocation}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-emerald-200"
                >
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {loading ? 'Konum Alınıyor...' : 'Konumum'}
                  </span>
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="İşletme adı, hizmet ara..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 placeholder-slate-500 shadow-sm hover:border-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Active Filters */}
          {(selectedProvinceId || selectedSubcategory) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Aktif filtreler:</span>
              {selectedProvinceId && (
                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-200">
                  <span>📍 {
                    selectedDistrictId && districts.length > 0 
                      ? `${districts.find(d => d.id === selectedDistrictId)?.name}, ${provinces.find(p => p.id === selectedProvinceId)?.name}`
                      : provinces.find(p => p.id === selectedProvinceId)?.name
                  }</span>
                  <button
                    onClick={clearLocation}
                    className="text-emerald-600 hover:text-emerald-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200">
                  <span>
                    {categories
                      .find(cat => cat.subcategories?.some(sub => sub.id === selectedSubcategory))
                      ?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name || 'Kategori'}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-slate-600 hover:text-slate-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sol Sidebar - Kategoriler (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-20 sm:top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
                Kategoriler
              </h2>
              
              {/* Categories Loading State */}
              {categoriesLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Kategori Listesi */
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 last:border-b-0 pb-2">
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors ${
                          expandedCategory === category.id ? 'bg-gray-100 text-gray-800' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg sm:text-xl">{getCategoryIcon(category)}</span>
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <ChevronRightIcon 
                          className={`w-4 h-4 transition-transform ${
                            expandedCategory === category.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                      
                      {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleSubcategoryClick(subcategory.id)}
                              className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 ${
                                selectedSubcategory === subcategory.id 
                                  ? 'bg-gray-100 text-gray-800 font-medium' 
                                  : 'text-gray-600'
                              }`}
                            >
                              <span>{getSubcategoryIcon(subcategory)}</span>
                              <span className="text-sm">{subcategory.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Clear Filters */}
              {(selectedCategory || selectedSubcategory || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-6 py-3 rounded-xl font-medium bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>

          {/* Sağ İçerik - İşletmeler */}
          <div className="lg:col-span-3">
            {/* Responsive Banner Area */}
            <div className="w-full mb-6 sm:mb-8">
              <div className="relative w-full" style={{ aspectRatio: '4/1' }}>
                <Link href="/business" className="block w-full h-full group">
                  <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                    <svg 
                      viewBox="0 0 1200 300" 
                      className="w-full h-full object-cover"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor:'#10b981',stopOpacity:1}} />
                          <stop offset="25%" style={{stopColor:'#059669',stopOpacity:1}} />
                          <stop offset="50%" style={{stopColor:'#0d9488',stopOpacity:1}} />
                          <stop offset="75%" style={{stopColor:'#14b8a6',stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                        </linearGradient>
                        
                        <linearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{stopColor:'rgba(0,0,0,0.1)',stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'rgba(0,0,0,0.3)',stopOpacity:1}} />
                        </linearGradient>
                        
                        <radialGradient id="lightEffect" cx="80%" cy="20%" r="50%">
                          <stop offset="0%" style={{stopColor:'rgba(255,255,255,0.3)',stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'rgba(255,255,255,0)',stopOpacity:0}} />
                        </radialGradient>
                        
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.15)"/>
                        </filter>
                      </defs>
                      
                      <rect width="1200" height="300" fill="url(#mainGradient)" rx="16" ry="16"/>
                      <rect width="1200" height="300" fill="url(#overlayGradient)" rx="16" ry="16"/>
                      <rect width="1200" height="300" fill="url(#lightEffect)" rx="16" ry="16"/>
                      
                      <circle cx="950" cy="80" r="60" fill="rgba(255,255,255,0.05)" opacity="0.8">
                        <animateTransform attributeName="transform" type="translate" values="0,0; 10,5; 0,0" dur="4s" repeatCount="indefinite"/>
                      </circle>
                      
                      <circle cx="1100" cy="200" r="40" fill="rgba(255,255,255,0.08)" opacity="0.6">
                        <animateTransform attributeName="transform" type="translate" values="0,0; -8,8; 0,0" dur="6s" repeatCount="indefinite"/>
                      </circle>
                      
                      <path d="M800 50 Q850 20 900 50 Q950 80 1000 50" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" opacity="0.5"/>
                      
                      <g transform="translate(60, 80)">
                        <rect x="0" y="0" width="80" height="80" rx="20" fill="rgba(255,255,255,0.15)" filter="url(#shadow)"/>
                        <rect x="4" y="4" width="72" height="72" rx="16" fill="rgba(255,255,255,0.9)"/>
                        <text x="40" y="55" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#10b981">R</text>
                      </g>
                      
                      <g transform="translate(180, 70)">
                        <text x="0" y="35" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" opacity="0.95">
                          RandeVur ile Randevularınızı
                        </text>
                        <text x="0" y="70" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" opacity="0.95">
                          Kolayca Yönetin
                        </text>
                        
                        <text x="0" y="110" fontFamily="Arial, sans-serif" fontSize="16" fill="rgba(255,255,255,0.8)">
                          2025 yılı boyunca tamamen ücretsiz! Hemen kayıt olun ve avantajlardan yararlanın.
                        </text>
                        
                        <g transform="translate(0, 130)">
                          <rect x="0" y="0" width="200" height="45" rx="22" fill="rgba(255,255,255,0.9)" filter="url(#shadow)">
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
                          </rect>
                          <text x="100" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#10b981">
                            Hemen Başlayın →
                          </text>
                        </g>
                      </g>
                      
                      <g transform="translate(850, 50)">
                        <rect x="0" y="0" width="120" height="200" rx="15" fill="rgba(255,255,255,0.15)" filter="url(#shadow)"/>
                        <rect x="8" y="8" width="104" height="184" rx="10" fill="rgba(255,255,255,0.9)"/>
                        <rect x="15" y="25" width="90" height="150" rx="5" fill="#f8fafc"/>
                        <rect x="25" y="35" width="70" height="8" rx="4" fill="#e2e8f0"/>
                        <rect x="25" y="50" width="50" height="6" rx="3" fill="#cbd5e1"/>
                        <rect x="25" y="65" width="70" height="20" rx="5" fill="#10b981" opacity="0.8"/>
                        <rect x="25" y="90" width="70" height="20" rx="5" fill="#14b8a6" opacity="0.8"/>
                        <rect x="25" y="115" width="70" height="20" rx="5" fill="#06b6d4" opacity="0.8"/>
                        <circle cx="85" cy="150" r="12" fill="#10b981"/>
                        <path d="M80 150 L84 154 L90 146" stroke="white" strokeWidth="2" fill="none"/>
                      </g>
                      
                      <g opacity="0.6">
                        <circle cx="200" cy="50" r="3" fill="rgba(255,255,255,0.8)">
                          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="0s"/>
                        </circle>
                        <circle cx="350" cy="40" r="2" fill="rgba(255,255,255,0.7)">
                          <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" begin="1s"/>
                        </circle>
                        <circle cx="500" cy="35" r="2.5" fill="rgba(255,255,255,0.6)">
                          <animate attributeName="opacity" values="0;1;0" dur="3.5s" repeatCount="indefinite" begin="2s"/>
                        </circle>
                      </g>
                      
                      <path d="M0 250 Q50 230 100 250 Q150 270 200 250" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {selectedSubcategory 
                    ? categories
                        .find(cat => cat.subcategories?.some(sub => sub.id === selectedSubcategory))
                        ?.subcategories?.find(sub => sub.id === selectedSubcategory)?.name + ' Hizmeti'
                    : selectedProvinceId 
                      ? `${provinces.find(p => p.id === selectedProvinceId)?.name} İşletmeleri`
                      : 'Tüm İşletmeler'
                  }
                </h1>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">
                  {loading ? 'Aranıyor...' : `${businesses.length} işletme bulundu`}
                  {selectedProvinceId && (
                    <span className="text-emerald-600 ml-1 font-medium">
                      • {selectedDistrictId && districts.length > 0 
                          ? `${districts.find(d => d.id === selectedDistrictId)?.name}, ${provinces.find(p => p.id === selectedProvinceId)?.name}`
                          : provinces.find(p => p.id === selectedProvinceId)?.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => fetchBusinesses({
                    provinceId: selectedProvinceId,
                    districtId: selectedDistrictId,
                    subcategory: selectedSubcategory,
                    search: searchQuery,
                    lat: userLocation?.lat,
                    lng: userLocation?.lng
                  })}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-pulse">
                    <div className="h-48 bg-slate-200"></div>
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-slate-200 rounded-full flex-1"></div>
                        <div className="h-8 bg-slate-200 rounded-full flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* İşletme Listesi */}
            {!loading && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    onClick={() => handleBusinessClick(business.id, business.slug)}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer block relative ${
                      business.isPremium 
                        ? 'premium-card shadow-emerald-200/50 hover:shadow-emerald-300/50' 
                        : 'border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {/* Loading Overlay */}
                    {businessLoading === business.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-2xl">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <p className="text-sm text-gray-600 font-medium">Yükleniyor...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative h-48 overflow-hidden">
                      <CloudinaryImage
                        src={business.image || business.profileImage || business.logo || business.coverPhotoUrl}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        transformation={{
                          width: 600,
                          height: 400,
                          crop: 'fill',
                          gravity: 'auto',
                          quality: 'auto',
                          format: 'auto'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-business.svg';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            toggleFavorite(business.id)
                          }}
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          {favorites.includes(business.id) ? (
                            <HeartSolid className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 flex space-x-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${
                          business.isOpen ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {business.isOpen ? 'Açık' : 'Kapalı'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                            {business.name}
                          </h3>
                          <p className="text-sm text-slate-500">{business.subcategoryName || business.categoryName || business.category}</p>
                        </div>
                        <span className="text-sm font-medium text-slate-600 ml-2">{business.priceRange}</span>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-900">{business.rating}</span>
                          <span className="text-sm text-slate-500">({business.reviewCount})</span>
                        </div>
                        {business.isPremium && (
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-500 text-sm animate-pulse">👑</span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">
                              PREMİUM
                            </span>
                          </div>
                        )}
                        {business.distance && (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="text-sm text-slate-600">{business.distance}</span>
                          </div>
                        )}
                      </div>

                      {/* İl İlçe Bilgisi */}
                      <div className="flex items-center space-x-1 mb-3">
                        <MapPinIcon className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-600 truncate">
                          {business.district && business.province 
                            ? `${business.district}, ${business.province}`
                            : business.province || business.address}
                        </p>
                      </div>

                      <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                      <button
                      onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBusinessClick(business.id, business.slug);
                      }}
                      disabled={businessLoading === business.id}
                        className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all duration-200 text-center border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        İncele
                      </button>
                      <button
                      onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                        handleBusinessClick(business.id, business.slug);
                      }}
                        disabled={businessLoading === business.id}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Randevu Al
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && businesses.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Sonuç bulunamadı</h3>
                <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                  {selectedProvinceId 
                    ? `${provinces.find(p => p.id === selectedProvinceId)?.name} ${selectedDistrictId && districts.length > 0 ? '(' + districts.find(d => d.id === selectedDistrictId)?.name + ')' : ''} şehrinde aradığınız kriterlere uygun işletme bulunamadı`
                    : 'Arama kriterlerinizi değiştirmeyi deneyin'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Filtreleri Temizle
                  </button>
                  <button
                    onClick={clearLocation}
                    className="bg-slate-200 text-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                  >
                    Konum Seçimini Temizle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          initialUserType={userType}
        />
      )}

      {/* Kampanya Popup */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-lg w-full p-4 sm:p-8 relative animate-fadeIn shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Kapat Butonu */}
            <button
              onClick={handleCloseCampaignModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>

            {/* İkon ve Başlık */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-3 sm:mb-4">
                <GiftIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
                🎉 Yıl Sonu Kampanyası!
              </h2>
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4 mr-1" />
                Sınırlı Süre
              </div>
            </div>

            {/* Kampanya Detayları */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      🎁 2025 Yılı Boyunca TAMAMEN ÜCRETSİZ!
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      31 Aralık 2025'e kadar tüm özellikler ücretsiz. Hiçbir gizli ücret yok!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      📅 2026'dan İtibaren Ücretli Olacak
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      1 Ocak 2026'dan itibaren aylık abonelik sistemi başlayacak.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      ✨ Yeni Üyeler İçin 1 Ay Deneme
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      2026'da kayıt olan yeni işletmeler ilk ayı ücretsiz deneyebilecek.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Kısım */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 text-white text-center">
              <p className="text-xs sm:text-sm mb-2">Fırsatı Kaçırmayın!</p>
              <p className="font-semibold text-sm sm:text-base">
                Şimdi kayıt olun, 2025 boyunca ücretsiz kullanın! 🚀
              </p>
            </div>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Link
                href="/business"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                onClick={handleCloseCampaignModal}
              >
                İşletme Kaydı Oluştur
              </Link>
              <button
                onClick={handleCloseCampaignModal}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm sm:text-base"
              >
                Şimdi Değil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
      </div>
    </>
  )
}

// Suspense wrapper for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
