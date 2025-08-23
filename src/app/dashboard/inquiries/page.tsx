'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useBusinessData } from '@/hooks/useBusinessData'
import { 
  ClockIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  InboxIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  VideoCameraIcon,
  PhoneArrowUpRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon as TimeIcon,
  FaceSmileIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface InquiryData {
  id: string
  type: 'consultation' | 'project'
  title: string
  description: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  status: string
  createdAt: string
  // Consultation specific
  date?: string
  meetingType?: string
  businessResponse?: string
  proposedDateTime?: string
  // Project specific
  budget?: number
  location?: string
  estimatedPrice?: number
  preferredDate?: string
}

export default function InquiriesPage() {
  const { data: session } = useSession()
  const { businessData } = useBusinessData()
  const [inquiries, setInquiries] = useState<InquiryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null)
  const [filter, setFilter] = useState<'all' | 'consultation' | 'project'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'RESPONDED' | 'COMPLETED'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [quickResponse, setQuickResponse] = useState('')
  const [showQuickResponse, setShowQuickResponse] = useState<string | null>(null)

  useEffect(() => {
    if (businessData?.id) {
      loadInquiries()
    }
  }, [businessData?.id])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inquiries/all?businessId=${businessData?.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      } else {
        setError('Talepler yüklenemedi')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const updateInquiryStatus = async (inquiryId: string, type: string, status: string, response?: string) => {
    try {
      const response_data = await fetch('/api/inquiries/all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId,
          type,
          status,
          businessId: businessData?.id,
          businessResponse: response
        })
      })

      if (response_data.ok) {
        loadInquiries()
        setSelectedInquiry(null)
        setShowQuickResponse(null)
        setQuickResponse('')
      } else {
        setError('Durum güncellenemedi')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter !== 'all' && inquiry.type !== filter) return false
    if (statusFilter !== 'all' && inquiry.status !== statusFilter) return false
    if (searchTerm && !inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inquiry.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    responded: inquiries.filter(i => i.status === 'RESPONDED').length,
    completed: inquiries.filter(i => i.status === 'COMPLETED').length,
    consultation: inquiries.filter(i => i.type === 'consultation').length,
    project: inquiries.filter(i => i.type === 'project').length,
    totalValue: inquiries.filter(i => i.budget).reduce((sum, i) => sum + (i.budget || 0), 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'RESPONDED': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'SCHEDULED': return 'bg-purple-50 text-purple-700 border border-purple-200'
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'REJECTED': return 'bg-red-50 text-red-700 border border-red-200'
      case 'CANCELLED': return 'bg-gray-50 text-gray-700 border border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede'
      case 'RESPONDED': return 'Yanıtlandı'
      case 'SCHEDULED': return 'Planlandı'
      case 'COMPLETED': return 'Tamamlandı'
      case 'REJECTED': return 'Reddedildi'
      case 'CANCELLED': return 'İptal Edildi'
      default: return status
    }
  }

  const getPriorityColor = (createdAt: string) => {
    const daysDiff = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24))
    if (daysDiff >= 3) return 'text-red-600'
    if (daysDiff >= 1) return 'text-amber-600'
    return 'text-green-600'
  }

  const getMeetingTypeIcon = (type?: string) => {
    switch (type) {
      case 'ONLINE': return <VideoCameraIcon className="w-4 h-4" />
      case 'PHONE': return <PhoneArrowUpRightIcon className="w-4 h-4" />
      default: return <UserGroupIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-300 opacity-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 opacity-10"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <InboxIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Keşif Talepleri
                    </h1>
                    <p className="text-gray-800 text-lg font-medium">Müşteri taleplerini yönet ve takip et</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Talep ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-72 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 placeholder-gray-600 shadow-sm"
                  />
                </div>
                
                {inquiries.length === 0 && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/test-data', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ businessId: businessData?.id })
                        })
                        if (response.ok) {
                          loadInquiries()
                        }
                      } catch (error) {
                        console.error('Test verisi oluşturulamadı:', error)
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Test Verisi Oluştur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Toplam Talep</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-green-700 font-medium mt-1">+{stats.pending} yeni</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Beklemede</p>
                <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                <p className="text-xs text-amber-700 font-medium mt-1">Acil yanıt gerekli</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Yanıtlandı</p>
                <p className="text-3xl font-bold text-blue-700">{stats.responded}</p>
                <p className="text-xs text-blue-700 font-medium mt-1">Devam ediyor</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Tamamlandı</p>
                <p className="text-3xl font-bold text-emerald-700">{stats.completed}</p>
                <p className="text-xs text-emerald-700 font-medium mt-1">Başarılı</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Danışmanlık</p>
                <p className="text-3xl font-bold text-purple-700">{stats.consultation}</p>
                <p className="text-xs text-purple-700 font-medium mt-1">Görüşmeler</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Projeler</p>
                <p className="text-3xl font-bold text-orange-700">{stats.project}</p>
                <p className="text-xs text-orange-700 font-medium mt-1">İş fırsatları</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <BuildingOfficeIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Toplam Değer</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalValue.toLocaleString('tr-TR')}₺</p>
                <p className="text-xs text-green-700 font-medium mt-1">Potansiyel gelir</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">Filtreler:</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
              >
                <option value="all">Tüm Türler</option>
                <option value="consultation">Danışmanlık</option>
                <option value="project">Proje</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="RESPONDED">Yanıtlandı</option>
                <option value="COMPLETED">Tamamlandı</option>
              </select>

              <div className="flex items-center space-x-2 border border-gray-200 rounded-xl px-3 py-2">
                <span className="text-sm text-gray-600">Görünüm:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Bars3Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(filter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilter('all')
                  setStatusFilter('all')
                  setSearchTerm('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
            
            <div className="ml-auto text-sm font-medium text-gray-800">
              {filteredInquiries.length} / {inquiries.length} talep gösteriliyor
            </div>
          </div>
        </div>

        {/* Enhanced Inquiries Grid/List */}
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-6 bg-gray-50 rounded-2xl mb-6">
                <InboxIcon className="w-16 h-16 text-gray-500 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm || filter !== 'all' || statusFilter !== 'all' 
                  ? 'Aramanıza uygun talep bulunamadı' 
                  : 'Henüz talep bulunmuyor'
                }
              </h3>
              <p className="text-gray-700 font-medium mb-6">
                {searchTerm || filter !== 'all' || statusFilter !== 'all' 
                  ? 'Farklı filtreler deneyebilir veya aramayı temizleyebilirsiniz.' 
                  : 'Müşterilerden gelen keşif talepleri burada görünecek.'
                }
              </p>
              {(searchTerm || filter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFilter('all')
                    setStatusFilter('all')
                    setSearchTerm('')
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <span>Tüm Talepleri Göster</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  viewMode === 'list' ? 'p-6' : 'p-6'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${
                      inquiry.type === 'consultation' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {inquiry.type === 'consultation' 
                        ? <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        : <BuildingOfficeIcon className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{inquiry.title}</h3>
                      <p className="text-sm font-medium text-gray-700">{inquiry.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {getStatusText(inquiry.status)}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-4">
                  <p className="text-gray-800 text-sm line-clamp-3 font-medium">{inquiry.description}</p>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <TimeIcon className="w-4 h-4 text-gray-600" />
                        <span className={`font-medium ${getPriorityColor(inquiry.createdAt)}`}>
                          {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <PhoneIcon className="w-4 h-4 text-gray-600" />
                        <span className="truncate font-medium">
                          {inquiry.customerPhone && inquiry.customerPhone.trim() 
                            ? inquiry.customerPhone 
                            : 'Telefon belirtilmemiş'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {inquiry.type === 'project' && inquiry.budget && (
                        <div className="flex items-center space-x-2 text-sm">
                          <BanknotesIcon className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-green-700">
                            {inquiry.budget.toLocaleString('tr-TR')}₺
                          </span>
                        </div>
                      )}
                      
                      {inquiry.type === 'consultation' && inquiry.meetingType && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <div className="text-gray-600">{getMeetingTypeIcon(inquiry.meetingType)}</div>
                          <span className="font-medium">
                            {inquiry.meetingType === 'ONLINE' ? 'Online' :
                             inquiry.meetingType === 'PHONE' ? 'Telefon' : 'Yüz Yüze'}
                          </span>
                        </div>
                      )}
                      
                      {inquiry.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <MapPinIcon className="w-4 h-4 text-gray-600" />
                          <span className="truncate font-medium">{inquiry.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span className="text-sm">Detay</span>
                    </button>
                    
                    {inquiry.status === 'PENDING' && (
                      <div className="flex items-center space-x-2">
                        {showQuickResponse === inquiry.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Hızlı yanıt..."
                              value={quickResponse}
                              onChange={(e) => setQuickResponse(e.target.value)}
                              className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => updateInquiryStatus(inquiry.id, inquiry.type, 'RESPONDED', quickResponse)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setShowQuickResponse(null)
                                setQuickResponse('')
                              }}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowQuickResponse(inquiry.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Yanıtla</span>
                            </button>
                            <button
                              onClick={() => updateInquiryStatus(inquiry.id, inquiry.type, 'REJECTED')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    
                    {inquiry.status === 'RESPONDED' && (
                      <button
                        onClick={() => updateInquiryStatus(inquiry.id, inquiry.type, 'COMPLETED')}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Tamamla</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-sm`}>
                    {selectedInquiry.type === 'consultation' 
                      ? <ChatBubbleLeftRightIcon className="w-8 h-8" />
                      : <BuildingOfficeIcon className="w-8 h-8" />
                    }
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedInquiry.title}</h2>
                    <div className="flex items-center space-x-4 text-white/80">
                      <span className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{selectedInquiry.customerName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{format(new Date(selectedInquiry.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                        {selectedInquiry.type === 'consultation' ? 'Danışmanlık' : 'Proje'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    <span>Müşteri Bilgileri</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <UserGroupIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                        <p className="text-sm font-medium text-gray-700">Ad Soyad</p>
                        <p className="font-semibold text-gray-900">{selectedInquiry.customerName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <PhoneIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                        <p className="text-sm font-medium text-gray-700">Telefon</p>
                        <p className="font-semibold text-gray-900">
                            {selectedInquiry.customerPhone && selectedInquiry.customerPhone.trim()
                                ? selectedInquiry.customerPhone 
                                : 'Telefon numarası belirtilmemiş'
                              }
                            </p>
                          </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedInquiry.customerEmail && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <EnvelopeIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">E-posta</p>
                            <p className="font-semibold text-gray-900">{selectedInquiry.customerEmail}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <ClockIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Talep Tarihi</p>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(selectedInquiry.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                    <span>Talep Detayları</span>
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">{selectedInquiry.description}</p>
                  </div>
                </div>

                {/* Type Specific Information */}
                {selectedInquiry.type === 'project' ? (
                  <div className="bg-orange-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                      <span>Proje Bilgileri</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedInquiry.budget && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BanknotesIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Bütçe</p>
                            <p className="text-xl font-bold text-green-600">
                              {selectedInquiry.budget.toLocaleString('tr-TR')}₺
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedInquiry.location && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPinIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Lokasyon</p>
                            <p className="font-semibold text-gray-900">{selectedInquiry.location}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedInquiry.preferredDate && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CalendarDaysIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Tercih Edilen Tarih</p>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(selectedInquiry.preferredDate), 'dd MMMM yyyy', { locale: tr })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                      <span>Danışmanlık Bilgileri</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedInquiry.date && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Tercih Edilen Tarih</p>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(selectedInquiry.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedInquiry.meetingType && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {getMeetingTypeIcon(selectedInquiry.meetingType)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Görüşme Türü</p>
                            <p className="font-semibold text-gray-900">
                              {selectedInquiry.meetingType === 'ONLINE' ? 'Online Toplantı' :
                               selectedInquiry.meetingType === 'PHONE' ? 'Telefon Görüşmesi' : 'Yüz Yüze Görüşme'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Response */}
                {selectedInquiry.businessResponse && (
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                      <span>Verilen Yanıt</span>
                    </h3>
                    <div className="bg-white border border-blue-200 rounded-xl p-4">
                      <p className="text-gray-800 whitespace-pre-wrap font-medium">{selectedInquiry.businessResponse}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              {selectedInquiry.status === 'PENDING' && (
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <textarea
                        placeholder="Müşteriye yanıtınızı yazın..."
                        value={quickResponse}
                        onChange={(e) => setQuickResponse(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => updateInquiryStatus(selectedInquiry.id, selectedInquiry.type, 'RESPONDED', quickResponse)}
                        disabled={!quickResponse.trim()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Yanıtla</span>
                      </button>
                      <button
                        onClick={() => updateInquiryStatus(selectedInquiry.id, selectedInquiry.type, 'REJECTED')}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        <span>Reddet</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedInquiry.status === 'RESPONDED' && (
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-center">
                    <button
                      onClick={() => updateInquiryStatus(selectedInquiry.id, selectedInquiry.type, 'COMPLETED')}
                      className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Tamamlandı Olarak İşaretle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-2 hover:bg-red-600 rounded p-1 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
