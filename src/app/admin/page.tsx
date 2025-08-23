'use client'

import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalBusinesses: number
  totalUsers: number
  totalAppointments: number
  pendingApprovals: number
  revenueThisMonth: number
  growthRate: number
}

interface RecentActivity {
  id: string
  message: string
  timestamp: string
  status: 'warning' | 'info'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBusinesses: 0,
    totalUsers: 0,
    totalAppointments: 0,
    pendingApprovals: 0,
    revenueThisMonth: 0,
    growthRate: 0
  })
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data for now - replace with actual API call later
      const mockStats: DashboardStats = {
        totalBusinesses: 342,
        totalUsers: 1248,
        totalAppointments: 2156,
        pendingApprovals: 23,
        revenueThisMonth: 45250,
        growthRate: 12.5
      }
      
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          message: 'Yeni işletme kaydı: Mehmet Kuaför Salonu',
          timestamp: '5 dakika önce',
          status: 'info' as const
        },
        {
          id: '2',
          message: 'Randevu iptali: Dr. Ahmet Diş Kliniği',
          timestamp: '12 dakika önce',
          status: 'warning' as const
        },
        {
          id: '3',
          message: 'Yeni kullanıcı kaydı tamamlandı',
          timestamp: '25 dakika önce',
          status: 'info' as const
        }
      ]
      
      setStats(mockStats)
      setRecentActivities(mockActivities)
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError(error instanceof Error ? error.message : 'Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    trendValue, 
    color = 'blue' 
  }: {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: 'up' | 'down'
    trendValue?: string
    color?: string
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? 
                <TrendingUp className="w-4 h-4 mr-1" /> : 
                <TrendingDown className="w-4 h-4 mr-1" />
              }
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">Randevu Yönetim Platformu</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <Bell className="w-6 h-6" />
                {stats.pendingApprovals > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Admin</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6">
            <ul className="space-y-2">
              <li>
                <a
                  href="/admin"
                  className="flex items-center space-x-3 text-gray-900 bg-blue-50 border-r-2 border-blue-600 p-3 rounded-lg font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <Link
                  href="/admin/businesses"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <Building2 className="w-5 h-5" />
                  <span>İşletmeler</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Kullanıcılar</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/appointments"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Randevular</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/analytics"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analitik</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Ayarlar</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Hoş Geldiniz!</h2>
                    <p className="text-blue-100 mt-2">
                      Platform durumunu ve metrikleri buradan takip edebilirsiniz.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-right">
                      <p className="text-sm text-blue-100">Toplam Gelir (Bu Ay)</p>
                      <p className="text-3xl font-bold">₺{stats.revenueThisMonth.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Toplam İşletme"
                  value={stats.totalBusinesses}
                  icon={<Building2 className="w-6 h-6" />}
                  trend="up"
                  trendValue="+8.2%"
                  color="blue"
                />
                <StatCard
                  title="Toplam Kullanıcı"
                  value={stats.totalUsers}
                  icon={<Users className="w-6 h-6" />}
                  trend="up"
                  trendValue="+12.5%"
                  color="green"
                />
                <StatCard
                  title="Bu Ay Randevu"
                  value={stats.totalAppointments}
                  icon={<Calendar className="w-6 h-6" />}
                  trend="up"
                  trendValue="+5.1%"
                  color="purple"
                />
                <StatCard
                  title="Bekleyen Onay"
                  value={stats.pendingApprovals}
                  icon={<Clock className="w-6 h-6" />}
                  color="orange"
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                      <button
                        onClick={fetchDashboardData}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Yenile
                      </button>
                    </div>
                    <div className="p-6">
                      {recentActivities.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${
                                activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                <AlertCircle className={`w-4 h-4 ${
                                  activity.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <Link
                        href="/admin/businesses"
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-blue-900">İşletme Yönetimi</span>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </Link>
                      <Link
                        href="/admin/users"
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-green-900">Kullanıcı Yönetimi</span>
                        <Plus className="w-4 h-4 text-green-600" />
                      </Link>
                      <Link
                        href="/admin/analytics"
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <span className="text-sm font-medium text-purple-900">Raporları Görüntüle</span>
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </Link>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Durumu</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Aktif</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Veritabanı</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Bağlı</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sunucu</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}