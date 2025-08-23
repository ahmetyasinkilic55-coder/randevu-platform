export interface BusinessInfo {
  id: number
  name: string
  category: string
  address: string
  phone: string
  email: string
  website: string
  rating: number
  reviewCount: number
  isOpen: boolean
  openHours: string
  logo: string
  coverImage: string
}

export interface TodayStats {
  appointments: number
  revenue: number
  customers: number
  cancellations: number
  completionRate: number
  dailyGoal: number
}

export interface Appointment {
  id: number
  customerName: string
  service: string
  time: string
  endTime: string
  status: 'completed' | 'confirmed' | 'pending' | 'cancelled'
  price: number
  phone: string
  avatar: string
  rating?: number
  staff: string
  notes: string
  cancelReason?: string
}

export interface Service {
  id: number
  name: string
  price: number
  duration: number
  active: boolean
  description: string
  popularity: number
  monthlyBookings: number
  category: string
}

export interface Staff {
  id: number
  name: string
  role: string
  avatar: string
  status: 'working' | 'break' | 'offline'
  nextAppointment: string
  todayAppointments: number
  todayRevenue: number
  rating: number
  experience: string
  specialties: string[]
  workingHours: string
  phone: string
}

export interface WebsiteTemplate {
  id: number
  name: string
  image: string
  color: string
  accent: string
  features: string[]
  style: string
  popularity: number
}

export interface Notification {
  id: number
  type: string
  message: string
  time: string
  unread: boolean
}

export interface Analytics {
  weeklyStats: {
    revenue: number[]
    days: string[]
  }
  monthlyGrowth: {
    appointments: number
    revenue: number
    customers: number
    rating: number
  }
  topServices: {
    name: string
    bookings: number
    revenue: number
  }[]
}

export interface WebsiteData {
  title: string
  description: string
  primaryColor: string
  accentColor: string
  logo: string
  coverImage: string
  sections: {
    hero: boolean
    about: boolean
    services: boolean
    gallery: boolean
    staff: boolean
    reviews: boolean
    contact: boolean
    booking: boolean
  }
  features: {
    animations: boolean
    chatWidget: boolean
    socialMedia: boolean
    googleMaps: boolean
    newsletter: boolean
    blog: boolean
  }
}
