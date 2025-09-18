'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, MapPin, Phone, Mail, Clock, Calendar, MessageCircle, ExternalLink,
  Camera, Eye, ArrowRight, Plus, Check, Award, Heart, Sparkles, Users, Play,
  ChevronLeft, ChevronRight, X, BookOpen, FileText, Zap, Shield, Crown,
  TrendingUp, Cpu, Palette, Layers, Globe, Rocket, Target, Gift, Menu,
  Diamond, Gem, Flame, Bolt, Infinity, Wand2, ChevronDown
} from 'lucide-react'
import AppointmentModal from '../AppointmentModal'
import ProjectInquiryModal from '../modals/ProjectInquiryModal'
import ConsultationModal from '../modals/ConsultationModal'
import ContactModal from '../modals/ContactModal'
import AIChatWidget from '../ai/AIChatWidget'
import CloudinaryImage from '@/components/cloudinary/CloudinaryImage'

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

interface IOSWebsitePreviewProps {
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

export default function IOSWebsitePreview({ 
  businessData, 
  customizations, 
  isModal = false, 
  device = 'desktop',
  businessSlug
}: IOSWebsitePreviewProps) {
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
  
  // iOS scroll effects
  const [scrollY, setScrollY] = useState(0)
  
  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Scroll tracking for iOS effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS Status Bar Simulation */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

      {/* Clean Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrollY > 50 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {businessData.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{businessData.name}</h1>
                <p className="text-sm text-gray-500">{businessData.sector}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Hizmetler
              </a>
              {customizations.showTeam && (
                <a href="#team" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Ekibimiz
                </a>
              )}
              {customizations.showGallery && (
                <a href="#gallery" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Galeri
                </a>
              )}
              {customizations.showReviews && (
                <a href="#reviews" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Değerlendirmeler
                </a>
              )}
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* iOS Style Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="p-6 space-y-4">
              <a href="#services" className="block text-lg font-semibold text-gray-900 py-3 border-b border-gray-100">
                Hizmetlerimiz
              </a>
              {customizations.showTeam && (
                <a href="#team" className="block text-lg font-semibold text-gray-900 py-3 border-b border-gray-100">
                  Ekibimiz
                </a>
              )}
              {customizations.showGallery && (
                <a href="#gallery" className="block text-lg font-semibold text-gray-900 py-3 border-b border-gray-100">
                  Galeri
                </a>
              )}
              {customizations.showReviews && (
                <a href="#reviews" className="block text-lg font-semibold text-gray-900 py-3">
                  Değerlendirmeler
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - iOS Clean Style with Cover Photo */}
      <section className="relative min-h-screen py-20 px-6 overflow-hidden flex items-center justify-center">
        {/* Background with Cover Photo or Gradient */}
        <div className="absolute inset-0">
          {(customizations.coverPhoto || businessData?.coverPhotoUrl) ? (
            <>
              {/* Cover Photo Background - Mobile Responsive Fix */}
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
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
              </div>
            </>
          ) : (
            <>
              {/* Default gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
            </>
          )}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center flex flex-col items-center justify-center min-h-[80vh]">
            {/* Profile Image */}
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white">
                {customizations.profilePhoto ? (
                  <CloudinaryImage
                    src={customizations.profilePhoto}
                    alt={businessData.name}
                    className="w-full h-full object-cover"
                    transformation={{
                      width: 128,
                      height: 128,
                      crop: 'fill',
                      gravity: 'auto'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {businessData.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Floating rating badge */}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-200/50">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-gray-900">{businessData.avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight ${
              (customizations.coverPhoto || businessData?.coverPhotoUrl) ? 'text-white drop-shadow-2xl' : 'text-gray-900'
            }`}>
              {customizations.heroTitle || businessData.name}
            </h1>
            
            <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed ${
              (customizations.coverPhoto || businessData?.coverPhotoUrl) ? 'text-white/90 drop-shadow-lg' : 'text-gray-600'
            }`}>
              {customizations.heroSubtitle || `Profesyonel ${businessData.sector} hizmetleri ile size özel çözümler sunuyoruz.`}
            </p>

            {/* Quick Stats */}
            <div className={`flex items-center justify-center space-x-8 mb-12 text-sm ${
              (customizations.coverPhoto || businessData?.coverPhotoUrl) ? 'text-white/80' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{businessData.totalAppointments}+ Mutlu Müşteri</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{businessData.reviewCount} Değerlendirme</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-lg mx-auto">
              <button
                onClick={handleAction}
                className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{customizations.buttonText || 'Randevu Al'}</span>
                </span>
              </button>
              
              <button
                onClick={() => setContactModalOpen(true)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <span className="flex items-center justify-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>İletişim</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - iOS Card Style */}
      {customizations.showServices && businessData.services && businessData.services.length > 0 && (
        <section id="services" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Size en uygun hizmeti seçin ve kaliteli deneyimin tadını çıkarın.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.services.map((service, index) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Service Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.category === 'skincare' && <Sparkles className="w-8 h-8 text-blue-600" />}
                    {service.category === 'massage' && <Heart className="w-8 h-8 text-pink-600" />}
                    {service.category === 'makeup' && <Palette className="w-8 h-8 text-purple-600" />}
                    {service.category === 'treatment' && <Zap className="w-8 h-8 text-yellow-600" />}
                    {!['skincare', 'massage', 'makeup', 'treatment'].includes(service.category) && (
                      <Star className="w-8 h-8 text-blue-600" />
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  
                  {service.description && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{service.duration} dakika</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">₺{service.price}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAction}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-2xl transition-all duration-300 group-hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Seç</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section - iOS People Style */}
      {customizations.showTeam && businessData.staff && businessData.staff.length > 0 && (
        <section id="team" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Alanında uzman ekibimizle en iyi hizmeti sunmaya devam ediyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.staff.map((member, index) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Member Photo */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg">
                      {member.photoUrl ? (
                        <CloudinaryImage
                          src={member.photoUrl}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    {member.specialty && (
                      <p className="text-gray-600 mb-4">{member.specialty}</p>
                    )}
                    
                    {member.rating && (
                      <div className="flex items-center justify-center space-x-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(member.rating!) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600">{member.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={handleAction}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300"
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

      {/* Gallery Section - iOS Photos Style */}
      {customizations.showGallery && businessData.gallery && businessData.gallery.length > 0 && (
        <section id="gallery" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Çalışmalarımız</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gerçekleştirdiğimiz başarılı projelere göz atın.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {businessData.gallery.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CloudinaryImage
                    src={item.imageUrl}
                    alt={item.title || `Galeri ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* iOS style overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      {item.title && (
                        <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      )}
                      <div className="flex items-center justify-between">
                        <Eye className="w-4 h-4 text-white/80" />
                        <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Plus className="w-3 h-3 text-white" />
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

      {/* Reviews Section - iOS Testimonials */}
      {customizations.showReviews && businessData.reviews && businessData.reviews.length > 0 && (
        <section id="reviews" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Değerlendirmeler</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Müşterilerimizin bizimle ilgili düşünceleri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessData.reviews.slice(0, 6).map((review, index) => (
                <div
                  key={review.id}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    "{review.comment}"
                  </p>
                  
                  {/* Customer Info */}
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm">
                     {review.customerAvatar ? (
                       <CloudinaryImage
                         src={review.customerAvatar}
                         alt={review.customerName}
                         width={48}
                         height={48}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold">
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

     {/* Contact Section - iOS Clean Contact */}
     {customizations.showContact && (
       <section className="py-20 px-6 bg-white">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h2>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Size nasıl yardımcı olabiliriz? Bizimle iletişime geçin.
             </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
             {/* Contact Info */}
             <div className="space-y-8">
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-100">
                 <div className="flex items-start space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                     <Phone className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-1">Telefon</h3>
                     <p className="text-gray-600">{businessData.phone}</p>
                   </div>
                 </div>
               </div>

               {businessData.email && (
                 <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
                   <div className="flex items-start space-x-4">
                     <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                       <Mail className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-1">E-posta</h3>
                       <p className="text-gray-600">{businessData.email}</p>
                     </div>
                   </div>
                 </div>
               )}

               <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 border border-gray-100">
                 <div className="flex items-start space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                     <MapPin className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-1">Adres</h3>
                     <p className="text-gray-600">{businessData.address}</p>
                   </div>
                 </div>
               </div>

               {/* Working Hours Card */}
               <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-gray-100">
                 <div className="flex items-center space-x-3 mb-6">
                   <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                     <Clock className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900">Çalışma Saatleri</h3>
                 </div>
                 <div className="space-y-3">
                   {businessData.workingHours.map((schedule, index) => (
                     <div key={index} className="flex justify-between items-center py-2">
                       <span className="text-gray-700 font-medium">{schedule.dayOfWeek}</span>
                       <span className={`font-semibold ${schedule.isClosed ? 'text-red-500' : 'text-green-600'}`}>
                         {schedule.isClosed ? 'Kapalı' : `${schedule.openTime} - ${schedule.closeTime}`}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* CTA Section */}
             <div className="lg:sticky lg:top-32">
               <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 shadow-2xl">
                 <div className="text-center text-white space-y-8">
                   <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                     <Calendar className="w-10 h-10 text-white" />
                   </div>
                   
                   <div>
                     <h3 className="text-2xl font-bold mb-4">Hemen Başlayın</h3>
                     <p className="text-gray-300 mb-8">
                       Profesyonel hizmetlerimizden faydalanmak için randevunuzu alın.
                     </p>
                   </div>
                   
                   <div className="space-y-4">
                     <button
                       onClick={handleAction}
                       className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                     >
                       {customizations.buttonText || 'Randevu Al'}
                     </button>
                     
                     <button
                       onClick={() => setContactModalOpen(true)}
                       className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                     >
                       Bilgi Al
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>
     )}

     {/* iOS Style Gallery Lightbox */}
     {selectedImageIndex !== null && businessData.gallery && (
       <div 
         className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
       >
         <button
           onClick={() => setSelectedImageIndex(null)}
           className="absolute top-8 right-8 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
         >
           <X className="w-5 h-5" />
         </button>
         
         <button
           onClick={prevImage}
           className="absolute left-8 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
         >
           <ChevronLeft className="w-5 h-5" />
         </button>
         
         <button
           onClick={nextImage}
           className="absolute right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
         >
           <ChevronRight className="w-5 h-5" />
         </button>
         
         <div className="relative max-w-4xl max-h-[80vh] mx-4">
           <CloudinaryImage
             src={businessData.gallery[selectedImageIndex].imageUrl}
             alt={businessData.gallery[selectedImageIndex].title || `Galeri ${selectedImageIndex + 1}`}
             width={800}
             height={600}
             className="max-w-full max-h-full object-contain rounded-2xl"
           />
           
           {businessData.gallery[selectedImageIndex].title && (
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
               <h3 className="text-white text-lg font-semibold mb-2">
                 {businessData.gallery[selectedImageIndex].title}
               </h3>
               {businessData.gallery[selectedImageIndex].description && (
                 <p className="text-white/80 text-sm">
                   {businessData.gallery[selectedImageIndex].description}
                 </p>
               )}
             </div>
           )}
         </div>
         
         {/* Clean counter */}
         <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
           {selectedImageIndex + 1} / {businessData.gallery.length}
         </div>
         
         {/* Simple instructions */}
         <div className="hidden md:block absolute top-20 left-8 text-white/60 text-sm">
           <div>← / → Gezinme • ESC Çıkış</div>
         </div>
         
         <div className="md:hidden absolute top-20 left-8 right-8 text-center text-white/60 text-sm">
           <div>Kaydırarak gezinin</div>
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
           dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].indexOf(wh.dayOfWeek),
           isOpen: !wh.isClosed,
           openTime: wh.openTime,
           closeTime: wh.closeTime
         })) : undefined
       }}
       customizations={{
         primaryColor: customizations.primaryColor,
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
         dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].indexOf(wh.dayOfWeek),
         isOpen: !wh.isClosed
       }))
     }} />
   </div>
 )
}