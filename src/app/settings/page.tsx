'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import {
  UserIcon,
  LockClosedIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainHeader from '@/components/MainHeader'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

interface UserProfile {
  name: string
  email: string
  phone?: string
  birthDate?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  city?: string
  district?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  promotionalMessages: boolean
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<'customer' | 'business'>('customer')
  
  const resetForm = () => {
    // Reset form function for auth modal
  }

  // Profile states
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: undefined,
    city: '',
    district: ''
  })

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Notification states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    promotionalMessages: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        birthDate: session.user.birthDate || '',
        gender: session.user.gender,
        city: session.user.city || '',
        district: session.user.district || ''
      })
      
      // Load notification settings
      loadNotificationSettings()
    }
  }, [session, status, router])

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        await update() // Refresh session
        setMessage({ type: 'success', text: 'Profil bilgileri başarıyla güncellendi!' })
        toast.success('Profil bilgileri başarıyla güncellendi!')
      } else {
        const data = await response.json()
        const errorMessage = data.error || 'Bir hata oluştu'
        setMessage({ type: 'error', text: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = 'Profil güncellenirken bir hata oluştu'
      setMessage({ type: 'error', text: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setMessage({ type: 'success', text: 'Şifre başarıyla güncellendi!' })
        toast.success('Şifre başarıyla güncellendi!')
      } else {
        const data = await response.json()
        const errorMessage = data.error || 'Bir hata oluştu'
        setMessage({ type: 'error', text: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = 'Şifre güncellenirken bir hata oluştu'
      setMessage({ type: 'error', text: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async (setting: keyof NotificationSettings) => {
    const newNotifications = {
      ...notifications,
      [setting]: !notifications[setting]
    }
    setNotifications(newNotifications)

    try {
      await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotifications)
      })
    } catch (error) {
      console.error('Error updating notifications:', error)
      // Revert on error
      setNotifications(notifications)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main Header */}
        <MainHeader 
          setShowAuthModal={setShowAuthModal}
          authMode={authMode}
          setAuthMode={setAuthMode}
          userType={userType}
          setUserType={setUserType}
          resetForm={resetForm}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: UserIcon },
    { id: 'password', name: 'Şifre Değiştir', icon: LockClosedIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <MainHeader 
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        userType={userType}
        setUserType={setUserType}
        resetForm={resetForm}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Enhanced Header - Ana sayfa tasarımıyla uyumlu */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-200 mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-50"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Ayarlar
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          
          {/* Tabs - Ana sayfa stiliyle uyumlu */}
          <div className="border-b border-slate-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">
                      {tab.id === 'profile' ? 'Profil' :
                       tab.id === 'password' ? 'Şifre' :
                       'Bildirim'}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content - Ana sayfa card içeriği stiliyle uyumlu */}
          <div className="p-4 sm:p-6">
            
            {/* Messages - Ana sayfa toast stiliyle uyumlu */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 shadow-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      value={profile.birthDate}
                      onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cinsiyet
                    </label>
                    <div className="relative">
                      <select
                        value={profile.gender || ''}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                        className="appearance-none w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                      >
                        <option value="">Seçiniz</option>
                        <option value="MALE">Erkek</option>
                        <option value="FEMALE">Kadın</option>
                        <option value="OTHER">Diğer</option>
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Şehir
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                      placeholder="Şehir adı"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    {loading ? 'Güncelleniyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab - Ana sayfa input stiliyle uyumlu */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mevcut Şifre *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yeni Şifre *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yeni Şifre Tekrar *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white shadow-sm hover:border-slate-400 transition-colors"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab - Ana sayfa card stiliyle uyumlu */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Bildirim Tercihleri</h3>
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">E-posta Bildirimleri</p>
                          <p className="text-sm text-slate-600">Randevu ve güncellemeler hakkında e-posta alın</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationUpdate('emailNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.emailNotifications ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DevicePhoneMobileIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">SMS Bildirimleri</p>
                          <p className="text-sm text-slate-600">Önemli güncellemeler için SMS alın</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationUpdate('smsNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.smsNotifications ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Randevu Hatırlatmaları</p>
                          <p className="text-sm text-slate-600">Yaklaşan randevularınız için hatırlatma alın</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationUpdate('appointmentReminders')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.appointmentReminders ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            notifications.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <BellIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Promosyon Mesajları</p>
                          <p className="text-sm text-slate-600">Özel fırsatlar ve kampanyalar hakkında bilgi alın</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationUpdate('promotionalMessages')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.promotionalMessages ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            notifications.promotionalMessages ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        initialUserType={userType}
      />
    </div>
  )
}
