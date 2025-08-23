'use client'

import { useState } from 'react'
import { X, Lightbulb, Calendar, Clock, CheckCircle, AlertCircle, Loader2, Video, Users, Phone } from 'lucide-react'

interface Business {
  id: string
  name: string
  phone: string
  email?: string
  settings?: {
    consultationFee: number
    isConsultationFree: boolean
    supportedMeetingTypes: string[]
  }
}

interface ConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
}

export default function ConsultationModal({ 
  isOpen, 
  onClose, 
  business 
}: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    consultationTopic: '',
    consultationDescription: '',
    preferredDate: '',
    preferredTime: '',
    meetingType: 'online',
    duration: '30',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    previousExperience: '',
    specificQuestions: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.consultationTopic || !formData.contactName || !formData.contactPhone || !formData.preferredDate) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/inquiries/consultation', {
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
      consultationTopic: '',
      consultationDescription: '',
      preferredDate: '',
      preferredTime: '',
      meetingType: 'online',
      duration: '30',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      previousExperience: '',
      specificQuestions: ''
    })
    setSuccess(false)
    setError('')
  }

  // Get today's date for minimum date selection
  const today = new Date().toISOString().split('T')[0]

  if (!isOpen) return null

  const isConsultationFree = business.settings?.isConsultationFree !== false
  const consultationFee = business.settings?.consultationFee || 0
  const supportedMeetingTypes = business.settings?.supportedMeetingTypes || ['online', 'face_to_face']

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Ön Görüşme Talep Et</h2>
              <p className="text-blue-100 text-lg">{business.name}</p>
              <div className="flex items-center mt-3 space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Danışmanlık Hizmeti</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{isConsultationFree ? 'İlk Görüşme Ücretsiz' : `${consultationFee}₺/saat`}</span>
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
              {/* Danışmanlık Konusu */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Danışmanlık Konusu</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hangi konuda danışmanlık almak istiyorsunuz? *
                    </label>
                    <input
                      type="text"
                      value={formData.consultationTopic}
                      onChange={(e) => handleInputChange('consultationTopic', e.target.value)}
                      placeholder="Örn: İş stratejisi, pazarlama, teknoloji seçimi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detaylı Açıklama
                    </label>
                    <textarea
                      rows={4}
                      value={formData.consultationDescription}
                      onChange={(e) => handleInputChange('consultationDescription', e.target.value)}
                      placeholder="Mevcut durumunuzu ve almak istediğiniz danışmanlığı detaylıca açıklayın"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Özel Sorularınız
                    </label>
                    <textarea
                      rows={3}
                      value={formData.specificQuestions}
                      onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
                      placeholder="Görüşmede özellikle cevap almak istediğiniz sorular varsa yazabilirsiniz"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Görüşme Ayarları */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Görüşme Tercihleri</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tercih Edilen Tarih *
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={today}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tercih Edilen Saat
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="" className="text-gray-500">Saat seçin</option>
                      <option value="09:00" className="text-gray-900">09:00</option>
                      <option value="10:00" className="text-gray-900">10:00</option>
                      <option value="11:00" className="text-gray-900">11:00</option>
                      <option value="13:00" className="text-gray-900">13:00</option>
                      <option value="14:00" className="text-gray-900">14:00</option>
                      <option value="15:00" className="text-gray-900">15:00</option>
                      <option value="16:00" className="text-gray-900">16:00</option>
                      <option value="17:00" className="text-gray-900">17:00</option>
                      <option value="flexible" className="text-gray-900">Esnek</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görüşme Şekli
                    </label>
                    <div className="space-y-3">
                      {supportedMeetingTypes.includes('online') && (
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="online"
                            checked={formData.meetingType === 'online'}
                            onChange={(e) => handleInputChange('meetingType', e.target.value)}
                            className="mr-3 text-blue-500"
                          />
                          <Video className="w-5 h-5 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">Online Görüşme</div>
                            <div className="text-sm text-gray-500">Zoom/Teams üzerinden</div>
                          </div>
                        </label>
                      )}
                      
                      {supportedMeetingTypes.includes('face_to_face') && (
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="face_to_face"
                            checked={formData.meetingType === 'face_to_face'}
                            onChange={(e) => handleInputChange('meetingType', e.target.value)}
                            className="mr-3 text-blue-500"
                          />
                          <Users className="w-5 h-5 mr-2 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900">Yüz Yüze Görüşme</div>
                            <div className="text-sm text-gray-500">Ofiste buluşalım</div>
                          </div>
                        </label>
                      )}
                      
                      {supportedMeetingTypes.includes('phone') && (
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value="phone"
                            checked={formData.meetingType === 'phone'}
                            onChange={(e) => handleInputChange('meetingType', e.target.value)}
                            className="mr-3 text-blue-500"
                          />
                          <Phone className="w-5 h-5 mr-2 text-orange-500" />
                          <div>
                            <div className="font-medium text-gray-900">Telefon Görüşmesi</div>
                            <div className="text-sm text-gray-500">Sesli görüşme</div>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görüşme Süresi
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="30" className="text-gray-900">30 dakika</option>
                      <option value="45" className="text-gray-900">45 dakika</option>
                      <option value="60" className="text-gray-900">1 saat</option>
                      <option value="90" className="text-gray-900">1.5 saat</option>
                      <option value="120" className="text-gray-900">2 saat</option>
                    </select>
                    
                    {!isConsultationFree && consultationFee > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tahmini ücret: {Math.round((parseInt(formData.duration) / 60) * consultationFee)}₺
                      </p>
                    )}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bu Konudaki Geçmiş Deneyiminiz
                  </label>
                  <textarea
                    rows={2}
                    value={formData.previousExperience}
                    onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                    placeholder="Bu konuda daha önce çalıştınız mı? Hangi seviyede bilginiz var?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
              </div>

              {/* Ücret Bilgilendirmesi */}
              {isConsultationFree ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">İlk görüşme ücretsizdir!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Durumunuzu anlayıp size nasıl yardımcı olabileceğimizi değerlendireceğiz.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Danışmanlık Ücreti: {consultationFee}₺/saat</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Görüşme sonrası ödeme yapılır. İptal durumunda ücret alınmaz.
                  </p>
                </div>
              )}

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
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-6 h-6" />
                      <span>Görüşme Talebini Gönder</span>
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-3">
                  Talep gönderildikten sonra 24 saat içinde size dönüş yapılacaktır.
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
                🎉 Görüşme Talebiniz Alındı!
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-700 text-lg mb-4">
                  Danışmanlık talebiniz başarıyla gönderildi. Uzmanımız en kısa sürede sizinle iletişime geçecek.
                </p>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Konu:</strong> {formData.consultationTopic}</p>
                  <p><strong>Tarih:</strong> {formData.preferredDate}</p>
                  <p><strong>Süre:</strong> {formData.duration} dakika</p>
                  <p><strong>Şekil:</strong> {
                    formData.meetingType === 'online' ? 'Online' :
                    formData.meetingType === 'face_to_face' ? 'Yüz yüze' : 'Telefon'
                  }</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  onClose()
                  setTimeout(resetForm, 300)
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
