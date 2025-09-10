'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import {
  GiftIcon,
  UserIcon,
  CalendarDaysIcon,
  TrophyIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid, GiftIcon as GiftSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainHeader from '@/components/MainHeader'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'

interface RaffleData {
  currentMonth: string
  year: number
  totalRights: number
  usedRights: number
  availableRights: number
  eligibleAppointments: EligibleAppointment[]
  currentPrize: Prize
  raffleHistory: RaffleHistory[]
  nextDrawDate: string
}

interface EligibleAppointment {
  id: string
  date: string
  time: string
  business: {
    name: string
    slug: string
    profilePhotoUrl?: string
    category?: string
  }
  service: {
    name: string
    price: number
    duration: number
  }
  staff?: {
    name: string
  }
  completedAt: string
  raffleRightEarned: boolean
}

interface Prize {
  id: string
  title: string
  description: string
  value: number
  image: string
  sponsor?: string
  category: string
}

interface RaffleHistory {
  id: string
  month: string
  year: number
  participatedRights: number
  won: boolean
  prize?: Prize
  winnerAnnounced: boolean
  drawDate: string
}

export default function RafflePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [participateLoading, setParticipateLoading] = useState(false)
  
  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<'customer' | 'business'>('customer')
  
  const resetForm = () => {
    // Reset form function for auth modal
  }
  
  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session) {
      fetchRaffleData()
    }
  }, [session, status, router])
  
  // Calculate next draw date (1st day of next month at 13:00 Turkey time)
  const calculateNextDrawDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 13, 0, 0) // Next month 1st day 13:00
    
    // Convert to Turkey time (UTC+3)
    const turkeyOffset = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
    const turkeyTime = new Date(nextMonth.getTime() + turkeyOffset)
    
    return turkeyTime
  }
  
  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const nextDraw = calculateNextDrawDate()
      const timeDiff = nextDraw.getTime() - now.getTime()
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
        
        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }
    
    // Update immediately
    updateCountdown()
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRaffleData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/raffle/data')
      
      if (response.ok) {
        const data = await response.json()
        setRaffleData(data)
      } else {
        setError('Çekiliş bilgileri yüklenirken hata oluştu')
      }
    } catch (err) {
      console.error('Error fetching raffle data:', err)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleParticipateRaffle = async () => {
    if (!raffleData || raffleData.availableRights === 0) return

    try {
      setParticipateLoading(true)
      const response = await fetch('/api/raffle/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rightsToUse: raffleData.availableRights
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.rightsUsed} adet hakkınızla çekilişe katıldınız!`)
        fetchRaffleData() // Refresh data
      } else {
        const data = await response.json()
        toast.error(data.error || 'Çekilişe katılırken hata oluştu')
      }
    } catch (err) {
      toast.error('Çekilişe katılırken bir hata oluştu')
    } finally {
      setParticipateLoading(false)
    }
  }

  const getMonthName = (month: string) => {
    const months = {
      '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan',
      '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos',
      '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık'
    }
    return months[month as keyof typeof months] || month
  }

  if (status === 'loading' || loading) {
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
        
        {/* Countdown Timer - Always show */}
        <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <ClockIcon className="w-6 h-6 text-white" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Çekiliş Sonucuna Kalan Süre
                </h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base mb-6">
                Sonrakı ayın 1. günü saat 13:00'da (Türkiye saati)
              </p>
              
              {/* Countdown Display */}
              <div className="grid grid-cols-4 gap-4 sm:gap-6 max-w-md mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {countdown.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">
                    Gün
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {countdown.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">
                    Saat
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {countdown.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">
                    Dakika
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white animate-pulse">
                    {countdown.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 font-medium">
                    Saniye
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Sonuçlar Açıklandığında Bildirim Alın!
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <XCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">Bir Hata Oluştu</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
              <button
                onClick={fetchRaffleData}
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
              >
                <span>Tekrar Dene</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      {/* Countdown Timer - Always show */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <ClockIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Çekiliş Sonucuna Kalan Süre
              </h2>
            </div>
            <p className="text-white/90 text-sm sm:text-base mb-6">
              Sonrakı ayın 1. günü saat 13:00'da (Türkiye saati)
            </p>
            
            {/* Countdown Display */}
            <div className="grid grid-cols-4 gap-4 sm:gap-6 max-w-md mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {countdown.days.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">
                  Gün
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {countdown.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">
                  Saat
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {countdown.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">
                  Dakika
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white animate-pulse">
                  {countdown.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">
                  Saniye
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Sonuçlar Açıklandığında Bildirim Alın!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-lg border border-slate-200 mb-6 sm:mb-8">
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <radialGradient id="sparkle1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="30" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="350" cy="40" r="1.5" fill="rgba(255,255,255,0.4)">
                <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" />
              </circle>
              <circle cx="120" cy="160" r="1" fill="rgba(255,255,255,0.5)">
                <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
              </circle>
              <circle cx="280" cy="140" r="2" fill="rgba(255,255,255,0.3)">
                <animate attributeName="opacity" values="0;1;0" dur="3.5s" repeatCount="indefinite" begin="2s" />
              </circle>
            </svg>
          </div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <GiftSolid className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Çekiliş Hakları
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {raffleData && getMonthName(raffleData.currentMonth)} {raffleData?.year} ayı çekiliş durumunuz
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {raffleData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            
            {/* Total Rights */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{raffleData.totalRights}</div>
                  <div className="text-emerald-100 text-sm font-medium">Toplam Hak</div>
                  <div className="text-emerald-200 text-xs mt-1">Bu ay kazandığınız</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TicketIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Available Rights */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{raffleData.availableRights}</div>
                  <div className="text-blue-100 text-sm font-medium">Kullanılabilir Hak</div>
                  <div className="text-blue-200 text-xs mt-1">Çekilişe katılmak için</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Used Rights */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{raffleData.usedRights}</div>
                  <div className="text-purple-100 text-sm font-medium">Kullanılan Hak</div>
                  <div className="text-purple-200 text-xs mt-1">Çekilişte kullanılan</div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participate Button */}
        {raffleData && raffleData.availableRights > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {raffleData.availableRights} Adet Çekiliş Hakkınız Var!
              </h3>
              <p className="text-slate-600 mb-6">
                Bu ay tamamladığınız randevularla {raffleData.availableRights} adet çekiliş hakkı kazandınız. 
                Çekilişe katılarak harika ödüller kazanma şansını yakalayın!
              </p>
              <button
                onClick={handleParticipateRaffle}
                disabled={participateLoading}
                className="inline-flex items-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                {participateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Katılınıyor...</span>
                  </>
                ) : (
                  <>
                    <GiftIcon className="w-5 h-5" />
                    <span>Çekilişe Katıl ({raffleData.availableRights} Hak)</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
              {raffleData.nextDrawDate && (
                <p className="text-sm text-slate-500 mt-4">
                  Çekiliş Tarihi: {new Date(raffleData.nextDrawDate).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Current Month Prize */}
        {raffleData?.currentPrize && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 sm:px-8 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <TrophyIcon className="w-6 h-6 mr-3" />
                Bu Ayın Ödülü
              </h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-lg flex items-center justify-center">
                      <GiftSolid className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ₺{raffleData.currentPrize.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-3">
                    <StarSolid className="w-4 h-4 mr-1" />
                    {raffleData.currentPrize.category}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    {raffleData.currentPrize.title}
                  </h3>
                  <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                    {raffleData.currentPrize.description}
                  </p>
                  {raffleData.currentPrize.sponsor && (
                    <div className="flex items-center justify-center lg:justify-start space-x-2 text-slate-500">
                      <BuildingStorefrontIcon className="w-5 h-5" />
                      <span className="font-medium">Sponsor: {raffleData.currentPrize.sponsor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eligible Appointments */}
        {raffleData?.eligibleAppointments && raffleData.eligibleAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-6 sm:mb-8">
            <div className="border-b border-slate-200 px-6 sm:px-8 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                <CalendarDaysIcon className="w-6 h-6 mr-3 text-emerald-600" />
                Hak Kazandıran Randevular ({raffleData.eligibleAppointments.length})
              </h2>
              <p className="text-slate-600 mt-1">Bu ay tamamladığınız ve hak kazandıran randevularınız</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {raffleData.eligibleAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <BuildingStorefrontIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900 truncate">
                              {appointment.business.name}
                            </h3>
                            <p className="text-emerald-600 font-medium text-sm">
                              {appointment.service.name}
                            </p>
                            {appointment.staff && (
                              <p className="text-slate-500 text-sm">
                                Uzman: {appointment.staff.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Hak Kazandı
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString('tr-TR')} - {appointment.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{appointment.service.duration} dk</span>
                          </div>
                          <div className="flex items-center space-x-1 text-green-600 font-medium">
                            <span>₺{appointment.service.price}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Tamamlandı: {new Date(appointment.completedAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Raffle History */}
        {raffleData?.raffleHistory && raffleData.raffleHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="border-b border-slate-200 px-6 sm:px-8 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                <ClockIcon className="w-6 h-6 mr-3 text-purple-600" />
                Geçmiş Çekilişler
              </h2>
              <p className="text-slate-600 mt-1">Daha önce katıldığınız çekilişlerin geçmişi</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {raffleData.raffleHistory.map((history) => (
                  <div key={history.id} className={`rounded-xl p-4 sm:p-5 border-2 ${
                    history.won 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {getMonthName(history.month.padStart(2, '0'))} {history.year}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {history.participatedRights} hak ile katıldınız
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Çekiliş: {new Date(history.drawDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="text-right">
                        {history.won ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                              <TrophyIcon className="w-4 h-4 mr-1" />
                              Kazandınız! 🎉
                            </span>
                            {history.prize && (
                              <p className="text-emerald-600 font-medium text-sm">
                                {history.prize.title}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                            {history.winnerAnnounced ? 'Kazanamadınız' : 'Sonuç Bekleniyor'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Rights Message */}
        {raffleData && raffleData.totalRights === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <GiftIcon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                Bu Ay Henüz Çekiliş Hakkınız Yok
              </h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                Çekiliş hakkı kazanmak için bu ay içerisinde randevu alıp tamamlamanız gerekiyor. 
                Her tamamlanan randevu 1 adet çekiliş hakkı kazandırır.
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
              >
                <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Randevu Al</span>
              </Link>
            </div>
          </div>
        )}
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
