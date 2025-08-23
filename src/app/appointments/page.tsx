'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  HeartIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  ClockIcon as TimeIcon,
  CameraIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/MainHeader'

interface Appointment {
  id: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  business: {
    name: string
    slug: string
    phone?: string
    address?: string
    profilePhotoUrl?: string
    category?: string
  }
  service: {
    name: string
    duration: number
    price: number
  }
  staff?: {
    name: string
  }
  notes?: string
  createdAt: string
  customerName: string
  customerPhone: string
  review?: {
    id: string
    rating: number
    comment: string
    createdAt: string
  }
}

// Review Modal Component
interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment
  onReviewSubmitted: () => void
}

function ReviewModal({ isOpen, onClose, appointment, onReviewSubmitted }: ReviewModalProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setComment('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating || !comment.trim()) {
      setError('Lütfen yıldız ve yorum alanlarını doldurun')
      return
    }

    if (!session?.user) {
      setError('Oturum bilgileriniz bulunamadı')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const reviewData = {
        appointmentId: appointment.id,
        rating,
        comment: comment.trim(),
        customerName: session.user.name || session.user.email || 'Kullanıcı',
        customerPhone: appointment.customerPhone || 'Telefon bilgisi yok',
        customerEmail: session.user.email || '',
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const result = await response.json()

      if (response.ok) {
        onReviewSubmitted()
        onClose()
      } else {
        setError(result.error || 'Değerlendirme gönderilirken hata oluştu')
      }
    } catch (err) {
      setError('Değerlendirme gönderilirken hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (currentRating: number, setRatingFunc: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatingFunc(star)}
            className="focus:outline-none transform hover:scale-110 transition-transform"
          >
            <StarIcon
              className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
                star <= currentRating
                  ? 'text-yellow-400 fill-current drop-shadow-sm'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        {currentRating > 0 && (
          <span className="ml-3 text-xl font-bold text-gray-800 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            {currentRating}/5
          </span>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="relative mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Deneyiminizi Değerlendirin</h2>
              <p className="text-gray-600">Aldığınız hizmet hakkında düşüncelerinizi paylaşın</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Appointment Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BuildingStorefrontIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{appointment.business.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <CalendarDaysIcon className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">
                      {new Date(appointment.date).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })} - {appointment.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <SparklesIcon className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{appointment.service.name}</span>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      ₺{appointment.service.price}
                    </span>
                  </div>
                  {appointment.staff && (
                    <div className="flex items-center text-gray-700">
                      <UserIcon className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="font-medium">Uzman: {appointment.staff.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-900 mb-6">
                Genel memnuniyetinizi değerlendirin
              </label>
              <div className="flex justify-center">
                {renderStars(rating, setRating)}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Deneyiminizi 1-5 yıldız arasında değerlendirin
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Detaylı yorumunuz
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                placeholder="Aldığınız hizmet hakkında detaylı yorumunuzu paylaşın. Bu yorumunuz diğer müşterilere yardımcı olacaktır..."
                required
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>En az 10 karakter yazın</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting || !rating || !comment.trim() || comment.length < 10}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <StarIcon className="w-5 h-5" />
                    Değerlendirmeyi Gönder
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchAppointments()
    }
  }, [session, status, router])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      } else {
        setError('Randevular yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowReviewModal(true)
  }

  const handleReviewSubmitted = () => {
    fetchAppointments()
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          text: 'Beklemede'
        }
      case 'CONFIRMED':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Onaylandı'
        }
      case 'COMPLETED':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Tamamlandı'
        }
      case 'CANCELLED':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircleIcon className="w-4 h-4" />,
          text: 'İptal Edildi'
        }
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <ExclamationTriangleIcon className="w-4 h-4" />,
          text: status
        }
    }
  }

  const canReview = (appointment: Appointment) => {
    if (appointment.status !== 'COMPLETED') return false
    if (appointment.review) return false
    
    const appointmentDate = new Date(appointment.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return appointmentDate > thirtyDaysAgo
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolid 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    )
  }

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const matchesSearch = appointment.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filter) {
      case 'upcoming':
        return appointmentDate >= now && appointment.status !== 'CANCELLED'
      case 'past':
        return appointmentDate < now || appointment.status === 'COMPLETED'
      case 'cancelled':
        return appointment.status === 'CANCELLED'
      default:
        return true
    }
  })

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    reviewed: appointments.filter(a => a.review).length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    totalSpent: appointments.filter(a => a.status === 'COMPLETED').reduce((sum, a) => sum + a.service.price, 0)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl h-32"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-8 rounded-2xl h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MainHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 opacity-10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <CalendarDaysIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Randevularım
                      </h1>
                      <p className="text-gray-600 text-lg">Tüm randevularınızı takip edin ve değerlendirin</p>
                    </div>
                  </div>
                </div>
               
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="İşletme veya hizmet ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filtrele:</span>
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-medium"
                >
                  <option value="all">Tümü ({appointments.length})</option>
                  <option value="upcoming">Yaklaşan ({appointments.filter(a => {
                    const appointmentDate = new Date(a.date)
                    const now = new Date()
                    now.setHours(0, 0, 0, 0)
                    return appointmentDate >= now && a.status !== 'CANCELLED'
                  }).length})</option>
                  <option value="past">Geçmiş ({appointments.filter(a => {
                    const appointmentDate = new Date(a.date)
                    const now = new Date()
                    now.setHours(0, 0, 0, 0)
                    return appointmentDate < now || a.status === 'COMPLETED'
                  }).length})</option>
                  <option value="cancelled">İptal Edilenler ({stats.cancelled})</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters */}
            {(filter !== 'all' || searchTerm) && (
              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Aktif filtreler:</span>
                {filter !== 'all' && (
                  <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                    <span>{filter === 'upcoming' ? 'Yaklaşan' : filter === 'past' ? 'Geçmiş' : 'İptal Edilenler'}</span>
                    <button onClick={() => setFilter('all')} className="text-blue-600 hover:text-blue-800 ml-1">×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                    <span>"{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="text-green-600 hover:text-green-800 ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilter('all')
                    setSearchTerm('')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>

          {/* Appointments List */}
          {error ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-red-50 rounded-2xl mb-6">
                  <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Bir Hata Oluştu</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchAppointments}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  <span>Tekrar Dene</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-gray-50 rounded-2xl mb-6">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {appointments.length === 0 ? 'Henüz randevunuz yok' : 'Aradığınız kriterlere uygun randevu bulunamadı'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {appointments.length === 0 
                    ? 'İlk randevunuzu oluşturmak için işletmeleri keşfedin.'
                    : 'Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.'
                  }
                </p>
                {appointments.length === 0 ? (
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    <span>İşletmeleri Keşfet</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setFilter('all')
                      setSearchTerm('')
                    }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <span>Tüm Randevuları Göster</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => {
                const statusConfig = getStatusConfig(appointment.status)
                
                return (
                  <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    
                    {/* Header - Responsive */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {appointment.business.profilePhotoUrl ? (
                              <img 
                                src={appointment.business.profilePhotoUrl} 
                                alt={appointment.business.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <BuildingStorefrontIcon className={`w-7 h-7 text-white ${
                              appointment.business.profilePhotoUrl ? 'hidden' : ''
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                              {appointment.business.name}
                            </h3>
                            <p className="text-blue-600 font-semibold text-sm sm:text-base truncate">{appointment.service.name}</p>
                            {appointment.business.category && (
                              <p className="text-gray-500 text-xs sm:text-sm truncate">{appointment.business.category}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <span className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="hidden sm:inline">{statusConfig.text}</span>
                            <span className="sm:hidden">
                              {statusConfig.text === 'Beklemede' ? 'Bekliyor' : 
                               statusConfig.text === 'Onaylandı' ? 'Onaylı' :
                               statusConfig.text === 'Tamamlandı' ? 'Tamam' :
                               statusConfig.text === 'İptal Edildi' ? 'İptal' : statusConfig.text}
                            </span>
                          </span>
                          
                          {/* Review Status Badge */}
                          {appointment.status === 'COMPLETED' && (
                            <span className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border ${
                              appointment.review 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : canReview(appointment) 
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">
                                {appointment.review 
                                  ? 'Değerlendirildi' 
                                  : canReview(appointment) 
                                    ? 'Değerlendirilebilir'
                                    : 'Süre Doldu'
                                }
                              </span>
                              <span className="sm:hidden">
                                {appointment.review 
                                  ? 'Değerli' 
                                  : canReview(appointment) 
                                    ? 'Yorum'
                                    : 'Süre'
                                }
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content - Responsive */}
                    <div className="p-4 sm:p-6">
                      {/* Details Grid - Responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                        
                        {/* Date & Time */}
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Tarih & Saat</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(appointment.date).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-blue-600 font-medium">{appointment.time}</p>
                          </div>
                        </div>

                        {/* Duration & Price */}
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BanknotesIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Süre & Ücret</p>
                            <p className="font-semibold text-gray-900">{appointment.service.duration} dakika</p>
                            <p className="text-green-600 font-bold">₺{appointment.service.price}</p>
                          </div>
                        </div>

                        {/* Staff */}
                        {appointment.staff && (
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <UserIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Uzman</p>
                              <p className="font-semibold text-gray-900">{appointment.staff.name}</p>
                            </div>
                          </div>
                        )}

                        {/* Location - Google Maps */}
                        {appointment.business.address && (
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <MapPinIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Konum</p>
                              <button
                                onClick={() => {
                                  const encodedAddress = encodeURIComponent(appointment.business.address!)
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm underline underline-offset-2 transition-colors"
                              >
                                Haritada Görüntüle
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Existing Review Display */}
                      {appointment.review && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                              <StarIcon className="w-5 h-5" />
                              Değerlendirmeniz
                            </h4>
                            <div className="flex items-center space-x-2">
                              {renderStars(appointment.review.rating)}
                              <span className="text-sm font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                {appointment.review.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-yellow-800 leading-relaxed mb-3 italic">
                            "{appointment.review.comment}"
                          </p>
                          <p className="text-xs text-yellow-600 flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>
                              {new Date(appointment.review.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })} tarihinde değerlendirildi
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Özel Notlar</p>
                              <p className="text-gray-800 leading-relaxed">{appointment.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions - Responsive */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 space-y-4 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-3">
                          {appointment.business.phone && (
                            <a
                              href={`tel:${appointment.business.phone}`}
                              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200 font-medium text-sm"
                            >
                              <PhoneIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">Ara</span>
                              <span className="sm:hidden">Tel</span>
                            </a>
                          )}
                          
                          <Link
                            href={`/${appointment.business.slug}`}
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-medium text-sm"
                          >
                            <BuildingStorefrontIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">İşletmeyi Görüntüle</span>
                            <span className="sm:hidden">İşletme</span>
                          </Link>

                          {/* Review Action Button */}
                          {canReview(appointment) && (
                            <button
                              onClick={() => handleReviewClick(appointment)}
                              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                            >
                              <StarIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">Değerlendir</span>
                              <span className="sm:hidden">Yorum</span>
                            </button>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            Oluşturulma: {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="sm:hidden">
                            {new Date(appointment.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedAppointment && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedAppointment(null)
          }}
          appointment={selectedAppointment}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  )
}
