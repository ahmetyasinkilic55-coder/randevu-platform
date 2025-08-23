// Types for Settings page and API responses

export interface BusinessData {
  id: string
  name: string
  category: string
  address: string
  phone: string
  email: string
  description?: string | null
  website?: string | null
  logo?: string | null
  coverImage?: string | null
  profilePhotoUrl?: string | null
  coverPhotoUrl?: string | null
  isActive: boolean
}

export interface UserData {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  position?: string | null
}

export interface NotificationSettings {
  newAppointment: boolean
  appointmentCancellation: boolean
  dailySummary: boolean
  weeklyReport: boolean
  monthlyAnalysis: boolean
  marketingTips: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

export interface WorkingHour {
  id?: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  isOpen: boolean
  openTime: string // HH:MM format
  closeTime: string // HH:MM format
}

export interface BusinessSettings {
  id: string
  businessId: string
  
  // Notification Settings
  newAppointmentNotification: boolean
  appointmentCancellationNotification: boolean
  dailySummaryNotification: boolean
  weeklyReportNotification: boolean
  monthlyAnalysisNotification: boolean
  marketingTipsNotification: boolean
  
  // Communication Preferences
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // Business Preferences
  allowOnlineBooking: boolean
  requireBookingApproval: boolean
  bookingLeadTime: number // minutes
  cancellationPolicy?: string | null
  
  // Payment Settings
  acceptCashPayment: boolean
  acceptCardPayment: boolean
  requireDepositForBooking: boolean
  depositPercentage: number
  
  createdAt: Date
  updatedAt: Date
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}

export interface BusinessResponse extends ApiResponse {
  business?: BusinessData
}

export interface UserResponse extends ApiResponse {
  user?: UserData
}

export interface NotificationsResponse extends ApiResponse {
  notifications?: NotificationSettings
}

export interface WorkingHoursResponse extends ApiResponse {
  workingHours?: WorkingHour[]
}

// Business category options
export const BUSINESS_CATEGORIES = [
  'BARBER',
  'BEAUTY_SALON', 
  'DENTIST',
  'VETERINARIAN',
  'CAR_WASH',
  'GYM',
  'OTHER'
] as const

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]

// Day names for working hours
export const DAY_NAMES = [
  'Pazar',     // 0
  'Pazartesi', // 1
  'Salı',      // 2
  'Çarşamba',  // 3
  'Perşembe',  // 4
  'Cuma',      // 5
  'Cumartesi'  // 6
] as const
