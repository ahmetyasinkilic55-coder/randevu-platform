'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { CloudinaryImage } from '@/components/cloudinary'
import MainHeader from '@/components/MainHeader'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  StarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

interface ServiceRequest {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceName: string
  serviceDetails?: string
  budget?: number
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  province?: string
  district?: string
  address?: string
  preferredDate?: string
  preferredTime?: string
  flexibleTiming: boolean
  status: string
  expiresAt: string
  createdAt: string
  responses: ServiceRequestResponse[]
}

interface ServiceRequestResponse {
  id: string
  message: string
  proposedPrice?: number
  proposedDate?: string
  proposedTime?: string
  availability?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  customerViewed: boolean
  createdAt: string
  business: {
    id: string
    name: string
    slug?: string
    phone: string
    email?: string
    province?: string
    district?: string
    address?: string
    profilePhotoUrl?: string
    isPremium: boolean
  }
}

const urgencyColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  NORMAL: 'bg-blue-100 text-blue-800 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200'
}

const urgencyLabels = {
  LOW: '1 hafta içinde',
  NORMAL: '2-3 gün içinde',
  HIGH: '24 saat içinde',
  URGENT: 'Bugün'
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
  RESPONDED: 'bg-green-100 text-green-800 border-green-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200'
}

const statusLabels = {
  PENDING: 'Beklemede',
  ACTIVE: 'Aktif',
  RESPONDED: 'Cevaplar Var',
  ACCEPTED: 'Kabul Edildi',
  EXPIRED: 'Süresi Doldu',
  CANCELLED: 'İptal Edildi',
  COMPLETED: 'Tamamlandı'
}

export default function MyRequestsPage() {
  const { data: session } = useSession()
  const [businesses, setBusinesses] = useState<ServiceRequest[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState({ phone: '', email: '' })
  const [showSearch, setShowSearch] = useState(!session)
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [userType, setUserType] = useState<'customer' | 'business'>('customer')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchMyRequests()
    }
  }, [session])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      let url = '/api/my-requests'
      
      if (!session && (searchQuery.phone || searchQuery.email)) {
        const params = new URLSearchParams()
        if (searchQuery.phone) params.append('phone', searchQuery.phone)
        if (searchQuery.email) params.append('email', searchQuery.email)
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests || [])
      } else {
        toast.error(data.error || 'Talepler yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Fetch my requests error:', error)
      toast.error('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.phone && !searchQuery.email) {
      toast.error('Telefon numarası veya email adresi giriniz')
      return
    }
    fetchMyRequests()
  }

  const handleAcceptOffer = async (requestId: string, responseId: string) => {
    if (acceptingOffer) return
    
    setAcceptingOffer(responseId)
    try {
      const response = await fetch(`/api/my-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'accept_offer',
          responseId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Teklif kabul edildi!')
        fetchMyRequests()
      } else {
        toast.error(data.error || 'Teklif kabul edilemedi')
      }
    } catch (error) {
      console.error('Accept offer error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setAcceptingOffer(null)
    }
  }

  const resetForm = () => {
    // AuthModal için form reset fonksiyonu
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-gray-600">Talepleriniz yükleniyor...</span>
      </div>
    )
  }

  if (!session && showSearch) {
    return (
      <div className="flex justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Taleplerimi Bul</h2>
              <p className="text-gray-600">Telefon numarası veya email ile taleplerinizi bulabilirsiniz</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={searchQuery.phone}
                    onChange={(e) => setSearchQuery(prev => ({...prev, phone: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="05xx xxx xx xx"
                  />
                </div>
              </div>

              <div className="text-center text-gray-500 text-sm">veya</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Adresi
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={searchQuery.email}
                    onChange={(e) => setSearchQuery(prev => ({...prev, email: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors"
              >
                Taleplerimi Bul
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Taleplerimi Takip Et</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gönderdiğiniz talepleri ve işletmelerden gelen teklifleri buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{requests.length}</h3>
              <p className="text-gray-600">Toplam Talep</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.responses.length > 0).length}
              </h3>
              <p className="text-gray-600">Cevaplanan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {requests.reduce((sum, r) => sum + r.responses.length, 0)}
              </h3>
              <p className="text-gray-600">Toplam Teklif</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {requests.filter(r => new Date() > new Date(r.expiresAt)).length}
              </h3>
              <p className="text-gray-600">Süresi Dolan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search for non-logged users */}
      {!session && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Farklı telefon/email ile ara
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {session ? 'Henüz talep oluşturmamışsınız' : 'Talep bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-4">
              {session 
                ? 'İhtiyacınız olan hizmetler için talep oluşturup teklifler alabilirsiniz.'
                : 'Bu telefon numarası veya email ile oluşturulmuş talep bulunamadı.'
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Talep Oluştur
            </Link>
          </div>
        ) : (
          requests.map((request) => {
            const isExpired = new Date() > new Date(request.expiresAt)
            const hasNewResponses = request.responses.some(r => !r.customerViewed)
            const acceptedResponse = request.responses.find(r => r.status === 'ACCEPTED')

            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Request Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {request.serviceName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${urgencyColors[request.urgency]}`}>
                          {urgencyLabels[request.urgency]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[request.status as keyof typeof statusColors] || statusColors.PENDING}`}>
                          {statusLabels[request.status as keyof typeof statusLabels] || 'Bilinmiyor'}
                        </span>
                        {hasNewResponses && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 animate-pulse">
                            Yeni
                          </span>
                        )}
                      </div>
                      
                      {request.serviceDetails && (
                        <p className="text-gray-600 mb-3">{request.serviceDetails}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                        {request.budget && (
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>Bütçe: ₺{request.budget.toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        
                        {request.province && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span>
                              {request.district ? `${request.district}, ` : ''}{request.province}
                            </span>
                          </div>
                        )}
                        
                        {request.preferredDate && (
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>
                              {formatDate(request.preferredDate)}
                              {request.preferredTime && ` ${request.preferredTime}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDate(request.createdAt)}</p>
                      <p>{formatTime(request.createdAt)}</p>
                      <p className="mt-1">
                        {isExpired ? (
                          <span className="text-red-600 font-medium">Süresi doldu</span>
                        ) : (
                          <span>
                            Bitiş: {formatDate(request.expiresAt)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Responses */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Gelen Teklifler ({request.responses.length})
                    </h4>
                  </div>
                  
                  {request.responses.length === 0 ? (
                    <div className="text-center py-8">
                      <BuildingStorefrontIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Henüz teklif gelmedi</p>
                      <p className="text-gray-400 text-sm mt-1">
                        İşletmeler size en kısa sürede dönüş yapacak
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {request.responses.map((response) => (
                        <div
                          key={response.id}
                          className={`border rounded-xl p-4 ${
                            response.status === 'ACCEPTED' 
                              ? 'border-emerald-300 bg-emerald-50' 
                              : 'border-gray-200'
                          } ${
                            !response.customerViewed ? 'ring-2 ring-blue-100 bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <CloudinaryImage
                                  src={response.business.profilePhotoUrl || '/default-business.svg'}
                                  alt={response.business.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                  transformation={{
                                    width: 100,
                                    height: 100,
                                    crop: 'fill',
                                    gravity: 'face'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/default-business.svg'
                                  }}
                                />
                                {response.business.isPremium && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">👑</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  {response.business.name}
                                  {response.business.isPremium && (
                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                      Premium
                                    </span>
                                  )}
                                </h5>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  {response.business.province && (
                                    <div className="flex items-center gap-1">
                                      <MapPinIcon className="w-3 h-3" />
                                      <span>{response.business.district}, {response.business.province}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-gray-500">
                              <p>{formatDate(response.createdAt)}</p>
                              <p>{formatTime(response.createdAt)}</p>
                              {response.status === 'ACCEPTED' && (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium mt-1">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Kabul Edildi
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-gray-700">{response.message}</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            {response.proposedPrice && (
                              <div>
                                <span className="font-medium text-gray-900">Fiyat</span>
                                <p className="text-emerald-600 font-semibold">
                                  ₺{response.proposedPrice.toLocaleString('tr-TR')}
                                </p>
                              </div>
                            )}
                            
                            {response.proposedDate && (
                              <div>
                                <span className="font-medium text-gray-900">Tarih</span>
                                <p className="text-gray-600">{formatDate(response.proposedDate)}</p>
                              </div>
                            )}
                            
                            {response.proposedTime && (
                              <div>
                                <span className="font-medium text-gray-900">Saat</span>
                                <p className="text-gray-600">{response.proposedTime}</p>
                              </div>
                            )}
                            
                            {response.availability && (
                              <div>
                                <span className="font-medium text-gray-900">Müsaitlik</span>
                                <p className="text-gray-600">{response.availability}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <a
                                href={`tel:${response.business.phone}`}
                                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                              >
                                <PhoneIcon className="w-4 h-4" />
                                {response.business.phone}
                              </a>
                              
                              {response.business.slug && (
                                <Link
                                  href={`/${response.business.slug}`}
                                  className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                                  target="_blank"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  Profili Gör
                                </Link>
                              )}
                            </div>

                            {response.status === 'PENDING' && !isExpired && request.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleAcceptOffer(request.id, response.id)}
                                disabled={acceptingOffer === response.id}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                              >
                                {acceptingOffer === response.id ? 'Kabul Ediliyor...' : 'Teklifi Kabul Et'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
          </div>
        </div>
      </div>

      {/* AuthModal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          initialUserType={userType}
        />
      )}

      {/* Footer */}
      <Footer />
    </>
  )
}
