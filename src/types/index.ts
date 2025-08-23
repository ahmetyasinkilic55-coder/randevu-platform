// src/types/index.ts
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface BusinessOwner {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  name: string
  slug: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  district?: string
  category: BusinessCategory
  isActive: boolean
  isVerified: boolean
  websiteData?: string
  templateId?: string
  workingHours?: string
  subscriptionType: SubscriptionType
  subscriptionEnds?: Date
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

export interface Staff {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  title?: string
  bio?: string
  isActive: boolean
  workingHours?: string
  createdAt: Date
  updatedAt: Date
  businessId: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  businessId: string
}

export interface Appointment {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  notes?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  createdAt: Date
  updatedAt: Date
  businessId: string
  staffId: string
  serviceId: string
  userId?: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
  businessId: string
  userId: string
}

// Enums
export type BusinessCategory = 
  | 'BARBER_SALON'
  | 'BEAUTY_CENTER' 
  | 'DENTAL_CLINIC'
  | 'CAR_WASH'
  | 'EVENT_HALL'
  | 'FITNESS_CENTER'
  | 'VETERINARY'
  | 'OTHER'

export type SubscriptionType = 
  | 'FREE'
  | 'BASIC'
  | 'PREMIUM'
  | 'ENTERPRISE'

export type AppointmentStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'