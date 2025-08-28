'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Mail, Clock, Calendar, MessageCircle, ExternalLink,
  Camera, Eye, ArrowRight, Plus, Check, Award, Heart, Sparkles, Users, Play,
  ChevronLeft, ChevronRight, X, BookOpen, FileText
} from 'lucide-react'
import AppointmentModal from '../AppointmentModal'
import ProjectInquiryModal from '../modals/ProjectInquiryModal'
import ConsultationModal from '../modals/ConsultationModal'
import ContactModal from '../modals/ContactModal'
import AIChatWidget from '../ai/AIChatWidget'
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

interface WebsitePreviewProps {
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

export default function WebsitePreview({ 
  businessData, 
  customizations, 
  isModal = false, 
  device = 'desktop',
  businessSlug
}: WebsitePreviewProps) {
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
  
  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
      setSelectedImageIndex(
        selectedImageIndex === 0 ? businessData.gallery.length - 1 : selectedImageIndex - 1
      )
    }
  }
  
  const closeLightbox = () => {
    setSelectedImageIndex(null)
  }
  
  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (selectedImageIndex === null) return
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') closeLightbox()
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedImageIndex, businessData?.gallery])
  
  // Get colors from customizations or defaults
  const colors = {
    primary: customizations.primaryColor || '#2563eb',
    secondary: customizations.secondaryColor || '#1d4ed8',
    gradient: customizations.gradientColors || 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  }
  
  // Function to handle CTA button clicks based on service type
  const handleCTAClick = () => {
    const serviceType = businessData.settings?.serviceType || 'APPOINTMENT'
    
    switch (serviceType) {
      case 'APPOINTMENT':
        setAppointmentModalOpen(true)
        break
      case 'PROJECT':
        setProjectModalOpen(true)
        break
      case 'CONSULTATION':
        setConsultationModalOpen(true)
        break
      case 'HYBRID':
        setContactModalOpen(true)
        break
      default:
        setAppointmentModalOpen(true)
    }
  }

  // Sector templates for icons
  const sectorTemplates = {
    BERBER: { icon: '✂️' },
    KUAFOR: { icon: '💇‍♀️' },
    DISHEKIMI: { icon: '🦷' },
    OTOYIKAMA: { icon: '🚗' },
    FREELANCER: { icon: '💼' },
    CONSULTANT: { icon: '🎓' },
    OTHER: { icon: '🏢' }
  }

  const deviceClasses = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[667px] mx-auto'
  }

  return (
    <div className={`${deviceClasses[device as keyof typeof deviceClasses]} bg-black overflow-y-auto min-h-screen`}>
      
      {/* Ultra Modern Hero Section with Cover & Profile Photos */}
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        
        {/* Dynamic Cover Photo or Gradient Background */}
        <div className="absolute inset-0">
          {(customizations.coverPhoto || businessData?.coverPhotoUrl) ? (
            <>
              {/* Cover Photo as Background - Mobile Responsive Fix */}
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
              <div className="absolute inset-0" style={{ background: colors.gradient }}></div>
              
              {/* Advanced Animated Background Effects */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
              </div>
              
              {/* Grid Pattern Overlay */}
              <div className="absolute inset-0 opacity-20" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                   }}></div>
            </>
          )}
        </div>
        
        {/* Hero Content Container */}
        <div className="relative z-10 w-full px-8 py-20">
          
          {/* Floating Navigation Bar */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-30">
            <div className="flex items-center gap-4">
              {/* Modern Logo/Brand with Profile Photo */}
              <div className="relative group">
                <div 
                  className="absolute inset-0 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"
                  style={{ background: colors.gradient }}
                ></div>
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3 hover:bg-black/60 transition-all">
                  {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
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
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl border-2 border-white/20 group-hover:border-white/40 transition-all">
                      {sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.icon || '🏢'}
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
              {customizations.showServices && (
                <a href="#services" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Hizmetler</a>
              )}
              {customizations.showTeam && (
                <a href="#team" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Ekibimiz</a>
              )}
              {customizations.showGallery && (
                <a href="#gallery" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Galeri</a>
              )}
              {blogPosts.length > 0 && customizations.showBlog && (
                <a href="#blog" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Blog</a>
              )}
              {customizations.showReviews && (
                <a href="#reviews" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Yorumlar</a>
              )}
              {customizations.showContact && (
                <a href="#contact" className="text-white/90 hover:text-white transition-colors font-semibold [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">İletişim</a>
              )}
              
              {/* Enhanced CTA Button */}
              <button 
                onClick={handleCTAClick}
                className="relative group overflow-hidden"
              >
                <div 
                  className="absolute inset-0 rounded-full blur-md group-hover:blur-lg transition-all opacity-70"
                  style={{ background: colors.gradient }}
                ></div>
                <div className="relative bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{customizations.buttonText || 'Randevu Al'}</span>
                </div>
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                  <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                  <div className="w-6 h-0.5 bg-white drop-shadow"></div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
              <div 
                className="absolute top-20 right-4 w-64 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl transform transition-transform duration-300 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      {(customizations.profilePhoto || businessData?.profilePhotoUrl) ? (
                        <CloudinaryImage
                          publicId={(customizations.profilePhoto || businessData?.profilePhotoUrl) || ''}
                          alt={businessData?.name || 'Logo'}
                          className="w-8 h-8 rounded-lg object-cover"
                          transformation={{
                            width: 64,
                            height: 64,
                            crop: 'fill',
                            quality: 'auto'
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm">
                          {sectorTemplates[businessData?.sector as keyof typeof sectorTemplates]?.icon || '🏢'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{businessData?.name}</h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  {/* Mobile Menu Items - Compact */}
                  <nav className="space-y-1">
                    {customizations.showServices && (
                      <a 
                        href="#services" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Hizmetler</span>
                      </a>
                    )}
                    
                    {customizations.showTeam && (
                      <a 
                        href="#team" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">Ekibimiz</span>
                      </a>
                    )}
                    
                    {customizations.showGallery && (
                      <a 
                        href="#gallery" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Camera className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">Galeri</span>
                      </a>
                    )}
                    
                    {blogPosts.length > 0 && customizations.showBlog && (
                      <a 
                        href="#blog" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-gray-900">Blog</span>
                      </a>
                    )}
                    
                    {customizations.showReviews && (
                      <a 
                        href="#reviews" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-gray-900">Yorumlar</span>
                      </a>
                    )}
                    
                    {customizations.showContact && (
                      <a 
                        href="#contact" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-gray-900">İletişim</span>
                      </a>
                    )}
                  </nav>
                  
                  {/* Mobile CTA Button - Compact */}
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        handleCTAClick()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      style={{ background: colors.gradient }}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{customizations.buttonText || 'Randevu Al'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        
          {/* Main Hero Content */}
          <div className="max-w-6xl mx-auto text-center space-y-8 flex flex-col items-center justify-center min-h-[80vh]">
            
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
                      alt={businessData?.name || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      transformation={{
                        width: 300,
                        height: 300,
                        crop: 'fill',
                        quality: 'auto'
                      }}
                    />
                  </div>
                  
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
              <span className="text-white font-medium [text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]"> Hemen randevu alabilirsiniz</span>
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
                      color: ${colors.primary};
                      text-shadow: 2px 4px 8px rgba(0,0,0,0.8), 0 0 20px ${colors.primary}55;
                    }
                    100% {
                      color: white;
                      text-shadow: 2px 4px 8px rgba(0,0,0,0.8);
                    }
                  }
                `}</style>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">
                  {customizations.heroSubtitle || `Profesyonel ${businessData?.sector} hizmetleri ile kaliteli deneyim`}
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="[text-shadow:_1px_1px_2px_rgba(0,0,0,0.8)]">Lisanslı & Güvenilir</span>
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
            
            {/* Rating Card & CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Rating Card */}
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
              
              {/* CTA Button */}
              <button 
                onClick={handleCTAClick}
                className="group relative overflow-hidden"
              >
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-80"
                  style={{ background: colors.gradient }}
                ></div>
                <div 
                  className="relative text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
                  style={{ background: colors.gradient }}
                >
                  <Calendar className="w-6 h-6" />
                  <span>{customizations.buttonText || 'Randevu Al'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
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
                  backgroundImage: `linear-gradient(to right, #1f2937, ${colors.primary}, #1f2937)` 
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
                            backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.primary}aa)`
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
                      onClick={handleCTAClick}
                      className="w-full relative group/btn overflow-hidden bg-black text-white py-4 px-6 rounded-2xl font-bold hover:scale-[1.02] transition-all duration-300"
                    >
                      <div 
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{ background: colors.gradient }}
                      ></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {customizations.buttonText || 'Randevu Al'}
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
                  style={{ background: colors.gradient }}
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
                  backgroundImage: `linear-gradient(to right, #ffffff, ${colors.primary}cc, #ffffff)`
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
                                src={member.photoUrl} 
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
                          backgroundImage: `linear-gradient(to right, ${colors.primary}cc, ${colors.primary})`
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
                        <button 
                          onClick={handleCTAClick}
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>{customizations.buttonText || 'Randevu Al'}</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                      
                      {/* Hover Gradient Overlay */}
                      <div 
                        className="absolute inset-0 rounded-3xl transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-5"
                        style={{
                          background: colors.gradient
                        }}
                      ></div>
                      
                      {/* Member Number Badge */}
                      <div 
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center"
                        style={{
                          background: colors.gradient
                        }}
                      >
                        <span className="text-white font-black text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Team Stats */}
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
                      style={{ background: colors.gradient }}
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
                  backgroundImage: `linear-gradient(to right, #1f2937, ${colors.primary}, #1f2937)`
                }}>
                  Çalışmalarımız
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed text-center">
                Profesyonel işlerimizden örnekleri görün ve kalitemizi keşfedin
              </p>
            </div>
            
            {businessData?.gallery?.length ? (
              <>
                {/* Modern Horizontal Grid - 16:9 aspect ratio */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businessData.gallery.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-200 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-xl"
                      style={{ aspectRatio: '16/9' }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      {/* Yatay çerçeveli görsel container */}
                      <div className="absolute inset-0">
                        <CloudinaryImage
                          src={photo.imageUrl} 
                          alt={photo.title || `Galeri ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ objectFit: 'cover' }}
                          transformation={{
                            width: 600,
                            height: 338, // 16:9 ratio için
                            crop: 'fill',
                            gravity: 'auto',
                            quality: 'auto:good'
                          }}
                        />
                      </div>
                      
                      {/* Modern Overlay - sadece hover'da görünür */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      
                      {/* Hover Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {/* Üst kısım - sıra numarası ve zoom ikonu */}
                        <div className="flex justify-between items-start">
                          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                            <span className="text-white font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Alt kısım - açıklama ve tıklama ipucu */}
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {photo.title && (
                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{photo.title}</h3>
                          )}
                          {photo.description && (
                            <p className="text-white/90 text-sm line-clamp-2 mb-2">{photo.description}</p>
                          )}
                          <div className="text-white/70 text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Büyütmek için tıklayın</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* View All Button */}
                <div className="text-center mt-16">
                  <button 
                    onClick={() => setSelectedImageIndex(0)}
                    className="group text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
                    style={{ background: colors.gradient }}
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
                  backgroundImage: `linear-gradient(to right, #ffffff, ${colors.primary}cc, #ffffff)`
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
                          "{review.comment}"
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
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(businessData?.avgRating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
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
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Henüz müşteri yorumu bulunmuyor</h3>
                <p className="text-white/60">İlk yorumlarınızı almaya başladığınızda burada görünecekler</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Blog Section */}
      {blogPosts.length > 0 && customizations.showBlog && (
        <div id="blog" className="py-32 px-8 bg-gray-50 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-100/30 to-yellow-100/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative">
            {/* Section Header */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Blog Yazıları</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-center mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-900 bg-clip-text text-transparent" style={{
                  backgroundImage: `linear-gradient(to right, #1f2937, ${colors.primary}, #1f2937)`
                }}>
                  Son Yazılarımız
                </span>
              </h2>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                En güncel bilgiler ve uzman görüşleri ile sizleri bilgilendiriyoruz
              </p>
            </div>
            
            {/* Blog Posts Grid */}
            {blogLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                    <div className="h-64 bg-gray-200 animate-pulse"></div>
                    <div className="p-8">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => (
                  <Link 
                    key={post.id}
                    href={`/${businessSlug}/${post.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Cover Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {post.featuredImage ? (
                        <CloudinaryImage
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          transformation={{
                            width: 500,
                            height: 300,
                            crop: 'fill',
                            quality: 'auto:good'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: colors.gradient }}>
                          <div className="text-center text-white">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-medium opacity-75">{businessData.name}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Date Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      {/* Views Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8">
                      {/* Author */}
                      <div className="flex items-center gap-2 mb-4">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: colors.gradient }}
                        >
                          {post.authorUser?.name?.charAt(0) || businessData.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600">{post.authorUser?.name || businessData.name}</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                      
                      {/* Read More */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>5 dk okuma</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary }}>
                          <span>Devamını Oku</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* View All Posts Button */}
            {blogPosts.length > 0 && (
              <div className="text-center mt-16">
                <button
                  className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 px-8 py-4 rounded-2xl font-bold text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Tüm Blog Yazılarını Gör</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
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
                  backgroundImage: `linear-gradient(to right, #1f2937, ${colors.primary}, #1f2937)`
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
                    style={{ background: colors.gradient }}
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Telefon</h3>
                  <p className="text-gray-600">{businessData?.phone}</p>
                </div>
                <button 
                  className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  style={{ background: colors.gradient }}
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
                    style={{ background: colors.gradient }}
                  >
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">E-posta</h3>
                  <p className="text-gray-600">{businessData?.email || 'info@example.com'}</p>
                </div>
                <button 
                  className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  style={{ background: colors.gradient }}
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
                    style={{ background: colors.gradient }}
                  >
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Adres</h3>
                  <p className="text-gray-600">{businessData?.address}</p>
                </div>
                <button 
                  className="w-full text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  style={{ background: colors.gradient }}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Yol Tarifi</span>
                </button>
              </div>
            </div>
            
            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: colors.gradient }}
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
              
              {/* Map Display */}
              <div className="relative h-96 bg-gray-100 rounded-b-3xl overflow-hidden">
                {businessData?.address ? (
                  <>
                    <div className="absolute inset-0">
                      <img
                        src={`https://www.mapquestapi.com/staticmap/v5/map?key=Fmjtd|luu821uznh,7a=o5-94720g&locations=${encodeURIComponent(businessData.address)}&size=800,400@2x&zoom=15&format=png`}
                        alt="Harita"
                        className="w-full h-full object-cover rounded-b-3xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      
                      <div 
                        className="w-full h-full flex items-center justify-center" 
                        style={{
                          display: 'none',
                          background: colors.gradient
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
                    
                    {/* Hover Overlay with Buttons */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 group">
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
                    style={{ background: colors.gradient }}
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
      
      {/* Gallery Lightbox Modal */}
      {selectedImageIndex !== null && businessData?.gallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image counter */}
          <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm z-50">
            {selectedImageIndex + 1} / {businessData.gallery.length}
          </div>
          
          {/* Navigation buttons - Sadece desktop'ta görünür */}
          {businessData.gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/20 transition-all z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/20 transition-all z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Main image container with touch support */}
          <div 
            className="w-full h-full flex items-center justify-center p-6 cursor-pointer touch-pan-x"
            onClick={closeLightbox}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              setTouchStartX(touch.clientX)
              setTouchStartY(touch.clientY)
            }}
            onTouchMove={(e) => {
              if (!touchStartX || !touchStartY) return
              
              const touch = e.touches[0]
              const deltaX = touchStartX - touch.clientX
              const deltaY = touchStartY - touch.clientY
              
              // Sadece yatay kaydırmayı algıla ve dikey kaydırmayı önle
              if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                e.preventDefault()
              }
            }}
            onTouchEnd={(e) => {
              if (!touchStartX || !touchStartY) return
              
              const touch = e.changedTouches[0]
              const deltaX = touchStartX - touch.clientX
              const deltaY = touchStartY - touch.clientY
              
              // Minimum kaydırma mesafesi (50px)
              const minSwipeDistance = 50
              
              // Yatay kaydırma dikey kaydırmadan fazlaysa ve minimum mesafeyi geçtiyse
              if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                  // Sola kaydır = sonraki görsel
                  nextImage()
                } else {
                  // Sağa kaydır = önceki görsel  
                  prevImage()
                }
              }
              
              setTouchStartX(null)
              setTouchStartY(null)
            }}
          >
           <div 
  className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center"
  onClick={(e) => e.stopPropagation()}
  onDragStart={(e) => e.preventDefault()}
>
  <CloudinaryImage
    src={businessData.gallery[selectedImageIndex].imageUrl}
    alt={businessData.gallery[selectedImageIndex].title || `Galeri ${selectedImageIndex + 1}`}
    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
    transformation={{
      width: 1200,
      height: 800,
      crop: 'limit',
      quality: 'auto:good'
    }}
  />
</div>
          </div>
          
          {/* Image info overlay */}
          {(businessData.gallery[selectedImageIndex].title || businessData.gallery[selectedImageIndex].description) && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 text-white">
              {businessData.gallery[selectedImageIndex].title && (
                <h3 className="text-lg md:text-xl font-bold mb-2">{businessData.gallery[selectedImageIndex].title}</h3>
              )}
              {businessData.gallery[selectedImageIndex].description && (
                <p className="text-sm md:text-base text-white/90">{businessData.gallery[selectedImageIndex].description}</p>
              )}
            </div>
          )}
          
          {/* Thumbnail navigation - Sadece desktop'ta tam, mobile'da basitleştirilmiş */}
          {businessData.gallery.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2">
              {businessData.gallery.slice(0, isMobile ? 3 : 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
              {businessData.gallery.length > (isMobile ? 3 : 5) && (
                <div className="text-white/60 text-xs flex items-center ml-2">+{businessData.gallery.length - (isMobile ? 3 : 5)}</div>
              )}
            </div>
          )}
          
          {/* Keyboard shortcuts info - Sadece desktop'ta */}
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
            // JavaScript Date.getDay() formatına uygun dönüşüm: 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi
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
          // JavaScript Date.getDay() formatına uygun dönüşüm: 0=Pazar, 1=Pazartesi, 2=Salı, 3=Çarşamba, 4=Perşembe, 5=Cuma, 6=Cumartesi
          dayOfWeek: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].indexOf(wh.dayOfWeek),
          isOpen: !wh.isClosed
        }))
      }} />
    </div>
  )
}
