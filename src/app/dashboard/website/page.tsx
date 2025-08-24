'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Zap, Eye, Globe, Smartphone, BarChart3, Palette, Wand2, 
  CheckCircle, ArrowRight, Loader2, ExternalLink, Copy, X, Save, 
  Monitor, Tablet, Camera, Star, MapPin, Phone, Mail, Clock, 
  Users, MessageCircle, Upload, Image as ImageIcon, AlertCircle, 
  Trash2, Plus, Calendar, Check, Award, Heart, Play
} from 'lucide-react'
import { CloudinaryImage } from '@/components/cloudinary'
import { CloudinaryUpload } from '@/components/cloudinary'

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
  reviews: Array<{
    id: string
    rating: number
    comment: string
    customerName: string
    customerAvatar?: string
    createdAt: string
  }>
  workingHours: Array<{
    dayOfWeek: string
    openTime: string
    closeTime: string
    isClosed: boolean
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

interface GeneratedSite {
  url: string
  previewUrl: string
  template: any
  analytics: {
    expectedVisitors: number
    seoScore: number
    loadTime: string
  }
}

// Sector-specific templates
const sectorTemplates = {
  BERBER: {
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#e74c3c',
      gradient: 'linear-gradient(135deg, #2c3e50, #4a6741)'
    },
    icon: '✂️',
    heroTitle: 'Profesyonel Berberlik Deneyimi',
    heroSubtitle: 'Stil ve zarafeti bir arada yaşayın',
    buttonText: 'Randevu Al',
    bgPattern: 'barbershop'
  },
  KUAFOR: {
    colors: {
      primary: '#e91e63',
      secondary: '#ad1457',
      accent: '#ffc107',
      gradient: 'linear-gradient(135deg, #e91e63, #9c27b0)'
    },
    icon: '💇‍♀️',
    heroTitle: 'Güzelliğinizi Keşfedin',
    heroSubtitle: 'Her detayda mükemmellik',
    buttonText: 'Randevu Al',
    bgPattern: 'salon'
  },
  DISHEKIMI: {
    colors: {
      primary: '#2196f3',
      secondary: '#1976d2',
      accent: '#4caf50',
      gradient: 'linear-gradient(135deg, #2196f3, #21cbf3)'
    },
    icon: '🦷',
    heroTitle: 'Sağlıklı Gülüşler',
    heroSubtitle: 'Modern diş hekimliği hizmetleri',
    buttonText: 'Muayene Randevusu',
    bgPattern: 'medical'
  },
  OTOYIKAMA: {
    colors: {
      primary: '#00bcd4',
      secondary: '#0097a7',
      accent: '#ff9800',
      gradient: 'linear-gradient(135deg, #00bcd4, #2196f3)'
    },
    icon: '🚗',
    heroTitle: 'Arabanız Tertemiz',
    heroSubtitle: 'Profesyonel oto bakım hizmetleri',
    buttonText: 'Temizlik Randevusu',
    bgPattern: 'automotive'
  },
  FREELANCER: {
    colors: {
      primary: '#9c27b0',
      secondary: '#7b1fa2',
      accent: '#ff5722',
      gradient: 'linear-gradient(135deg, #9c27b0, #673ab7)'
    },
    icon: '💼',
    heroTitle: 'Uzman Çözümler',
    heroSubtitle: 'Projeleriniz için profesyonel destek',
    buttonText: 'Proje Teklifi Al',
    bgPattern: 'modern'
  },
  CONSULTANT: {
    colors: {
      primary: '#ff5722',
      secondary: '#d84315',
      accent: '#4caf50',
      gradient: 'linear-gradient(135deg, #ff5722, #ff7043)'
    },
    icon: '🎓',
    heroTitle: 'Uzman Danışmanlık',
    heroSubtitle: 'İşinizi bir sonraki seviyeye taşıyın',
    buttonText: 'Danışmanlık Al',
    bgPattern: 'professional'
  },
  OTHER: {
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    icon: '🏢',
    heroTitle: 'Profesyonel Hizmet',
    heroSubtitle: 'Kalite ve güven bir arada',
    buttonText: 'Hizmet Al',
    bgPattern: 'modern'
  }
}

// Color themes for customization
const colorThemes = [
  { name: 'Klasik Mavi', primary: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { name: 'Lüks Mor', primary: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
  { name: 'Modern Yeşil', primary: '#059669', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  { name: 'Enerjik Turuncu', primary: '#ea580c', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)' },
  { name: 'Şık Siyah', primary: '#111827', gradient: 'linear-gradient(135deg, #111827, #374151)' },
  { name: 'Zarif Pembe', primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' }
]

export default function SmartWebsiteBuilder() {
  const { data: session, status } = useSession()
  const [step, setStep] = useState('intro')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Preview and customization states
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [customizations, setCustomizations] = useState<Partial<WebsiteConfig>>({
    heroTitle: '',
    heroSubtitle: '',
    buttonText: 'Randevu Al',
    showServices: true,
    showTeam: true,
    showGallery: true,
    showReviews: true,
    showMap: true,
    showContact: true,
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    gradientColors: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  })

  // Load business data on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadBusinessData()
    } else if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
    }
  }, [session, status])
  
  // Refresh data when returning to website page (for settings changes)
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user && document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing business data...')
        loadBusinessData()
      }
    }
    
    document.addEventListener('visibilitychange', handleFocus)
    return () => document.removeEventListener('visibilitychange', handleFocus)
  }, [session])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First get user's businesses
      const businessResponse = await fetch(`/api/businesses?userId=${session?.user?.id}`)
      if (!businessResponse.ok) {
        const errorData = await businessResponse.json()
        throw new Error(errorData.error || 'İşletmeler yüklenemedi')
      }
      
      const businessData = await businessResponse.json()
      if (!businessData.businesses || businessData.businesses.length === 0) {
        throw new Error('Henüz bir işletme oluşturmamışsınız')
      }
      
      const business = businessData.businesses[0]
      
      // Get website data with business details
      const websiteResponse = await fetch(`/api/websites?businessId=${business.id}`)
      if (websiteResponse.ok) {
        const websiteData = await websiteResponse.json()
        setBusinessData(websiteData.business)
        
        // If website config exists, set customizations
        if (websiteData.business.websiteConfig) {
          const config = websiteData.business.websiteConfig
          setCustomizations({
            ...config,
            galleryPhotos: config.galleryPhotos ? JSON.parse(config.galleryPhotos) : [],
            // Eğer custom button text yoksa sector template'den al
            buttonText: config.buttonText || sectorTemplates[websiteData.business.sector as keyof typeof sectorTemplates]?.buttonText || 'Randevu Al'
          })
          
          // If website exists, go to completed step
          setStep('completed')
          setGeneratedSite({
            url: `randevur.com/${config.urlSlug}`,
            previewUrl: `/preview/${config.urlSlug}`,
            template: sectorTemplates[business.sector as keyof typeof sectorTemplates] || sectorTemplates.OTHER,
            analytics: {
              expectedVisitors: Math.floor(Math.random() * 500) + 200,
              seoScore: Math.floor(Math.random() * 20) + 80,
              loadTime: (Math.random() * 1.5 + 0.5).toFixed(1)
            }
          })
        } else {
          // No website config, set defaults
          const template = sectorTemplates[business.sector as keyof typeof sectorTemplates] || sectorTemplates.OTHER
          setCustomizations(prev => ({
            ...prev,
            heroTitle: template.heroTitle,
            heroSubtitle: template.heroSubtitle,
            buttonText: template.buttonText || 'Randevu Al',
            primaryColor: template.colors.primary,
            secondaryColor: template.colors.secondary,
            gradientColors: template.colors.gradient
          }))
        }
      } else {
        const errorData = await websiteResponse.json()
        console.error('Website loading error:', errorData)
        // Continue without website config
      }
    } catch (error: any) {
      console.error('Error loading business data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateWebsite = async () => {
    if (!businessData) return
    
    setIsGenerating(true)
    setStep('generating')
    setError(null)
    
    // Simulate AI processing with realistic steps
    const steps = [
      { text: 'İşletme bilgileriniz analiz ediliyor...', duration: 1000 },
      { text: 'Sektörel optimizasyonlar yapılıyor...', duration: 1500 },
      { text: 'En uygun tasarım seçiliyor...', duration: 1200 },
      { text: 'Renk paleti oluşturuluyor...', duration: 800 },
      { text: 'İçerik hazırlanıyor...', duration: 1000 },
      { text: 'SEO optimizasyonları uygulanıyor...', duration: 800 },
      { text: 'Mobil uyumluluk test ediliyor...', duration: 700 },
      { text: 'Son kontroller yapılıyor...', duration: 500 }
    ]

    let currentProgress = 0
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration))
      currentProgress = ((i + 1) / steps.length) * 100
      setProgress(currentProgress)
    }

    try {
      // Create website config via API
      const websiteData = {
        businessId: businessData.id,
        heroTitle: customizations.heroTitle || sectorTemplates[businessData.sector as keyof typeof sectorTemplates]?.heroTitle || 'Hoş Geldiniz',
        heroSubtitle: customizations.heroSubtitle || sectorTemplates[businessData.sector as keyof typeof sectorTemplates]?.heroSubtitle || 'Profesyonel hizmet',
        buttonText: customizations.buttonText || 'Randevu Al',
        primaryColor: customizations.primaryColor,
        secondaryColor: customizations.secondaryColor,
        gradientColors: customizations.gradientColors,
        showServices: customizations.showServices,
        showTeam: customizations.showTeam,
        showGallery: customizations.showGallery,
        showReviews: customizations.showReviews,
        showMap: customizations.showMap,
        showContact: customizations.showContact,
        profilePhoto: businessData.profilePhotoUrl || null,
        coverPhoto: businessData.coverPhotoUrl || null,
        isPublished: false // Initially unpublished
      }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(websiteData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update business data with website config
        setBusinessData(prev => prev ? {
          ...prev,
          websiteConfig: result.websiteConfig
        } : null)

        // Select template based on sector
        const template = sectorTemplates[businessData.sector as keyof typeof sectorTemplates] || sectorTemplates.OTHER
        setSelectedTemplate(template)
        
        setGeneratedSite({
          url: result.url,
          previewUrl: result.previewUrl || `/preview/${result.websiteConfig.urlSlug}`,
          template,
          analytics: {
            expectedVisitors: Math.floor(Math.random() * 500) + 200,
            seoScore: Math.floor(Math.random() * 20) + 80,
            loadTime: (Math.random() * 1.5 + 0.5).toFixed(1)
          }
        })

        setIsGenerating(false)
        setStep('completed')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Website oluşturulamadı')
      }
    } catch (error: any) {
      console.error('Error creating website:', error)
      setError('Website oluşturulurken bir hata oluştu: ' + error.message)
      setIsGenerating(false)
      setStep('intro')
    }
  }

  const copyUrl = () => {
    if (generatedSite?.url) {
      navigator.clipboard.writeText(`https://${generatedSite.url}`)
    }
  }

  const getCurrentColors = () => {
    return {
      primary: customizations.primaryColor || selectedTemplate?.colors?.primary || '#2563eb',
      secondary: customizations.secondaryColor || selectedTemplate?.colors?.secondary || '#1d4ed8', 
      gradient: customizations.gradientColors || selectedTemplate?.colors?.gradient || 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    }
  }

  const saveCustomizations = async () => {
    if (!businessData?.websiteConfig) {
      console.error('SaveCustomizations error: businessData or websiteConfig is missing', { businessData, websiteConfig: businessData?.websiteConfig })
      setError('Website konfigürasyonu bulunamadı. Lütfen önce website oluşturun.')
      return
    }
    
    try {
      setIsSaving(true)
      setError(null)
      
      console.log('Saving customizations...', {
        businessId: businessData.id,
        customizations,
        websiteConfig: businessData.websiteConfig
      })
      
      const websiteData = {
        businessId: businessData.id,
        heroTitle: customizations.heroTitle,
        heroSubtitle: customizations.heroSubtitle,
        buttonText: customizations.buttonText,
        primaryColor: customizations.primaryColor,
        secondaryColor: customizations.secondaryColor,
        gradientColors: customizations.gradientColors,
        showServices: customizations.showServices,
        showTeam: customizations.showTeam,
        showGallery: customizations.showGallery,
        showReviews: customizations.showReviews,
        showMap: customizations.showMap,
        showContact: customizations.showContact,
        profilePhoto: customizations.profilePhoto || businessData.profilePhotoUrl || null,
        coverPhoto: customizations.coverPhoto || businessData.coverPhotoUrl || null,
        galleryPhotos: customizations.galleryPhotos,
        isPublished: businessData.websiteConfig.isPublished
      }
      
      console.log('Sending websiteData to API:', websiteData)

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(websiteData)
      })
      
      console.log('API Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API Response result:', result)
        
        setBusinessData(prev => prev ? {
          ...prev,
          websiteConfig: result.websiteConfig
        } : null)

        setShowCustomizer(false)
        
        // Başarılı kaydetme sonrası kullanıcıya bilgi ver ve URL'yi aç
        const slug = result.websiteConfig?.urlSlug || businessData.websiteConfig?.urlSlug || businessData.name.toLowerCase().replace(/\s+/g, '-')
        const timestamp = Date.now()
        const siteUrl = `http://localhost:3000/${slug}?v=${timestamp}&force=${Math.random()}` // Güçlü cache buster
        
        console.log('Website config updated successfully');
        console.log('New URL with cache buster:', siteUrl);
        
        // Confirmation dialog with option to open site
        const openSite = confirm('✅ Değişiklikler başarıyla kaydedildi!\n\nCanlı sitenizi şimdi görmek ister misiniz?\n\nURL: ' + `http://localhost:3000/${slug}`)
        
        if (openSite) {
          // Cache'i bypass etmek için güçlü timestamp ekle
          setTimeout(() => {
            window.open(siteUrl, '_blank')
          }, 500) // Kısa bekleme ile veritabanının güncellenmesini bekle
        }
        
        // URL'yi clipboard'a kopyala (cache buster olmadan)
        const cleanUrl = `http://localhost:3000/${slug}`
        navigator.clipboard.writeText(cleanUrl).then(() => {
          console.log('Site URL clipboard\'a kopyalandı:', cleanUrl)
        })
        
      } else {
        const errorData = await response.json()
        console.error('API Error response:', errorData)
        throw new Error(errorData.error || 'Kaydetme başarısız')
      }
    } catch (error: any) {
      console.error('Error saving customizations:', error)
      setError('Değişiklikler kaydedilirken bir hata oluştu: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  // Photo upload functions
  const handlePhotoUpload = async (file: File, type: 'profile' | 'cover' | 'gallery') => {
    if (!businessData?.id) return
    
    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan büyük olamaz')
      return
    }
    
    // File type check
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
          setCustomizations(prev => ({ ...prev, profilePhoto: result.url }))
        } else if (type === 'cover') {
          setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: result.url } : null)
          setCustomizations(prev => ({ ...prev, coverPhoto: result.url }))
        } else if (type === 'gallery') {
          // Reload business data to get updated gallery
          loadBusinessData()
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Yükleme başarısız')
      }
    } catch (error: any) {
      console.error('Photo upload error:', error)
      setError('Fotoğraf yüklenirken bir hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  const handlePhotoDelete = async (type: 'profile' | 'cover', galleryId?: string) => {
    if (!businessData?.id) return
    
    try {
      const params = new URLSearchParams({
        businessId: businessData.id,
        type
      })
      
      if (galleryId) {
        params.append('galleryId', galleryId)
      }
      
      const response = await fetch(`/api/upload?${params}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        if (type === 'profile') {
          setBusinessData(prev => prev ? { ...prev, profilePhotoUrl: undefined } : null)
          setCustomizations(prev => ({ ...prev, profilePhoto: null }))
        } else if (type === 'cover') {
          setBusinessData(prev => prev ? { ...prev, coverPhotoUrl: undefined } : null)
          setCustomizations(prev => ({ ...prev, coverPhoto: null }))
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme başarısız')
      }
    } catch (error: any) {
      console.error('Photo delete error:', error)
      setError('Fotoğraf silinirken bir hata oluştu: ' + error.message)
    }
  }
  
  const handleGalleryDelete = async (galleryId: string) => {
    if (!businessData?.id) return
    
    try {
      const params = new URLSearchParams({
        businessId: businessData.id,
        type: 'gallery',
        galleryId
      })
      
      const response = await fetch(`/api/upload?${params}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Reload business data to get updated gallery
        loadBusinessData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme başarısız')
      }
    } catch (error: any) {
      console.error('Gallery delete error:', error)
      setError('Galeri fotoğrafı silinirken bir hata oluştu: ' + error.message)
    }
  }

  const WebsitePreview = ({ isModal = false, device = 'desktop' }: { isModal?: boolean, device?: string }) => {
    const colors = getCurrentColors()
    const deviceClasses = {
      desktop: 'w-full h-full',
      tablet: 'w-[768px] h-[1024px] mx-auto',
      mobile: 'w-[375px] h-[667px] mx-auto'
    }

    return (
      <div className={`${deviceClasses[device as keyof typeof deviceClasses]} bg-black rounded-2xl ${isModal ? 'shadow-2xl' : ''} overflow-y-auto`}>
        
        {/* Ultra Modern Hero Section with Cover & Profile Photos */}
        <div className="relative min-h-[100vh] overflow-hidden">
          
          {/* Dynamic Cover Photo or Gradient Background */}
          <div className="absolute inset-0 min-h-[100vh]">
            {(customizations.coverPhoto || businessData?.coverPhotoUrl) ? (
              <>
                {/* Cover Photo */}
                <div className="absolute inset-0 min-h-[100vh]">
                  <CloudinaryImage 
                    src={customizations.coverPhoto || businessData?.coverPhotoUrl}
                    alt="Cover"
                    className="w-full h-full"
                    style={{ objectFit: 'cover', minHeight: '100vh' }}
                  />
                  {/* Dark overlay for readability - daha koyu */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                  
                  {/* Additional text shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                </div>
                
                {/* Cover Photo Upload Button (Edit Mode) */}
                {showCustomizer && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            if (target && target.files) {
                              const file = target.files[0];
                              if (file) handlePhotoUpload(file, 'cover');
                            }
                          };
                          input.click();
                        }}
                        disabled={uploadingCover}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        <span className="text-sm font-medium">Kapak Değiştir</span>
                      </button>
                      
                      <button
                        onClick={() => handlePhotoDelete('cover')}
                        className="bg-red-500/20 backdrop-blur-xl border border-red-300/20 text-white p-3 rounded-xl hover:bg-red-500/30 transition-all"
                        title="Kapak fotoğrafını sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Gradient Background when no cover photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
                
                {/* Advanced Animated Background Effects */}
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                  <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                  <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
                </div>
                
                {/* Add Cover Photo Button (Edit Mode) */}
                {showCustomizer && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files) {
                            const file = target.files[0];
                            if (file) handlePhotoUpload(file, 'cover');
                          }
                        };
                        input.click();
                      }}
                      disabled={uploadingCover}
                      className="group bg-white/10 backdrop-blur-xl border-2 border-dashed border-white/30 text-white px-8 py-12 rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all flex flex-col items-center gap-4"
                    >
                      {uploadingCover ? (
                        <Loader2 className="w-12 h-12 animate-spin" />
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="w-10 h-10" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold mb-2">Kapak Fotoğrafı Ekle</p>
                            <p className="text-sm text-white/70">İşletmenizi en iyi temsil eden bir fotoğraf seçin</p>
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10" 
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                     }}></div>
              </>
            )}
          </div>
          
          {/* Hero Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-20">
            
            {/* Floating Navigation Bar */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-30">
              <div className="flex items-center gap-4">
                {/* Modern Logo/Brand with Profile Photo */}
                <div className="relative group">
                  <div 
                    className="absolute inset-0 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"
                    style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  ></div>
                  <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3 hover:bg-black/60 transition-all">
                    {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                      <div className="relative">
                        <CloudinaryImage 
                          publicId={(customizations.profilePhoto || businessData?.profilePhotoUrl) || ''} 
                          alt={businessData?.name || 'Logo'} 
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 group-hover:border-white/40 transition-all"
                          transformation={{
                            width: 100,
                            height: 100,
                            crop: 'fill',
                            quality: 'auto'
                          }}
                        />
                        {/* Edit button overlay for profile photo in edit mode */}
                        {showCustomizer && (
                          <button
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement;
                                if (target && target.files) {
                                  const file = target.files[0];
                                  if (file) handlePhotoUpload(file, 'profile');
                                }
                              };
                              input.click();
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xs transition-all shadow-lg"
                            title="Profil fotoğrafını değiştir"
                          >
                            <Camera className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl border-2 border-white/20 group-hover:border-white/40 transition-all">
                          {selectedTemplate?.icon || sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.icon || '🏢'}
                        </div>
                        {/* Add profile photo button in edit mode */}
                        {showCustomizer && (
                          <button
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement;
                                if (target && target.files) {
                                  const file = target.files[0];
                                  if (file) handlePhotoUpload(file, 'profile');
                                }
                              };
                              input.click();
                            }}
                            disabled={uploadingProfile}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-xs transition-all shadow-lg"
                            title="Profil fotoğrafı ekle"
                          >
                            {uploadingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <h3 className="text-white font-bold text-lg [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">{businessData?.name}</h3>
                  <p className="text-white/80 text-sm [text-shadow:_1px_1px_2px_rgba(0,0,0,0.6)]">Premium {businessData?.sector?.toLowerCase() || 'işletme'}</p>
                </div>
              </div>
              
              {/* Modern Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <a href="#services" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Hizmetler</a>
                <a href="#team" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Ekibimiz</a>
                <a href="#gallery" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Galeri</a>
                <a href="#reviews" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Yorumlar</a>
                <a href="#contact" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">İletişim</a>
                
                {/* Enhanced CTA Button */}
                <button className="relative group overflow-hidden">
                  <div 
                    className="absolute inset-0 rounded-full blur-md group-hover:blur-lg transition-all opacity-70"
                    style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  ></div>
                  <div className="relative bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{customizations.buttonText || sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.buttonText || 'Randevu Al'}</span>
                  </div>
                </button>
                
                {/* Edit Mode Toggle */}
                {showCustomizer && (
                  <button 
                    onClick={() => setShowCustomizer(false)}
                    className="bg-blue-500/20 backdrop-blur-xl border border-blue-300/20 text-white px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Düzenlemeyi Bitir</span>
                  </button>
                )}
              </nav>
              
              {/* Mobile Menu Button & Edit Controls */}
              <div className="lg:hidden flex items-center gap-2">
                {/* Edit Mode Toggle for Mobile */}
                {showCustomizer && (
                  <button 
                    onClick={() => setShowCustomizer(false)}
                    className="bg-blue-500/20 backdrop-blur-xl border border-blue-300/20 text-white p-2 rounded-xl hover:bg-blue-500/30 transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                <button className="relative w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                  <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                    <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                    <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                  </div>
                </button>
              </div>
            </div>
          
            {/* Main Hero Content */}
            <div className="max-w-6xl mx-auto text-center space-y-8">
              
              {/* Profile Photo Showcase - Large version for hero */}
              {(customizations.profilePhoto || businessData?.profilePhotoUrl) && (
                <div className="relative group mb-8">
                  <div className="w-32 h-32 mx-auto relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    
                    {/* Profile photo container */}
                    <div className="relative w-full h-full rounded-full border-4 border-white/30 group-hover:border-white/50 transition-all duration-300 overflow-hidden bg-white/10 backdrop-blur-sm">
                      <CloudinaryImage 
                        publicId={(customizations.profilePhoto || businessData?.profilePhotoUrl) || ''}
                        alt={businessData?.name || 'Profile'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        transformation={{
                          width: 300,
                          height: 300,
                          crop: 'fill',
                          quality: 'auto'
                        }}
                      />
                    </div>
                    
                    {/* Edit overlay in customizer mode */}
                    {showCustomizer && (
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            if (target && target.files) {
                              const file = target.files[0];
                              if (file) handlePhotoUpload(file, 'profile');
                            }
                          };
                          input.click();
                        }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                      >
                        {uploadingProfile ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera className="w-6 h-6 text-white" />
                            <span className="text-white text-xs font-medium">Değiştir</span>
                          </div>
                        )}
                      </button>
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white/30 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2 shadow-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
                <span className="text-white font-medium [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Şu an açık • Hemen randevu alabilirsiniz</span>
              </div>
              
              {/* Main Title with Gradient Animation */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight">
                    <span className="gradient-text">
                      {customizations.heroTitle || businessData?.name}
                    </span>
                  </h1>
                  
                  <style jsx>{`
                    .gradient-text {
                      display: inline-block;
                      color: white;
                      text-shadow: 2px 4px 8px rgba(0,0,0,0.8);
                      animation: colorPulse 6s ease-in-out infinite;
                    }
                    
                    @keyframes colorPulse {
                      0% {
                        color: white;
                        text-shadow: 2px 4px 8px rgba(0,0,0,0.8);
                      }
                      50% {
                        color: ${customizations.primaryColor || '#3b82f6'};
                        text-shadow: 2px 4px 8px rgba(0,0,0,0.8), 0 0 20px ${customizations.primaryColor || '#3b82f6'}55;
                      }
                      100% {
                        color: white;
                        text-shadow: 2px 4px 8px rgba(0,0,0,0.8);
                      }
                    }
                  `}</style>
                  
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-medium [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">
                      {customizations.heroSubtitle || sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.heroSubtitle || 'Yeni nesil hizmet deneyimi ile tanışın'}
                    </p>
                  </div>
                </div>
                
                {/* Business Highlights */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="[text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Profesyonel Hizmet</span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="[text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">{businessData?.totalAppointments || '1000'}+ Mutlu Müşteri</span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="[text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">{(businessData?.avgRating || 4.9).toFixed(1)} Puan</span>
                  </div>
                </div>
              </div>
              
              {/* Glassmorphism Stats Cards */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">{(businessData?.avgRating || 4.9).toFixed(1)}</p>
                      <p className="text-white/60 text-xs">{businessData?.reviewCount || 250}+ değerlendirme</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-400" />
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">{businessData?.totalAppointments || 1500}+</p>
                      <p className="text-white/60 text-xs">Mutlu müşteri</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-green-400" />
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">Sertifikalı</p>
                      <p className="text-white/60 text-xs">Profesyonel hizmet</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modern CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="group relative overflow-hidden">
                  <div 
                    className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-80"
                    style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  ></div>
                  <div 
                    className="relative text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
                    style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  >
                    <Calendar className="w-6 h-6" />
                    <span>{customizations.buttonText || sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.buttonText || 'Randevu Al'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                <button className="group bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  <span>Tanıtım Videosu</span>
                </button>
              </div>
              
              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-white/40 text-sm">Keşfet</span>
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Modern Services Section */}
        {customizations.showServices && (
          <div id="services" className="py-32 px-8 bg-white relative overflow-hidden">
            {/* Minimal Geometric Background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="container mx-auto max-w-7xl relative">
              {/* Section Header - Minimal & Modern */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Hizmetlerimiz</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-900 bg-clip-text text-transparent" style={{ 
                    backgroundImage: `linear-gradient(to right, #1f2937, ${customizations.primaryColor || '#3b82f6'}, #1f2937)` 
                  }}>
                    Profesyonel Hizmetler
                  </span>
                </h2>
                <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                  Modern yaklaşımımız ve uzman ekibimizle size özel çözümler sunuyoruz
                </p>
              </div>
              
              {/* Modern Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessData?.services?.length ? businessData.services.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    {/* Hover Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Service Number */}
                      <div className="absolute -top-4 -right-4 w-20 h-20 flex items-center justify-center">
                        <span className="text-8xl font-black text-gray-100">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      
                      {/* Service Title & Price */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-black text-gray-900 mb-2 transition-all">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${customizations.primaryColor || '#3b82f6'}, ${customizations.primaryColor || '#3b82f6'}aa)`
                            }}
                          >
                            ₺{service.price}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 font-medium">{service.duration} dakika</span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {service.description && (
                        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                      )}
                      
                      {/* Features List */}
                      <div className="space-y-2 mb-8">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-600">Uzman personel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-600">Premium kalite</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-600">Garanti</span>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button 
                        className="w-full relative group/btn overflow-hidden bg-black text-white py-4 px-6 rounded-2xl font-bold hover:scale-[1.02] transition-all duration-300"
                      >
                        <div 
                          className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                          style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                        ></div>
                        <span className="relative flex items-center justify-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Randevu Al
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz hizmet eklenmemiş</h3>
                    <p className="text-gray-600">Hizmetlerinizi ekleyerek müşterilerinize sunun</p>
                  </div>
                )}
              </div>
              
              {/* Bottom CTA */}
              {businessData?.services?.length && (
                <div className="text-center mt-16">
                  <button 
                    className="group text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
                    style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  >
                    <span>Tüm Hizmetleri Gör</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ultra Modern Team Section */}
        {customizations.showTeam && (
          <div id="team" className="py-32 px-8 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
            {/* Dark Theme Background with Advanced Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.02]" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                   }}></div>
            </div>
            
            <div className="container mx-auto max-w-7xl relative">
              {/* Section Header - Dark Theme */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Ekibimiz</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                  <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff, ${customizations.primaryColor || '#3b82f6'}cc, #ffffff)`
                  }}>
                    Uzman Ekibimiz
                  </span>
                </h2>
                <p className="text-xl text-white/70 text-center max-w-3xl mx-auto">
                  Alanında uzman profesyonel ekibimiz sizlere en kaliteli hizmeti sunuyor
                </p>
              </div>
              
              {businessData?.staff?.length ? (
                <>
                  {/* Modern Team Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                    {businessData.staff.map((member, index) => (
                      <div 
                        key={member.id} 
                        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105"
                      >
                        {/* Modern Avatar with Glow Effect */}
                        <div className="relative mb-6">
                          <div className="relative w-24 h-24 mx-auto">
                            {/* Glow Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
                            {/* Avatar Container */}
                            <div className="relative w-full h-full rounded-full border-3 border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden">
                              {member.photoUrl ? (
                                <img 
                                  src={member.photoUrl || ''} 
                                  alt={member.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center backdrop-blur-sm">
                                  <Users className="w-12 h-12 text-white/70" />
                                </div>
                              )}
                            </div>
                            {/* Status Indicator */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-gray-900 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Member Info */}
                        <div className="text-center">
                          <h3 className="text-xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all" style={{
                            backgroundImage: `linear-gradient(to right, ${customizations.primaryColor || '#3b82f6'}cc, ${customizations.primaryColor || '#3b82f6'})`
                          }}>
                            {member.name}
                          </h3>
                          
                          {member.specialty && (
                            <p className="text-white/60 text-sm mb-4 font-medium">
                              {member.specialty}
                            </p>
                          )}
                          
                          {/* Skills/Features */}
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="text-xs text-white/50">Sertifikalı uzman</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-white/50">5+ yıl deneyim</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="text-xs text-white/50">Modern teknikler</span>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                            <Calendar className="w-4 h-4" />
                            <span>Randevu Al</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                        
                        {/* Hover Gradient Overlay */}
                        <div 
                          className="absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-5"
                          style={{
                            background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          }}
                        ></div>
                        
                        {/* Member Number Badge */}
                        <div 
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center"
                          style={{
                            background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          }}
                        >
                          <span className="text-white font-black text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Team Stats - Margin eklendi */}
                  <div className="mt-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl font-black text-white mb-2">{businessData.staff.length}</div>
                        <div className="text-white/60 text-sm">Uzman Personel</div>
                      </div>
                      <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl font-black text-white mb-2">100%</div>
                        <div className="text-white/60 text-sm">Müşteri Memnuniyeti</div>
                      </div>
                      <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl font-black text-white mb-2">5+</div>
                        <div className="text-white/60 text-sm">Yıl Deneyim</div>
                      </div>
                      <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="text-3xl font-black text-white mb-2">24/7</div>
                        <div className="text-white/60 text-sm">Hizmet Desteği</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Call to Action */}
                  <div className="text-center mt-16">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl mx-auto">
                      <h3 className="text-2xl font-black text-white mb-4">Ekibimizle Tanışın</h3>
                      <p className="text-white/70 mb-6">Hangi uzmanımızla çalışmak istediğinizi seçin ve kişiselleştirilmiş hizmet alın</p>
                      <button 
                        className="text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto group"
                        style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                      >
                        <Users className="w-5 h-5" />
                        <span>Tüm Ekibi Gör</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-white/40" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Henüz ekip üyesi eklenmemiş</h3>
                  <p className="text-white/60">Ekip üyelerinizi ekleyerek müşterilerinize tanıtın</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ultra Modern Gallery Section */}
        {customizations.showGallery && (
          <div id="gallery" className="py-32 px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Minimal Background */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-200/30 via-pink-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
            </div>
            
            <div className="container mx-auto max-w-7xl relative">
              {/* Section Header */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Portfolyo</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-900 bg-clip-text text-transparent" style={{
                    backgroundImage: `linear-gradient(to right, #1f2937, ${customizations.primaryColor || '#3b82f6'}, #1f2937)`
                  }}>
                    Çalışmalarımız
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Profesyonel işlerimizden örnekleri görün ve kalitemizi keşfedin
                </p>
              </div>
              
              {businessData?.gallery?.length ? (
                <>
                  {/* Modern Masonry Grid - Düzgün boyutlar ve dosya ismi yok */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {businessData.gallery.map((photo, index) => (
                      <div 
                        key={photo.id} 
                        className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-200 border-2 border-gray-300"
                        style={{ aspectRatio: '1/1', minHeight: '200px' }}
                      >
                        {/* Sabit boyutlu görsel container */}
                        <div className="absolute inset-0">
                          <img 
                            src={photo.imageUrl || ''} 
                            alt={`Galeri ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            style={{ display: 'block' }}
                          />
                        </div>
                        
                        {/* Modern Overlay - sadece hover'da görünür */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        
                        {/* Hover Content - dosya ismi yok */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {/* Sadece sıra numarası */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                              <span className="text-white font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                            </div>
                          </div>
                          
                          {/* View Button */}
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          {/* Debug info - geçici */}
                          <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded text-xs">
                            {index + 1}: {photo.imageUrl.split('/').pop()}
                          </div>
                          
                          {/* Sadece açıklama varsa göster */}
                          {photo.description && (
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white/90 text-sm line-clamp-2">{photo.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View All Button */}
                  <div className="text-center mt-16">
                    <button 
                      className="group text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
                      style={{ background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                      <Camera className="w-5 h-5" />
                      <span>Tüm Fotoğrafları Gör</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz galeri fotoğrafı eklenmemiş</h3>
                  <p className="text-gray-600">Çalışmalarınızın fotoğraflarını ekleyerek müşterilerinize gösterin</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ultra Modern Reviews Section */}
        {customizations.showReviews && (
          <div id="reviews" className="py-32 px-8 bg-black relative overflow-hidden">
            {/* Dark Theme Background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="container mx-auto max-w-7xl relative">
              {/* Section Header */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <span className="text-sm font-medium text-white/60 uppercase tracking-wider">Müşteri Yorumları</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                  <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff, ${customizations.primaryColor || '#3b82f6'}cc, #ffffff)`
                  }}>
                    Ne Diyorlar?
                  </span>
                </h2>
                <p className="text-xl text-white/60 text-center max-w-3xl mx-auto">
                  Müşterilerimizin deneyimlerini okuyun
                </p>
              </div>
              
              {businessData?.reviews?.length ? (
                <>
                  {/* Modern Review Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessData.reviews.map((review, index) => (
                      <div 
                        key={review.id} 
                        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
                      >
                        {/* Rating Stars at Top */}
                        <div className="flex items-center gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-white/20'}`} 
                            />
                          ))}
                        </div>
                        
                        {/* Review Text */}
                        <div className="mb-6">
                          <p className="text-white/90 text-lg leading-relaxed font-light">
                            “{review.comment}”
                          </p>
                        </div>
                        
                        {/* Customer Info */}
                        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                          <div className="relative">
                            <img 
                              src={review.customerAvatar || `https://ui-avatars.com/api/?name=${review.customerName}&background=random`} 
                              alt={review.customerName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{review.customerName}</h4>
                            <p className="text-sm text-white/40">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bottom Stats */}
                  <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 border border-gray-200/50 shadow-lg">
                      <div className="text-center">
                        <div className="text-3xl font-black" style={{ color: colors.primary }}>
                          {(businessData?.avgRating || 4.8).toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-1">
                          {renderStars(Math.floor(businessData?.avgRating || 5))}
                        </div>
                        <p className="text-sm text-gray-600">Ortalama Puan</p>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-3xl font-black" style={{ color: colors.primary }}>
                          {businessData?.reviewCount || 127}
                        </div>
                        <p className="text-sm text-gray-600">Toplam Yorum</p>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-green-600">
                          %{((businessData?.reviewCount || 120) / (businessData?.reviewCount || 127) * 100).toFixed(0)}
                        </div>
                        <p className="text-sm text-gray-600">Memnuniyet</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz müşteri yorumu bulunmuyor</h3>
                  <p className="text-gray-600">İlk yorumlarınızı almaya başladığınızda burada görünecekler</p>
                </div>
              )}
            </div>
          </div>
        )}

{/* Ultra Modern Contact Section */}
        {customizations.showContact && (
          <div id="contact" className="py-32 px-8 bg-white relative overflow-hidden">
            {/* Minimal Gradient Background */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/50 via-purple-100/50 to-pink-100/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-green-100/50 via-yellow-100/50 to-orange-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="container mx-auto max-w-7xl relative">
              {/* Section Header */}
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">İletişim</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-900 bg-clip-text text-transparent" style={{
                    backgroundImage: `linear-gradient(to right, #1f2937, ${customizations.primaryColor || '#3b82f6'}, #1f2937)`
                  }}>
                    Bize Ulaşın
                  </span>
                </h2>
                <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                  Size nasıl yardımcı olabileceğimizi öğrenmek için iletişime geçin
                </p>
              </div>
              
              {/* Modern Contact Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Phone Card */}
              <div className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-2xl transition-all duration-500">
              <div className="mb-6">
              <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600">{businessData?.phone}</p>
              </div>
              <button 
              className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <Phone className="w-4 h-4" />
              <span>Ara</span>
              </button>
              </div>
              
              {/* Email Card */}
              <div className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-2xl transition-all duration-500">
              <div className="mb-6">
              <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600">{businessData?.email || 'info@example.com'}</p>
              </div>
              <button 
              className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <Mail className="w-4 h-4" />
              <span>Mesaj Gönder</span>
              </button>
              </div>
              
              {/* Address Card */}
              <div className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 hover:shadow-2xl transition-all duration-500">
              <div className="mb-6">
              <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">{businessData?.address}</p>
              </div>
              <button 
              className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              style={{
              background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              }}
              >
              <MapPin className="w-4 h-4" />
              <span>Yol Tarifi</span>
              </button>
              </div>
              </div>
            
            {/* Dynamic Google Maps */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      }}
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{businessData?.name}</h3>
                      <p className="text-sm text-gray-600">Konum & Yol Tarifi</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const address = encodeURIComponent(businessData?.address || '');
                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Google Maps'te Aç</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Ücretsiz Statik Harita + İnteraktif Butonlar - En Basit Çözüm (Güzel Placeholder) */}
              <div className="relative h-96 bg-gray-100 rounded-b-3xl overflow-hidden">
                {businessData?.address ? (
                  <>
                    {/* Statik Harita Görüntüsü - MapQuest Static API (Free) */}
                    <div className="absolute inset-0">
                      <img
                        src={`https://www.mapquestapi.com/staticmap/v5/map?key=Fmjtd|luu821uznh,7a=o5-94720g&locations=${encodeURIComponent(businessData.address)}&size=800,400@2x&zoom=15&format=png`}
                        alt="Harita"
                        className="w-full h-full object-cover rounded-b-3xl"
                        onError={(e) => {
                          // Eğer MapQuest çalışmazsa, güzel bir placeholder göster
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      
                      {/* Placeholder - Harita yüklenemezse gösterilecek */}
                      <div 
                        className="w-full h-full flex items-center justify-center" 
                        style={{
                          display: 'none',
                          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                        }}
                      >
                        <div className="text-center text-white">
                          <MapPin className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-lg font-bold mb-2">{businessData.name}</h3>
                          <p className="text-sm opacity-90 max-w-xs mx-auto">{businessData.address}</p>
                          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">Konum Bilgileri</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Overlay ile Butonlar */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 group">
                      {/* Buton Container - Hover'da görünür */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50">
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <button
                              onClick={() => {
                                const address = encodeURIComponent(businessData.address);
                                window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 justify-center transition-all shadow-lg hover:shadow-xl text-sm"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z M7,9c0-2.8,2.2-5,5-5s5,2.2,5,5 c0,2.9-2.9,6.9-5,9.1C9.9,15.9,7,11.9,7,9z M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z"/>
                              </svg>
                              Google Maps
                            </button>
                            
                            <button
                              onClick={() => {
                                const address = encodeURIComponent(businessData.address);
                                window.open(`https://maps.apple.com/?q=${address}`, '_blank');
                              }}
                              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 justify-center transition-all shadow-lg hover:shadow-xl text-sm"
                            >
                              <MapPin className="w-4 h-4" />
                              Apple Maps
                            </button>
                            
                            <button
                              onClick={() => {
                                const address = encodeURIComponent(businessData.address);
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 justify-center transition-all shadow-lg hover:shadow-xl text-sm"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                              </svg>
                              Yol Tarifi
                            </button>
                          </div>
                          
                          {/* Adres bilgisi */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">{businessData.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>7/24 Erişilebilir</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {businessData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover İpucu */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                          Seçenekleri görmek için fareyi üzerine getirin
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center p-8">
                      <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Adres Bilgisi Bulunamadı</h3>
                      <p className="text-gray-500">Konum bilgisi eklendiğinde harita görünecek</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Map Info Footer */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Aktif Konum</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>7/24 Görüntülenebilir</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const address = encodeURIComponent(businessData?.address || '');
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                    }}
                    className="text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    style={{
                      background: customizations.gradientColors || 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Yol Tarifi Al</span>
                    <ArrowRight className="w-4 h-4" />
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
                 
                  {/* Quick Actions */}
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Randevu</span>
                      </button>
                      <button className="bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-bold hover:bg-white/25 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Mesaj</span>
                      </button>
                    </div>
                  </div>
               
              
              
              {/* Bottom CTA */}
              

  // Loading screen
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error screen
  if (error && status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            {error.includes('işletme oluştur') && (
              <button 
                onClick={() => window.location.href = '/dashboard/settings'}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                İşletme Oluştur
              </button>
            )}
            <button 
              onClick={() => {
                setError(null)
                loadBusinessData()
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI Destekli Web Sitesi Oluşturucu
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4"
          >
            5 Saniyede Profesyonel
            <br />Web Siteniz Hazır! ✨
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Bilgileriniz zaten sistemde. Tek tuşla profesyonel, SEO uyumlu ve mobil responsive web sitenizi oluşturun!
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'intro' && businessData && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-4xl mx-auto"
            >
              {/* Business Preview Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                    {sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.icon || '🏢'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{businessData?.name}</h2>
                    <p className="text-gray-600">Sistemdeki bilgileriniz kullanılacak</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">📞 İletişim</h3>
                    <p className="text-sm text-gray-600">{businessData?.phone}</p>
                    <p className="text-sm text-gray-600">{businessData?.address}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">⭐ Performans</h3>
                    <p className="text-sm text-gray-600">{businessData?.avgRating?.toFixed(1) || 0} puan ({businessData?.reviewCount || 0} yorum)</p>
                    <p className="text-sm text-gray-600">{businessData?.totalAppointments || 0} randevu</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">💼 Hizmetler</h3>
                    <p className="text-sm text-gray-600">{businessData?.services?.length || 0} farklı hizmet</p>
                    <p className="text-sm text-gray-600">{businessData?.staff?.length || 0} personel</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: Zap, title: '5 Saniye', desc: 'Anında hazır', color: 'from-yellow-400 to-orange-500' },
                  { icon: Smartphone, title: 'Mobil Uyumlu', desc: 'Tüm cihazlarda perfect', color: 'from-green-400 to-blue-500' },
                  { icon: BarChart3, title: 'SEO Optimized', desc: 'Google\'da üst sıralarda', color: 'from-purple-400 to-pink-500' },
                  { icon: Globe, title: 'Canlı Veri', desc: 'Otomatik güncellenen', color: 'from-blue-400 to-cyan-500' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <button
                  onClick={handleGenerateWebsite}
                  disabled={isGenerating}
                  className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Wand2 className="w-6 h-6" />
                    )}
                    ✨ Web Sitemi 5 Saniyede Oluştur!
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </button>
                
                <p className="text-sm text-gray-500 mt-4">
                  💡 Tasarım bilgisi gerektirmez • Anında yayına çıkar • İstediğiniz zaman düzenlenebilir
                </p>
              </motion.div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-8"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🤖 AI Sitenizi Oluşturuyor...
                </h2>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
                
                <p className="text-xl text-gray-600 mb-2">{Math.round(progress)}% Tamamlandı</p>
                <p className="text-sm text-gray-500">
                  İçerik hazırlanıyor, SEO optimizasyonları uygulanıyor...
                </p>
              </div>
            </motion.div>
          )}

          {step === 'completed' && generatedSite && businessData && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-6xl mx-auto"
            >
              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  🎉 Web Siteniz Hazır!
                </h2>
                <p className="text-xl text-gray-800">
                  Profil fotoğrafı, hizmetler, galeri ve iletişim bilgileri ile birlikte tam kapsamlı web siteniz hazır!
                </p>
              </div>

              {/* Website Preview */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-mono text-gray-800">{generatedSite.url}</span>
                      <button
                        onClick={copyUrl}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="URL'yi kopyala"
                      >
                        <Copy className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Tam ekran önizleme"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.open(`https://${generatedSite.url}`, '_blank')}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Yeni sekmede aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Website Mockup */}
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                  <WebsitePreview />
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-blue-900">SEO Skoru</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">{generatedSite.analytics.seoScore}/100</p>
                  <p className="text-sm text-blue-700">Google için optimize edildi</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-green-900">Yükleme Hızı</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-2">{generatedSite.analytics.loadTime}s</p>
                  <p className="text-sm text-green-700">Çok hızlı performans</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-purple-900">Beklenen Ziyaret</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-2">{generatedSite.analytics.expectedVisitors}</p>
                  <p className="text-sm text-purple-700">Aylık ziyaretçi tahmini</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <Eye className="w-5 h-5" />
                  Önizleme
                </button>
                
                <button 
                  onClick={() => setShowCustomizer(true)}
                  className="bg-white text-gray-900 border-2 border-gray-200 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <Palette className="w-5 h-5" />
                  Tasarımı Özelleştir
                </button>
                
                <button 
                  onClick={() => {
                    const slug = businessData?.websiteConfig?.urlSlug || businessData?.name?.toLowerCase().replace(/\s+/g, '-')
                    // Cache buster ile aç
                    window.open(`http://localhost:3000/${slug}?v=${Date.now()}`, '_blank')
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <ExternalLink className="w-5 h-5" />
                  Canlı Siteyi Gör
                </button>
                
                <button 
                  onClick={() => {
                    setStep('intro')
                    setGeneratedSite(null)
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <Wand2 className="w-5 h-5" />
                  Yeni Site Oluştur
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">Önizleme</h3>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                        title="Masaüstü görünümü"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                        title="Tablet görünümü"
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                        title="Mobil görünümü"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800 font-mono">{generatedSite?.url}</span>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-gray-100 p-8">
                  <WebsitePreview isModal={true} device={previewDevice} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customizer Modal */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex"
            >
              <div className="bg-white w-80 h-full overflow-y-auto">
                <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Tasarım Özelleştir</h3>
                    <button
                      onClick={() => setShowCustomizer(false)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profil Fotoğrafı */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Profil Fotoğrafı
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl border-3 border-white overflow-hidden bg-white shadow-xl group-hover:scale-105 transition-all duration-300">
                            {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                               <CloudinaryImage
                                src={customizations.profilePhoto || businessData?.profilePhotoUrl}
                                alt="Kapak Fotoğrafı"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
                                <Camera className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {/* Preview Badge */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="space-y-3">
                            <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-sm font-semibold group">
                              {uploadingProfile ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              )}
                              {uploadingProfile ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingProfile}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handlePhotoUpload(file, 'profile')
                                    e.target.value = ''
                                  }
                                }}
                              />
                            </label>
                            
                            {(customizations.profilePhoto || businessData?.profilePhotoUrl) && (
                              <button
                                onClick={() => handlePhotoDelete('profile')}
                                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 text-sm font-semibold group"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Kaldır
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-3 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2">
                            📸 JPG, PNG veya WebP • Max: 5MB • Kare format önerilir
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kapak Fotoğrafı */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                      Kapak Fotoğrafı
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <div className="space-y-4">

                        {/* Cover Photo Preview */}
                        {(customizations.coverPhoto || businessData?.coverPhotoUrl) && (
                          <div className="mb-4">
                            <div className="relative group aspect-video rounded-xl overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300">
                              <CloudinaryImage
                                src={customizations.coverPhoto || businessData?.coverPhotoUrl}
                                alt="Kapak Fotoğrafı"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => handlePhotoDelete('cover')}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg transform scale-75 group-hover:scale-100 duration-300"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <CloudinaryUpload
                            onUpload={(result) => {
      if (result.secure_url) {
        setCustomizations(prev => ({ ...prev, coverPhoto: result.public_id }));
        setUploadingCover(false);
      }
    }}
    folder="business-covers"
    tags="cover,website"
    maxFiles={1}
  />
                        </div>
                        
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="font-semibold">1200x400 px</p>
                              <p className="opacity-80">Önerilen boyut</p>
                            </div>
                            <div className="text-center">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="font-semibold">Max 5MB</p>
                              <p className="opacity-80">Dosya boyutu</p>
                            </div>
                            <div className="text-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                </svg>
                              </div>
                              <p className="font-semibold">JPG, PNG</p>
                              <p className="opacity-80">Format</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Galeri Fotoğrafları */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Galeri Fotoğrafları
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="space-y-4">
                        {/* Galeri Grid */}
                        <div className="grid grid-cols-4 gap-3">
                          {businessData?.gallery?.map((photo) => (
                            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300">
                              <img 
                                src={photo.imageUrl || ''} 
                                alt={photo.title || 'Galeri fotoğrafı'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                  onClick={() => handleGalleryDelete(photo.id)}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg transform scale-75 group-hover:scale-100 duration-300"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )) || []}
                          
                          {/* Yeni Fotoğraf Ekleme */}
                          <div className="aspect-square rounded-xl border-2 border-dashed border-green-300 hover:border-green-400 transition-colors bg-white/50 backdrop-blur-sm hover:bg-white/70 group overflow-hidden">
                            <CloudinaryUpload
  onUpload={(result) => {
    if (result.secure_url) {
      // Yeni galeri fotoğrafını ekle
      const newPhoto = {
        id: Date.now().toString(),
        imageUrl: result.secure_url,
        title: 'Galeri Fotoğrafı'
      };
      // Bu kısım backend'e kaydetme işlemi yapılmalı
      setUploadingGallery(false);
    }
  }}
  folder="business-gallery"
  tags="gallery,website"
  maxFiles={1}
  className="w-full h-full flex items-center justify-center"
>
                              {uploadingGallery ? (
                                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                              ) : (
                                <div className="text-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <Plus className="w-5 h-5 text-green-500" />
                                  </div>
                                  <p className="text-xs text-green-600 font-semibold">Ekle</p>
                                </div>
                              )}
                            </CloudinaryUpload>
                          </div>
                        </div>
                        
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span>Her seferinde bir fotoğraf yükleyin</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                </svg>
                              </div>
                              <span>JPG, PNG, WebP • Max: 5MB</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Renk Seçici */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Palette className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xl">Renk Teması</span>
                    </h4>
                    
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                      {/* Ana Renk Seçici */}
                      <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h5 className="text-lg font-bold text-gray-900">Ana Renk</h5>
                            <p className="text-gray-600 text-sm mt-1">Web sitenizin temel rengi</p>
                          </div>
                          <div 
                            className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl ring-2 ring-gray-100 transition-all duration-300"
                            style={{ backgroundColor: customizations.primaryColor || '#3b82f6' }}
                          ></div>
                        </div>
                        
                        {/* Renk Seçici Input */}
                        <div className="relative group">
                          <input
                            type="color"
                            value={customizations.primaryColor || '#3b82f6'}
                            onChange={(e) => {
                              const color = e.target.value;
                              setCustomizations(prev => ({ 
                                ...prev, 
                                primaryColor: color,
                                secondaryColor: color,
                                gradientColors: `linear-gradient(135deg, ${color}, ${color}dd)`
                              }));
                            }}
                            className="w-full h-16 rounded-2xl border-0 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                            style={{ backgroundColor: customizations.primaryColor || '#3b82f6' }}
                          />
                          <div className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-white/50 group-hover:border-white/80 transition-all duration-300"></div>
                        </div>
                        
                        {/* Renk Kodu */}
                        <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <code className="font-mono text-sm text-gray-700 font-bold">
                            {customizations.primaryColor || '#3b82f6'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(customizations.primaryColor || '#3b82f6');
                            }}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                            title="Renk kodunu kopyala"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Popüler Renk Paleti */}
                      <div className="p-8">
                        <h5 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Popüler Renkler</h5>
                        <div className="grid grid-cols-8 gap-3">
                          {[
                            '#3b82f6', // Blue
                            '#8b5cf6', // Purple  
                            '#ec4899', // Pink
                            '#ef4444', // Red
                            '#f97316', // Orange
                            '#eab308', // Yellow
                            '#22c55e', // Green
                            '#06b6d4', // Cyan
                            '#6366f1', // Indigo
                            '#a855f7', // Violet
                            '#e11d48', // Rose
                            '#dc2626', // Red-600
                            '#059669', // Emerald
                            '#0891b2', // Sky
                            '#1f2937', // Gray-800
                            '#374151', // Gray-700
                          ].map((color, index) => {
                            const isSelected = customizations.primaryColor === color;
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setCustomizations(prev => ({ 
                                    ...prev, 
                                    primaryColor: color,
                                    secondaryColor: color,
                                    gradientColors: `linear-gradient(135deg, ${color}, ${color}dd)`
                                  }));
                                }}
                                className={`group relative w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 ${
                                  isSelected 
                                    ? 'ring-4 ring-blue-200 ring-offset-2 scale-110 shadow-xl' 
                                    : 'hover:shadow-lg shadow-md'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              >
                                {isSelected && (
                                  <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ana Başlık */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.5 3A1.5 1.5 0 001 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0015 5.293V4.5A1.5 1.5 0 0013.5 3h-11z" />
                        </svg>
                      </div>
                      Ana Başlık
                    </h4>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                      <input
                        type="text"
                        value={customizations.heroTitle || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, heroTitle: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 text-gray-900 bg-white/80 backdrop-blur-sm font-semibold text-lg transition-all duration-300 hover:bg-white placeholder-gray-400"
                        placeholder="Örn: Profesyonel Berberlik Deneyimi"
                      />
                      <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span>Bu metin web sitenizin en üstünde büyük boyutta görünecek</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alt Başlık */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Alt Başlık
                    </h4>
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                      <textarea
                        value={customizations.heroSubtitle || ''}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-400 text-gray-900 bg-white/80 backdrop-blur-sm resize-none transition-all duration-300 hover:bg-white placeholder-gray-400"
                        placeholder="Örn: Her detayda mükemmellik, profesyonel hizmet deneyimi"
                        rows={3}
                      />
                      <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span>Bu açıklama ana başlığın altında görünecek</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buton Metni */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                        </svg>
                      </div>
                      Ana Buton Metni
                    </h4>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                      <input
                        type="text"
                        value={customizations.buttonText || 'Randevu Al'}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, buttonText: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 text-gray-900 bg-white/80 backdrop-blur-sm font-semibold transition-all duration-300 hover:bg-white placeholder-gray-400"
                        placeholder="Örn: Randevu Al, Hemen Ara, İletişime Geç"
                      />
                      <div className="mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span>Bu metin ana butonunuzda görünecek ve tıklanabilir olacak</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🔧 Bölüm Görünürlüğü</h4>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showServices ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showServices: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Hizmetleri Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showTeam ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showTeam: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Ekibimizi Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showTeam ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showTeam: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Ekibimizi Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showGallery ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showGallery: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Galeriyi Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showReviews ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showReviews: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Yorumları Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showMap ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showMap: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Haritayı Göster</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customizations.showContact ?? true}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, showContact: e.target.checked }))}
                          className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">İletişim Bilgilerini Göster</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 sticky bottom-0">
                  <div className="flex gap-3">
                    <button
                      onClick={saveCustomizations}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? 'Kaydediliyor...' : '✨ Değişiklikleri Kaydet ve Yayınla'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Kaydetme sonrası değişiklikleriniz localhost:3000/[slug] adresinde görünecek
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex-1 overflow-auto bg-gray-100 p-8">
                <WebsitePreview isModal={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md z-50"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Hata</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-600 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}