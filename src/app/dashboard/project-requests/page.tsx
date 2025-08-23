'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Hammer,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Send
} from 'lucide-react'

interface ProjectRequest {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  projectDescription: string
  estimatedBudget?: number
  preferredDate?: string
  location?: string
  status: 'PENDING' | 'RESPONDED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  notes?: string
  businessResponse?: string
  estimatedPrice?: number
  responseDate?: string
  createdAt: string
  business: {
    name: string
    phone: string
    email?: string
  }
}

export default function ProjectRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseData, setResponseData] = useState({
    businessResponse: '',
    estimatedPrice: '',
    status: 'RESPONDED' as 'RESPONDED' | 'ACCEPTED' | 'REJECTED'
  })

  useEffect(() => {
    if (session?.user) {
      loadProjectRequests()
    }
  }, [session])

  const loadProjectRequests = async () => {
    try {
      setLoading(true)
      // First get the user's business ID
      const userResponse = await fetch('/api/settings/business')
      if (!userResponse.ok) throw new Error('Failed to get business info')
      
      const userData = await userResponse.json()
      const businessId = userData.business?.id
      
      if (!businessId) {
        console.error('No business found for user')
        return
      }

      // Then get project requests for this business
      const response = await fetch(`/api/project-requests?businessId=${businessId}`)
      if (!response.ok) throw new Error('Failed to load project requests')
      
      const data = await response.json()
      setRequests(data.projectRequests || [])
    } catch (error) {
      console.error('Error loading project requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/project-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...responseData,
          estimatedPrice: responseData.estimatedPrice ? parseFloat(responseData.estimatedPrice) : null
        })
      })

      if (response.ok) {
        await loadProjectRequests()
        setShowResponseModal(false)
        setSelectedRequest(null)
        setResponseData({
          businessResponse: '',
          estimatedPrice: '',
          status: 'RESPONDED'
        })
      } else {
        alert('Yanıt gönderilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error sending response:', error)
      alert('Bağlantı hatası oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESPONDED':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor'
      case 'RESPONDED':
        return 'Yanıtlandı'
      case 'ACCEPTED':
        return 'Kabul Edildi'
      case 'REJECTED':
        return 'Reddedildi'
      case 'COMPLETED':
        return 'Tamamlandı'
      default:
        return status
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.projectDescription.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    RESPONDED: requests.filter(r => r.status === 'RESPONDED').length,
    ACCEPTED: requests.filter(r => r.status === 'ACCEPTED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Hammer className="w-8 h-8 text-purple-600" />
            Proje Talepleri
          </h1>
          <p className="text-lg mt-2 text-gray-600">
            Müşterilerinizden gelen proje taleplerini yönetin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { key: 'all', label: 'Toplam', count: statusCounts.all, color: 'bg-gray-100 text-gray-800' },
          { key: 'PENDING', label: 'Bekliyor', count: statusCounts.PENDING, color: 'bg-yellow-100 text-yellow-800' },
          { key: 'RESPONDED', label: 'Yanıtlandı', count: statusCounts.RESPONDED, color: 'bg-blue-100 text-blue-800' },
          { key: 'ACCEPTED', label: 'Kabul', count: statusCounts.ACCEPTED, color: 'bg-green-100 text-green-800' },
          { key: 'REJECTED', label: 'Red', count: statusCounts.REJECTED, color: 'bg-red-100 text-red-800' },
          { key: 'COMPLETED', label: 'Tamamlandı', count: statusCounts.COMPLETED, color: 'bg-purple-100 text-purple-800' }
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              statusFilter === stat.key
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stat.color} mb-2`}>
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Müşteri adı veya proje açıklaması ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="PENDING">Bekliyor</option>
          <option value="RESPONDED">Yanıtlandı</option>
          <option value="ACCEPTED">Kabul Edildi</option>
          <option value="REJECTED">Reddedildi</option>
          <option value="COMPLETED">Tamamlandı</option>
        </select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Hammer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Filtreye uygun talep bulunamadı' : 'Henüz proje talebi yok'}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Farklı filtreler deneyebilirsiniz'
              : 'Müşterileriniz proje talebi gönderdiğinde burada görünecek'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.customerName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {request.customerPhone}
                      </div>
                      {request.customerEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.customerEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proje Açıklaması:</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {request.projectDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {request.estimatedBudget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        <strong>Tahmini Bütçe:</strong> ₺{request.estimatedBudget.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {request.preferredDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">
                        <strong>Tercih Edilen Tarih:</strong> {new Date(request.preferredDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                  
                  {request.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <span className="text-sm">
                        <strong>Lokasyon:</strong> {request.location}
                      </span>
                    </div>
                  )}
                </div>

                {request.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ek Notlar:</h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {request.notes}
                    </p>
                  </div>
                )}

                {request.businessResponse && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Yanıtınız:</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm mb-2">{request.businessResponse}</p>
                      {request.estimatedPrice && (
                        <p className="text-sm font-medium text-blue-800">
                          Tahmini Fiyat: ₺{request.estimatedPrice.toLocaleString()}
                        </p>
                      )}
                      {request.responseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Yanıt Tarihi: {new Date(request.responseDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {request.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setResponseData({
                        businessResponse: '',
                        estimatedPrice: '',
                        status: 'RESPONDED'
                      })
                      setShowResponseModal(true)
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Yanıtla
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setResponseData({
                        businessResponse: 'Bu proje şu anda kapasitemizin dışında, özür dileriz.',
                        estimatedPrice: '',
                        status: 'REJECTED'
                      })
                      setShowResponseModal(true)
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Proje Talebine Yanıt Ver</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{selectedRequest.customerName}</strong> adlı müşteriye yanıt veriyorsunuz
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yanıt Durumu
                  </label>
                  <select
                    value={responseData.status}
                    onChange={(e) => setResponseData({
                      ...responseData,
                      status: e.target.value as 'RESPONDED' | 'ACCEPTED' | 'REJECTED'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="RESPONDED">Yanıtlandı (Daha fazla bilgi verildi)</option>
                    <option value="ACCEPTED">Kabul Edildi</option>
                    <option value="REJECTED">Reddedildi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yanıt Mesajı *
                  </label>
                  <textarea
                    value={responseData.businessResponse}
                    onChange={(e) => setResponseData({
                      ...responseData,
                      businessResponse: e.target.value
                    })}
                    rows={4}
                    placeholder="Müşteriye gönderilecek yanıt mesajınızı yazın..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {responseData.status !== 'REJECTED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahmini Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={responseData.estimatedPrice}
                      onChange={(e) => setResponseData({
                        ...responseData,
                        estimatedPrice: e.target.value
                      })}
                      placeholder="15000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleResponse}
                    disabled={!responseData.businessResponse.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
