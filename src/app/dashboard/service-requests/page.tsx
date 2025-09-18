'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import {
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon
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
  responses: any[]
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

export default function ServiceRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [businessInfo, setBusinessInfo] = useState<any>(null)
  const [allRequests, setAllRequests] = useState<{active: ServiceRequest[], responded: ServiceRequest[], accepted: ServiceRequest[]}>({active: [], responded: [], accepted: []})
  const [currentFilter, setCurrentFilter] = useState<'active' | 'responded' | 'accepted'>('active')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseData, setResponseData] = useState({
    message: '',
    proposedPrice: '',
    proposedDate: '',
    proposedTime: '',
    availability: ''
  })
  const [sendingResponse, setSendingResponse] = useState(false)

  useEffect(() => {
    fetchServiceRequests()
    fetchAllRequestsForStats()
  }, [])

  const fetchServiceRequests = async (filter: string = currentFilter) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/service-requests?filter=${filter}`)
      
      if (response.ok) {
        const data = await response.json()
        setRequests(data.serviceRequests || [])
        setBusinessInfo(data.businessInfo)
      } else {
        toast.error('Talepler yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Service requests fetch error:', error)
      toast.error('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async (filter: 'active' | 'responded' | 'accepted') => {
    setCurrentFilter(filter)
    await fetchServiceRequests(filter)
  }

  const fetchAllRequestsForStats = async () => {
    try {
      const [activeRes, respondedRes, acceptedRes] = await Promise.all([
        fetch('/api/dashboard/service-requests?filter=active'),
        fetch('/api/dashboard/service-requests?filter=responded'),
        fetch('/api/dashboard/service-requests?filter=accepted')
      ])
      
      const [activeData, respondedData, acceptedData] = await Promise.all([
        activeRes.json(),
        respondedRes.json(),
        acceptedRes.json()
      ])
      
      setAllRequests({
        active: activeData.serviceRequests || [],
        responded: respondedData.serviceRequests || [],
        accepted: acceptedData.serviceRequests || []
      })
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
  }

  const handleSendResponse = async (requestId: string) => {
    if (!session?.user?.id) {
      toast.error('Giriş yapmalısınız')
      return
    }

    if (!businessInfo?.id) {
      toast.error('İşletme bilgileriniz bulunamadı')
      return
    }

    try {
      setSendingResponse(true)
      
      const response = await fetch(`/api/service-requests/${requestId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: businessInfo.id,
          ...responseData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Teklifiniz başarıyla gönderildi!')
        setShowResponseModal(false)
        setSelectedRequest(null)
        setResponseData({
          message: '',
          proposedPrice: '',
          proposedDate: '',
          proposedTime: '',
          availability: ''
        })
        fetchServiceRequests() // Listeyi yenile
      } else {
        toast.error(data.error || 'Teklif gönderilirken hata oluştu')
      }
    } catch (error) {
      console.error('Send response error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSendingResponse(false)
    }
  }

  const openResponseModal = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setShowResponseModal(true)
  }

  const closeResponseModal = () => {
    setShowResponseModal(false)
    setSelectedRequest(null)
    setResponseData({
      message: '',
      proposedPrice: '',
      proposedDate: '',
      proposedTime: '',
      availability: ''
    })
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
    <div>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-gray-600">Talepler yükleniyor...</span>
      </div>

      {/* Category Filter Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Akıllı Filtreleme</h4>
            <p className="text-blue-800 text-sm">
              Sadece işletmenizin kategorisi ve konum bilgilerine uygun talepler görüntülenir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{allRequests.active.length}</h3>
              <p className="text-gray-600">Aktif Talep</p>
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
                {allRequests.responded.length}
              </h3>
              <p className="text-gray-600">Cevapladığım</p>
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
                {allRequests.accepted.length}
              </h3>
              <p className="text-gray-600">Kabul Edilen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentFilter === 'active'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Aktif Talepler
          </button>
          <button
            onClick={() => handleFilterChange('responded')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentFilter === 'responded'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Cevapladıklarım
          </button>
          <button
            onClick={() => handleFilterChange('accepted')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentFilter === 'accepted'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Kabul Edilenler
          </button>
        </div>
      </div>

      {/* Filter Info */}
      {currentFilter === 'active' && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Akıllı Filtreleme Aktif</h4>
              <p className="text-blue-800 text-sm">
                Sadece işletmenizin kategorisi ve konum bilgileriyle uyuşan talepler görüntülenür.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Service Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentFilter === 'active' && 'Henüz aktif talep yok'}
              {currentFilter === 'responded' && 'Henüz cevapladığınız talep yok'}
              {currentFilter === 'accepted' && 'Henüz kabul edilen teklifiniz yok'}
            </h3>
            <p className="text-gray-600">
              {currentFilter === 'active' && 'Size uygun talepler geldiğinde burada görünecek.'}
              {currentFilter === 'responded' && 'Cevapladığınız talepler burada görünecek.'}
              {currentFilter === 'accepted' && 'Kabul edilen teklifleriniz burada görünecek.'}
            </p>
          </div>
        ) : (
          requests.map((request) => {
            const hasResponse = request.responses.some(res => 
              res.businessId === businessInfo?.id || res.businessId === session?.user?.id
            )
            const myResponse = request.responses.find(res => 
              res.businessId === businessInfo?.id || res.businessId === session?.user?.id
            )
            const isExpired = new Date() > new Date(request.expiresAt)
            const isAccepted = myResponse?.status === 'ACCEPTED'
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.serviceName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${urgencyColors[request.urgency]}`}>
                        {urgencyLabels[request.urgency]}
                      </span>
                      {isExpired && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Süresi Doldu
                        </span>
                      )}
                    </div>
                    
                    {request.serviceDetails && (
                      <p className="text-gray-600 mb-3">{request.serviceDetails}</p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDate(request.createdAt)}</p>
                    <p>{formatTime(request.createdAt)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4" />
                    <span>{request.customerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{request.customerPhone}</span>
                  </div>
                  
                  {request.province && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>
                        {request.district ? `${request.district}, ` : ''}{request.province}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  {request.budget && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>Bütçe: ₺{request.budget.toLocaleString('tr-TR')}</span>
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
                  
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      Bitiş: {formatDate(request.expiresAt)} {formatTime(request.expiresAt)}
                    </span>
                  </div>
                </div>

                {/* Kabul edilen teklif detayları */}
                {isAccepted && myResponse && (
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Teklifiniz Kabul Edildi!</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {myResponse.proposedPrice && (
                        <div className="text-gray-700">
                          <span className="font-medium">Kabul Edilen Fiyat:</span> ₺{myResponse.proposedPrice.toLocaleString('tr-TR')}
                        </div>
                      )}
                      {myResponse.proposedDate && (
                        <div className="text-gray-700">
                          <span className="font-medium">Tarih:</span> {formatDate(myResponse.proposedDate)}
                          {myResponse.proposedTime && ` ${myResponse.proposedTime}`}
                        </div>
                      )}
                    </div>
                    {myResponse.message && (
                      <div className="mt-3 text-sm text-gray-700">
                        <span className="font-medium">Mesajınız:</span> {myResponse.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {isAccepted 
                      ? 'Tebrikler! Müşteri ile iletişime geçin ve hizmeti planlayabilirsiniz.'
                      : 'Teklifi doğrulamak için müşteriyi arayabilirsiniz'
                    }
                  </div>
                  
                  {isAccepted ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Kabul Edildi</span>
                    </div>
                  ) : hasResponse ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Teklif gönderildi</span>
                    </div>
                  ) : isExpired ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <XCircleIcon className="w-5 h-5" />
                      <span className="text-sm">Süresi doldu</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openResponseModal(request)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Teklif Gönder
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Teklif Gönder</h2>
              <button
                onClick={closeResponseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircleIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Request Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedRequest.serviceName}</h3>
                <p className="text-gray-600 mb-2">{selectedRequest.serviceDetails}</p>
                <div className="text-sm text-gray-500">
                  <p>Müşteri: {selectedRequest.customerName}</p>
                  <p>Telefon: {selectedRequest.customerPhone}</p>
                  {selectedRequest.budget && (
                    <p>Bütçe: ₺{selectedRequest.budget.toLocaleString('tr-TR')}</p>
                  )}
                </div>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesajınız *
                  </label>
                  <textarea
                    value={responseData.message}
                    onChange={(e) => setResponseData(prev => ({...prev, message: e.target.value}))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                    placeholder="Teklifinizi ve hizmet detaylarınızı açıklayın..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önerilen Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={responseData.proposedPrice}
                      onChange={(e) => setResponseData(prev => ({...prev, proposedPrice: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önerilen Tarih
                    </label>
                    <input
                      type="date"
                      value={responseData.proposedDate}
                      onChange={(e) => setResponseData(prev => ({...prev, proposedDate: e.target.value}))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önerilen Saat
                    </label>
                    <input
                      type="time"
                      value={responseData.proposedTime}
                      onChange={(e) => setResponseData(prev => ({...prev, proposedTime: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Müsaitlik
                    </label>
                    <input
                      type="text"
                      value={responseData.availability}
                      onChange={(e) => setResponseData(prev => ({...prev, availability: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                      placeholder="Örn: Hafta içi 09:00-17:00"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={closeResponseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => selectedRequest && handleSendResponse(selectedRequest.id)}
                  disabled={!responseData.message.trim() || sendingResponse}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingResponse ? 'Gönderiliyor...' : 'Teklif Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
