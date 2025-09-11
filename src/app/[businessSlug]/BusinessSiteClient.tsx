'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Eye, Crown, Sparkles, Zap, Smartphone } from 'lucide-react'

// Dynamically import website preview components
const WebsitePreview = dynamic(() => import('@/components/website/WebsitePreview'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  ),
  ssr: false
})

const PremiumWebsitePreview = dynamic(() => import('@/components/website/PremiumWebsitePreview'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  ),
  ssr: false
})

const GlassmorphismWebsitePreview = dynamic(() => import('@/components/website/GlassMorpWebsitePreview'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  ),
  ssr: false
})

const IOSWebsitePreview = dynamic(() => import('@/components/website/IOSwebsitePreview'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  ),
  ssr: false
})

interface BusinessData {
  id: string
  name: string
  slug: string
  category: string
  phone: string
  email?: string
  address: string
  description?: string
  profilePhotoUrl?: string
  coverPhotoUrl?: string
  latitude?: number
  longitude?: number
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  services: Array<{
    id: string
    name: string
    description?: string
    price: number
    duration: number
    popularity: number
  }>
  staff: Array<{
    id: string
    name: string
    specialty?: string
    experience?: number
    rating?: number
    photoUrl?: string
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
  websiteConfig: {
    primaryColor: string
    secondaryColor: string
    gradientColors: string
    heroTitle: string
    heroSubtitle: string
    buttonText: string
    showServices: boolean
    showTeam?: boolean
    showGallery: boolean
    showBlog: boolean
    showReviews: boolean
    showMap: boolean
    showContact: boolean
  } | null
  averageRating: number
  formattedWorkingHours: Array<{
    day: string
    hours: string
    isClosed: boolean
  }>
  _count: {
    reviews: number
    appointments: number
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
  workingHours?: Array<{
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
  }>
}

export default function BusinessSiteClient({ 
  businessData,
  businessSlug
}: { 
  businessData: BusinessData
  businessSlug: string
}) {
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'premium' | 'futuristic' | 'ios'>('classic')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  // Debug: Log businessData to see what we have
  console.log('🔧 [BusinessSiteClient] BusinessData:', {
    id: businessData.id,
    name: businessData.name,
    profilePhotoUrl: businessData.profilePhotoUrl,
    coverPhotoUrl: businessData.coverPhotoUrl,
    servicesCount: businessData.services?.length || 0,
    staffCount: businessData.staff?.length || 0,
    galleryCount: businessData.gallery?.length || 0,
    reviewsCount: businessData.reviews?.length || 0,
    hasSettings: !!businessData.settings,
    settingsType: businessData.settings?.serviceType,
    websiteConfig: businessData.websiteConfig
  })

  // Convert business data to match WebsitePreview expectations
  const transformedBusinessData = {
    id: businessData.id,
    name: businessData.name,
    sector: businessData.category,
    phone: businessData.phone,
    email: businessData.email,
    address: businessData.address,
    profilePhotoUrl: businessData.profilePhotoUrl,
    coverPhotoUrl: businessData.coverPhotoUrl,
    avgRating: businessData.averageRating,
    reviewCount: businessData._count.reviews,
    totalAppointments: businessData._count.appointments,
    services: businessData.services.map(service => ({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
      category: 'general' // Default category since it's not in original data
    })),
    staff: businessData.staff.map(staff => ({
      id: staff.id,
      name: staff.name,
      specialty: staff.specialty,
      photoUrl: staff.photoUrl,
      rating: staff.rating,
      staffLeaves: staff.staffLeaves
    })),
    gallery: businessData.gallery.map(item => ({
      id: item.id,
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description
    })),
    reviews: businessData.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customerName: review.customerName,
      customerAvatar: review.customerAvatar,
      createdAt: review.createdAt
    })),
    workingHours: businessData.formattedWorkingHours.map(wh => ({
      dayOfWeek: wh.day, // Gün ismi olarak geçiyor (Pazartesi, Salı, vb.)
      openTime: wh.hours.split(' - ')[0] || '09:00',
      closeTime: wh.hours.split(' - ')[1] || '18:00',
      isClosed: wh.isClosed
    })),
    websiteConfig: businessData.websiteConfig ? {
      primaryColor: businessData.websiteConfig.primaryColor,
      secondaryColor: businessData.websiteConfig.secondaryColor,
      gradientColors: businessData.websiteConfig.gradientColors,
      heroTitle: businessData.websiteConfig.heroTitle,
      heroSubtitle: businessData.websiteConfig.heroSubtitle,
      buttonText: businessData.websiteConfig.buttonText,
      showServices: businessData.websiteConfig.showServices,
      showTeam: businessData.websiteConfig.showTeam || false,
      showGallery: businessData.websiteConfig.showGallery,
      showBlog: businessData.websiteConfig.showBlog || false,
      showReviews: businessData.websiteConfig.showReviews,
      showMap: businessData.websiteConfig.showMap,
      showContact: businessData.websiteConfig.showContact
    } : undefined,
    settings: businessData.settings,
    appointmentSettings: businessData.appointmentSettings
  }

  // Create customizations object from websiteConfig
  const customizations = businessData.websiteConfig ? {
    primaryColor: businessData.websiteConfig.primaryColor,
    secondaryColor: businessData.websiteConfig.secondaryColor,
    gradientColors: businessData.websiteConfig.gradientColors,
    heroTitle: businessData.websiteConfig.heroTitle,
    heroSubtitle: businessData.websiteConfig.heroSubtitle,
    buttonText: businessData.settings?.buttonText || businessData.websiteConfig.buttonText,
    showServices: businessData.websiteConfig.showServices,
    showTeam: businessData.websiteConfig.showTeam,
    showGallery: businessData.websiteConfig.showGallery,
    showBlog: businessData.websiteConfig.showBlog || false,
    showReviews: businessData.websiteConfig.showReviews,
    showMap: businessData.websiteConfig.showMap,
    showContact: businessData.websiteConfig.showContact,
    profilePhoto: businessData.profilePhotoUrl,
    coverPhoto: businessData.coverPhotoUrl
  } : {
    // Default customizations if no websiteConfig
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    gradientColors: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    heroTitle: businessData.name,
    heroSubtitle: `Profesyonel ${businessData.category} hizmetleri`,
    buttonText: businessData.settings?.buttonText || 'Randevu Al',
    showServices: true,
    showTeam: true,
    showGallery: true,
    showBlog: false, // Default olarak blog kapalı
    showReviews: true,
    showMap: true,
    showContact: true,
    profilePhoto: businessData.profilePhotoUrl,
    coverPhoto: businessData.coverPhotoUrl
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <div className="relative">
      {/* Floating Template Selector */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end space-y-3">
          {/* Template Options */}
          {showTemplateSelector && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl animate-fade-in-up">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedTemplate('classic')
                    setShowTemplateSelector(false)
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
                    selectedTemplate === 'classic' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Klasik Tasarım</div>
                    <div className="text-xs opacity-80">Minimalist & Şık</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedTemplate('premium')
                    setShowTemplateSelector(false)
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
                    selectedTemplate === 'premium' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Premium Tasarım</div>
                    <div className="text-xs opacity-80">Lüks & Etkileyici</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedTemplate('futuristic')
                    setShowTemplateSelector(false)
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
                    selectedTemplate === 'futuristic' 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Futuristik Tasarım</div>
                    <div className="text-xs opacity-80">Cyber & Holografik</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedTemplate('ios')
                    setShowTemplateSelector(false)
                  }}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 ${
                    selectedTemplate === 'ios' 
                      ? 'bg-gradient-to-r from-blue-500 to-gray-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">iOS Minimal</div>
                    <div className="text-xs opacity-80">Sade & Şık</div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Toggle Button */}
          <button
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            className="group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6" />
              <span className="font-bold text-sm">Tasarım</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              YENİ
            </div>
          </button>
        </div>
      </div>

      {/* Render Selected Template */}
      {selectedTemplate === 'ios' ? (
        <IOSWebsitePreview 
          businessData={transformedBusinessData}
          customizations={customizations}
          isModal={false}
          device="desktop"
          businessSlug={businessSlug}
        />
      ) : selectedTemplate === 'futuristic' ? (
        <GlassmorphismWebsitePreview 
          businessData={transformedBusinessData}
          customizations={customizations}
          isModal={false}
          device="desktop"
          businessSlug={businessSlug}
        />
      ) : selectedTemplate === 'premium' ? (
        <PremiumWebsitePreview 
          businessData={transformedBusinessData}
          customizations={customizations}
          isModal={false}
          device="desktop"
          businessSlug={businessSlug}
        />
      ) : (
        <WebsitePreview 
          businessData={transformedBusinessData}
          customizations={customizations}
          isModal={false}
          device="desktop"
          businessSlug={businessSlug}
        />
      )}
      
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
        </div>
        </Suspense>
  )
}
