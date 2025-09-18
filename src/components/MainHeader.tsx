import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { 
  ChevronDownIcon,
  Bars3Icon,
  UserIcon,
  CalendarDaysIcon,
  HeartIcon,
  GiftIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface MainHeaderProps {
  showMobileSidebar?: boolean
  setShowMobileSidebar?: (show: boolean) => void
  userType?: 'customer' | 'business'
  setUserType?: (type: 'customer' | 'business') => void
  authMode?: 'login' | 'register'
  setAuthMode?: (mode: 'login' | 'register') => void
  setShowAuthModal?: (show: boolean) => void
  resetForm?: () => void
}

export default function MainHeader({ 
  showMobileSidebar = false,
  setShowMobileSidebar = () => {},
  userType = 'customer',
  setUserType = () => {},
  authMode = 'login',
  setAuthMode = () => {},
  setShowAuthModal = () => {},
  resetForm = () => {}
}: MainHeaderProps) {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setIsDropdownOpen(false)
    toast.success('Başarıyla çıkış yaptınız')
  }

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 min-w-0">
          {/* Left side - Mobile Menu + Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink-0">
            {/* Mobile Menu Button - sadece eğer setShowMobileSidebar prop'u varsa */}
            {setShowMobileSidebar !== (() => {}) && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 flex-shrink-0"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">R</span>
              </div>
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">RandeVur</span>
                <span className="text-xs text-slate-400 hidden lg:block whitespace-nowrap overflow-hidden text-ellipsis">Dijital Randevu Sistemi</span>
              </div>
            </Link>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {session ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-slate-700 hover:bg-slate-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 border border-slate-600 whitespace-nowrap"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white hidden sm:block">
                      {session.user?.name || 'Kullanıcı'}
                    </span>
                    <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      
                      <Link
                        href="/my-requests"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Taleplerimi Takip Et</span>
                      </Link>
                      
                      <Link
                        href="/appointments"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Randevularım</span>
                      </Link>
                      
                      <Link
                        href="/favorites"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <HeartIcon className="w-4 h-4" />
                        <span>Favorilerim</span>
                      </Link>
                      
                      <Link
                        href="/raffle"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <GiftIcon className="w-4 h-4" />
                        <span>Çekiliş Hakları</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Ayarlar</span>
                      </Link>
                      
                      {session.user?.role === 'BUSINESS_OWNER' && (
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <BuildingStorefrontIcon className="w-4 h-4" />
                          <span>İşletme Paneli</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setUserType('customer')
                    setAuthMode('login')
                    setShowAuthModal(true)
                    resetForm()
                  }}
                  className="text-slate-300 hover:text-white font-medium text-sm transition-colors duration-200 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-700 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Giriş Yap</span>
                  <span className="sm:hidden">Giriş</span>
                </button>
                <button
                  onClick={() => {
                    setUserType('customer')
                    setAuthMode('register')
                    setShowAuthModal(true)
                    resetForm()
                  }}
                  className="text-slate-300 hover:text-white font-medium text-sm transition-colors duration-200 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-700 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Kayıt Ol</span>
                  <span className="sm:hidden">Kayıt</span>
                </button>
                <div className="w-px h-4 sm:h-6 bg-slate-600 hidden xs:block"></div>
                <Link
                  href="/business"
                  className="px-2 sm:px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-block text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border border-emerald-400 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">İşletme Kaydı</span>
                  <span className="sm:hidden">İşletme</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
