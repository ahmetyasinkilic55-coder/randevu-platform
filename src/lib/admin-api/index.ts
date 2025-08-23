// Admin API client functions

export interface DashboardStats {
  totalBusinesses: number
  totalUsers: number
  totalAppointments: number
  pendingApprovals: number
  revenueThisMonth: number
  growthRate: number
}

export interface RecentActivity {
  id: string
  type: 'business_registered' | 'user_joined' | 'appointment_created'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'info'
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: RecentActivity[]
}

export interface Business {
  id: string
  name: string
  category: string
  email: string
  phone: string
  address: string
  province?: string
  district?: string
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  createdAt: string
  totalAppointments: number
  totalServices: number
  totalStaff: number
  totalReviews: number
  rating: number
  revenue: number
  owner: {
    id: string
    name: string
    email: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  createdAt: string
  lastLoginAt?: string
  totalAppointments: number
  totalSpent: number
  businessName?: string
  verified: boolean
}

export interface Appointment {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  businessName: string
  businessId: string
  serviceName: string
  staffName: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  price: number
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  createdAt: string
  notes?: string
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number
    revenueGrowth: number
    totalAppointments: number
    appointmentsGrowth: number
    activeBusinesses: number
    businessGrowth: number
    activeUsers: number
    userGrowth: number
  }
  monthlyData: {
    month: string
    revenue: number
    appointments: number
    newBusinesses: number
    newUsers: number
  }[]
  topBusinesses: {
    id: string
    name: string
    revenue: number
    appointments: number
    growth: number
  }[]
  sectorDistribution: {
    sector: string
    count: number
    percentage: number
  }[]
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

// API Base URL
const API_BASE = '/api/admin'

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API Error' }))
    throw new Error(errorData.error || `API Error: ${response.status}`)
  }

  return response.json()
}

// Dashboard API
export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    return apiCall<DashboardData>('/dashboard')
  }
}

// Businesses API
export const businessesApi = {
  async getBusinesses(params?: {
    search?: string
    status?: string
    category?: string
    page?: number
    limit?: number
  }): Promise<{ businesses: Business[]; pagination: PaginationInfo }> {
    const searchParams = new URLSearchParams()
    
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.category) searchParams.set('category', params.category)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return apiCall<{ businesses: Business[]; pagination: PaginationInfo }>(
      `/businesses${query ? `?${query}` : ''}`
    )
  },

  async updateBusinessStatus(businessId: string, status: string): Promise<void> {
    return apiCall('/businesses', {
      method: 'PATCH',
      body: JSON.stringify({ businessId, status })
    })
  },

  async deleteBusiness(businessId: string): Promise<void> {
    return apiCall(`/businesses?id=${businessId}`, {
      method: 'DELETE'
    })
  }
}

// Users API
export const usersApi = {
  async getUsers(params?: {
    search?: string
    status?: string
    role?: string
    page?: number
    limit?: number
  }): Promise<{ users: User[]; pagination: PaginationInfo }> {
    const searchParams = new URLSearchParams()
    
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.role) searchParams.set('role', params.role)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return apiCall<{ users: User[]; pagination: PaginationInfo }>(
      `/users${query ? `?${query}` : ''}`
    )
  },

  async updateUserStatus(userId: string, action: string, value?: any): Promise<void> {
    return apiCall('/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, action, value })
    })
  },

  async deleteUser(userId: string): Promise<void> {
    return apiCall(`/users?id=${userId}`, {
      method: 'DELETE'
    })
  }
}

// Appointments API
export const appointmentsApi = {
  async getAppointments(params?: {
    search?: string
    status?: string
    dateFilter?: string
    page?: number
    limit?: number
  }): Promise<{ appointments: Appointment[]; pagination: PaginationInfo }> {
    const searchParams = new URLSearchParams()
    
    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.dateFilter) searchParams.set('dateFilter', params.dateFilter)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return apiCall<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      `/appointments${query ? `?${query}` : ''}`
    )
  },

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    return apiCall('/appointments', {
      method: 'PATCH',
      body: JSON.stringify({ appointmentId, status })
    })
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    return apiCall(`/appointments?id=${appointmentId}`, {
      method: 'DELETE'
    })
  }
}

// Analytics API
export const analyticsApi = {
  async getAnalytics(period: string = '6M'): Promise<AnalyticsData> {
    return apiCall<AnalyticsData>(`/analytics?period=${period}`)
  }
}