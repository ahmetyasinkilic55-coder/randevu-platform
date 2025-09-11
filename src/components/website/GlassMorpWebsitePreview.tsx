'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, MapPin, Phone, Mail, Clock, Calendar, MessageCircle, ExternalLink,
  Camera, Eye, ArrowRight, Plus, Check, Award, Heart, Sparkles, Users, Play,
  ChevronLeft, ChevronRight, X, BookOpen, FileText, Zap, Shield, Crown,
  TrendingUp, Cpu, Palette, Layers, Globe, Rocket, Target, Gift, Menu,
  Diamond, Gem, Flame, Bolt, Infinity, Wand2, Hexagon, Activity, Stethoscope,
  Scissors, Car, Briefcase, GraduationCap, Building, Dumbbell, Waves, Wind
} from 'lucide-react'

import { CloudinaryImage } from '@/components/cloudinary'

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

interface RevolutionaryWebsitePreviewProps {
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

export default function RevolutionaryWebsitePreview({ 
  businessData, 
  customizations, 
  isModal = false, 
  device = 'desktop',
  businessSlug
}: RevolutionaryWebsitePreviewProps) {
  // States
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [consultationModalOpen, setConsultationModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [blogLoading, setBlogLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('')

  // Scroll tracking for parallax and animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      if (!businessData?.id) return
      
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
    
    fetchBlogPosts()
  }, [businessData?.id])

  // Handle action button based on service type
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

  // Get sector-specific theme and icons
  const getSectorTheme = (sector: string) => {
    const themes: Record<string, any> = {
      'Güzellik & Bakım': {
        primary: 'from-rose-400 via-pink-500 to-purple-600',
        secondary: 'from-rose-300 to-pink-400',
        accent: '#ec4899',
        icon: Crown,
        bgPattern: 'sparkle'
      },
      'Sağlık Hizmetleri': {
        primary: 'from-emerald-400 via-cyan-500 to-blue-600',
        secondary: 'from-emerald-300 to-cyan-400',
        accent: '#06b6d4',
        icon: Stethoscope,
        bgPattern: 'medical'
      },
      'Otomotiv & Hizmet': {
        primary: 'from-orange-400 via-red-500 to-pink-600',
        secondary: 'from-orange-300 to-red-400',
        accent: '#f97316',
        icon: Car,
        bgPattern: 'tech'
      },
      'Etkinlik & Mekan': {
        primary: 'from-violet-400 via-purple-500 to-indigo-600',
        secondary: 'from-violet-300 to-purple-400',
        accent: '#8b5cf6',
        icon: Building,
        bgPattern: 'celebration'
      }
    }
    
    return themes[sector] || {
      primary: 'from-blue-400 via-cyan-500 to-teal-600',
      secondary: 'from-blue-300 to-cyan-400',
      accent: '#06b6d4',
      icon: Briefcase,
      bgPattern: 'default'
    }
  }

  const theme = getSectorTheme(businessData.sector)
  const SectorIcon = theme.icon

  // Gallery navigation
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

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Dynamic Background - Mobile Optimized */}
        <div className="absolute inset-0">
          {/* Cover Photo or Dynamic Gradient */}
          {(customizations.coverPhoto || businessData?.coverPhotoUrl) ? (
            <>
              {/* Mobile-First Cover Photo Background */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("https://res.cloudinary.com/ddapurgju/image/upload/w_1920,h_1080,c_fill,g_auto,q_auto/${customizations.coverPhoto || businessData?.coverPhotoUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                  transform: `translateY(${scrollY * 0.3}px) scale(1.1)`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary}`} />
              
              {/* Animated Particles */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Organic Blobs */}
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                  style={{ transform: `translate(${scrollY * -0.2}px, ${scrollY * 0.1}px)` }}
                />
                <div 
                  className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                  style={{ transform: `translate(${scrollY * 0.2}px, ${scrollY * -0.1}px)` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Floating Navigation - Mobile Responsive */}
        <nav className="absolute top-4 sm:top-6 lg:top-8 left-2 sm:left-4 lg:left-8 right-2 sm:right-4 lg:right-8 z-30">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-3xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              {/* Logo/Brand - Mobile Responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="relative group">
                  {/* Profile Photo */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/30 group-hover:border-white/60 transition-all">
                    {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url("https://res.cloudinary.com/ddapurgju/image/upload/w_150,h_150,c_fill,g_auto,q_auto/${customizations.profilePhoto || businessData?.profilePhotoUrl}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
                        <SectorIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Online Status */}
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-green-500 border-1 sm:border-2 border-white rounded-full">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg drop-shadow-lg truncate max-w-32 sm:max-w-40 lg:max-w-none">{businessData?.name}</h3>
                  <p className="text-white/80 text-xs sm:text-sm drop-shadow hidden lg:block">{businessData?.sector}</p>
                </div>
              </div>

              {/* Desktop Navigation - Responsive */}
              <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                {customizations.showServices && (
                  <a href="#services" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    Hizmetler
                  </a>
                )}
                {customizations.showTeam && (
                  <a href="#team" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    Ekip
                  </a>
                )}
                {customizations.showGallery && (
                  <a href="#gallery" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    Galeri
                  </a>
                )}
                {blogPosts.length > 0 && customizations.showBlog && (
                  <a href="#blog" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    Blog
                  </a>
                )}
                {customizations.showReviews && (
                  <a href="#reviews" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    Yorumlar
                  </a>
                )}
                {customizations.showContact && (
                  <a href="#contact" className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-lg text-sm xl:text-base">
                    İletişim
                  </a>
                )}
              </div>

              {/* CTA Button & Mobile Menu - Responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <button
                  onClick={handleAction}
                  className="hidden sm:flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white font-semibold px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl text-xs sm:text-sm lg:text-base"
                >
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">{customizations.buttonText || 'Randevu Al'}</span>
                </button>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-lg transition-colors"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content - Mobile Responsive */}
        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Profile Showcase - Mobile Responsive */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="relative inline-block">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6">
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 border-2 sm:border-3 lg:border-4 border-dashed border-white/30 rounded-full animate-spin" style={{animationDuration: '20s'}} />
                  <div className="absolute inset-1 sm:inset-2 border border-white/20 rounded-full animate-pulse" />
                  
                  {/* Profile Photo - Mobile Responsive */}
                  <div className="absolute inset-2 sm:inset-3 lg:inset-4 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border border-white/40">
                    {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                      <div 
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url("https://res.cloudinary.com/ddapurgju/image/upload/w_200,h_200,c_fill,g_auto,q_auto/${customizations.profilePhoto || businessData?.profilePhotoUrl}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
                        <SectorIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Floating Badges - Mobile Responsive */}
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-green-500 border-2 sm:border-3 lg:border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full animate-pulse" />
                  </div>
                  
                  <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-500 border-2 sm:border-3 lg:border-4 border-white rounded-full flex items-center justify-center">
                    <Award className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title - Mobile Responsive */}
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black leading-none text-white drop-shadow-2xl">
                <span className="block">
                  {customizations.heroTitle || businessData?.name}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-4">
                {customizations.heroSubtitle || `Uzman ${businessData?.sector} hizmetleri ile sağlıklı yaşam`}
              </p>

              {/* Trust Indicators - Mobile Responsive */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                {/* Rating */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${
                          i < Math.floor(businessData?.avgRating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/40'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-white">{businessData?.avgRating?.toFixed(1)}</div>
                    <div className="text-white/70 text-xs sm:text-sm">{businessData?.reviewCount} Değerlendirme</div>
                  </div>
                </div>

                {/* Appointments */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-white">{businessData?.totalAppointments}+</div>
                    <div className="text-white/70 text-xs sm:text-sm">Başarılı Randevu</div>
                  </div>
                </div>

                {/* Team */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-black text-white">{businessData?.staff?.length || 0}</div>
                    <div className="text-white/70 text-xs sm:text-sm">Uzman Ekip</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 sm:pt-8">
                <button
                  onClick={handleAction}
                  className="group relative bg-white text-gray-900 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg lg:text-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center"
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{customizations.buttonText || 'Randevu Al'}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="group bg-white/20 backdrop-blur-md border-2 border-white/40 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg lg:text-xl hover:bg-white/30 transition-all hover:scale-105 flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>İletişim</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            </div>

            {/* Scroll Indicator - Mobile Responsive */}
            <div className="absolute bottom-6 sm:bottom-8 lg:bottom-10 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                <span className="text-xs sm:text-sm font-medium">Keşfet</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Menu - Enhanced */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-20 sm:top-24 left-2 right-2 sm:left-4 sm:right-4 bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3 sm:space-y-4">
              {customizations.showServices && (
                <a href="#services" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    <span>Hizmetler</span>
                  </div>
                </a>
              )}
              {customizations.showTeam && (
                <a href="#team" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
                    <span>Ekip</span>
                  </div>
                </a>
              )}
              {customizations.showGallery && (
                <a href="#gallery" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                    <span>Galeri</span>
                  </div>
                </a>
              )}
              {blogPosts.length > 0 && customizations.showBlog && (
                <a href="#blog" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                    <span>Blog</span>
                  </div>
                </a>
              )}
              {customizations.showReviews && (
                <a href="#reviews" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-red-500 rounded-full"></div>
                    <span>Yorumlar</span>
                  </div>
                </a>
              )}
              {customizations.showContact && (
                <a href="#contact" className="block text-white hover:text-yellow-300 transition-colors py-2 sm:py-3 text-base sm:text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"></div>
                    <span>İletişim</span>
                  </div>
                </a>
              )}
              
              {/* Mobile CTA Button */}
              <div className="pt-3 sm:pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    handleAction();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{customizations.buttonText || 'Randevu Al'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revolutionary Services Section */}
      {customizations.showServices && businessData?.services?.length > 0 && (
        <section id="services" className="py-20 px-8 bg-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${theme.secondary} opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3`} />
            <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${theme.secondary} opacity-10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-gray-100 rounded-full px-6 py-3 mb-8">
                <SectorIcon className={`w-5 h-5 text-${theme.accent}`} />
                <span className="text-gray-600 font-semibold">Hizmetlerimiz</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Profesyonel Çözümler
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Size özel tasarlanmış hizmetlerimizle hedeflerinize ulaşın
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.services.map((service, index) => (
                <div
                  key={service.id}
                  className="group relative bg-white border-2 border-gray-100 hover:border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Service Number */}
                  <div className="absolute top-6 right-6 text-6xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="relative z-10">
                    {/* Service Icon */}
                    <div className="mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${theme.primary} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {service.category === 'nutrition' && <Heart className="w-8 h-8 text-white" />}
                        {service.category === 'analysis' && <Activity className="w-8 h-8 text-white" />}
                        {service.category === 'test' && <Zap className="w-8 h-8 text-white" />}
                        {service.category === 'online' && <Globe className="w-8 h-8 text-white" />}
                        {!['nutrition', 'analysis', 'test', 'online'].includes(service.category) && (
                          <Star className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {service.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className={`text-3xl font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                          ₺{service.price}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">{service.duration}dk</span>
                        </div>
                      </div>
                      
                      {service.description && (
                        <p className="text-gray-600 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                      
                      {/* Features */}
                      <div className="space-y-2 pt-4">
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          <span className="text-sm">Uzman danışmanlık</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          <span className="text-sm">Kişiselleştirilmiş plan</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          <span className="text-sm">Takip desteği</span>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button
                        onClick={handleAction}
                        className={`w-full bg-gradient-to-r ${theme.primary} text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all hover:scale-105 group-hover:shadow-xl flex items-center justify-center space-x-2`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Randevu Al</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Revolutionary Team Section */}
      {customizations.showTeam && businessData?.staff?.length > 0 && (
        <section id="team" className="py-20 px-8 bg-gray-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br ${theme.primary} opacity-20 rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl ${theme.primary} opacity-20 rounded-full blur-3xl`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white/90 font-semibold">Uzman Ekibimiz</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Profesyonel Ekip
                </span>
              </h2>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Alanında uzman profesyonellerimiz sizlere en iyi hizmeti sunuyor
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.staff.map((member, index) => (
                <div
                  key={member.id}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Member Photo */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto relative">
                      {/* Rotating Ring */}
                      <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full animate-spin group-hover:border-white/50 transition-colors" style={{animationDuration: '15s'}} />
                      
                      {/* Photo Container */}
                      <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/40 group-hover:border-white/60 transition-colors bg-white/20">
                        {member.photoUrl ? (
                          <CloudinaryImage
                            publicId={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            transformation={{
                              width: 150,
                              height: 150,
                              crop: 'fill',
                              quality: 'auto'
                            }}
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
                            <Users className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors mb-2">
                        {member.name}
                      </h3>
                      {member.specialty && (
                        <p className="text-white/60 text-sm font-medium">
                          {member.specialty}
                        </p>
                      )}
                    </div>
                    
                    {/* Rating */}
                    {member.rating && (
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(member.rating!) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-yellow-400 text-sm font-semibold">
                          {member.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {/* Specialties */}
                    <div className="space-y-1 text-xs text-white/50">
                      <div>✓ Sertifikalı uzman</div>
                      <div>✓ 5+ yıl deneyim</div>
                      <div>✓ Kişisel yaklaşım</div>
                    </div>
                    
                    {/* CTA Button */}
                    <button
                      onClick={handleAction}
                      className={`w-full bg-gradient-to-r ${theme.primary} text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Randevu Al</span>
                    </button>
                  </div>
                  
                  {/* Member Number */}
                  <div className="absolute top-4 right-4 text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Revolutionary Gallery Section */}
      {customizations.showGallery && businessData?.gallery?.length > 0 && (
        <section id="gallery" className="py-20 px-8 bg-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r ${theme.primary} opacity-5 rounded-full blur-3xl`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-gray-100 rounded-full px-6 py-3 mb-8">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-semibold">Çalışmalarımız</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Galeri
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profesyonel çalışmalarımızdan örnekleri keşfedin
              </p>
            </div>

            {/* Gallery Grid - Masonry Style */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {businessData.gallery.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative break-inside-avoid cursor-pointer rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="relative">
                    <CloudinaryImage
                      publicId={photo.imageUrl}
                      alt={photo.title || `Galeri ${index + 1}`}
                      className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                      transformation={{
                        width: 400,
                        height: 600,
                        crop: 'limit',
                        quality: 'auto:good'
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        {/* Top Icons */}
                        <div className="flex justify-between items-start">
                          <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                            <span className="text-white text-sm font-bold">
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Bottom Info */}
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {photo.title && (
                            <h3 className="text-white font-bold text-lg mb-1">{photo.title}</h3>
                          )}
                          {photo.description && (
                            <p className="text-white/90 text-sm line-clamp-2">{photo.description}</p>
                          )}
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

      {/* Revolutionary Reviews Section */}
      {customizations.showReviews && businessData?.reviews?.length > 0 && (
        <section id="reviews" className="py-20 px-8 bg-gray-900 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${theme.primary} opacity-20 rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${theme.primary} opacity-20 rounded-full blur-3xl`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white/90 font-semibold">Müşteri Yorumları</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Mutlu Müşteriler
                </span>
              </h2>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Müşterilerimizin deneyimleri bizim en büyük motivasyonumuz
              </p>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {businessData.reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-500 hover:scale-105"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                    <MessageCircle className="w-16 h-16 text-white" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-white/90 text-lg leading-relaxed mb-8 italic">
                    "{review.comment}"
                  </p>
                  
                  {/* Customer Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                      {review.customerAvatar ? (
                        <CloudinaryImage
                          publicId={review.customerAvatar}
                          alt={review.customerName}
                          className="w-full h-full object-cover"
                          transformation={{
                            width: 80,
                            height: 80,
                            crop: 'fill',
                            quality: 'auto'
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center text-white font-bold`}>
                          {review.customerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{review.customerName}</p>
                      <p className="text-white/50 text-sm">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews Summary */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-2">
                    {businessData.avgRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(businessData.avgRating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm">Ortalama Puan</p>
                </div>
                
                <div className="w-px h-12 bg-white/20" />
                
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-2">
                    {businessData.reviewCount}
                  </div>
                  <p className="text-white/60 text-sm">Toplam Yorum</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Revolutionary Blog Section */}
      {blogPosts.length > 0 && customizations.showBlog && (
        <section id="blog" className="py-20 px-8 bg-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br ${theme.secondary} opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2`} />
            <div className={`absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl ${theme.secondary} opacity-10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-gray-100 rounded-full px-6 py-3 mb-8">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-semibold">Blog Yazıları</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Güncel İçerikler
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sağlık ve yaşam kalitesi hakkında uzman görüşleri
              </p>
            </div>

            {/* Blog Posts Grid */}
            {blogLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="h-64 bg-gray-200 animate-pulse" />
                    <div className="p-8">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Featured Image */}
                    <div className="relative h-64 overflow-hidden">
                      {post.featuredImage ? (
                        <CloudinaryImage
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
                          <div className="text-center text-white">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-medium opacity-75">{businessData.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1">
                        <span className="text-xs font-bold text-gray-700">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      {/* Views Badge */}
                      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-xl px-3 py-1 text-white">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs font-semibold">{post.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8">
                      {/* Author */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-xs font-bold text-white`}>
                          {(post.authorUser?.name || businessData.name).charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{post.authorUser?.name || businessData.name}</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                      
                      {/* Read More */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>5 dk okuma</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                          <span>Devamını Oku</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Revolutionary Contact Section */}
      {customizations.showContact && (
        <section id="contact" className="py-20 px-8 bg-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${theme.secondary} opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2`} />
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${theme.secondary} opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2`} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 bg-gray-100 rounded-full px-6 py-3 mb-8">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-semibold">İletişim</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  Bize Ulaşın
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sorularınız için bizimle iletişime geçin
              </p>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Info */}
              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-center space-x-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 bg-gradient-to-br ${theme.primary} rounded-2xl flex items-center justify-center`}>
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Telefon</h3>
                    <p className="text-gray-600 text-lg">{businessData.phone}</p>
                  </div>
                  <button className={`px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-2xl font-semibold hover:shadow-lg transition-all`}>
                    Ara
                  </button>
                </div>

                {/* Email */}
                {businessData.email && (
                  <div className="flex items-center space-x-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className={`w-16 h-16 bg-gradient-to-br ${theme.primary} rounded-2xl flex items-center justify-center`}>
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">E-posta</h3>
                      <p className="text-gray-600 text-lg">{businessData.email}</p>
                    </div>
                    <button className={`px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-2xl font-semibold hover:shadow-lg transition-all`}>
                      Mail Gönder
                    </button>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-center space-x-6 bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 bg-gradient-to-br ${theme.primary} rounded-2xl flex items-center justify-center`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Adres</h3>
                    <p className="text-gray-600 text-lg">{businessData.address}</p>
                  </div>
                  <button className={`px-6 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-2xl font-semibold hover:shadow-lg transition-all`}>
                    Yol Tarifi
                  </button>
                </div>

                {/* Working Hours */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center`}>
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Çalışma Saatleri</h3>
                  </div>
                  <div className="space-y-3">
                    {businessData.workingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 font-medium">{schedule.dayOfWeek}</span>
                        <span className={`font-bold ${schedule.isClosed ? 'text-red-500' : 'text-green-600'}`}>
                          {schedule.isClosed ? 'Kapalı' : `${schedule.openTime} - ${schedule.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
                <div className="space-y-8">
                  {/* Icon */}
                  <div className="mx-auto">
                    <div className={`w-24 h-24 bg-gradient-to-br ${theme.primary} rounded-3xl flex items-center justify-center relative mx-auto`}>
                      <Rocket className="w-12 h-12 text-white" />
                      <div className="absolute inset-0 bg-white/20 rounded-3xl blur animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">
                      Hemen Başlayın!
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Size özel planınızı hazırlamak için randevu alın
                    </p>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="space-y-4">
                    <button
                      onClick={handleAction}
                      className={`w-full bg-gradient-to-r ${theme.primary} text-white py-6 px-8 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center justify-center space-x-3`}
                    >
                      <Calendar className="w-6 h-6" />
                      <span>{customizations.buttonText || 'Randevu Al'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 px-8 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Bilgi Al</span>
                    </button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Güvenli</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span>Sertifikalı</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>%100 Memnuniyet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Lightbox */}
      {selectedImageIndex !== null && businessData?.gallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image Counter */}
          <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white text-sm z-10">
            {selectedImageIndex + 1} / {businessData.gallery.length}
          </div>
          
          {/* Navigation Buttons */}
          {businessData.gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Main Image */}
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="relative max-w-5xl max-h-full">
              <CloudinaryImage
                publicId={businessData.gallery[selectedImageIndex].imageUrl}
                alt={businessData.gallery[selectedImageIndex].title || `Galeri ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                transformation={{
                  width: 1200,
                  height: 800,
                  crop: 'limit',
                  quality: 'auto:good'
                }}
              />
              
              {/* Image Info */}
              {(businessData.gallery[selectedImageIndex].title || businessData.gallery[selectedImageIndex].description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-2xl">
                  {businessData.gallery[selectedImageIndex].title && (
                    <h3 className="text-white text-xl font-bold mb-2">
                      {businessData.gallery[selectedImageIndex].title}
                    </h3>
                  )}
                  {businessData.gallery[selectedImageIndex].description && (
                    <p className="text-white/90 text-sm">
                      {businessData.gallery[selectedImageIndex].description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 lg:hidden">
          <div className="absolute inset-4 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden">
                  {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                    <CloudinaryImage
                      publicId={customizations.profilePhoto || businessData?.profilePhotoUrl}
                      alt={businessData?.name}
                      className="w-full h-full object-cover"
                      transformation={{
                        width: 80,
                        height: 80,
                        crop: 'fill',
                        quality: 'auto'
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
                      <SectorIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{businessData?.name}</h3>
                  <p className="text-gray-600 text-sm">{businessData?.sector}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <nav className="space-y-4 mb-8">
              {customizations.showServices && (
                <a
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Hizmetler</span>
                </a>
              )}
              {customizations.showTeam && (
                <a
                  href="#team"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Ekip</span>
                </a>
              )}
              {customizations.showGallery && (
                <a
                  href="#gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Galeri</span>
                </a>
              )}
              {blogPosts.length > 0 && customizations.showBlog && (
                <a
                  href="#blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Blog</span>
                </a>
              )}
              {customizations.showReviews && (
                <a
                  href="#reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Star className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Yorumlar</span>
                </a>
              )}
              {customizations.showContact && (
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">İletişim</span>
                </a>
              )}
            </nav>
            
            <button
              onClick={() => {
                handleAction()
                setMobileMenuOpen(false)
              }}
              className={`w-full bg-gradient-to-r ${theme.primary} text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center space-x-2`}
            >
              <Calendar className="w-5 h-5" />
              <span>{customizations.buttonText || 'Randevu Al'}</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
