'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Globe, BarChart3, Palette, Eye, 
  CheckCircle, ArrowRight, Loader2, ExternalLink, Copy, Save, 
  Camera, Upload, Trash2, Plus, Check,
  Edit3, Layout, Image as ImageIcon,
  Zap, Star, Users, MapPin, Sparkles, X, Share2
} from 'lucide-react'
import { CloudinaryImage } from '@/components/cloudinary'

// Types
interface BusinessData {
  id: string
  name: string
  sector: string
  phone: string
  email?: string
  address: string
  profilePhotoUrl?: string
  coverPhotoUrl?: string
  avgRating: number
  reviewCount: number
  totalAppointments: number
  services: Array<{
    id: string
    name: string
    price: number
    duration: number
    description?: string
    category: string
  }>
  staff: Array<{
    id: string
    name: string
    specialty?: string
    photoUrl?: string
  }>
  gallery: Array<{
    id: string
    imageUrl: string
    title?: string
    description?: string
  }>
  websiteConfig?: WebsiteConfig
}

interface WebsiteConfig {
  id: string
  urlSlug: string
  isPublished: boolean
  template: string
  heroTitle: string
  heroSubtitle: string
  buttonText: string
  primaryColor: string
  secondaryColor: string
  gradientColors: string
  showServices: boolean
  showTeam: boolean
  showGallery: boolean
  showReviews: boolean
  showMap: boolean
  showContact: boolean
  profilePhoto?: string | null
  coverPhoto?: string | null
  galleryPhotos?: string[]
}

// Color themes
const colorThemes = [
  { name: 'Klasik Mavi', primary: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { name: 'Lüks Mor', primary: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
  { name: 'Modern Yeşil', primary: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  { name: 'Enerjik Turuncu', primary: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
  { name: 'Şık Siyah', primary: '#111827', gradient: 'linear-gradient(135deg, #111827, #374151)' },
  { name: 'Zarif Pembe', primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' }
]

// Sector templates
const sectorTemplates = {
  BERBER: {
    heroTitle: 'Profesyonel Berberlik Deneyimi',
    heroSubtitle: 'Stil ve zarafeti bir arada yaşayın',
    buttonText: 'Randevu Al',
    colors: { primary: '#2c3e50', gradient: 'linear-gradient(135deg, #2c3e50, #4a6741)' }
  },
  KUAFOR: {
    heroTitle: 'Güzelliğinizi Keşfedin',
    heroSubtitle: 'Her detayda mükemmellik',
    buttonText: 'Randevu Al',
    colors: { primary: '#e91e63', gradient: 'linear-gradient(135deg, #e91e63, #9c27b0)' }
  },
  DISHEKIMI: {
    heroTitle: 'Sağlıklı Gülüşler',
    heroSubtitle: 'Modern diş hekimliği hizmetleri',
    buttonText: 'Muayene Randevusu',
    colors: { primary: '#2196f3', gradient: 'linear-gradient(135deg, #2196f3, #21cbf3)' }
  },
  OTHER: {
    heroTitle: 'Profesyonel Hizmet',
    heroSubtitle: 'Kalite ve güven bir arada',
    buttonText: 'Hizmet Al',
    colors: { primary: '#667eea', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' }
  }
}

export default function WebsiteManager() {
  const { data: session, status } = useSession()
  
  // Main states
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Form states
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [buttonText, setButtonText] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [gradientColors, setGradientColors] = useState('linear-gradient(135deg, #2563eb, #1d4ed8)')
  
  // Upload states
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  
  // Section toggles
  const [showServices, setShowServices] = useState(true)
  const [showTeam, setShowTeam] = useState(true)
  const [showGallery, setShowGallery] = useState(true)
  const [showReviews, setShowReviews] = useState(true)
  const [showContact, setShowContact] = useState(true)
  
  // Load data effect
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadBusinessData()
    } else if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
    }
  }, [session, status])

  const handlePhotoUpload = async (file: File, type: 'profile' | 'cover' | 'gallery') => {
    if (!businessData?.id) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan büyük olamaz')
      return
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG ve WebP formatları desteklenir')
      return
    }
    
    const setUploading = type === 'profile' ? setUploadingProfile : 
                        type === 'cover' ? setUploadingCover : setUploadingGallery
    
    try {
      setUploading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessId', businessData.id)
      formData.append('type', type)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (type === 'profile') {
          setBusinessData(prev => prev ? { ...prev, profilePhotoUrl: result.url } : null)
        } else if (type === 'cover') {
          setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: result.url } : null)
        } else if (type === 'gallery') {
          loadBusinessData()
        }
      } else {
        throw new Error('Yükleme başarısız')
      }
    } catch (error: any) {
      setError('Fotoğraf yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const saveChanges = async () => {
    if (!businessData) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const websiteData = {
        businessId: businessData.id,
        heroTitle,
        heroSubtitle,
        buttonText,
        primaryColor,
        secondaryColor: primaryColor,
        gradientColors,
        showServices,
        showTeam,
        showGallery,
        showReviews,
        showContact: showContact,
        profilePhoto: businessData.profilePhotoUrl || null,
        coverPhoto: businessData.coverPhotoUrl || null,
        isPublished: businessData.websiteConfig?.isPublished || false
      }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setBusinessData(prev => prev ? { ...prev, websiteConfig: result.websiteConfig } : null)
        
        // Show success message
        const slug = result.websiteConfig?.urlSlug || businessData.name.toLowerCase().replace(/\s+/g, '-')
        const siteUrl = `http://localhost:3000/${slug}`
        
        const openSite = confirm('✅ Değişiklikler başarıyla kaydedildi!\n\nCanlı sitenizi görüntülemek ister misiniz?')
        if (openSite) {
          window.open(siteUrl, '_blank')
        }
      } else {
        throw new Error('Kaydetme başarısız')
      }
    } catch (error: any) {
      setError('Değişiklikler kaydedilirken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const createWebsite = async () => {
    if (!businessData) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const template = sectorTemplates[businessData.sector as keyof typeof sectorTemplates] || sectorTemplates.OTHER
      
      const websiteData = {
        businessId: businessData.id,
        heroTitle: template.heroTitle,
        heroSubtitle: template.heroSubtitle,
        buttonText: template.buttonText,
        primaryColor: template.colors.primary,
        secondaryColor: template.colors.primary,
        gradientColors: template.colors.gradient,
        showServices: true,
        showTeam: true,
        showGallery: true,
        showReviews: true,
        showContact: true,
        isPublished: false
      }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setBusinessData(prev => prev ? { ...prev, websiteConfig: result.websiteConfig } : null)
        
        // Update form with created values
        setHeroTitle(result.websiteConfig.heroTitle)
        setHeroSubtitle(result.websiteConfig.heroSubtitle)
        setButtonText(result.websiteConfig.buttonText)
        setPrimaryColor(result.websiteConfig.primaryColor)
        setGradientColors(result.websiteConfig.gradientColors)
        
        setActiveTab('content')
      } else {
        throw new Error('Website oluşturulamadı')
      }
    } catch (error: any) {
      setError('Website oluşturulurken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  // Load business data function - devam ediyor...
  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const businessResponse = await fetch(`/api/businesses?userId=${session?.user?.id}`)
      if (!businessResponse.ok) {
        throw new Error('İşletmeler yüklenemedi')
      }
      
      const businessData = await businessResponse.json()
      if (!businessData.businesses || businessData.businesses.length === 0) {
        throw new Error('Henüz bir işletme oluşturmamışsınız')
      }
      
      const business = businessData.businesses[0]
      
      const websiteResponse = await fetch(`/api/websites?businessId=${business.id}`)
      if (websiteResponse.ok) {
        const websiteData = await websiteResponse.json()
        setBusinessData(websiteData.business)
        
        if (websiteData.business.websiteConfig) {
          const config = websiteData.business.websiteConfig
          setHeroTitle(config.heroTitle || '')
          setHeroSubtitle(config.heroSubtitle || '')
          setButtonText(config.buttonText || 'Randevu Al')
          setPrimaryColor(config.primaryColor || '#2563eb')
          setGradientColors(config.gradientColors || 'linear-gradient(135deg, #2563eb, #1d4ed8)')
          setShowServices(config.showServices !== false)
          setShowTeam(config.showTeam !== false)
          setShowGallery(config.showGallery !== false)
          setShowReviews(config.showReviews !== false)
          setShowContact(config.showContact !== false)
        } else {
          const template = sectorTemplates[business.sector as keyof typeof sectorTemplates] || sectorTemplates.OTHER
          setHeroTitle(template.heroTitle)
          setHeroSubtitle(template.heroSubtitle)
          setButtonText(template.buttonText)
          setPrimaryColor(template.colors.primary)
          setGradientColors(template.colors.gradient)
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Loading state render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700 mx-auto mb-4" />
          <p className="text-slate-800 font-medium">Website bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error state render
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-slate-700" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Bir Hata Oluştu</h3>
          <p className="text-slate-800 mb-4">{error}</p>
          <button 
            onClick={loadBusinessData}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // No business data state
  if (!businessData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">İşletme Bulunamadı</h3>
          <p className="text-slate-800">Lütfen önce bir işletme oluşturun</p>
        </div>
      </div>
    )
  }

  const websiteUrl = businessData.websiteConfig?.urlSlug 
    ? `http://localhost:3000/${businessData.websiteConfig.urlSlug}`
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 sm:py-0 sm:h-16 space-y-3 sm:space-y-0">
            {/* Logo ve Başlık */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Website Yönetimi</h1>
                <p className="text-sm text-slate-700 font-medium">{businessData.name}</p>
              </div>
            </div>
            
            {/* Sağ Taraf - URL ve Kaydet Butonu */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Website URL Bilgisi */}
              {websiteUrl && (
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    businessData.websiteConfig?.isPublished 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Yayında
                  </div>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${businessData.name} - Randevu Al`,
                          text: `${businessData.name} işletmesinden randevu al`,
                          url: websiteUrl
                        })
                      } else {
                        navigator.clipboard.writeText(websiteUrl)
                        alert('🔗 Website linki kopyalandı!')
                      }
                    }}
                    className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Website'yi paylaş"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(websiteUrl)}
                    className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="URL'yi kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Websiteyi aç"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
              
              {/* Kaydet/Oluştur Butonu */}
              <button
                onClick={businessData.websiteConfig ? saveChanges : createWebsite}
                disabled={isSaving}
                className="bg-slate-800 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {businessData.websiteConfig ? 'Kaydediliyor...' : 'Oluşturuluyor...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm">
                      {businessData.websiteConfig ? 'Kaydet' : 'Oluştur'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Website Oluşturma State'i - Eğer website yoksa */}
        {!businessData.websiteConfig && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-center py-16 px-8">
              <div className="max-w-lg mx-auto">
                {/* Ana İkon */}
                <div className="w-20 h-20 bg-slate-800 rounded-xl mx-auto mb-8 flex items-center justify-center">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                
                {/* Başlık ve Açıklama */}
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Profesyonel Website Oluşturun
                </h2>
                <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                  {businessData.sector.toLowerCase()} sektörüne özel tasarlanmış modern bir website oluşturun. 
                  Müşterileriniz randevu alabilir, hizmetlerinizi inceleyebilir.
                </p>
                
                {/* Özellikler Grid'i */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                  {[
                    { icon: CheckCircle, text: 'Mobil Uyumlu' },
                    { icon: CheckCircle, text: 'SEO Optimize' },
                    { icon: CheckCircle, text: 'Hızlı Yükleme' },
                    { icon: CheckCircle, text: 'Otomatik Randevu' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 text-left">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-emerald-700" />
                      </div>
                      <span className="text-sm text-slate-800 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Oluştur Butonu */}
                <button
                  onClick={createWebsite}
                  disabled={isSaving}
                  className="bg-slate-800 text-white px-10 py-4 rounded-xl hover:bg-slate-900 transition-all duration-200 inline-flex items-center space-x-3 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Hemen Oluştur</span>
                    </>
                  )}
                </button>
                
                {/* Alt Bilgi */}
                <p className="text-xs text-slate-500 mt-6">
                  ⚡ Sadece birkaç saniye sürer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Website Yönetim Interface'i - Eğer website varsa */}
        {businessData.websiteConfig && (
          <>
            {/* Tab Navigation */}
            <div className="mb-8">
              {/* Mobil Tab Navigation - Dikey */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'overview', label: 'Genel', icon: BarChart3 },
                    { id: 'content', label: 'İçerik', icon: Edit3 },
                    { id: 'design', label: 'Renk', icon: Palette },
                    { id: 'photos', label: 'Foto', icon: Camera },
                    { id: 'sections', label: 'Bölüm', icon: Layout }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-center leading-tight">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Masaustu Tab Navigation - Yatay */}
              <div className="hidden sm:block">
                <div className="border-b border-slate-200 bg-white rounded-t-xl">
                  <nav className="flex px-2">
                    {[
                      { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                      { id: 'content', label: 'İçerik', icon: Edit3 },
                      { id: 'design', label: 'Tasarım', icon: Palette },
                      { id: 'photos', label: 'Fotoğraflar', icon: Camera },
                      { id: 'sections', label: 'Bölümler', icon: Layout }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 py-4 px-6 border-b-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'border-slate-800 text-slate-900 bg-slate-50'
                              : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Tab İçerikleri */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px]">
              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Genel Bakış</h3>
                    <p className="text-slate-600 mb-8">Website'nizin genel durumu ve hızlı işlemler</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      
                      {/* Website Durumu */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-bold text-slate-900 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Website Durumu
                          </h4>
                          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            businessData.websiteConfig?.isPublished 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Yayında
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-700 font-medium">URL</span>
                            <span className="text-sm text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded">
                              /{businessData.websiteConfig?.urlSlug}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-700 font-medium">Son Güncelleme</span>
                            <span className="text-sm text-slate-800 font-semibold">Bugün</span>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-700 font-medium">Tema</span>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-300" 
                                style={{ backgroundColor: primaryColor }}
                              />
                              <span className="text-sm text-slate-600 font-mono">{primaryColor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200">
                          <a
                            href={websiteUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center justify-center space-x-2 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Website'yi Görüntüle</span>
                          </a>
                        </div>
                      </div>

                      {/* Hızlı İstatistikler */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          İstatistikler
                        </h4>
                        
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-700" />
                              </div>
                              <div>
                                <span className="text-slate-700 font-medium block">Ortalama Puan</span>
                                <span className="text-xs text-slate-500">{businessData.reviewCount} değerlendirme</span>
                              </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900">{businessData.avgRating.toFixed(1)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-700" />
                              </div>
                              <div>
                                <span className="text-slate-700 font-medium block">Toplam Randevu</span>
                                <span className="text-xs text-slate-500">Tüm zamanlar</span>
                              </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900">{businessData.totalAppointments.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-purple-700" />
                              </div>
                              <div>
                                <span className="text-slate-700 font-medium block">Galeri Fotoğrafı</span>
                                <span className="text-xs text-slate-500">Yüklenmiş görsel</span>
                              </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900">{businessData.gallery?.length || 0}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-green-700" />
                              </div>
                              <div>
                                <span className="text-slate-700 font-medium block">Hizmet Sayısı</span>
                                <span className="text-xs text-slate-500">Aktif hizmetler</span>
                              </div>
                            </div>
                            <span className="text-xl font-bold text-slate-900">{businessData.services?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hızlı İşlemler */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Hızlı İşlemler
                        </h4>
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => setActiveTab('content')}
                            className="w-full text-left p-4 rounded-lg hover:bg-slate-50 flex items-center space-x-3 border border-slate-100 hover:border-slate-200 transition-all group"
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Edit3 className="w-5 h-5 text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-800 font-medium block">İçeriği Düzenle</span>
                              <span className="text-xs text-slate-500">Başlık ve metin değiştir</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                          </button>
                          
                          <button
                            onClick={() => setActiveTab('photos')}
                            className="w-full text-left p-4 rounded-lg hover:bg-slate-50 flex items-center space-x-3 border border-slate-100 hover:border-slate-200 transition-all group"
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Camera className="w-5 h-5 text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-800 font-medium block">Fotoğraf Ekle</span>
                              <span className="text-xs text-slate-500">Galeri ve profil fotoğrafları</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                          </button>
                          
                          <button
                            onClick={() => setActiveTab('design')}
                            className="w-full text-left p-4 rounded-lg hover:bg-slate-50 flex items-center space-x-3 border border-slate-100 hover:border-slate-200 transition-all group"
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Palette className="w-5 h-5 text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-800 font-medium block">Renkleri Değiştir</span>
                              <span className="text-xs text-slate-500">Tema ve renk düzeni</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                          </button>
                          
                          <button
                            onClick={() => setActiveTab('sections')}
                            className="w-full text-left p-4 rounded-lg hover:bg-slate-50 flex items-center space-x-3 border border-slate-100 hover:border-slate-200 transition-all group"
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Layout className="w-5 h-5 text-slate-700" />
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-800 font-medium block">Bölümleri Yönet</span>
                              <span className="text-xs text-slate-500">Hangi alanların görüneceği</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tamamlanma Durumu */}
                    <div className="mt-10">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border-2 border-dashed border-slate-300">
                        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                          <CheckCircle className="w-6 h-6 mr-3 text-emerald-600" />
                          Website Tamamlanma Durumu
                        </h4>
                        
                        {/* Progress Bar */}
                        <div className="mb-8">
                          {(() => {
                            const checks = [
                              { label: 'Başlık ve içerik', completed: !!(heroTitle && heroSubtitle) },
                              { label: 'Renk teması', completed: !!primaryColor },
                              { label: 'Profil fotoğrafı', completed: !!businessData.profilePhotoUrl },
                              { label: 'Galeri fotoğrafları', completed: (businessData.gallery?.length || 0) > 0 },
                              { label: 'Bölüm ayarları', completed: [showServices, showTeam, showGallery, showReviews, showContact].some(Boolean) }
                            ]
                            const completed = checks.filter(check => check.completed).length
                            const percentage = Math.round((completed / checks.length) * 100)
                            
                            return (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {completed}/{checks.length} tamamlandı
                                  </span>
                                  <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 mb-6">
                                  <div 
                                    className="bg-gradient-to-r from-slate-600 to-slate-800 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {checks.map((check, index) => (
                                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                                      check.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-slate-200'
                                    }`}>
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                        check.completed ? 'bg-emerald-500' : 'bg-slate-300'
                                      }`}>
                                        {check.completed && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className={`text-sm font-medium ${
                                        check.completed ? 'text-emerald-800' : 'text-slate-600'
                                      }`}>
                                        {check.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        
                        {/* Tavsiyeler */}
                        <div className="bg-white p-6 rounded-lg border border-slate-200">
                          <h5 className="font-semibold text-slate-900 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                            İyileştirme Önerileri
                          </h5>
                          <ul className="space-y-2 text-sm text-slate-600">
                            {!businessData.profilePhotoUrl && (
                              <li className="flex items-center space-x-2">
                                <span>•</span>
                                <span>Logo/profil fotoğrafı ekleyerek markanızı güçlendirin</span>
                              </li>
                            )}
                            {(!businessData.gallery || businessData.gallery.length === 0) && (
                              <li className="flex items-center space-x-2">
                                <span>•</span>
                                <span>Çalışma örneklerinizi galeri bölümüne ekleyin</span>
                              </li>
                            )}
                            {(businessData.gallery?.length || 0) < 5 && (
                              <li className="flex items-center space-x-2">
                                <span>•</span>
                                <span>En az 5-10 kaliteli fotoğraf ekleyerek galerinizi zenginleştirin</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Ana Başlık ve İçerik</h3>
                    <p className="text-slate-600 mb-8">Website'nizin başlık, alt başlık ve buton metnini düzenleyin</p>
                    
                    <div className="space-y-6">
                      {/* Ana Başlık */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-3">
                          Ana Başlık
                        </label>
                        <input
                          type="text"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 font-medium transition-colors"
                          placeholder="Örn: Profesyonel Berberlik Deneyimi"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Website'nizin ana başlığını girin. Bu metinler ziyaretçilerinizin ilk göreceği şey olacak.
                        </p>
                      </div>
                      
                      {/* Alt Başlık */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-3">
                          Alt Başlık
                        </label>
                        <textarea
                          value={heroSubtitle}
                          onChange={(e) => setHeroSubtitle(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 font-medium transition-colors resize-none"
                          placeholder="Örn: Stil ve zarafeti bir arada yaşayın"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Müşterilerinize hizmetinizi tanıtan destekleyici açıklama.
                        </p>
                      </div>
                      
                      {/* Buton Metni */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-3">
                          Ana Buton Metni
                        </label>
                        <input
                          type="text"
                          value={buttonText}
                          onChange={(e) => setButtonText(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 font-medium transition-colors"
                          placeholder="Örn: Randevu Al"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Müşterilerinizin tıklayacağı ana eylem butonunuzun metni.
                        </p>
                      </div>

                      {/* Önizleme Kartı */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-dashed border-slate-300 mt-8">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Önizleme
                        </h4>
                        <div className="text-center space-y-4">
                          <h1 className="text-2xl font-bold text-slate-900">
                            {heroTitle || 'Ana Başlık'}
                          </h1>
                          <p className="text-slate-600 leading-relaxed">
                            {heroSubtitle || 'Alt başlık metni burada görünecek'}
                          </p>
                          <button 
                            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 cursor-default"
                          >
                            <span>{buttonText || 'Buton Metni'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Kaydet Butonu */}
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-slate-500">
                            Değişiklikler otomatik kaydedilir
                          </p>
                          <button
                            onClick={saveChanges}
                            disabled={isSaving}
                            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Kaydediliyor...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Kaydet</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Design Tab */}
                {activeTab === 'design' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Renk Teması</h3>
                    <p className="text-slate-600 mb-8">Website'nizin renklerini ve temasını seçin</p>
                    
                    {/* Hazır Temalar */}
                    <div className="mb-10">
                      <h4 className="text-lg font-semibold text-slate-900 mb-6">Hazır Temalar</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {colorThemes.map((theme) => (
                          <button
                            key={theme.name}
                            onClick={() => {
                              setPrimaryColor(theme.primary)
                              setGradientColors(theme.gradient)
                            }}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
                              primaryColor === theme.primary 
                                ? 'border-slate-800 ring-2 ring-slate-200 bg-slate-50 shadow-lg' 
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
                            }`}
                          >
                            {/* Renk Önizlemesi */}
                            <div 
                              className="w-full h-20 rounded-lg mb-4 shadow-sm transition-all duration-200 group-hover:shadow-md"
                              style={{ background: theme.gradient }}
                            />
                            
                            {/* Tema Bilgisi */}
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-bold text-slate-900">{theme.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{theme.primary}</div>
                              </div>
                              
                              {/* Seçili İşareti */}
                              {primaryColor === theme.primary && (
                                <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Özel Renk */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-900 mb-6">Kendi Renginizi Seçin</h4>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Renk Seçici */}
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => {
                                setPrimaryColor(e.target.value)
                                setGradientColors(`linear-gradient(135deg, ${e.target.value}, ${e.target.value}dd)`)
                              }}
                              className="w-16 h-16 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors"
                            />
                          </div>
                          
                          {/* Renk Kodu */}
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Renk Kodu
                            </label>
                            <input
                              type="text"
                              value={primaryColor}
                              onChange={(e) => {
                                setPrimaryColor(e.target.value)
                                setGradientColors(`linear-gradient(135deg, ${e.target.value}, ${e.target.value}dd)`)
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 font-mono text-sm text-slate-900"
                              placeholder="#2563eb"
                            />
                          </div>
                        </div>
                        
                        {/* Renk Önizleme Kartı */}
                        <div className="w-full sm:w-auto">
                          <div className="w-32 h-20 rounded-lg shadow-sm" style={{ background: gradientColors }} />
                        </div>
                      </div>
                    </div>

                    {/* Önizleme Bölümü */}
                    <div className="mt-10">
                      <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Renk Önizleme
                      </h4>
                      
                      {/* Önizleme Kartı */}
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                        <div 
                          className="w-full h-32 rounded-xl mb-6 flex items-center justify-center text-white font-bold text-xl shadow-md"
                          style={{ background: gradientColors }}
                        >
                          {heroTitle || 'Website Başlığı'}
                        </div>
                        
                        <p className="text-slate-600 mb-6">
                          {heroSubtitle || 'Bu bölümde seçtiğiniz renklerin website\'nizde nasıl görüneceğini görebilirsiniz.'}
                        </p>
                        
                        <div className="flex justify-center space-x-4">
                          <button 
                            className="px-6 py-3 rounded-lg font-medium text-white shadow-md cursor-default"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {buttonText || 'Ana Buton'}
                          </button>
                          <button className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 cursor-default">
                            İkincil Buton
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Kaydet */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">
                          Renk değişiklikleri anlık olarak uygulanır
                        </p>
                        <button
                          onClick={saveChanges}
                          disabled={isSaving}
                          className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                              <Palette className="w-4 h-4" />
                              <span>Renkleri Kaydet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos Tab */}
                {activeTab === 'photos' && (
                  <div className="max-w-5xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Fotoğraf Yönetimi</h3>
                    <p className="text-slate-600 mb-8">Profil, kapak ve galeri fotoğraflarınızı yönetin</p>
                    
                    {/* Profil ve Kapak Fotoğrafları */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                      
                      {/* Profil Fotoğrafı */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                          <Camera className="w-5 h-5 mr-2" />
                          Profil Fotoğrafı
                        </h4>
                        
                        <div className="text-center">
                          {/* Fotoğraf Görüntüleme Alanı */}
                          <div className="relative inline-block mb-6">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-200 shadow-lg">
                              {businessData.profilePhotoUrl ? (
                                <CloudinaryImage
                                  src={businessData.profilePhotoUrl}
                                  alt="Profil"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                  <Camera className="w-12 h-12 text-slate-600" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Butonlar */}
                          <div className="space-y-3">
                            <button
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement
                                  if (target?.files?.[0]) {
                                    handlePhotoUpload(target.files[0], 'profile')
                                  }
                                }
                                input.click()
                              }}
                              disabled={uploadingProfile}
                              className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 font-medium"
                            >
                              {uploadingProfile ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Yükleniyor...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>{businessData.profilePhotoUrl ? 'Değiştir' : 'Yükle'}</span>
                                </div>
                              )}
                            </button>
                            
                            {businessData.profilePhotoUrl && (
                              <button
                                onClick={() => {
                                  setBusinessData(prev => prev ? { ...prev, profilePhotoUrl: undefined } : null)
                                }}
                                className="w-full text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 border border-slate-200 font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Sil</span>
                              </button>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-4">
                            Website'nizde logo olarak görünecek
                          </p>
                        </div>
                      </div>

                      {/* Kapak Fotoğrafı */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                          <ImageIcon className="w-5 h-5 mr-2" />
                          Kapak Fotoğrafı
                        </h4>
                        
                        <div className="text-center">
                          {/* Fotoğraf Görüntüleme Alanı */}
                          <div className="relative mb-6">
                            <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                              {businessData.coverPhotoUrl ? (
                                <CloudinaryImage
                                  src={businessData.coverPhotoUrl}
                                  alt="Kapak"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                  <ImageIcon className="w-12 h-12 text-slate-600" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Butonlar */}
                          <div className="space-y-3">
                            <button
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement
                                  if (target?.files?.[0]) {
                                    handlePhotoUpload(target.files[0], 'cover')
                                  }
                                }
                                input.click()
                              }}
                              disabled={uploadingCover}
                              className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 font-medium"
                            >
                              {uploadingCover ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Yükleniyor...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>{businessData.coverPhotoUrl ? 'Değiştir' : 'Yükle'}</span>
                                </div>
                              )}
                            </button>
                            
                            {businessData.coverPhotoUrl && (
                              <button
                                onClick={() => {
                                  setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: undefined } : null)
                                }}
                                className="w-full text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 border border-slate-200 font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Sil</span>
                              </button>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-600 mt-4">
                            Website'nizin arka planında görünecek
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Galeri Fotoğrafları */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Galeri Fotoğrafları
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            Müşterilerinize çalışmalarınızı sergileyin
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => {
                              const target = e.target as HTMLInputElement
                              if (target?.files?.[0]) {
                                handlePhotoUpload(target.files[0], 'gallery')
                              }
                            }
                            input.click()
                          }}
                          disabled={uploadingGallery}
                          className="bg-slate-800 text-white py-2.5 px-4 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center space-x-2 font-medium shadow-sm"
                        >
                          {uploadingGallery ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>Fotoğraf Ekle</span>
                        </button>
                      </div>
                      
                      {/* Galeri Grid */}
                      {businessData.gallery && businessData.gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {businessData.gallery.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <img 
                                  src={photo.imageUrl} 
                                  alt="Galeri"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              
                              {/* Sil Butonu */}
                              <button
                                onClick={() => {
                                  setBusinessData(prev => prev ? {
                                    ...prev,
                                    gallery: prev.gallery?.filter(g => g.id !== photo.id) || []
                                  } : null)
                                }}
                                className="absolute top-2 right-2 bg-slate-800 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900 shadow-lg"
                                title="Fotoğrafı sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Boş Durum */
                        <div className="text-center py-20">
                          <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <ImageIcon className="w-10 h-10 text-slate-600" />
                          </div>
                          <h5 className="text-xl font-bold text-slate-900 mb-2">
                            Henüz galeri fotoğrafı yok
                          </h5>
                          <p className="text-slate-700 mb-6 max-w-md mx-auto">
                            İşletmenizin fotoğraflarını ekleyin. Müşterileriniz çalışmalarınızı görebilsin.
                          </p>
                          <button
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement
                                if (target?.files?.[0]) {
                                  handlePhotoUpload(target.files[0], 'gallery')
                                }
                              }
                              input.click()
                            }}
                            disabled={uploadingGallery}
                            className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center space-x-2 font-medium shadow-sm"
                          >
                            <Plus className="w-5 h-5" />
                            <span>İlk Fotoğrafı Ekle</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dosya Formatı Bilgisi */}
                    <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 text-slate-600 mt-0.5">
                          ℹ️
                        </div>
                        <div className="flex-1">
                          <h6 className="text-sm font-semibold text-slate-900 mb-1">
                            Fotoğraf Gereksinimleri
                          </h6>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Desteklenen formatlar: JPG, PNG, WebP</li>
                            <li>• Maksimum dosya boyutu: 5MB</li>
                            <li>• En iyi kalite için yüksek çözünürlüklü fotoğraflar kullanın</li>
                            <li>• Profil fotoğrafı için kare format önerilir</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sections Tab */}
                {activeTab === 'sections' && (
                  <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Website Bölümleri</h3>
                    <p className="text-slate-600 mb-8">Website'nizde hangi bölümlerin görünmesini istediğinizi seçin</p>
                    
                    <div className="space-y-4">
                      {[
                        { 
                          key: 'showServices', 
                          label: 'Hizmetler', 
                          description: 'Sunduğunuz hizmetleri, fiyatları ve süreleri gösterin', 
                          icon: Sparkles,
                          value: showServices,
                          setValue: setShowServices
                        },
                        { 
                          key: 'showTeam', 
                          label: 'Ekibimiz', 
                          description: 'Çalışanlarınızı ve uzmanlık alanlarını tanıtın', 
                          icon: Users,
                          value: showTeam,
                          setValue: setShowTeam
                        },
                        { 
                          key: 'showGallery', 
                          label: 'Galeri', 
                          description: 'Çalışma fotoğraflarınızı ve projelerinizi sergileyin', 
                          icon: ImageIcon,
                          value: showGallery,
                          setValue: setShowGallery
                        },
                        { 
                          key: 'showReviews', 
                          label: 'Müşteri Yorumları', 
                          description: 'Müşteri değerlendirmelerini ve puanlarını gösterin', 
                          icon: Star,
                          value: showReviews,
                          setValue: setShowReviews
                        },
                        { 
                          key: 'showContact', 
                          label: 'İletişim & Konum', 
                          description: 'İletişim bilgileriniz ve harita konumunuzu gösterin', 
                          icon: MapPin,
                          value: showContact,
                          setValue: setShowContact
                        }
                      ].map((section) => {
                        const Icon = section.icon
                        return (
                          <div 
                            key={section.key} 
                            className={`flex items-center justify-between p-6 border-2 rounded-xl transition-all duration-200 hover:bg-slate-25 ${
                              section.value 
                                ? 'border-slate-300 bg-slate-50' 
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start space-x-4 flex-1">
                              {/* İkon */}
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                section.value 
                                  ? 'bg-slate-800 text-white' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              
                              {/* İçerik */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-lg font-bold text-slate-900">{section.label}</h4>
                                  {section.value && (
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {section.description}
                                </p>
                                
                                {/* Ek Bilgiler */}
                                {section.key === 'showServices' && businessData.services && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    📊 {businessData.services.length} hizmet mevcut
                                  </p>
                                )}
                                {section.key === 'showTeam' && businessData.staff && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    👥 {businessData.staff.length} çalışan mevcut
                                  </p>
                                )}
                                {section.key === 'showGallery' && businessData.gallery && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    🖼️ {businessData.gallery.length} fotoğraf mevcut
                                  </p>
                                )}
                                {section.key === 'showReviews' && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    ⭐ Ortalama {businessData.avgRating.toFixed(1)} puan ({businessData.reviewCount} yorum)
                                  </p>
                                )}
                                {section.key === 'showContact' && (
                                  <p className="text-xs text-slate-500 mt-2">
                                    📍 {businessData.address}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Toggle Switch */}
                            <div className="ml-6">
                              <button
                                onClick={() => section.setValue(!section.value)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                                  section.value ? 'bg-slate-800' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg ${
                                    section.value ? 'translate-x-7' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Önizleme Bölümü */}
                    <div className="mt-10 bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-300">
                      <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Website Bölümleri Önizleme
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-slate-200">
                          <span className="font-medium text-slate-900">Ana Sayfa</span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-semibold">
                            Her zaman aktif
                          </span>
                        </div>
                        
                        {[
                          { key: 'showServices', label: 'Hizmetler', value: showServices },
                          { key: 'showTeam', label: 'Ekibimiz', value: showTeam },
                          { key: 'showGallery', label: 'Galeri', value: showGallery },
                          { key: 'showReviews', label: 'Yorumlar', value: showReviews },
                          { key: 'showContact', label: 'İletişim', value: showContact }
                        ].map((section) => (
                          <div key={section.key} className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-colors ${
                            section.value 
                              ? 'bg-white border-slate-200' 
                              : 'bg-slate-100 border-slate-200 opacity-50'
                          }`}>
                            <span className={`font-medium ${
                              section.value ? 'text-slate-900' : 'text-slate-500 line-through'
                            }`}>
                              {section.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              section.value 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {section.value ? 'Görünür' : 'Gizli'}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-4 text-center">
                        Bu bölümler website'nizde yukardan aşağıya doğru sıralanacak
                      </p>
                    </div>

                    {/* Kaydet */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                          <p className="text-sm text-slate-500">
                            Bölüm değişiklikleri anlık olarak uygulanır
                          </p>
                          <p className="text-xs text-slate-400">
                            Aktif: {[showServices, showTeam, showGallery, showReviews, showContact].filter(Boolean).length}/5 bölüm
                          </p>
                        </div>
                        
                        <button
                          onClick={saveChanges}
                          disabled={isSaving}
                          className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium shadow-sm"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                              <Layout className="w-4 h-4" />
                              <span>Bölümleri Kaydet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 border border-slate-600 z-50">
          <span className="font-medium">{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="hover:bg-slate-700 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}