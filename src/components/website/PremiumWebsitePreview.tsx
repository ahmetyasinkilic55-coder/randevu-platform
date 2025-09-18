'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Mail, Clock, Calendar, MessageCircle, ExternalLink,
  Camera, Eye, ArrowRight, Plus, Check, Award, Heart, Sparkles, Users, Play,
  ChevronLeft, ChevronRight, X, BookOpen, FileText, Zap, Shield, Crown,
  TrendingUp, Cpu, Palette, Layers, Globe, Rocket, Target, Gift, Menu,
  Diamond, Gem, Flame, Bolt, Infinity, Wand2
} from 'lucide-react'
import AppointmentModal from '../AppointmentModal'
import ProjectInquiryModal from '../modals/ProjectInquiryModal'
import ConsultationModal from '../modals/ConsultationModal'
import ContactModal from '../modals/ContactModal'
import AIChatWidget from '../ai/AIChatWidget'
import CloudinaryImage from '@/components/cloudinary/CloudinaryImage'
import MainHeader from '@/components/MainHeader'

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
    rating?: number
    staffLeaves?: Array<{
      id: string
      startDate: string
      endDate: string
      startTime?: string
      endTime?: string
      type: 'FULL_DAY' | 'PARTIAL' | 'MULTI_DAY'
      status: 'APPROVED' | 'PENDING' | 'REJECTED'
    }>
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
  websiteConfig?: {
    primaryColor: string
    secondaryColor: string
    gradientColors: string
    heroTitle: string
    heroSubtitle: string
    buttonText: string
    showServices: boolean
    showTeam: boolean
    showGallery: boolean
    showBlog: boolean
    showReviews: boolean
    showMap: boolean
    showContact: boolean
  }
  settings?: {
    serviceType: string
    buttonText: string
    consultationFee: number
    isConsultationFree: boolean
    minimumProjectAmount: number
    workingRadius?: string
    supportedMeetingTypes?: string[]
  }
  appointmentSettings?: {
    slotDuration: number
    bufferTime: number
    maxAdvanceBooking: number
    minAdvanceBooking: number
    allowSameDayBooking: boolean
    maxDailyAppointments: number
    autoConfirmation: boolean
  }
}

interface PremiumWebsitePreviewProps {
  businessData: BusinessData
  customizations: {
    primaryColor?: string
    secondaryColor?: string
    gradientColors?: string
    heroTitle?: string
    heroSubtitle?: string
    buttonText?: string
    showServices?: boolean
    showTeam?: boolean
    showGallery?: boolean
    showBlog?: boolean
    showReviews?: boolean
    showMap?: boolean
    showContact?: boolean
    profilePhoto?: string
    coverPhoto?: string
  }
  isModal?: boolean
  device?: string
  businessSlug?: string
}

export default function PremiumWebsitePreview({ 
  businessData, 
  customizations, 
  isModal = false, 
  device = 'desktop',
  businessSlug
}: PremiumWebsitePreviewProps) {
  // States for different modals
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [consultationModalOpen, setConsultationModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  
  // Gallery lightbox states
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [blogLoading, setBlogLoading] = useState(true)
  
  // Hero animation states
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  
  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Hero animation on load
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])
  
  // Auto-rotate featured services
  useEffect(() => {
    if (businessData?.services && businessData.services.length > 1) {
      const interval = setInterval(() => {
        setCurrentServiceIndex(prev => (prev + 1) % businessData.services.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [businessData?.services])
  
  // Fetch blog posts for this business
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setBlogLoading(true)
        const response = await fetch(`/api/blog/business/${businessData.id}`)
        if (response.ok) {
          const posts = await response.json()
          setBlogPosts(posts)
        }
      } catch (error) {
        console.error('Blog yazıları yüklenirken hata:', error)
      } finally {
        setBlogLoading(false)
      }
    }
    
    if (businessData?.id) {
      fetchBlogPosts()
    }
  }, [businessData?.id])
  
  // Gallery navigation functions
  const nextImage = () => {
    if (selectedImageIndex !== null && businessData?.gallery) {
      setSelectedImageIndex((selectedImageIndex + 1) % businessData.gallery.length)
    }
  }
  
  const prevImage = () => {
    if (selectedImageIndex !== null && businessData?.gallery) {
      setSelectedImageIndex((selectedImageIndex - 1 + businessData.gallery.length) % businessData.gallery.length)
    }
  }
  
  // Handle touch/swipe for mobile gallery navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartX === null || touchStartY === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchStartX - touchEndX
    const deltaY = touchStartY - touchEndY
    
    // Only process horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
    
    setTouchStartX(null)
    setTouchStartY(null)
  }
  
  // Handle keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextImage()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedImageIndex(null)
      }
    }
    
    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedImageIndex])
  
  const handleAction = () => {
    if (!businessData.settings) {
      setAppointmentModalOpen(true)
      return
    }
    
    switch (businessData.settings.serviceType) {
      case 'PROJECT':
        setProjectModalOpen(true)
        break
      case 'CONSULTATION':
        setConsultationModalOpen(true)
        break
      case 'APPOINTMENT':
      default:
        setAppointmentModalOpen(true)
        break
    }
  }

  // Dynamic gradient and color scheme based on sector
  const getSectorTheme = (sector: string) => {
    const themes: Record<string, any> = {
      'Güzellik & Bakım': {
        primary: 'from-rose-500 via-pink-500 to-purple-600',
        secondary: 'from-rose-100 to-pink-100',
        accent: 'bg-gradient-to-r from-rose-500 to-pink-500',
        icon: Crown,
        pattern: 'bg-rose-50'
      },
      'Sağlık Hizmetleri': {
        primary: 'from-blue-500 via-cyan-500 to-teal-600',
        secondary: 'from-blue-50 to-cyan-50',
        accent: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        icon: Shield,
        pattern: 'bg-blue-50'
      },
      'Otomotiv & Hizmet': {
        primary: 'from-slate-600 via-gray-700 to-zinc-800',
        secondary: 'from-slate-100 to-gray-100',
        accent: 'bg-gradient-to-r from-slate-600 to-gray-700',
        icon: Zap,
        pattern: 'bg-slate-50'
      },
      'Etkinlik & Mekan': {
        primary: 'from-amber-500 via-orange-500 to-red-600',
        secondary: 'from-amber-50 to-orange-50',
        accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
        icon: Sparkles,
        pattern: 'bg-amber-50'
      }
    }
    
    return themes[sector] || {
      primary: 'from-indigo-500 via-purple-500 to-pink-600',
      secondary: 'from-indigo-50 to-purple-50',
      accent: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      icon: Diamond,
      pattern: 'bg-indigo-50'
    }
  }

  const theme = getSectorTheme(businessData.sector)
  const SectorIcon = theme.icon

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation - Mobile Responsive */}
      <nav className="fixed top-3 sm:top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-4 sm:space-x-8 text-white">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <SectorIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-sm sm:text-lg truncate max-w-32 sm:max-w-none">{businessData.name}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#hizmetler" className="hover:text-yellow-300 transition-colors">Hizmetler</a>
              {customizations.showTeam && (
                <a href="#takim" className="hover:text-yellow-300 transition-colors">Ekip</a>
              )}
              {customizations.showGallery && (
                <a href="#galeri" className="hover:text-yellow-300 transition-colors">Galeri</a>
              )}
              {customizations.showReviews && (
                <a href="#yorumlar" className="hover:text-yellow-300 transition-colors">Yorumlar</a>
              )}
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Improved */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3 sm:space-y-4">
              <a href="#hizmetler" className="block text-white hover:text-yellow-300 transition-colors py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                Hizmetler
              </a>
              {customizations.showTeam && (
                <a href="#takim" className="block text-white hover:text-yellow-300 transition-colors py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Ekip
                </a>
              )}
              {customizations.showGallery && (
                <a href="#galeri" className="block text-white hover:text-yellow-300 transition-colors py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Galeri
                </a>
              )}
              {customizations.showReviews && (
                <a href="#yorumlar" className="block text-white hover:text-yellow-300 transition-colors py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Yorumlar
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Full Screen with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Mobile-First Responsive Design */}
        <div className="absolute inset-0">
          {(customizations.coverPhoto || businessData?.coverPhotoUrl) ? (
            <>
              {/* Mobile-Optimized Cover Photo Background */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("https://res.cloudinary.com/ddapurgju/image/upload/w_1920,h_1080,c_fill,g_auto,q_auto/${customizations.coverPhoto || businessData?.coverPhotoUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
              </div>
            </>
          ) : (
            <>
              {/* Gradient Background when no cover photo */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Animated Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Hero Content - Mobile Responsive */}
        <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${
          heroLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          {/* Profile Photo with Glow Effect */}
          <div className="mb-6 sm:mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full animate-pulse blur-lg opacity-75" />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                  <div 
                    className="w-full h-full rounded-full border-4 border-white/30 backdrop-blur-sm"
                    style={{
                      backgroundImage: `url("https://res.cloudinary.com/ddapurgju/image/upload/w_200,h_200,c_fill,g_auto,q_auto/${customizations.profilePhoto || businessData?.profilePhotoUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                    <SectorIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Info - Mobile Responsive */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight">
              {customizations.heroTitle || businessData.name}
            </h1>
            
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-6 sm:h-6 ${
                      i < Math.floor(businessData.avgRating) ? 'fill-current' : ''
                    }`}
                  />
                ))}
                <span className="ml-2 text-white font-bold text-sm sm:text-lg">
                  {businessData.avgRating.toFixed(1)}
                </span>
              </div>
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              <span className="text-white/80 text-sm sm:text-lg">
                {businessData.reviewCount} değerlendirme
              </span>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed px-2">
              {customizations.heroSubtitle || `Profesyonel ${businessData.sector} hizmetleri`}
            </p>

            {/* Rotating Service Highlight - Mobile Responsive */}
            {businessData.services && businessData.services.length > 0 && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-sm sm:max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    <div>
                      <h3 className="text-white font-semibold text-base sm:text-lg">
                        {businessData.services[currentServiceIndex]?.name}
                      </h3>
                      <p className="text-white/70 text-xs sm:text-sm">
                        {businessData.services[currentServiceIndex]?.duration} dk • ₺{businessData.services[currentServiceIndex]?.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 mt-8 sm:mt-10">
              <button
                onClick={handleAction}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{customizations.buttonText || 'Hemen Başla'}</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button
                onClick={() => setContactModalOpen(true)}
                className="group flex items-center justify-center space-x-2 text-white border-2 border-white/50 hover:border-white hover:bg-white/10 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>İletişim</span>
              </button>
            </div>

            {/* Stats Bar - Mobile Responsive */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-12 max-w-sm sm:max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{businessData.totalAppointments}+</div>
                <div className="text-white/70 text-xs sm:text-sm">Mutlu Müşteri</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{businessData.services?.length || 0}+</div>
                <div className="text-white/70 text-xs sm:text-sm">Hizmet Türü</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">{businessData.staff?.length || 0}+</div>
                <div className="text-white/70 text-xs sm:text-sm">Uzman Ekip</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Mobile Responsive */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      {customizations.showServices && businessData.services && businessData.services.length > 0 && (
        <section id="hizmetler" className={`py-20 ${theme.pattern}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <Gem className="w-4 h-4" />
                <span>Premium Hizmetler</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Lüks Deneyimler
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Size özel tasarlanmış premium hizmetlerimizle farkı yaşayın
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.services.map((service, index) => (
                <div
                  key={service.id}
                  className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Service Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 ${theme.accent} rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                      {service.category === 'skincare' && <Sparkles className="w-8 h-8 text-white" />}
                      {service.category === 'massage' && <Heart className="w-8 h-8 text-white" />}
                      {service.category === 'makeup' && <Palette className="w-8 h-8 text-white" />}
                      {service.category === 'treatment' && <Zap className="w-8 h-8 text-white" />}
                      {!['skincare', 'massage', 'makeup', 'treatment'].includes(service.category) && (
                        <Diamond className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  {service.description && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{service.duration} dk</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-gray-900">₺{service.price}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAction}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
                  >
                    <span>Randevu Al</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {customizations.showTeam && businessData.staff && businessData.staff.length > 0 && (
        <section id="takim" className="py-20 bg-gray-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <Crown className="w-4 h-4" />
                <span>Uzman Ekibimiz</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Profesyonel Kadromuz
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Alanında uzman profesyonellerle en iyi hizmeti alın
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.staff.map((member, index) => (
                <div
                  key={member.id}
                  className="group relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Staff Photo */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden">
                      {member.photoUrl ? (
                        <CloudinaryImage
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          transformation={{
                            width: 96,
                            height: 96,
                            crop: 'fill',
                            gravity: 'auto'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    {member.specialty && (
                      <p className="text-gray-300 mb-4">{member.specialty}</p>
                    )}
                    
                    {member.rating && (
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(member.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-300">{member.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={handleAction}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
                    >
                      Randevu Al
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {customizations.showGallery && businessData.gallery && businessData.gallery.length > 0 && (
        <section id="galeri" className={`py-20 ${theme.pattern}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <Camera className="w-4 h-4" />
                <span>Çalışmalarımız</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Sanat Galerisi
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                En özel anlarınızı ölümsüzleştirdiğimiz çalışmalarımıza göz atın
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {businessData.gallery.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CloudinaryImage
                    src={item.imageUrl}
                    alt={item.title || `Galeri ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      {item.title && (
                        <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      )}
                      <div className="flex items-center justify-between">
                        <Eye className="w-4 h-4 text-white/80" />
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {customizations.showReviews && businessData.reviews && businessData.reviews.length > 0 && (
        <section id="yorumlar" className="py-20 bg-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20" />
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                <span>Müşteri Memnuniyeti</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Mutlu Müşterilerimiz
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Bizi tercih eden değerli müşterilerimizin deneyimleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.reviews.slice(0, 6).map((review, index) => (
                <div
                  key={review.id}
                  className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                  
                  {/* Customer Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {review.customerAvatar ? (
                        <CloudinaryImage
                          src={review.customerAvatar}
                          alt={review.customerName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {customizations.showContact && (
        <section id="iletisim" className="py-20 bg-gray-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-20`} />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <MessageCircle className="w-4 h-4" />
                <span>İletişime Geçin</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Hemen Başlayalım
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Size özel hizmet için bugün bizimle iletişime geçin
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Telefon</h3>
                    <p className="text-gray-300">{businessData.phone}</p>
                  </div>
                </div>

                {businessData.email && (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">E-posta</h3>
                      <p className="text-gray-300">{businessData.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Adres</h3>
                    <p className="text-gray-300">{businessData.address}</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold">Çalışma Saatleri</h3>
                  </div>
                  <div className="space-y-2">
                    {businessData.workingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-300">{schedule.dayOfWeek}</span>
                        <span className={`${schedule.isClosed ? 'text-red-400' : 'text-green-400'} font-medium`}>
                          {schedule.isClosed ? 'Kapalı' : `${schedule.openTime} - ${schedule.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold">Hemen Başlayın!</h3>
                  <p className="text-gray-300">
                    Premium hizmetlerimizden yararlanmak için randevunuzu alın
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleAction}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      {customizations.buttonText || 'Randevu Al'}
                    </button>
                    
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="w-full border-2 border-white/50 hover:border-white hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                    >
                      Bilgi Al
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {customizations.showContact && (
        <section id="iletisim" className="py-20 bg-gray-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-20`} />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                <MessageCircle className="w-4 h-4" />
                <span>İletişime Geçin</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Hemen Başlayalım
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Size özel hizmet için bugün bizimle iletişime geçin
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Telefon</h3>
                    <p className="text-gray-300">{businessData.phone}</p>
                  </div>
                </div>

                {businessData.email && (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">E-posta</h3>
                      <p className="text-gray-300">{businessData.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Adres</h3>
                    <p className="text-gray-300">{businessData.address}</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold">Çalışma Saatleri</h3>
                  </div>
                  <div className="space-y-2">
                    {businessData.workingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-300">{schedule.dayOfWeek}</span>
                        <span className={`${schedule.isClosed ? 'text-red-400' : 'text-green-400'} font-medium`}>
                          {schedule.isClosed ? 'Kapalı' : `${schedule.openTime} - ${schedule.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold">Hemen Başlayın!</h3>
                  <p className="text-gray-300">
                    Premium hizmetlerimizden yararlanmak için randevunuzu alın
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleAction}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      {customizations.buttonText || 'Randevu Al'}
                    </button>
                    
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="w-full border-2 border-white/50 hover:border-white hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                    >
                      Bilgi Al
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Lightbox */}
      {selectedImageIndex !== null && businessData.gallery && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-[80vh] mx-4">
            <CloudinaryImage
              src={businessData.gallery[selectedImageIndex].imageUrl}
              alt={businessData.gallery[selectedImageIndex].title || `Galeri ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {businessData.gallery[selectedImageIndex].title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {businessData.gallery[selectedImageIndex].title}
                </h3>
                {businessData.gallery[selectedImageIndex].description && (
                  <p className="text-white/80">
                    {businessData.gallery[selectedImageIndex].description}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            {selectedImageIndex + 1} / {businessData.gallery.length}
          </div>
          
          {/* Keyboard shortcuts info - Desktop only */}
          <div className="hidden md:block absolute top-20 left-6 text-white/60 text-xs space-y-1">
            <div>← / → Gezinme</div>
            <div>ESC Çıkış</div>
          </div>
          
          {/* Mobile swipe instruction */}
          <div className="md:hidden absolute top-20 left-6 right-6 text-center text-white/60 text-xs">
            <div>Fotoğraflar arasında geçiş için kaydırın</div>
          </div>
        </div>
      )}
      
      {/* All Modals */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        business={{
          id: businessData.id,
          name: businessData.name,
          phone: businessData.phone,
          services: businessData.services || [],
          staff: businessData.staff || [],
          appointmentSettings: businessData.appointmentSettings,
          workingHours: businessData.workingHours ? businessData.workingHours.map(wh => ({
            // JavaScript Date.getDay() formatına uygun dönüşüm
            dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].indexOf(wh.dayOfWeek),
            isOpen: !wh.isClosed,
            openTime: wh.openTime,
            closeTime: wh.closeTime
          })) : undefined
        }}
        customizations={{
          primaryColor: customizations.primaryColor || theme.primary,
          secondaryColor: customizations.secondaryColor,
          gradientColors: customizations.gradientColors
        }}
      />
      
      <ProjectInquiryModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        business={{
          id: businessData.id,
          name: businessData.name,
          phone: businessData.phone,
          email: businessData.email,
          address: businessData.address,
          settings: businessData.settings ? {
            ...businessData.settings,
            workingRadius: businessData.settings.workingRadius || ''
          } : undefined
        }}
      />
      
      <ConsultationModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        business={{
          id: businessData.id,
          name: businessData.name,
          phone: businessData.phone,
          email: businessData.email,
          settings: businessData.settings ? {
            consultationFee: businessData.settings.consultationFee,
            isConsultationFree: businessData.settings.isConsultationFree,
            supportedMeetingTypes: businessData.settings.supportedMeetingTypes || []
          } : undefined
        }}
      />
      
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        business={{
          id: businessData.id,
          name: businessData.name,
          phone: businessData.phone,
          email: businessData.email,
          address: businessData.address
        }}
      />
      
      {/* AI Chat Widget */}
      <AIChatWidget businessData={{
        ...businessData,
        workingHours: businessData.workingHours.map(wh => ({
          ...wh,
          // JavaScript Date.getDay() formatına uygun dönüşüm
          dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].indexOf(wh.dayOfWeek),
          isOpen: !wh.isClosed
        }))
      }} />
    </div>
  )
} 