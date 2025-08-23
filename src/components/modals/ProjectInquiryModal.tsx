'use client'

import { useState } from 'react'
import { X, Hammer, MapPin, Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  phone: string
  email?: string
  address: string
  settings?: {
    minimumProjectAmount: number
    workingRadius: string
  }
}

interface ProjectInquiryModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
}

export default function ProjectInquiryModal({ 
  isOpen, 
  onClose, 
  business 
}: ProjectInquiryModalProps) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    location: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    preferredContactMethod: 'phone',
    urgency: 'normal'
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.projectTitle || !formData.projectDescription || !formData.contactName || !formData.contactPhone) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/inquiries/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          ...formData
        })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Bir hata oluştu, lütfen tekrar deneyin')
      }
    } catch (error) {
      setError('Bağlantı hatası, lütfen tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectTitle: '',
      projectDescription: '',
      budget: '',
      timeline: '',
      location: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      preferredContactMethod: 'phone',
      urgency: 'normal'
    })
    setSuccess(false)
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Proje Keşfi Talep Et</h2>
              <p className="text-orange-100 text-lg">{business.name}</p>
              <div className="flex items-center mt-3 space-x-6 text-sm text-orange-100">
                <div className="flex items-center space-x-2">
                  <Hammer className="w-4 h-4" />
                  <span>Proje Bazlı Hizmet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Ücretsiz Keşif</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose()
                setTimeout(resetForm, 300)
              }}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {!success ? (
            <div className="space-y-6">
              {/* İş Bilgileri */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Proje Detayları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proje Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.projectTitle}
                      onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                      placeholder="Örn: Evim için mutfak yenileme projesi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proje Açıklaması *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                      placeholder="Projenizi detaylıca açıklayın. Ne yapmak istiyorsunuz? Özel istekleriniz var mı?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahmini Bütçe
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">Bütçe aralığı seçin</option>
                        <option value="0-5000" className="text-gray-900">5.000₺ altı</option>
                        <option value="5000-15000" className="text-gray-900">5.000₺ - 15.000₺</option>
                        <option value="15000-50000" className="text-gray-900">15.000₺ - 50.000₺</option>
                        <option value="50000-100000" className="text-gray-900">50.000₺ - 100.000₺</option>
                        <option value="100000+" className="text-gray-900">100.000₺ üzeri</option>
                        <option value="negotiable" className="text-gray-900">Pazarlığa açık</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zaman Çerçevesi
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="" className="text-gray-500">Süre seçin</option>
                        <option value="1-week" className="text-gray-900">1 hafta içinde</option>
                        <option value="2-4-weeks" className="text-gray-900">2-4 hafta</option>
                        <option value="1-3-months" className="text-gray-900">1-3 ay</option>
                        <option value="3-6-months" className="text-gray-900">3-6 ay</option>
                        <option value="6-months+" className="text-gray-900">6 ay üzeri</option>
                        <option value="flexible" className="text-gray-900">Esnek</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proje Konumu
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Proje yapılacağı adres (mahalle/semt)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">İletişim Bilgileri</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon Numaranız *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen İletişim Yöntemi
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        checked={formData.preferredContactMethod === 'phone'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-2 text-orange-500"
                      />
                      <span className="text-gray-900">Telefon</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={formData.preferredContactMethod === 'email'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-2 text-orange-500"
                      />
                      <span className="text-gray-900">E-posta</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={formData.preferredContactMethod === 'whatsapp'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-2 text-orange-500"
                      />
                      <span className="text-gray-900">WhatsApp</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Hammer className="w-6 h-6" />
                      <span>Keşif Talebini Gönder</span>
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-3">
                  Keşif talebi ücretsizdir. 24 saat içinde size dönüş yapılacaktır.
                </p>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-12">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-100 rounded-full -z-10 animate-ping"></div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Keşif Talebiniz Alındı!
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-700 text-lg mb-4">
                  Talebiniz başarıyla gönderildi. Uzmanımız en kısa sürede sizinle iletişime geçecek.
                </p>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Proje:</strong> {formData.projectTitle}</p>
                  <p><strong>İletişim:</strong> {formData.preferredContactMethod === 'phone' ? 'Telefon' : formData.preferredContactMethod === 'email' ? 'E-posta' : 'WhatsApp'}</p>
                  <p><strong>Yanıt Süresi:</strong> 24 saat içinde</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose()
                    setTimeout(resetForm, 300)
                  }}
                  className="bg-gradient-to-r from-orange-500 to-pink-600 text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Mükemmel! 🚀
                </button>
                
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                  {business.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{business.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
