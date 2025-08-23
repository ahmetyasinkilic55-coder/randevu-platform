'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { 
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { getProvinces, getDistricts, Province, District } from '@/lib/location/turkiye-api'

// Interface'ler
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  categoryId: string
}

// Ayrı bir form componenti oluşturalım
const BusinessRegistrationForm = ({ onClose }: { onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  // Her field için ayrı state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  
  // Kredi kartı bilgileri
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  
  // Yeni state'ler - Konum
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  
  // Yeni state'ler - Kategori
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  
  // İlleri yükle
  useEffect(() => {
    async function loadProvinces() {
      try {
        const provincesData = await getProvinces()
        setProvinces(provincesData)
      } catch (error) {
        console.error('İller yüklenemedi:', error)
        toast.error('İller yüklenirken bir hata oluştu')
      }
    }
    loadProvinces()
  }, [])
  
  // Kategorileri yükle
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories?include=subcategories')
        const data = await response.json()
        if (response.ok) {
          setCategories(data.categories)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error)
        toast.error('Kategoriler yüklenirken bir hata oluştu')
      }
    }
    loadCategories()
  }, [])
  
  // İl seçildiğinde ilçeleri yükle
  useEffect(() => {
    async function loadDistricts() {
      if (!selectedProvince) {
        setDistricts([])
        setSelectedDistrict('')
        return
      }
      
      try {
        const province = provinces.find(p => p.id.toString() === selectedProvince)
        if (province) {
          const districtsData = await getDistricts(province.id)
          setDistricts(districtsData)
          setSelectedDistrict('') // Reset district when province changes
        }
      } catch (error) {
        console.error('İlçeler yüklenemedi:', error)
        toast.error('İlçeler yüklenirken bir hata oluştu')
      }
    }
    loadDistricts()
  }, [selectedProvince, provinces])
  
  // Kategori seçildiğinde alt kategorileri güncelle
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([])
      setSelectedSubcategory('')
      return
    }
    
    const category = categories.find(c => c.id === selectedCategory)
    if (category && category.subcategories) {
      setSubcategories(category.subcategories)
      setSelectedSubcategory('') // Reset subcategory when category changes
    }
  }, [selectedCategory, categories])

  // Şifre güçlülük kontrolü
  const isPasswordStrong = (pwd: string) => {
    const minLength = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    return minLength && hasUpper && hasLower && hasNumber
  }

  const getPasswordStrengthText = () => {
    if (!password) return ''
    if (password.length < 8) return 'En az 8 karakter olmalı'
    if (!/[A-Z]/.test(password)) return 'En az bir büyük harf içermeli'
    if (!/[a-z]/.test(password)) return 'En az bir küçük harf içermeli'
    if (!/\d/.test(password)) return 'En az bir rakam içermeli'
    return 'Güçlü şifre'
  }

  const isPasswordMatch = password === confirmPassword && password.length > 0

  // Kredi kartı doğrulama
  const isCardValid = cardNumber.replace(/\s/g, '').length >= 16 &&
                     cardExpiry.length === 5 &&
                     cardCvv.length >= 3 &&
                     cardName.trim().length > 0

  // Form validation
  const isFormValid = name.trim() && 
                     email.trim() && 
                     password.trim() && 
                     isPasswordStrong(password) &&
                     isPasswordMatch &&
                     phone.trim() &&
                     businessName.trim() && 
                     selectedCategory.trim() && 
                     selectedSubcategory.trim() &&
                     selectedProvince.trim() &&
                     selectedDistrict.trim() &&
                     address.trim() && 
                     address.length >= 10 &&  // Adres en az 10 karakter
                     isCardValid  // Kredi kartı bilgileri geçerli

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Önce kullanıcı oluştur
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          userType: 'business'
        })
      })

      if (!userResponse.ok) {
        const error = await userResponse.json()
        throw new Error(error.error || 'Kullanıcı kayıt hatası')
      }

      // Kullanıcı kaydı başarılı olduktan sonra otomatik giriş yap
      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        throw new Error('Kayıt başarılı ancak giriş yapılamadı. Lütfen manuel olarak giriş yapın.')
      }

      // Sonra işletme oluştur
      const selectedProvinceData = provinces.find(p => p.id.toString() === selectedProvince)
      const selectedDistrictData = districts.find(d => d.id.toString() === selectedDistrict)
      
      const businessResponse = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          category: 'OTHER',  // Legacy field - sabit değer
          categoryId: selectedCategory,
          subcategoryId: selectedSubcategory,
          phone,
          email,
          address,
          province: selectedProvinceData?.name,
          district: selectedDistrictData?.name,
          provinceId: selectedProvinceData?.id,
          districtId: selectedDistrictData?.id,
          latitude: selectedDistrictData?.latitude ? parseFloat(selectedDistrictData.latitude) : null,
          longitude: selectedDistrictData?.longitude ? parseFloat(selectedDistrictData.longitude) : null,
          description,
          paymentCard: {
            number: cardNumber.replace(/\s/g, ''),
            expiry: cardExpiry,
            cvv: cardCvv,
            name: cardName
          }
        })
      })

      if (businessResponse.ok) {
        toast.success('İşletmeniz başarıyla kaydedildi! Yönlendiriliyorsunuz...')
        
        // 2 saniye bekle ve sonra dashboard'a yönlendir
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
        
        onClose()
      } else {
        const error = await businessResponse.json()
        throw new Error(error.error || 'İşletme kayıt hatası')
      }
    } catch (error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        type="button"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">R</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">İşletme Kaydı</h2>
        <p className="text-slate-600">
          Tüm bilgilerinizi girerek işletmenizi kaydedin
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-2 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
            👤 Kişisel Bilgiler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="name"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">📧</span>
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔒</span>
              <input
                type="password"
                placeholder="Şifre (güçlü şifre)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm ${
                  password && !isPasswordStrong(password) ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                required
                autoComplete="new-password"
              />
              {password && (
                <div className={`text-sm mt-1 ${
                  isPasswordStrong(password) ? 'text-green-600' : 'text-red-500'
                }`}>
                  {getPasswordStrengthText()}
                </div>
              )}
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔒</span>
              <input
                type="password"
                placeholder="Şifre Tekrar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm ${
                  confirmPassword && !isPasswordMatch ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                required
                autoComplete="new-password"
              />
              {confirmPassword && !isPasswordMatch && (
                <div className="text-red-500 text-sm mt-1">
                  Şifreler eşleşmiyor
                </div>
              )}
            </div>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="tel"
                placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        {/* İşletme Bilgileri */}
        <div className="border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-2 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
            🏢 İşletme Bilgileri
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="İşletme Adı"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="organization"
              />
            </div>

            {/* Kategori Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🏢</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 appearance-none hover:border-slate-400 transition-colors shadow-sm"
                  required
                >
                  <option value="">Ana Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🎯</span>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 appearance-none hover:border-slate-400 transition-colors shadow-sm disabled:opacity-50"
                  required
                  disabled={!selectedCategory || subcategories.length === 0}
                >
                  <option value="">Alt Kategori Seçin</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.icon} {subcategory.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* İl ve İlçe Seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 appearance-none hover:border-slate-400 transition-colors shadow-sm"
                  required
                >
                  <option value="">İl Seçin</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id.toString()}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🏘️</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 appearance-none hover:border-slate-400 transition-colors shadow-sm disabled:opacity-50"
                  required
                  disabled={!selectedProvince || districts.length === 0}
                >
                  <option value="">İlçe Seçin</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id.toString()}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <textarea
                placeholder="Detaylı Adres (minimum 10 karakter)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 resize-none hover:border-slate-400 transition-colors shadow-sm ${
                  address.length > 0 && address.length < 10 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-slate-300'
                }`}
                rows={3}
                required
                autoComplete="street-address"
              />
              {address.length > 0 && address.length < 10 && (
                <div className="text-red-500 text-sm mt-1">
                  Adres en az 10 karakter olmalı (mevcut: {address.length})
                </div>
              )}
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">📝</span>
              <textarea
                placeholder="İşletme Açıklaması (Opsiyonel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 resize-none hover:border-slate-400 transition-colors shadow-sm"
                rows={3}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Ödeme Bilgileri */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <span className="w-2 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
            💳 Ödeme Bilgileri
          </h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
            <div className="flex items-center text-emerald-700 mb-2">
              <span className="mr-2">🎉</span>
              <span className="font-medium">İlk 30 gün ücretsiz! Ödeme bilgileriniz 30 gün sonra kullanılacak.</span>
            </div>
            <div className="flex items-center text-emerald-600 text-sm">
              <span className="mr-2">✨</span>
              <span>Dilediğiniz zaman üyeliğinizi iptal edebilirsiniz.</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">💳</span>
              <input
                type="text"
                placeholder="Kart Numarası (1234 5678 9012 3456)"
                value={cardNumber}
                onChange={(e) => {
                  // Sadece rakam ve boşluk kabul et, 4'lü gruplar halinde formatla
                  const value = e.target.value.replace(/[^\d]/g, '')
                  const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
                  if (formatted.length <= 19) setCardNumber(formatted)
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="cc-number"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">📅</span>
                <input
                  type="text"
                  placeholder="AA/YY"
                  value={cardExpiry}
                  onChange={(e) => {
                    // MM/YY formatı
                    const value = e.target.value.replace(/[^\d]/g, '')
                    if (value.length >= 2) {
                      const formatted = value.substring(0, 2) + (value.length > 2 ? '/' + value.substring(2, 4) : '')
                      setCardExpiry(formatted)
                    } else {
                      setCardExpiry(value)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                  required
                  maxLength={5}
                  autoComplete="cc-exp"
                />
              </div>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    if (value.length <= 4) setCardCvv(value)
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                  required
                  maxLength={4}
                  autoComplete="cc-csc"
                />
              </div>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">👤</span>
              <input
                type="text"
                placeholder="Kart Üzerindeki İsim"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                required
                autoComplete="cc-name"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`px-8 py-3 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
              isLoading || !isFormValid
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
            }`}
          >
            {isLoading ? 'Kaydediliyor...' : 'İşletme Kaydı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function BusinessLanding() {
  const { data: session } = useSession()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100"></div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 lg:px-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">RandevuPro</span>
            <span className="text-xs text-slate-400 hidden sm:block">Dijital Randevu Sistemi</span>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">Özellikler</a>
          <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Fiyatlar</a>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">Ana Sayfa</Link>
          {session ? (
            <Link href="/dashboard" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl">
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
            >
              Hemen Başla
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-3 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 transition-all duration-200 border border-slate-600"
          >
            {showMobileMenu ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg z-50 relative">
          <div className="px-6 py-6 space-y-4">
            <a 
              href="#features" 
              className="block text-slate-800 hover:text-emerald-600 transition-colors py-3 text-lg font-medium border-b border-slate-200"
              onClick={() => setShowMobileMenu(false)}
            >
              Özellikler
            </a>
            <a 
              href="#pricing" 
              className="block text-slate-800 hover:text-emerald-600 transition-colors py-3 text-lg font-medium border-b border-slate-200"
              onClick={() => setShowMobileMenu(false)}
            >
              Fiyatlar
            </a>
            <Link 
              href="/" 
              className="block text-slate-800 hover:text-emerald-600 transition-colors py-3 text-lg font-medium border-b border-slate-200"
              onClick={() => setShowMobileMenu(false)}
            >
              Ana Sayfa
            </Link>
            <div className="pt-6">
              {session ? (
                <Link 
                  href="/dashboard" 
                  className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl text-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setShowRegisterModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  Hemen Başla
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center py-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-5 py-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 text-sm font-medium">İşletmeler İçin Dijital Çözüm</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-900">
            İşletmenizi Dijitalleştirin,
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Müşterilerinize Daha Kolay Ulaşın</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Profesyonel website, akıllı randevu sistemi ve detaylı raporlama araçları ile 
            işletmenizi tek platformdan yönetin. Hızlı kurulum, kolay kullanım.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Ücretsiz Başla</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
            
            <Link 
              href="/"
              className="bg-white border border-slate-300 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
            >
              Platformu İncele
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-slate-600 text-sm mt-1">Aktif İşletme</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">10K+</div>
              <div className="text-slate-600 text-sm mt-1">Aylık Randevu</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">%95</div>
              <div className="text-slate-600 text-sm mt-1">Memnuniyet</div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">7/24</div>
              <div className="text-slate-600 text-sm mt-1">Destek</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              İşletmeniz İçin Tüm Araçlar
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tek platformda ihtiyacınız olan tüm dijital araçlara sahip olun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Profesyonel Website
              </h3>
              <p className="text-slate-600">
                Hazır şablonlar ve kolay editör ile dakikalar içinde web sitenizi oluşturun.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Akıllı Randevu Sistemi
              </h3>
              <p className="text-slate-600">
                Otomatik onay, hatırlatmalar ve personel yönetimi ile randevuları kolayca yönetin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Detaylı Raporlar
              </h3>
              <p className="text-gray-600">
                Gelir, müşteri ve performans analizleri ile işletmenizi veriye dayalı yönetin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Online Ödeme
              </h3>
              <p className="text-gray-600">
                Güvenli ödeme altyapısı ile müşterilerinizden kolayca ödeme alın.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mobil Uyumlu
              </h3>
              <p className="text-gray-600">
                Her cihazdan erişim ile işletmenizi istediğiniz yerden yönetin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pazarlama Araçları
              </h3>
              <p className="text-gray-600">
                SMS ve e-posta kampanyaları ile müşterilerinize ulaşın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-lg text-slate-600 mb-12">
            İşletmenizin büyüklüğüne göre esnek fiyatlandırma. İlk ay tamamen ücretsiz!
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Başlangıç</h3>
              <div className="text-4xl font-bold text-slate-900 mb-2">₺299</div>
              <div className="text-slate-600 mb-6">aylık / tek şube</div>
              <ul className="text-left space-y-3 text-slate-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Profesyonel Website
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Sınırsız Randevu
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  3 Personel
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Temel Raporlar
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  E-posta Desteği
                </li>
              </ul>
              <button className="w-full mt-8 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                Başla
              </button>
            </div>

            <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 relative hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                En Popüler
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Profesyonel</h3>
              <div className="text-4xl font-bold text-slate-900 mb-2">₺499</div>
              <div className="text-slate-600 mb-6">aylık / şube başı (çoklu şube)</div>
              <ul className="text-left space-y-3 text-slate-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Tüm Başlangıç Özellikleri
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Sınırsız Personel
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Gelişmiş Analitik
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Online Ödeme
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Öncelikli Destek
                </li>
              </ul>
              <button className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl">
                Hemen Başla
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-12 border border-emerald-200">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              3 dakikada işletmenizi kaydedin, hızla dijital dönüşümünüzü tamamlayın. 
              İlk ay tamamen ücretsiz, kredi kartı gerektirmez.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center text-slate-700">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                30 gün ücretsiz
              </div>
              <div className="flex items-center text-slate-700">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Kredi kartı yok
              </div>
              <div className="flex items-center text-slate-700">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Hızlı kurulum
              </div>
              <div className="flex items-center text-slate-700">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                7/24 destek
              </div>
            </div>

            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <span>Ücretsiz Hesap Oluştur</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-xl font-bold text-slate-900">RandevuPro</span>
          </div>
          <p className="text-slate-600 mb-4">
            İşletmeler için dijital çözüm platformu
          </p>
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">Ana Sayfa</Link>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Özellikler</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Fiyatlar</a>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 RandevuPro. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <BusinessRegistrationForm onClose={() => setShowRegisterModal(false)} />
        </div>
      )}
    </div>
  )
}