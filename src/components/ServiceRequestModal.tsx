'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface ServiceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
  provinces: any[]
  districts: any[]
  selectedProvinceId: number | null
  selectedDistrictId: number | null
  searchQuery?: string
}

interface FormData {
  customerName: string
  customerPhone: string
  customerEmail: string
  categoryId: string
  subcategoryId: string
  serviceName: string
  serviceDetails: string
  budget: string
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  provinceId: string
  districtId: string
  address: string
  preferredDate: string
  preferredTime: string
  flexibleTiming: boolean
}

const urgencyOptions = [
  { value: 'LOW', label: '1 hafta içinde', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'NORMAL', label: '2-3 gün içinde', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'HIGH', label: '24 saat içinde', color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'URGENT', label: 'Bugün', color: 'text-red-600', bg: 'bg-red-100' }
]

export default function ServiceRequestModal({
  isOpen,
  onClose,
  categories,
  provinces,
  districts,
  selectedProvinceId,
  selectedDistrictId,
  searchQuery
}: ServiceRequestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    categoryId: '',
    subcategoryId: '',
    serviceName: searchQuery || '',
    serviceDetails: '',
    budget: '',
    urgency: 'NORMAL',
    provinceId: selectedProvinceId?.toString() || '',
    districtId: selectedDistrictId?.toString() || '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    flexibleTiming: true
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [modalDistricts, setModalDistricts] = useState<any[]>(districts) // Modal için ayrı districts state

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (step === 1) {
      if (!formData.customerName.trim()) newErrors.customerName = 'Ad soyad gerekli'
      if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Telefon numarası gerekli'
      else if (!/^(\+90|0)?[0-9]{10}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
        newErrors.customerPhone = 'Geçerli bir telefon numarası giriniz'
      }
      if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Geçerli bir email adresi giriniz'
      }
    }

    if (step === 2) {
      if (!formData.serviceName.trim()) newErrors.serviceName = 'Hizmet açıklaması gerekli'
      if (!formData.provinceId) newErrors.provinceId = 'İl seçimi gerekli'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleProvinceChange = async (provinceId: string) => {
    handleInputChange('provinceId', provinceId)
    handleInputChange('districtId', '') // Reset district
    
    // Modal için ayrı districts fetch et - ana sayfa filtrelerini etkileme
    if (provinceId) {
      try {
        const response = await fetch(`/api/locations/districts?provinceId=${provinceId}`)
        if (response.ok) {
          const data = await response.json()
          setModalDistricts(data.districts || [])
        }
      } catch (error) {
        console.error('Districts fetch error:', error)
        setModalDistricts([])
      }
    } else {
      setModalDistricts([])
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    handleInputChange('categoryId', categoryId)
    handleInputChange('subcategoryId', '') // Reset subcategory
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(2)) return

    setLoading(true)
    
    try {
      const province = provinces.find(p => p.id === parseInt(formData.provinceId))
      const district = modalDistricts.find(d => d.id === parseInt(formData.districtId))
      
      const submitData = {
        ...formData,
        provinceId: parseInt(formData.provinceId),
        districtId: formData.districtId ? parseInt(formData.districtId) : null,
        province: province?.name || null,
        district: district?.name || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        preferredDate: formData.preferredDate || null,
        preferredTime: formData.preferredTime || null
      }

      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Talebiniz başarıyla oluşturuldu! İşletmeler size en kısa sürede dönüş yapacak.')
        onClose()
        
        // Form reset
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          categoryId: '',
          subcategoryId: '',
          serviceName: '',
          serviceDetails: '',
          budget: '',
          urgency: 'NORMAL',
          provinceId: '',
          districtId: '',
          address: '',
          preferredDate: '',
          preferredTime: '',
          flexibleTiming: true
        })
        setCurrentStep(1)
        setErrors({})
      } else {
        toast.error(data.error || 'Talep oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Service request submit error:', error)
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const selectedUrgency = urgencyOptions.find(u => u.value === formData.urgency)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hizmet Talebi Oluştur</h2>
            <p className="text-gray-600 text-sm mt-1">
              İhtiyacınıza uygun işletmeler size teklif gönderecek
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-3 rounded ${
              currentStep > 1 ? 'bg-emerald-600' : 'bg-gray-200'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-3 text-sm text-gray-600">
              {currentStep === 1 ? 'İletişim Bilgileri' : 'Hizmet Detayları'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  İletişim Bilgileriniz
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 ${
                        errors.customerName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Adınız ve soyadınız"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon Numarası *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 ${
                          errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="05xx xxx xx xx"
                      />
                    </div>
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Adresi (İsteğe bağlı)
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 ${
                          errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                      />
                    </div>
                    {errors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Service Details */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              {/* Service Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hizmet Bilgileri
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İhtiyacınız Olan Hizmet *
                    </label>
                    <input
                      type="text"
                      value={formData.serviceName}
                      onChange={(e) => handleInputChange('serviceName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 ${
                        errors.serviceName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Örn: Saç kesimi, Diş temizliği, Araç yıkama..."
                    />
                    {errors.serviceName && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detaylı Açıklama (İsteğe bağlı)
                    </label>
                    <textarea
                      value={formData.serviceDetails}
                      onChange={(e) => handleInputChange('serviceDetails', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-900 placeholder-gray-500"
                      placeholder="Hizmetle ilgili ek detaylarınız..."
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      >
                        <option value="">Kategori seçin</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Kategori
                      </label>
                      <select
                        value={formData.subcategoryId}
                        onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                        disabled={!selectedCategory?.subcategories?.length}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 text-gray-900 bg-white"
                      >
                        <option value="">Alt kategori seçin</option>
                        {selectedCategory?.subcategories?.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Konum
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İl *
                      </label>
                      <select
                        value={formData.provinceId}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white ${
                          errors.provinceId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">İl seçin</option>
                        {provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {errors.provinceId && (
                        <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İlçe
                      </label>
                      <select
                        value={formData.districtId}
                        onChange={(e) => handleInputChange('districtId', e.target.value)}
                        disabled={!modalDistricts.length}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 text-gray-900 bg-white"
                      >
                        <option value="">İlçe seçin</option>
                        {modalDistricts.map(district => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres Detayı (İsteğe bağlı)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                      placeholder="Mahalle, sokak, bina no..."
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Urgency */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                    Bütçe (İsteğe bağlı)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                    placeholder="₺"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                    Aciliyet
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                  >
                    {urgencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedUrgency && (
                    <p className={`text-sm mt-1 ${selectedUrgency.color}`}>
                      {selectedUrgency.label}
                    </p>
                  )}
                </div>
              </div>

              {/* Timing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Zaman Tercihi
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tercih Edilen Tarih
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tercih Edilen Saat
                      </label>
                      <input
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.flexibleTiming}
                      onChange={(e) => handleInputChange('flexibleTiming', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      Zaman konusunda esnekliğim var
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Geri
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Gönderiliyor...' : 'Talep Oluştur'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
