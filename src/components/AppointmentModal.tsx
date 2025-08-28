'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Calendar, Clock, User, Scissors, Loader2, CheckCircle, ChevronLeft, ChevronRight, Star, Phone, Mail, UserCheck, ArrowRight } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string
}

interface Staff {
  id: string
  name: string
  specialty?: string
  photoUrl?: string
  rating?: number
  staffLeaves?: Array<{
    id: string
    startDate: string
    endDate: string
    startTime?: string
    endTime?: string
    type: 'FULL_DAY' | 'PARTIAL' | 'MULTI_DAY'
    status: 'APPROVED' | 'PENDING' | 'REJECTED'
  }>
}

interface TimeSlot {
  time: string
  available: boolean
}

interface Business {
  id: string
  name: string
  phone: string
  services: Service[]
  staff: Staff[]
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

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
  customizations?: {
    primaryColor?: string
    secondaryColor?: string
    gradientColors?: string
  }
}

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  business,
  customizations
}: AppointmentModalProps) {
  const { data: session } = useSession()
  
  // Tema renklerini al veya varsayılan değerleri kullan
  const themeColors = {
    primary: customizations?.primaryColor || '#2563eb',
    secondary: customizations?.secondaryColor || '#1d4ed8',
    gradient: customizations?.gradientColors || 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  }
  
  // Debug: Check if we received the business data correctly
  console.log('🔧 [AppointmentModal] Business data:', {
    id: business?.id,
    name: business?.name,
    servicesCount: business?.services?.length || 0,
    staffCount: business?.staff?.length || 0,
    servicesArray: business?.services,
    staffArray: business?.staff
  })
  
  // Early return if business data is not available
  if (!business) {
    console.warn('⚠️ [AppointmentModal] Business data not provided')
    return null
  }
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDates, setCalendarDates] = useState<Date[]>([])
  
  // Guest user information states
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  // Utility functions for appointment settings and staff availability
  const isStaffAvailable = (staff: Staff, date: Date, time?: string) => {
    if (!staff.staffLeaves) return true
    
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    return !staff.staffLeaves.some(leave => {
      if (leave.status !== 'APPROVED') return false
      
      const startDate = new Date(leave.startDate)
      const endDate = new Date(leave.endDate)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      
      const isWithinDateRange = checkDate >= startDate && checkDate <= endDate
      
      if (!isWithinDateRange) return false
      
      // If it's a partial day leave, check time overlap
      if (leave.type === 'PARTIAL' && time && leave.startTime && leave.endTime) {
        const [leaveStartHour, leaveStartMin] = leave.startTime.split(':').map(Number)
        const [leaveEndHour, leaveEndMin] = leave.endTime.split(':').map(Number)
        const [slotHour, slotMin] = time.split(':').map(Number)
        
        const leaveStartMinutes = leaveStartHour * 60 + leaveStartMin
        const leaveEndMinutes = leaveEndHour * 60 + leaveEndMin
        const slotMinutes = slotHour * 60 + slotMin
        
        // Check if slot time overlaps with leave time
        return slotMinutes >= leaveStartMinutes && slotMinutes < leaveEndMinutes
      }
      
      // Full day or multi-day leave
      return leave.type === 'FULL_DAY' || leave.type === 'MULTI_DAY'
    })
  }
  
  const getAppointmentSettings = () => {
    return business?.appointmentSettings || {
      slotDuration: 60,
      bufferTime: 15,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      allowSameDayBooking: true,
      maxDailyAppointments: 0,
      autoConfirmation: true
    }
  }
  
  const getWorkingHours = (dayOfWeek: number) => {
    if (!business?.workingHours) {
      return { isOpen: true, openTime: '09:00', closeTime: '18:00' }
    }
    
    const workingDay = business.workingHours.find(wh => wh.dayOfWeek === dayOfWeek)
    return workingDay || { isOpen: false, openTime: '09:00', closeTime: '18:00' }
  }

  // Modal açıldığında step'i sıfırla
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedService(null)
      setSelectedStaff(null)
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
      setSuccess(false)
      setCurrentMonth(new Date())
      
      // Guest user bilgilerini sıfırla
      setGuestName('')
      setGuestPhone('')
      setGuestEmail('')
    }
  }, [isOpen])

  // Takvim tarihlerini oluştur - Sınırsız ileri tarih
  useEffect(() => {
    generateCalendarDates()
  }, [currentMonth])

  // Tarih seçildiğinde müsait saatleri getir
  useEffect(() => {
    if (selectedDate && selectedService && selectedStaff) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService, selectedStaff])

  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    
    // Türkiye'de hafta Pazartesi ile başlar, bu yüzden Pazar = 0 ise 6, diğerleri -1
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 6 hafta göster (42 gün) - daha fazla tarih seçeneği
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(new Date(date))
    }
    
    setCalendarDates(dates)
  }

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        businessId: business?.id || '',
        date: selectedDate,
        serviceId: selectedService!.id,
        staffId: selectedStaff!.id
      })

      const response = await fetch(`/api/appointments/available-slots?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        // Filter out slots that conflict with staff leaves
        const filteredSlots = data.slots.map((slot: TimeSlot) => {
          if (!selectedStaff || !selectedStaff.staffLeaves) {
            return slot
          }
          
          const slotDate = new Date(selectedDate)
          const isSlotAvailable = isStaffAvailable(selectedStaff, slotDate, slot.time)
          
          return {
            ...slot,
            available: slot.available && isSlotAvailable
          }
        })
        
        setAvailableSlots(filteredSlots)
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async () => {
    // Eğer kullanıcı giriş yapmamışsa, kullanıcı bilgilerini kontrol et
    if (!session?.user) {
      if (!guestName.trim() || !guestPhone.trim()) {
        alert('Lütfen adınızı ve telefon numaranızı girin')
        return
      }
      
      // Telefon numara formatını kontrol et
      const phoneRegex = /^[+]?[0-9\s-()]{10,}$/
      if (!phoneRegex.test(guestPhone.trim())) {
        alert('Lütfen geçerli bir telefon numarası girin')
        return
      }
    }

    console.log('Creating appointment with data:', {
      selectedDate,
      selectedTime,
      businessId: business?.id,
      serviceId: selectedService?.id,
      staffId: selectedStaff?.id
    })

    setBookingLoading(true)
    try {
      const appointmentData = {
        businessId: business?.id || '',
        serviceId: selectedService!.id,
        staffId: selectedStaff!.id,
        appointmentDate: selectedDate, // YYYY-MM-DD format
        appointmentTime: selectedTime, // HH:MM format
        customerName: session?.user ? (session.user.name || 'İsimsiz Müşteri') : guestName.trim(),
        customerPhone: session?.user ? (session.user.phone || guestPhone.trim()) : guestPhone.trim(),
        customerEmail: session?.user ? (session.user.email || '') : (guestEmail.trim() || ''),
        totalPrice: selectedService!.price,
        duration: selectedService!.duration,
        notes: notes || ''
      }

      console.log('Sending appointment data:', appointmentData)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
      const result = await response.json()
      console.log('Appointment created successfully:', result)
      setSuccess(true)
      // Giriş yapmış kullanıcılar için step 5, giriş yapmamış için step 6
        setStep(session?.user ? 5 : 6)
      } else {
        const error = await response.json()
        console.error('Appointment creation failed:', error)
        alert(error.message || 'Randevu oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Create appointment error:', error)
      alert('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setBookingLoading(false)
    }
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  }

  const isDateSelectable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const settings = getAppointmentSettings()
    
    // Check if date is in the past
    if (date < today) return false
    
    // Check same day booking policy
    if (!settings.allowSameDayBooking && date.getTime() === today.getTime()) {
      return false
    }
    
    // Check minimum advance booking (in hours)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffInHours < settings.minAdvanceBooking) {
      return false
    }
    
    // Check maximum advance booking (in days)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + settings.maxAdvanceBooking)
    if (date > maxDate) return false
    
    // Check working hours for the day
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const workingHours = getWorkingHours(dayOfWeek)
    if (!workingHours.isOpen) return false
    
    // Check if selected staff is available (if staff is selected)
    if (selectedStaff && !isStaffAvailable(selectedStaff, date)) {
      return false
    }
    
    return true
  }

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear()
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Elegant Header */}
        <div 
          className="relative p-8 text-white"
          style={{ background: themeColors.gradient }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Randevu Planlayın</h2>
              <p className="text-blue-100 text-lg">{business?.name || 'İşletme'}</p>
              <div className="flex items-center mt-3 space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Hızlı & Kolay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Anında Onay</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Elegant Progress Bar */}
        <div className="px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            {[
              { num: 1, label: 'Hizmet', icon: Scissors },
              { num: 2, label: 'Uzman', icon: User },
              { num: 3, label: 'Tarih', icon: Calendar },
              { num: 4, label: session?.user ? 'Saat' : 'Bilgiler', icon: session?.user ? Clock : UserCheck },
              ...((!session?.user) ? [{ num: 5, label: 'Saat', icon: Clock }] : [])
            ].map(({ num, label, icon: Icon }, index) => (
              <div key={num} className="flex items-center">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= num 
                    ? 'text-white shadow-lg transform scale-110' 
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
                  style={step >= num ? { background: themeColors.gradient } : {}}
                >
                  <Icon className="w-5 h-5" />
                  {step > num && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step >= num ? 'text-gray-900' : 'text-gray-500'
                  }`}>{label}</p>
                </div>
                {index < ((!session?.user) ? 4 : 3) && (
                  <div 
                    className={`hidden sm:block w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                      step > num ? '' : 'bg-gray-200'
                    }`}
                    style={step > num ? { background: themeColors.gradient } : {}}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          
          {/* Step 1: Premium Service Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  Hangi hizmeti alacaksınız?
                </h3>
                <p className="text-gray-600">Size en uygun hizmeti seçin</p>
              </div>
              
              <div className="grid gap-4">
                {(business?.services || []).map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep(2)
                    }}
                    className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      selectedService?.id === service.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                    style={selectedService?.id === service.id ? { 
                      borderColor: themeColors.primary, 
                      background: `linear-gradient(to right, ${themeColors.primary}10, ${themeColors.secondary}10)` 
                    } : {}}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                            style={{ background: themeColors.gradient }}
                          >
                            {service.name.charAt(0)}
                          </div>
                          <div>
                            <h4 
                              className="text-xl font-bold text-gray-900 transition-colors"
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.color = themeColors.primary
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.color = '#111827' // text-gray-900
                              }}
                            >
                              {service.name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration} dk</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                          {service.price}₺
                        </div>
                        <p className="text-xs text-gray-500 mt-2">KDV Dahil</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Expert Staff Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  Uzmanınızı seçin
                </h3>
                <p className="text-gray-600">Deneyimli uzmanlarımızdan birini seçin</p>
              </div>
              
              <div className="grid gap-4">
                {(business?.staff || []).map((member) => {
                  const hasActiveLeaves = member.staffLeaves?.some(leave => {
                    if (leave.status !== 'APPROVED') return false
                    const now = new Date()
                    const startDate = new Date(leave.startDate)
                    const endDate = new Date(leave.endDate)
                    return now >= startDate && now <= endDate
                  })
                  
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedStaff(member)
                        setStep(3)
                      }}
                      className="group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 hover:border-blue-300 bg-white"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg">
                            {member.photoUrl ? (
                              <img 
                                src={member.photoUrl} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                            hasActiveLeaves ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 
                            className="text-xl font-bold text-gray-900 transition-colors"
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = themeColors.primary
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = '#111827' // text-gray-900
                            }}
                          >
                            {member.name}
                          </h4>
                          {member.specialty && (
                            <p className="text-gray-600 text-sm mt-1">{member.specialty}</p>
                          )}
                          {hasActiveLeaves && (
                            <p className="text-orange-600 text-xs mt-1 font-medium">
                              ⚠️ Şu anda izinli (kısmi erişilebilir)
                            </p>
                          )}
                          {member.rating && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex">
                                {renderStars(Math.floor(member.rating))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{member.rating}</span>
                              <span className="text-xs text-gray-500">(128 değerlendirme)</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            hasActiveLeaves 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {hasActiveLeaves ? 'Kısmi Müsait' : 'Müsait'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri Dön</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Professional Calendar */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  Uygun tarihinizi seçin
                </h3>
                <p className="text-gray-600">Müsait olan tarihlerden birini seçin</p>
              </div>

              {/* Hızlı Tarih Seçimi Kısayolları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Bugün', days: 0 },
                  { label: 'Yarın', days: 1 },
                  { label: 'Gelecek Hafta', days: 7 },
                  { label: 'Gelecek Ay', days: 30 }
                ].map((shortcut) => {
                  const shortcutDate = new Date()
                  shortcutDate.setDate(shortcutDate.getDate() + shortcut.days)
                  const isShortcutSelectable = isDateSelectable(shortcutDate)
                  
                  return (
                    <button
                      key={shortcut.label}
                      onClick={() => {
                        if (isShortcutSelectable) {
                          const shortcutDate = new Date()
                          shortcutDate.setDate(shortcutDate.getDate() + shortcut.days)
                          
                          // Türkiye saat diliminde tarih formatı oluştur
                          const year = shortcutDate.getFullYear()
                          const month = String(shortcutDate.getMonth() + 1).padStart(2, '0')
                          const day = String(shortcutDate.getDate()).padStart(2, '0')
                          const dateString = `${year}-${month}-${day}`
                          
                          setCurrentMonth(new Date(shortcutDate.getFullYear(), shortcutDate.getMonth()))
                          setSelectedDate(dateString)
                          // Giriş yapmış kullanıcılar saat seçimine (4), giriş yapmamış bilgi alma (4) adımına git
                        setStep(session?.user ? 4 : 4) // Her iki durumda da 4'e git ama anlamları farklı
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (isShortcutSelectable) {
                          (e.target as HTMLElement).style.backgroundColor = `${themeColors.primary}30`
                          ;(e.target as HTMLElement).style.transform = 'scale(1.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isShortcutSelectable) {
                          (e.target as HTMLElement).style.backgroundColor = `${themeColors.primary}10`
                          ;(e.target as HTMLElement).style.transform = 'scale(1)'
                        }
                      }}
                      disabled={!isShortcutSelectable}
                      className={`p-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isShortcutSelectable
                          ? 'hover:scale-105'
                          : 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                      style={isShortcutSelectable ? {
                        color: themeColors.primary,
                        backgroundColor: `${themeColors.primary}10`
                      } : {}}
                    >
                      <div>{shortcut.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {shortcutDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                      {!isShortcutSelectable && shortcut.days === 0 && !getAppointmentSettings().allowSameDayBooking && (
                        <div className="text-xs text-red-500 mt-1">
                          Aynı gün randevu kapalı
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Calendar Header - Geliştirilmiş Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                    const today = new Date()
                    // Sadece bugünkü aydan öncesine gitmeyi engelle
                    if (prevMonth.getFullYear() > today.getFullYear() || 
                        (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() >= today.getMonth())) {
                      setCurrentMonth(prevMonth)
                    }
                  }}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2 text-gray-700"
                  disabled={(() => {
                    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                    const today = new Date()
                    return prevMonth.getFullYear() < today.getFullYear() || 
                           (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() < today.getMonth())
                  })()}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium text-gray-700">Önceki Ay</span>
                </button>
                
                <h4 className="text-xl font-bold text-gray-900">
                  {formatMonthYear(currentMonth)}
                </h4>
                
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center space-x-2 text-gray-700"
                >
                  <span className="text-sm font-medium text-gray-700">Sonraki Ay</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid - 6 hafta (42 gün) */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {calendarDates.map((date, index) => {
                  const isSelectable = isDateSelectable(date)
                  const isSelected = selectedDate === (() => {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}-${month}-${day}`
                  })()
                  const isCurrentMonth = isDateInCurrentMonth(date)
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isSelectable) {
                          // Türkiye saat diliminde tarih formatı oluştur (YYYY-MM-DD)
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          const dateString = `${year}-${month}-${day}`
                          setSelectedDate(dateString)
                          // Giriş yapmış kullanıcılar saat seçimine (4), giriş yapmamış bilgi alma (4) adımına git
                          setStep(4)
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (isSelectable && !isSelected) {
                          (e.target as HTMLElement).style.backgroundColor = `${themeColors.primary}20`
                          ;(e.target as HTMLElement).style.color = themeColors.primary
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isSelectable && !isSelected) {
                          if (isToday) {
                            (e.target as HTMLElement).style.backgroundColor = `${themeColors.primary}20`
                            ;(e.target as HTMLElement).style.color = themeColors.primary
                          } else {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent'
                            ;(e.target as HTMLElement).style.color = isCurrentMonth ? '#111827' : '#9ca3af' // text-gray-900 : text-gray-400
                          }
                        }
                      }}
                      disabled={!isSelectable}
                      className={`aspect-square p-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                        isSelected
                          ? 'text-white shadow-lg transform scale-105'
                          : isSelectable
                          ? 'text-gray-900 hover:text-gray-700'
                          : 'text-gray-300 cursor-not-allowed'
                      } ${
                        !isCurrentMonth && isSelectable ? 'text-gray-400' : ''
                      } ${
                        isToday && !isSelected ? 'font-bold' : ''
                      }`}
                      style={isSelected ? { background: themeColors.gradient } : 
                        isToday && !isSelected ? {
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary
                        } : {}}
                    >
                      {date.getDate()}
                      {isToday && !isSelected && (
                        <div 
                          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ backgroundColor: themeColors.primary }}
                        ></div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri Dön</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Guest Information (if not logged in) */}
          {step === 4 && !session?.user && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  İletişim Bilgileriniz
                </h3>
                <p className="text-gray-600">Randevu onayı için iletişim bilgilerinizi girin</p>
              </div>

              <div 
                className="rounded-2xl p-6 mb-6"
                style={{ background: `linear-gradient(to right, ${themeColors.primary}10, ${themeColors.secondary}10)` }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Adınızı ve soyadınızı girin"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      style={{ 
                        outlineColor: themeColors.primary + '80'
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon Numarası <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      style={{ 
                        outlineColor: themeColors.primary + '80'
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta (Opsiyonel)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      style={{ 
                        outlineColor: themeColors.primary + '80'
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              {/* Elegant Summary for guest users */}
              <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">Randevu Özeti</h4>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hizmet</p>
                      <p className="font-semibold text-gray-900">{selectedService?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Uzman</p>
                      <p className="font-semibold text-gray-900">{selectedStaff?.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tarih & Saat</p>
                      <p className="font-semibold text-gray-900">
                        {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long'
                        })} - {selectedTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Süre & Ücret</p>
                      <p className="font-semibold text-gray-900">{selectedService?.duration} dk - {selectedService?.price}₺</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setStep(3)} // Bilgi adımından tarih seçimine dön
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Geri Dön</span>
                </button>
                
                <button
                  onClick={() => setStep(5)} // Bilgi alındıktan sonra saat seçimine git
                  disabled={!guestName.trim() || !guestPhone.trim()}
                  className="group text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                  style={{ background: themeColors.gradient }}
                >
                  <ArrowRight className="w-6 h-6" />
                  <span>Devam Et</span>
                </button>
              </div>
            </div>
          )}

          {/* Time Selection Step - Step 4 for logged-in users, Step 5 for guest users */}
          {((step === 4 && session?.user) || (step === 5 && !session?.user)) && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.primary }}
                >
                  Müsait saatinizi seçin
                </h3>
                <p className="text-gray-600">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })} - {selectedStaff?.name}
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600 font-medium">Müsait saatler kontrol ediliyor...</p>
                </div>
              ) : (
                <>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          onMouseEnter={(e) => {
                            if (slot.available && selectedTime !== slot.time) {
                              (e.target as HTMLElement).style.borderColor = themeColors.primary
                              ;(e.target as HTMLElement).style.backgroundColor = `${themeColors.primary}20`
                              ;(e.target as HTMLElement).style.color = themeColors.primary
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (slot.available && selectedTime !== slot.time) {
                              (e.target as HTMLElement).style.borderColor = '#e5e7eb' // border-gray-200
                              ;(e.target as HTMLElement).style.backgroundColor = 'white'
                              ;(e.target as HTMLElement).style.color = '#111827' // text-gray-900
                            }
                          }}
                          className={`group p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                            selectedTime === slot.time
                              ? 'text-white shadow-lg transform scale-105'
                              : slot.available
                              ? 'border-gray-200 text-gray-900'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                          style={selectedTime === slot.time ? {
                            borderColor: themeColors.primary,
                            background: themeColors.gradient
                          } : {}}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold">{slot.time}</div>
                            {slot.available && (
                              <div className="text-xs mt-1 opacity-75">
                                {selectedTime === slot.time ? 'Seçili' : 'Müsait'}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Müsait saat yok</h4>
                      <p className="text-gray-600">Bu tarih için müsait saat bulunmuyor. Lütfen başka bir tarih seçin.</p>
                    </div>
                  )}

                  {/* Notes Section */}
                  {selectedTime && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Eklemek istediğiniz not var mı?</h4>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Özel isteklerinizi, tercihlerinizi veya notlarınızı buraya yazabilirsiniz..."
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                        style={{ 
                          outlineColor: themeColors.primary + '80'
                        } as React.CSSProperties}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Elegant Summary */}
                  {selectedTime && (
                    <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900">Randevu Özeti</h4>
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Hizmet</p>
                            <p className="font-semibold text-gray-900">{selectedService?.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Uzman</p>
                            <p className="font-semibold text-gray-900">{selectedStaff?.name}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Tarih & Saat</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('tr-TR', { 
                                day: 'numeric', 
                                month: 'long'
                              })} - {selectedTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Süre & Ücret</p>
                            <p className="font-semibold text-gray-900">{selectedService?.duration} dk - {selectedService?.price}₺</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => {
                        // Giriş yapmış kullanıcılar için step 3'e (tarih), giriş yapmamış için step 4'e (bilgi) git
                        setStep(session?.user ? 3 : 4)
                      }}
                      className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Geri Dön</span>
                    </button>
                    
                    {selectedTime && (
                      <button
                        onClick={handleBookAppointment}
                        disabled={bookingLoading}
                        className="group text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                        style={{ background: themeColors.gradient }}
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Randevu Oluşturuluyor...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            <span>Randevuyu Onayla</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Success Celebration - Final Step */}
          {((step === 5 && success && session?.user) || (step === 6 && success && !session?.user)) && (
            <div className="text-center py-12">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-100 rounded-full -z-10 animate-ping"></div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Randevunuz Oluşturuldu!
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-700 text-lg mb-4">
                  Randevunuz başarıyla kaydedildi. Yaklaşan randevu saatinizde size hatırlatma mesajı gönderilecektir.
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Tarih:</strong> {new Date(selectedDate + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p><strong>Saat:</strong> {selectedTime}</p>
                  <p><strong>Uzman:</strong> {selectedStaff?.name}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-white py-4 px-12 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ background: themeColors.gradient }}
              >
                Mükemmel! 🚀
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
