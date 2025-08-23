'use client'

import { useState } from 'react'
import { X, MessageCircle, Phone, Mail, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  phone: string
  email?: string
  address: string
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  business 
}: ContactModalProps) {
  const [formData, setFormData] = useState({
    inquiryType: 'general',
    subject: '',
    message: '',
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
    if (!formData.subject || !formData.message || !formData.contactName || !formData.contactPhone) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/inquiries/contact', {
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
      inquiryType: 'general',
      subject: '',
      message: '',
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

  const inquiryTypes = [
    { value: 'appointment', label: 'Randevu Almak İstiyorum', icon: '📅' },
    { value: 'project', label: 'Proje Hakkında Bilgi', icon: '🔨' },
    { value: 'consultation', label: 'Danışmanlık Almak İstiyorum', icon: '💡' },
    { value: 'pricing', label: 'Fiyat Bilgisi', icon: '💰' },
    { value: 'general', label: 'Genel Bilgi', icon: '💬' },
    { value: 'complaint', label: 'Şikayet/Öneri', icon: '📝' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">İletişime Geç</h2>
              <p className="text-indigo-100 text-lg">{business.name}</p>
              <div className="flex items-center mt-3 space-x-6 text-sm text-indigo-100">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Hızlı İletişim</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>24 saat içinde yanıt</span>
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
              {/* Konu Seçimi */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hangi konuda iletişime geçmek istiyorsunuz?</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {inquiryTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('inquiryType', type.value)}
                      className={`p-4 border-2 rounded-xl transition-all text-left hover:shadow-lg ${
                        formData.inquiryType === type.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className={`text-sm font-medium ${
                        formData.inquiryType === type.value ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesaj Detayları */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mesaj Detayları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konu *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Mesajınızın konusunu kısaca yazın"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Lütfen ihtiyacınızı, sorularınızı veya isteklerinizi detaylıca yazın..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aciliyet Durumu
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="low" className="text-gray-900">Düşük - Normal sırada yanıtlayın</option>
                      <option value="normal" className="text-gray-900">Normal - 24 saat içinde</option>
                      <option value="high" className="text-gray-900">Yüksek - Mümkün olan en kısa sürede</option>
                      <option value="urgent" className="text-gray-900">Acil - Aynı gün içinde</option>
                    </select>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tercih Edilen İletişim Yöntemi
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="phone"
                        checked={formData.preferredContactMethod === 'phone'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-3 text-purple-500"
                      />
                      <Phone className="w-5 h-5 mr-2 text-green-500" />
                      <span className="text-gray-900">Telefon</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="email"
                        checked={formData.preferredContactMethod === 'email'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-3 text-purple-500"
                      />
                      <Mail className="w-5 h-5 mr-2 text-blue-500" />
                      <span className="text-gray-900">E-posta</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={formData.preferredContactMethod === 'whatsapp'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="mr-3 text-purple-500"
                      />
                      <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
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
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-6 h-6" />
                      <span>Mesajı Gönder</span>
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-3">
                  Mesajınız 24 saat içinde yanıtlanacaktır.
                </p>
              </div>

              {/* İletişim Bilgileri */}
              <div className="bg-gray-50 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Alternatif İletişim</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                  {business.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{business.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Pazartesi - Cuma: 09:00 - 18:00</span>
                  </div>
                </div>
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
                🎉 Mesajınız Gönderildi!
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-700 text-lg mb-4">
                  Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapılacaktır.
                </p>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Konu:</strong> {formData.subject}</p>
                  <p><strong>İletişim:</strong> {formData.preferredContactMethod === 'phone' ? 'Telefon' : formData.preferredContactMethod === 'email' ? 'E-posta' : 'WhatsApp'}</p>
                  <p><strong>Aciliyet:</strong> {
                    formData.urgency === 'low' ? 'Düşük' :
                    formData.urgency === 'normal' ? 'Normal' :
                    formData.urgency === 'high' ? 'Yüksek' : 'Acil'
                  }</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onClose()
                  setTimeout(resetForm, 300)
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Mükemmel! 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
