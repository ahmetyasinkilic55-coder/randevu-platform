// components/DynamicActionButton.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Hammer, 
  Lightbulb, 
  MessageCircle, 
  Phone, 
  Video,
  MapPin,
  Clock,
  DollarSign,
  Send
} from 'lucide-react'
import AppointmentModal from '@/components/AppointmentModal'

interface BusinessSettings {
  serviceType: string
  buttonText: string
  consultationFee: number
  isConsultationFree: boolean
  minimumProjectAmount: number
  workingRadius?: string
  supportedMeetingTypes?: string
}

interface DynamicActionButtonProps {
  businessData: {
    id: string
    name: string
    phone: string
    email?: string
    address: string
    settings?: BusinessSettings
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function DynamicActionButton({ 
  businessData, 
  className = '',
  size = 'lg'
}: DynamicActionButtonProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)
  const [showHybridModal, setShowHybridModal] = useState(false)
  const [fullBusinessData, setFullBusinessData] = useState<any>(null)
  const [loadingBusinessData, setLoadingBusinessData] = useState(false)

  const serviceType = businessData.settings?.serviceType || 'APPOINTMENT'
  const buttonText = businessData.settings?.buttonText || 'Randevu Al'

  // Debug log
  console.log('🔧 DynamicActionButton Debug:', {
    serviceType,
    buttonText,
    hasSettings: !!businessData.settings,
    businessName: businessData.name
  })

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  // Icons for different service types
  const getIcon = () => {
    switch (serviceType) {
      case 'APPOINTMENT':
        return <Calendar className={iconSizeClasses[size]} />
      case 'PROJECT':
        return <Hammer className={iconSizeClasses[size]} />
      case 'CONSULTATION':
        return <Lightbulb className={iconSizeClasses[size]} />
      case 'HYBRID':
        return <MessageCircle className={iconSizeClasses[size]} />
      default:
        return <Calendar className={iconSizeClasses[size]} />
    }
  }

  // Fetch full business data when appointment modal is needed
  const fetchBusinessData = async () => {
    if (fullBusinessData) return fullBusinessData // Already loaded
    
    setLoadingBusinessData(true)
    try {
      console.log('🔍 [DynamicActionButton] Fetching business data for ID:', businessData.id)
      
      const response = await fetch(`/api/businesses/${businessData.id}`)
      
      console.log('🔍 [DynamicActionButton] API response status:', response.status)
      console.log('🔍 [DynamicActionButton] API response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [DynamicActionButton] Received business data:', {
          name: data.name,
          servicesCount: data.services?.length || 0,
          staffCount: data.staff?.length || 0
        })
        setFullBusinessData(data)
        return data
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [DynamicActionButton] API error response:', errorData)
        console.error('❌ [DynamicActionButton] Failed to fetch business data - Status:', response.status)
        return null
      }
    } catch (error) {
      console.error('❌ [DynamicActionButton] Network error:', error)
      console.error('❌ [DynamicActionButton] Error message:', error instanceof Error ? error.message : String(error))
      return null
    } finally {
      setLoadingBusinessData(false)
    }
  }

  const handleClick = async () => {
    switch (serviceType) {
      case 'APPOINTMENT':
        await fetchBusinessData()
        setShowAppointmentModal(true)
        break
      case 'PROJECT':
        setShowProjectModal(true)
        break
      case 'CONSULTATION':
        setShowConsultationModal(true)
        break
      case 'HYBRID':
        setShowHybridModal(true)
        break
      default:
        await fetchBusinessData()
        setShowAppointmentModal(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center gap-3 
          ${sizeClasses[size]}
          bg-gradient-to-r from-purple-600 to-blue-600 
          text-white font-semibold rounded-xl
          hover:from-purple-700 hover:to-blue-700
          transform hover:scale-105 transition-all duration-300
          shadow-lg hover:shadow-xl
          ${className}
        `}
      >
        {getIcon()}
        <span>{buttonText}</span>
      </button>

      {/* Appointment Modal - Only show for APPOINTMENT type */}
      {(serviceType === 'APPOINTMENT' || serviceType === 'HYBRID') && showAppointmentModal && fullBusinessData && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          business={fullBusinessData}
        />
      )}

      {/* Project Request Modal */}
      {showProjectModal && (
        <ProjectRequestModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          businessData={businessData}
        />
      )}

      {/* Consultation Request Modal */}
      {showConsultationModal && (
        <ConsultationRequestModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
          businessData={businessData}
        />
      )}

      {/* Hybrid Service Modal */}
      {showHybridModal && (
        <HybridServiceModal
          isOpen={showHybridModal}
          onClose={() => setShowHybridModal(false)}
          businessData={businessData}
        />
      )}
    </>
  )
}

// Project Request Modal Component
interface ProjectRequestModalProps {
  isOpen: boolean
  onClose: () => void
  businessData: DynamicActionButtonProps['businessData']
}

function ProjectRequestModal({ isOpen, onClose, businessData }: ProjectRequestModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    projectDescription: '',
    estimatedBudget: '',
    preferredDate: '',
    location: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessData.id,
          ...formData
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            projectDescription: '',
            estimatedBudget: '',
            preferredDate: '',
            location: '',
            notes: ''
          })
        }, 2000)
      } else {
        alert('Hata oluştu, lütfen tekrar deneyin.')
      }
    } catch (error) {
      alert('Bağlantı hatası oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Hammer className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Proje Keşfi Talep Et</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Talebiniz Gönderildi!</h3>
              <p className="text-gray-600">İşletme sahibi en kısa sürede size dönüş yapacaktır.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proje Açıklaması *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                  placeholder="Projenizi detaylı bir şekilde açıklayın..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahmini Bütçe (₺)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({...formData, estimatedBudget: e.target.value})}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {businessData.settings?.minimumProjectAmount && (
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum proje tutarı: ₺{businessData.settings.minimumProjectAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen Tarih
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proje Lokasyonu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Çankaya, Ankara"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ek Notlar
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ek bilgiler, özel istekler..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Talep Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Consultation Request Modal Component
interface ConsultationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  businessData: DynamicActionButtonProps['businessData']
}

function ConsultationRequestModal({ isOpen, onClose, businessData }: ConsultationRequestModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    consultationTopic: '',
    preferredDateTime: '',
    meetingType: 'FACE_TO_FACE',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/consultation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessData.id,
          ...formData
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            consultationTopic: '',
            preferredDateTime: '',
            meetingType: 'FACE_TO_FACE',
            notes: ''
          })
        }, 2000)
      } else {
        alert('Hata oluştu, lütfen tekrar deneyin.')
      }
    } catch (error) {
      alert('Bağlantı hatası oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const supportedMeetingTypes = businessData.settings?.supportedMeetingTypes 
    ? JSON.parse(businessData.settings.supportedMeetingTypes)
    : ['face_to_face', 'online']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Danışmanlık Talebi</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {businessData.settings?.isConsultationFree && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm font-medium">
                🎉 İlk görüşme ücretsiz!
              </p>
            </div>
          )}

          {!businessData.settings?.isConsultationFree && businessData.settings?.consultationFee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                💰 Danışmanlık ücreti: <strong>₺{businessData.settings.consultationFee}/saat</strong>
              </p>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Talebiniz Gönderildi!</h3>
              <p className="text-gray-600">İşletme sahibi en kısa sürede size dönüş yapacaktır.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danışmanlık Konusu *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.consultationTopic}
                  onChange={(e) => setFormData({...formData, consultationTopic: e.target.value})}
                  placeholder="Hangi konuda danışmanlık almak istiyorsunuz?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen Tarih
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.preferredDateTime}
                    onChange={(e) => setFormData({...formData, preferredDateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görüşme Şekli
                  </label>
                  <select
                    value={formData.meetingType}
                    onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {supportedMeetingTypes.includes('face_to_face') && (
                      <option value="FACE_TO_FACE">Yüz Yüze</option>
                    )}
                    {supportedMeetingTypes.includes('online') && (
                      <option value="ONLINE">Online</option>
                    )}
                    {supportedMeetingTypes.includes('phone') && (
                      <option value="PHONE">Telefon</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ek Notlar
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ek bilgiler, özel istekler..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Talep Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Hybrid Service Modal Component
interface HybridServiceModalProps {
  isOpen: boolean
  onClose: () => void
  businessData: DynamicActionButtonProps['businessData']
}

function HybridServiceModal({ isOpen, onClose, businessData }: HybridServiceModalProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  if (!isOpen) return null

  const handleOptionClick = async (optionId: string) => {
    onClose() // Close hybrid modal first
    
    // Then open the appropriate modal
    setTimeout(async () => {
      switch (optionId) {
        case 'appointment':
          // We need to get parent component's fetchBusinessData function
          // For now, let's use direct fetch
          setShowAppointmentModal(true)
          break
        case 'project':
          setShowProjectModal(true)
          break
        case 'consultation':
          setShowConsultationModal(true)
          break
      }
    }, 100) // Small delay to ensure smooth transition
  }

  const serviceOptions = [
    {
      id: 'appointment',
      title: 'Randevu Al',
      description: 'Belirli bir tarih ve saatte hizmet almak için randevu alın',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'project',
      title: 'Proje Teklifi Al',
      description: 'Büyük projeniz için özel keşif ve fiyat teklifi alın',
      icon: <Hammer className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'consultation',
      title: 'Danışmanlık Al',
      description: 'Uzman görüşü ve danışmanlık hizmeti alın',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Hizmet Seçin</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            {businessData.name} farklı hizmet türleri sunuyor. Hangi hizmet türünü tercih ediyorsunuz?
          </p>

          <div className="space-y-3">
            {serviceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${option.color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Seçiminizi yaptıktan sonra ilgili form açılacaktır
            </p>
          </div>
        </div>
      </div>
      
      {/* Individual Modals for Hybrid Service */}
      {/* Note: For hybrid modal, we need to handle appointment modal differently */}
      {/* This is a temporary solution - hybrid modal needs refactoring */}
      
      {showProjectModal && (
        <ProjectRequestModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          businessData={businessData}
        />
      )}
      
      {showConsultationModal && (
        <ConsultationRequestModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
          businessData={businessData}
        />
      )}
    </div>
  )
}
