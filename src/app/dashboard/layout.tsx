'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { checkClientSideAccess } from '@/lib/auth-utils'
import { useBusinessData } from '@/hooks/useBusinessData'
import { 
  BellIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CodeBracketIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  
  // İşletme verilerini al
  const { businessData, loading: businessLoading, error: businessError } = useBusinessData()
  
  // Debug için console.log ekle
  useEffect(() => {
    console.log('Business Data Debug:', {
      businessData: businessData,
      profilePhotoUrl: businessData?.profilePhotoUrl,
      logo: businessData?.profilePhotoUrl
    })
  }, [businessData])
  
  // Çıkış işlemi
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      toast.success('Başarıyla çıkış yaptınız!')
    } catch (error) {
      toast.error('Çıkış yaparken bir hata oluştu')
    }
  }
  
  // Siteyi görüntüle
  const handleViewSite = () => {
    if (businessData?.slug) {
      window.open(`/${businessData.slug}`, '_blank')
    } else {
      toast.error('İşletme slug bilgisi bulunamadı')
    }
  }
  
  // Component mount kontrolü
  useEffect(() => {
    setHasMounted(true)
  }, [])
  
  // Erişim kontrolü
  useEffect(() => {
    if (!hasMounted) return // Component henüz mount olmamış
    
    if (status === 'loading') {
      setIsCheckingAccess(true)
      return // Henüz yükleniyor
    }
    
    const accessCheck = checkClientSideAccess(session)
    
    if (!accessCheck.hasAccess) {
      // Sayfa yenileme yerine yönlendirme yap
      setIsCheckingAccess(false)
      router.replace(accessCheck.redirectTo || '/')
      return
    }
    
    setIsCheckingAccess(false)
  }, [hasMounted, session, status, router])
  
  // Yükleme ekranı
  if (!hasMounted || status === 'loading' || isCheckingAccess || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!hasMounted || status === 'loading' || isCheckingAccess ? 'Erişim kontrol ediliyor...' : 'İşletme bilgileri yükləniyor...'}
          </p>
        </div>
      </div>
    )
  }
  
  // Hata durumu
  if (businessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-4">{businessError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }
  
  const menuItems = [
    { key: 'dashboard', icon: ChartBarIcon, label: 'Panel', href: '/dashboard', badge: null },
    { key: 'appointments', icon: CalendarDaysIcon, label: 'Randevular', href: '/dashboard/appointments', badge: 3 },
    { key: 'inquiries', icon: DocumentTextIcon, label: 'Talepler', href: '/dashboard/inquiries', badge: null },
    { key: 'services', icon: Cog6ToothIcon, label: 'Hizmetler', href: '/dashboard/services', badge: null },
    { key: 'staff', icon: UserGroupIcon, label: 'Personel', href: '/dashboard/staff', badge: null },
    { key: 'staff-leave', icon: ClockIcon, label: 'İzin Yönetimi', href: '/dashboard/staff-leave', badge: null },
    { key: 'reviews', icon: ChatBubbleLeftRightIcon, label: 'Değerlendirmeler', href: '/dashboard/reviews', badge: null },
    { key: 'customer-notes', icon: DocumentTextIcon, label: 'Müşteri Notları', href: '/dashboard/customer-notes', badge: null },
    { key: 'gallery', icon: PhotoIcon, label: 'Galeri Yönetimi', href: '/dashboard/gallery', badge: null },
    { key: 'website', icon: CodeBracketIcon, label: 'Web Sitesi', href: '/dashboard/website', badge: null },
    { key: 'advertising', icon: MegaphoneIcon, label: 'Reklam Desteği', href: '/dashboard/advertising', badge: null },
    { key: 'analytics', icon: ChartBarIcon, label: 'Analitik', href: '/dashboard/analytics', badge: null },
    { key: 'settings', icon: Cog6ToothIcon, label: 'Ayarlar', href: '/dashboard/settings', badge: null }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <img
                src={
                  businessData?.profilePhotoUrl || 
                  '/default-business.svg'
                }
                alt="Profil Fotoğrafı"
                className="w-10 h-10 rounded-lg object-cover shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/default-business.svg'
                }}
              />
              <div className="hidden sm:block">
                <h1 className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {businessData?.name || 'Yükləniyor...'}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    businessData?.isCurrentlyOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {businessData?.isCurrentlyOpen ? 'Açık' : 'Kapalı'} • {businessData?.currentOpenHours || 'Bilinmiyor'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Test Profile Photo Button */}
                
                
                {/* Today Stats */}
              <div className="hidden xl:flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-lg font-bold transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {businessData?.todayStats?.revenue ? `${businessData.todayStats.revenue.toLocaleString('tr-TR')}₺` : '0₺'}
                  </div>
                  <div className={`text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Bugün
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {businessData?.todayStats?.appointments || 0}
                  </div>
                  <div className={`text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Randevu
                  </div>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border z-50 transition-colors ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`p-4 border-b transition-colors ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <h3 className={`font-semibold transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Bildirimler
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4">
                      <p className={`text-sm text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Henüz bildirim bulunmuyor.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`w-px h-6 transition-colors hidden sm:block ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}></div>
              
              {/* Siteyi Görüntüle Button */}
              <button 
                onClick={handleViewSite}
                disabled={!businessData?.slug}
                className={`flex items-center space-x-1 sm:space-x-2 transition-colors ${
                  businessData?.slug 
                    ? 'text-purple-600 hover:text-purple-700' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <EyeIcon className="w-5 h-5" />
                <span className="font-medium hidden md:inline text-sm">Siteyi Görüntüle</span>
              </button>
              
              {/* Çıkış Button */}
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-1 sm:space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium hidden md:inline text-sm">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none`}>
          <nav className={`h-full p-4 sm:p-6 transition-colors ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-r`}>
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end mb-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                      isActive
                        ? isDarkMode
                          ? 'bg-purple-900 text-purple-300'
                          : 'bg-purple-100 text-purple-700'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-sm sm:text-base">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
