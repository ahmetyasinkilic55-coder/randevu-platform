'use client'

import React from 'react'
import WebsitePreview from '@/components/website/WebsitePreview'

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
  businessData 
}: { 
  businessData: BusinessData 
}) {
  // Debug: Log businessData to see what we have
  console.log('🔧 [BusinessSiteClient] BusinessData:', {
    id: businessData.id,
    name: businessData.name,
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
    showReviews: true,
    showMap: true,
    showContact: true,
    profilePhoto: businessData.profilePhotoUrl,
    coverPhoto: businessData.coverPhotoUrl
  }

  return (
    <WebsitePreview 
      businessData={transformedBusinessData}
      customizations={customizations}
      isModal={false}
      device="desktop"
    />
  )
}
