'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Calendar, Clock, Star, Phone, MapPin, Bot, User, Sparkles, CheckCircle, HeadphonesIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  buttons?: Array<{
    text: string
    action: string
    data?: any
  }>
  calendar?: boolean
  timeSlots?: string[]
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Staff {
  id: string
  name: string
  specialty?: string
  photoUrl?: string
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

interface BusinessData {
  id: string
  name: string
  sector: string
  phone: string
  address: string
  services: Service[]
  staff: Staff[]
  workingHours: Array<{
    dayOfWeek: number // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    openTime: string
    closeTime: string
    isOpen: boolean
  }>
  appointmentSettings?: {
    slotDuration: number
    bufferTime: number
    maxAdvanceBooking: number
    minAdvanceBooking: number
    allowSameDayBooking: boolean
    maxDailyAppointments: number
    autoConfirmation: boolean
  }
  avgRating: number
  reviewCount: number
  websiteConfig?: {
    primaryColor?: string
    secondaryColor?: string
    gradientColors?: string
  }
}

interface AIChatWidgetProps {
  businessData: BusinessData
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ businessData }) => {
  // İşletmenin renk teemasını al
  const primaryColor = businessData.websiteConfig?.primaryColor || '#2563eb'
  const secondaryColor = businessData.websiteConfig?.secondaryColor || '#1d4ed8'
  const gradientColors = businessData.websiteConfig?.gradientColors || 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  
  // Hex renkleri RGB'ye çevir (Tailwind için)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 99, b: 235 }
  }
  
  const primaryRgb = hexToRgb(primaryColor)
  const secondaryRgb = hexToRgb(secondaryColor)
  
  const [isOpen, setIsOpen] = useState(true) // İlk açılışta açık olsun
  const [isMinimized, setIsMinimized] = useState(false) // Minimize durumu
  const [isVisible, setIsVisible] = useState(true) // Tamamen gizleme durumu
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${businessData.name} müşteri hizmetlerine hoş geldiniz! Ben size yardımcı olacak dijital asistanınızım. Size nasıl yardımcı olabilirim?`,
      isUser: false,
      timestamp: new Date(),
      buttons: [
        { text: '🎯 Randevu Almak İstiyorum', action: 'start_appointment' },
        { text: '💎 Hizmet ve Fiyat Bilgisi', action: 'prices' },
        { text: '📍 Konum ve Ulaşım', action: 'location' },
        { text: '⏰ Çalışma Saatleri', action: 'hours' }
      ]
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  // Randevu state'leri
  const [appointmentStep, setAppointmentStep] = useState(0) // 0: başlangıç, 1: hizmet, 2: isim, 3: telefon, 4: personel, 5: tarih, 6: saat, 7: not, 8: onay
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
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
    return businessData?.appointmentSettings || {
      slotDuration: 30,
      bufferTime: 0,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 2,
      allowSameDayBooking: true,
      maxDailyAppointments: 0,
      autoConfirmation: true
    }
  }
  
  const getWorkingHours = (dayOfWeek: number) => {
    if (!businessData?.workingHours) {
      return { isOpen: true, openTime: '09:00', closeTime: '18:00' }
    }
    
    const workingDay = businessData.workingHours.find(wh => wh.dayOfWeek === dayOfWeek)
    return workingDay || { isOpen: false, openTime: '09:00', closeTime: '18:00' }
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (text: string, isUser: boolean, buttons?: Message['buttons'], calendar?: boolean, timeSlots?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      buttons,
      calendar,
      timeSlots
    }
    setMessages(prev => [...prev, newMessage])
  }

  const generateAvailableSlots = async (date: string) => {
    // İşletmenin çalışma saatlerini al
    const [year, month, day] = date.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day)
    const dayOfWeek = selectedDate.getDay() // 0=Pazar, 1=Pazartesi
    
    // Randevu ayarlarını al
    const settings = getAppointmentSettings()
    
    // Çalışma saatlerini kontrol et
    const workingHour = getWorkingHours(dayOfWeek)
    
    console.log('Date slot generation:', {
      date,
      dayOfWeek,
      workingHour,
      settings,
      selectedStaff: selectedStaff?.name
    })
    
    if (!workingHour.isOpen) {
      console.log('Business is closed on this day')
      return [] // Kapalı gün
    }
    
    // Seçili personelin o gün tamamen izinli olup olmadığını kontrol et
    if (selectedStaff && !isStaffAvailable(selectedStaff, selectedDate)) {
      console.log('Selected staff is not available on this day')
      return [] // Personel izinli
    }
    
    const slots = []
    const [openHour, openMinute] = workingHour.openTime.split(':').map(Number)
    const [closeHour, closeMinute] = workingHour.closeTime.split(':').map(Number)
    const slotDuration = settings.slotDuration || 30 // dakika
    const bufferTime = settings.bufferTime || 0 // dakika
    
    // Bugün mü kontrolü
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    const isToday = selectedDate.getTime() === today.getTime()
    
    // Eğer bugünse, şu anki saatten sonraki slotları göster
    let startHour = openHour
    let startMinute = openMinute
    
    if (isToday) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      console.log('Today slot calculation:', {
        currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
        openTime: `${openHour}:${openMinute.toString().padStart(2, '0')}`,
        minStartTime: currentHour * 60 + currentMinute + 30
      })
      
      // Şu anki saatten 30 dakika sonrasını başlangıç yap (hazırlık süresi)
      const minStartTime = currentHour * 60 + currentMinute + 30
      const openTime = openHour * 60 + openMinute
      
      if (minStartTime > openTime) {
        // Bir sonraki 30dk slot'unu bul
        const nextSlotMinutes = Math.ceil(minStartTime / 30) * 30
        startHour = Math.floor(nextSlotMinutes / 60)
        startMinute = nextSlotMinutes % 60
        
        console.log('Adjusted start time:', `${startHour}:${startMinute.toString().padStart(2, '0')}`)
      }
    }
    
    // Açılış saatinden kapanış saatine kadar belirlenen aralıklarla slot oluştur
    let currentHour = startHour
    let currentMinute = startMinute
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      // Son randevu hizmet süresini + buffer time'ı tamamlayabilecek saatte olmalı
      const serviceEndTime = currentHour * 60 + currentMinute + (selectedService?.duration || 30) + bufferTime
      const closeTime = closeHour * 60 + closeMinute
      
      if (serviceEndTime <= closeTime) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        
        // Personel izin kontrolü (kısmi izin için)
        const isSlotAvailable = selectedStaff ? isStaffAvailable(selectedStaff, selectedDate, timeString) : true
        
        slots.push({ time: timeString, available: isSlotAvailable })
      }
      
      // Belirlenen süre kadar ekle (varsayılan 30 dakika)
      currentMinute += slotDuration
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60)
        currentMinute = currentMinute % 60
      }
    }
    
    // Dolu saatleri API'den al
    try {
      const response = await fetch(`/api/appointments/availability?businessId=${businessData.id}&date=${date}&staffId=${selectedStaff?.id || ''}`, {
        method: 'GET'
      })
      
      if (response.ok) {
        const { bookedSlots } = await response.json()
        
        // Dolu saatleri pasif yap
        slots.forEach(slot => {
          if (bookedSlots.includes(slot.time)) {
            slot.available = false
          }
        })
      }
    } catch (error) {
      console.error('Availability check error:', error)
    }
    
    return slots
  }

  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Ayın ilk günü ve son günü
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Ayın ilk gününün haftanın hangi günü olduğunu bul (0=Pazar, 1=Pazartesi)
    const firstDayOfWeek = firstDay.getDay()
    
    // Takvim grid'i için günleri oluştur
    const calendarDates = []
    
    // Önceki ayın son günlerini ekle (grid'i tamamlamak için)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      calendarDates.push({ date, isCurrentMonth: false, isToday: false, isPast: true, isDisabled: true })
    }
    
    // Mevcut ayın günlerini ekle
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Sadece tarihi karşılaştır
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0) // Sadece tarihi karşılaştır
      
      const isToday = date.getTime() === today.getTime()
      const isPast = date.getTime() < today.getTime()
      
      calendarDates.push({ 
        date, 
        isCurrentMonth: true, 
        isToday, 
        isPast,
        isDisabled: isPast
      })
    }
    
    // Sonraki ayın ilk günlerini ekle (grid'i 42'ye tamamlamak için)
    const remainingSlots = 42 - calendarDates.length
    for (let day = 1; day <= remainingSlots; day++) {
      const date = new Date(year, month + 1, day)
      calendarDates.push({ date, isCurrentMonth: false, isToday: false, isPast: false, isDisabled: false })
    }
    
    return calendarDates
  }
  
  const isDateAvailable = (date: Date) => {
    return isDateSelectable(date)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateLong = (dateString: string) => {
    // YYYY-MM-DD formatındaki string'i Date object'e çevir
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month 0-indexed
    
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const handleButtonClick = (action: string, data?: any) => {
    setIsTyping(true)
    
    setTimeout(() => {
      switch (action) {
        case 'start_appointment':
          addMessage('Randevu almak istiyorum', true)
          setAppointmentStep(1)
          setTimeout(() => {
            addMessage(
              `Mükemmel! ${businessData.name} için randevu alalım. İlk olarak hangi hizmetimizi tercih edersiniz?`,
              false,
              businessData.services.slice(0, 6).map(service => ({
                text: `${service.name} - ${service.price}₺ (${service.duration}dk)`,
                action: 'select_service',
                data: service
              }))
            )
            setIsTyping(false)
          }, 1000)
          break

        case 'select_service':
          setSelectedService(data)
          addMessage(`${data.name} seçiyorum`, true)
          setAppointmentStep(2)
          setTimeout(() => {
            addMessage(
              `✅ ${data.name} seçildi!\n\nŞimdi sizinle nasıl ilgilenebileceğimizi bilmek için isminizi öğrenebilir miyim?`,
              false
            )
            setIsTyping(false)
          }, 1000)
          break

        case 'select_staff':
          setSelectedStaff(data)
          addMessage(`${data.name} ile randevu almak istiyorum`, true)
          setAppointmentStep(5)
          setTimeout(() => {
            addMessage(
              `✅ ${data.name} seçildi!\n\nHangi tarihte randevunuz olsun? Aşağıdaki günlerden birini seçin:`,
              false,
              [],
              true
            )
            setIsTyping(false)
          }, 1000)
          break

        case 'select_date':
          setSelectedDate(data)
          addMessage(`${formatDateLong(data)} tarihini seçiyorum`, true)
          setAppointmentStep(6)
          setTimeout(async () => {
            const availableSlots = await generateAvailableSlots(data)
            if (availableSlots.length === 0) {
              addMessage(
                `❌ ${formatDateLong(data)} tarihinde maalesef müsait saatimiz bulunmuyor. Lütfen başka bir tarih seçin veya bizi arayın.`,
                false,
                [
                  { text: '📅 Başka Tarih Seç', action: 'select_date_again' },
                  { text: '📞 Telefon ile Ara', action: 'call' }
                ]
              )
            } else {
              addMessage(
                `📅 ${formatDateLong(data)} için müsait saatlerimiz:`,
                false,
                [],
                false,
                availableSlots.filter(slot => slot.available).map(slot => slot.time)
              )
            }
            setIsTyping(false)
          }, 1000)
          break

        case 'select_time':
          setSelectedTime(data)
          addMessage(`Saat ${data}'da randevu almak istiyorum`, true)
          setAppointmentStep(7)
          setTimeout(() => {
            addMessage(
              `⏰ Saat ${data} seçildi!\n\nRandevunuz için özel bir notunuz var mı? (İsteğe bağlı)`,
              false,
              [
                { text: '✍️ Not Ekleyeceğim', action: 'add_notes' },
                { text: '✅ Notum Yok, Devam Et', action: 'skip_notes' }
              ]
            )
            setIsTyping(false)
          }, 1000)
          break

        case 'add_notes':
          addMessage('Not ekleyeceğim', true)
          setTimeout(() => {
            addMessage(
              'Lütfen notunuzu yazın:',
              false
            )
            setIsTyping(false)
          }, 500)
          break

        case 'skip_notes':
          addMessage('Notum yok, devam edelim', true)
          setAppointmentStep(8)
          setTimeout(() => {
            showAppointmentSummary()
            setIsTyping(false)
          }, 1000)
          break

        case 'confirm_appointment':
          addMessage('Randevumu onaylıyorum', true)
          setTimeout(() => {
            createAppointment()
            setIsTyping(false)
          }, 1000)
          break

        case 'select_date_again':
          addMessage('Başka bir tarih seçeceğim', true)
          setAppointmentStep(5)
          setTimeout(() => {
            addMessage(
              'Hangi tarihte randevunuz olsun? Aşağıdaki günlerden birini seçin:',
              false,
              [],
              true
            )
            setIsTyping(false)
          }, 1000)
          break

        case 'cancel_appointment':
          addMessage('Randevumu iptal etmek istiyorum', true)
          resetAppointment()
          setTimeout(() => {
            addMessage(
              'Randevu işlemi iptal edildi. Başka bir konuda yardımcı olabilir miyim?',
              false,
              [
                { text: '🎯 Yeni Randevu Al', action: 'start_appointment' },
                { text: '💎 Hizmet Bilgisi', action: 'prices' }
              ]
            )
            setIsTyping(false)
          }, 1000)
          break

        // Diğer aksiyonlar (prices, location, hours) aynı kalacak
        case 'prices':
          addMessage('Hizmet fiyatlarınızı öğrenmek istiyorum', true)
          setTimeout(() => {
            const priceList = businessData.services
              .slice(0, 6)
              .map(s => `• ${s.name}: ${s.price}₺ (${s.duration} dakika)`)
              .join('\n')
            addMessage(
              `💎 **${businessData.name} Hizmet Fiyat Listesi**\n\n${priceList}\n\n📞 Randevu almak ister misiniz?`,
              false,
              [
                { text: '📅 Hemen Randevu Al', action: 'start_appointment' },
                { text: '📞 Telefon ile Görüş', action: 'call' }
              ]
            )
            setIsTyping(false)
          }, 1500)
          break

        case 'location':
          addMessage('Konum ve adres bilgilerini istiyorum', true)
          setTimeout(() => {
            addMessage(
              `📍 **${businessData.name} Adres Bilgileri**\n\n🏢 Adres: ${businessData.address}\n📞 Telefon: ${businessData.phone}\n⭐ Değerlendirme: ${businessData.avgRating.toFixed(1)}/5 (${businessData.reviewCount} yorum)\n\n🗺️ Yol tarifi için Google Maps'i kullanabilirsiniz.`,
              false,
              [
                { text: '🗺️ Google Maps ile Yol Tarifi', action: 'directions' },
                { text: '📞 Telefon ile Ara', action: 'call' }
              ]
            )
            setIsTyping(false)
          }, 1300)
          break

        case 'hours':
          addMessage('Çalışma saatlerinizi öğrenmek istiyorum', true)
          setTimeout(() => {
            const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
            const workingHours = businessData.workingHours
              .map(wh => `• ${dayNames[wh.dayOfWeek]}: ${!wh.isOpen ? '❌ Kapalı' : `✅ ${wh.openTime} - ${wh.closeTime}`}`)
              .join('\n')
            addMessage(
              `⏰ **${businessData.name} Çalışma Saatleri**\n\n${workingHours}\n\n📅 Uygun bir zamanda randevu almak ister misiniz?`,
              false,
              [
                { text: '📅 Randevu Al', action: 'start_appointment' },
                { text: '📞 Telefon ile Bilgi Al', action: 'call' }
              ]
            )
            setIsTyping(false)
          }, 1400)
          break

        case 'call':
          window.open(`tel:${businessData.phone}`, '_self')
          setIsTyping(false)
          break
          
        case 'directions':
          const address = encodeURIComponent(businessData.address)
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
          setIsTyping(false)
          break
          
        case 'prev_month':
          const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
          setCurrentMonth(prevMonth)
          setIsTyping(false)
          break
          
        case 'next_month':
          const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
          setCurrentMonth(nextMonth)
          setIsTyping(false)
          break

        default:
          setIsTyping(false)
          break
      }
    }, 800)
  }

  const showAppointmentSummary = () => {
    const summary = `🎉 **Randevu Özeti**\n\n👤 **Müşteri:** ${customerName}\n📞 **Telefon:** ${customerPhone}\n✂️ **Hizmet:** ${selectedService?.name} (${selectedService?.price}₺)\n👨‍💼 **Personel:** ${selectedStaff?.name}\n📅 **Tarih:** ${formatDateLong(selectedDate)}\n⏰ **Saat:** ${selectedTime}\n📝 **Not:** ${appointmentNotes || 'Yok'}\n\n✅ Randevunuzu onaylıyor musunuz?`
    
    addMessage(
      summary,
      false,
      [
        { text: '✅ Onayla ve Randevuyu Al', action: 'confirm_appointment' },
        { text: '❌ İptal Et', action: 'cancel_appointment' }
      ]
    )
  }

  const createAppointment = async () => {
    setIsTyping(true)
    
    try {
      // API çağrısı yapacağız
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessData.id,
          serviceId: selectedService?.id,
          staffId: selectedStaff?.id,
          customerName,
          customerPhone,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes: appointmentNotes,
          totalPrice: selectedService?.price,
          duration: selectedService?.duration
        })
      })

      if (response.ok) {
        const result = await response.json()
        addMessage(
          `🎉 **Randevunuz Başarıyla Oluşturuldu!**\n\nRandevu No: #${result.appointmentId || '12345'}\n\n📱 Size SMS ile onay mesajı gönderilecek\n📞 Randevu saatinden 1 saat önce hatırlatma arayacağız\n\n✨ ${businessData.name} olarak size hizmet etmek için sabırsızlanıyoruz!`,
          false,
          [
            { text: '🏠 Ana Sayfaya Dön', action: 'reset' },
            { text: '📞 İşletmeyi Ara', action: 'call' }
          ]
        )
      } else {
        addMessage(
          '❌ Randevu oluşturulurken bir hata oluştu. Lütfen telefon ile iletişime geçin.',
          false,
          [{ text: '📞 Telefon ile Ara', action: 'call' }]
        )
      }
    } catch (error) {
      console.error('Appointment creation error:', error)
      addMessage(
        '❌ Bağlantı hatası. Lütfen telefon ile iletişime geçin.',
        false,
        [{ text: '📞 Telefon ile Ara', action: 'call' }]
      )
    }
    
    resetAppointment()
    setIsTyping(false)
  }

  const resetAppointment = () => {
    setAppointmentStep(0)
    setSelectedService(null)
    setCustomerName('')
    setCustomerPhone('')
    setSelectedStaff(null)
    setSelectedDate('')
    setSelectedTime('')
    setAppointmentNotes('')
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    addMessage(text, true)
    setInputText('')
    setIsTyping(true)

    // Randevu adımlarını kontrol et
    if (appointmentStep === 2) { // İsim toplama
      setCustomerName(text)
      setAppointmentStep(3)
      setTimeout(() => {
        addMessage(
          `Merhaba ${text}! Randevunuz için telefon numaranızı alabilir miyim?`,
          false
        )
        setIsTyping(false)
      }, 1000)
      return
    }

    if (appointmentStep === 3) { // Telefon toplama
      const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/
      if (phoneRegex.test(text.replace(/\s/g, ''))) {
        setCustomerPhone(text)
        setAppointmentStep(4)
        setTimeout(() => {
          addMessage(
            `📱 Telefon numaranız kaydedildi: ${text}\n\nŞimdi hangi personelimizle randevunuz olsun?`,
            false,
            businessData.staff.slice(0, 4).map(staff => {
              const hasActiveLeaves = staff.staffLeaves?.some(leave => {
                if (leave.status !== 'APPROVED') return false
                const now = new Date()
                const startDate = new Date(leave.startDate)
                const endDate = new Date(leave.endDate)
                return now >= startDate && now <= endDate
              })
              
              return {
                text: `${staff.name}${staff.specialty ? ` (${staff.specialty})` : ''}${hasActiveLeaves ? ' ⚠️ Kısmi İzinli' : ''}`,
                action: 'select_staff',
                data: staff
              }
            })
          )
          setIsTyping(false)
        }, 1000)
        return
      } else {
        setTimeout(() => {
          addMessage(
            'Lütfen geçerli bir telefon numarası giriniz. Örnek: 0532 123 45 67',
            false
          )
          setIsTyping(false)
        }, 1000)
        return
      }
    }

    if (appointmentStep === 7) { // Not ekleme
      setAppointmentNotes(text)
      setAppointmentStep(8)
      setTimeout(() => {
        showAppointmentSummary()
        setIsTyping(false)
      }, 1000)
      return
    }

    // Genel AI yanıtları
    setTimeout(() => {
      let response = 'Size nasıl yardımcı olabilirim?'
      const lowerText = text.toLowerCase()

      if (lowerText.includes('randevu')) {
        response = 'Randevu almak için size yardımcı olabilirim!'
      } else if (lowerText.includes('fiyat')) {
        response = 'Hizmet fiyatlarımızı öğrenmek ister misiniz?'
      }

      addMessage(response, false, [
        { text: '📅 Randevu Al', action: 'start_appointment' },
        { text: '💎 Fiyatlar', action: 'prices' }
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* AI Assistant Widget - Conditional Rendering */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Minimized Chat Button */}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-white p-4 md:p-5 rounded-full shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 20px 40px -12px ${primaryColor}60`
              }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 animate-pulse"></div>
              
              {/* Bot Icon with Animation */}
              <div className="relative">
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              </div>
              
              {/* Floating Effect */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/40 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            </button>
          )}

          {/* Full Chat Window */}
          {isOpen && (
            <div className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-500 transform ${
              isMinimized ? 'w-80 md:w-96 h-16' : 'w-80 md:w-96 h-[500px] md:h-[600px]'
            }`}>
              {/* Header - Always Visible */}
              <div 
                className="text-white p-4 md:p-4 relative cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                }}
                onClick={() => isMinimized && setIsMinimized(false)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <HeadphonesIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm md:text-base">AI Asistan</h3>
                      <p className="text-xs opacity-90 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                        {businessData.name} • Aktif
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Minimize Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsMinimized(!isMinimized)
                      }}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    {/* Hide Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsVisible(false)
                      }}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages - Hidden when minimized */}
              {!isMinimized && (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.isUser ? 'ml-8' : 'mr-8'}`}>
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">Randevu Asistanı</span>
                    </div>
                  )}
                  
                  <div
                    className={`p-4 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-white text-gray-800 shadow-md border border-gray-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.text}</p>
                    
                    {/* Calendar */}
                    {message.calendar && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => handleButtonClick('prev_month')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold text-gray-800">
                            {currentMonth.toLocaleDateString('tr-TR', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </h3>
                          <button
                            onClick={() => handleButtonClick('next_month')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Days of Week */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDates().map((dateInfo, index) => {
                            const isAvailable = dateInfo.isCurrentMonth ? isDateAvailable(dateInfo.date) : false
                            const isSelectable = dateInfo.isCurrentMonth && !dateInfo.isDisabled && isAvailable
                            // Timezone problemını çözmek için local date format kullan
                            const year = dateInfo.date.getFullYear()
                            const month = (dateInfo.date.getMonth() + 1).toString().padStart(2, '0')
                            const day = dateInfo.date.getDate().toString().padStart(2, '0')
                            const dateString = `${year}-${month}-${day}`
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (isSelectable) {
                                    console.log('Selected date:', dateString, 'for date object:', dateInfo.date.toLocaleDateString('tr-TR'))
                                    handleButtonClick('select_date', dateString)
                                  }
                                }}
                                disabled={!isSelectable}
                                className={`
                                  p-2 text-center text-sm rounded-lg transition-all min-h-[40px] flex items-center justify-center
                                  ${
                                    !dateInfo.isCurrentMonth
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : dateInfo.isToday
                                      ? 'bg-blue-600 text-white font-bold'
                                      : dateInfo.isDisabled
                                      ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                                      : isAvailable
                                      ? 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-300 cursor-pointer font-semibold'
                                      : 'bg-red-50 text-red-500 cursor-not-allowed border border-red-200'
                                  }
                                `}
                              >
                                {dateInfo.date.getDate()}
                              </button>
                            )
                          })}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-4">
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
                            Açık Günler
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                            Kapalı Günler
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 rounded"></div>
                            Geçmiş
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Time Slots */}
                    {message.timeSlots && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {message.timeSlots.map((timeString, index) => {
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  handleButtonClick('select_time', timeString)
                                }}
                                className="p-3 text-center rounded-lg transition-all text-sm font-semibold bg-white text-gray-800 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                              >
                                {timeString}
                              </button>
                            )
                          })}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-3 text-center">
                          ⏰ Müsait saatler - Seçmek için tıklayın
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {message.buttons && message.buttons.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {message.buttons.map((button, index) => (
                          <button
                            key={index}
                            onClick={() => handleButtonClick(button.action, button.data)}
                            className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-xl p-3 text-sm transition-all duration-200 font-medium text-gray-700 hover:text-blue-700 group"
                          >
                            <span className="group-hover:translate-x-1 transition-transform inline-block">
                              {button.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-60 mt-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="mr-8 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Yazıyor...</span>
                  </div>
                  <div className="bg-white text-gray-800 shadow-md border border-gray-100 p-4 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input - Hidden when minimized */}
        {!isMinimized && (
          <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
            <div className="flex gap-2 md:gap-3">
              <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder={
              appointmentStep === 2 
              ? 'İsminizi yazın...' 
              : appointmentStep === 3
              ? 'Telefon numaranızı yazın...'
              : appointmentStep === 7
              ? 'Notunuzu yazın...'
              : 'Mesajınızı yazın...'
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-sm font-medium placeholder-gray-400 text-gray-800"
                style={{
                    '--tw-ring-color': `${primaryColor}80`
                  } as React.CSSProperties}
                />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              🔒 Güvenli şifreleme ile korunmaktadır
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}
    </>
  )
}

export default AIChatWidget