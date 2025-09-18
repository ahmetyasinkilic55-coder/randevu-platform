'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import CloudinaryImage from '@/components/cloudinary/CloudinaryImage'
import MainHeader from '@/components/MainHeader'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import { 
  HeartIcon,
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

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
  isActive: boolean
  isOpen: boolean
  nextAvailable: string
  tags: string[]
  phone: string
  email?: string
  description?: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<'customer' | 'business'>('customer')
  
  const resetForm = () => {
    // Reset form function for auth modal
  }

  // Favorileri getir
  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/user/favorites?detailed=true', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Favoriler yüklenirken bir hata oluştu')
      }
      
      const data = await response.json()
      setBusinesses(data.businesses || [])
      
    } catch (err) {
      console.error('Favoriler yüklenirken hata:', err)
      setError(err instanceof Error ? err.message : 'Favoriler yüklenirken bir hata oluştu')
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  // Favorilerden çıkar
  const removeFavorite = async (businessId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId })
      })

      if (response.ok) {
        setBusinesses(prev => prev.filter(b => b.id !== businessId))
        toast.success('Favorilerden çıkarıldı')
      } else {
        throw new Error('İşlem başarısız')
      }
    } catch (err) {
      toast.error('Favorilerden çıkarılırken bir hata oluştu')
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      setLoading(false)
      setError('Bu sayfayı görüntülemek için giriş yapmalısınız')
      return
    }
    
    fetchFavorites()
  }, [session, status])

  // Giriş yapılmamışsa
  if (!session && status !== 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main Header */}
        <MainHeader 
          setShowAuthModal={setShowAuthModal}
          authMode={authMode}
          setAuthMode={setAuthMode}
          userType={userType}
          setUserType={setUserType}
          resetForm={resetForm}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Favorilerim</h1>
            <p className="text-slate-600 mb-8">
              Favori işletmelerinizi görüntülemek için giriş yapmalısınız.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          initialUserType={userType}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <MainHeader 
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        userType={userType}
        setUserType={setUserType}
        resetForm={resetForm}
      />
      
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <HeartSolid className="w-8 h-8 text-red-500 mr-3" />
                Favorilerim
              </h1>
              <p className="text-slate-600 mt-2">
                {loading ? 'Yükleniyor...' : `${businesses.length} favori işletme`}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            {session && (
              <button
                onClick={fetchFavorites}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Tekrar Dene
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-5 space-y-3">
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
        {!loading && businesses.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group"
              >
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
                      onClick={() => removeFavorite(business.id)}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      title="Favorilerden çıkar"
                    >
                      <HeartSolid className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                      business.isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {business.isOpen ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
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
                    {business.distance && (
                      <div className="flex items-center space-x-1 text-slate-500">
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
                      <Link
                        href={`/${business.slug || business.id}`}
                        className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all duration-200 text-center border border-slate-200"
                      >
                        İncele
                      </Link>
                      <Link
                        href={`/${business.slug || business.id}`}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-center shadow-md hover:shadow-lg"
                      >
                        Randevu Al
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && businesses.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Henüz favori işletmeniz yok</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Beğendiğiniz işletmeleri favorilere ekleyerek buradan kolayca erişebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                İşletmeleri Keşfet
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        initialUserType={userType}
      />
    </div>
  )
}
