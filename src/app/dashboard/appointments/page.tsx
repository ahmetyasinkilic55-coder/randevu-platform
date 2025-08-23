'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { 
 PlusIcon,
 MagnifyingGlassIcon,
 EyeIcon,
 TrashIcon,
 ClockIcon,
 UserIcon,
 PhoneIcon,
 CheckIcon,
 XMarkIcon,
 ChevronLeftIcon,
 ChevronRightIcon,
 CalendarDaysIcon,
 ListBulletIcon,
 ChevronDownIcon,
 FunnelIcon,
 ArrowPathIcon,
 ChatBubbleLeftRightIcon,
 EnvelopeIcon,
 DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

// Types
interface Staff {
 id: string
 name: string
 phone?: string
 email?: string
 specialty?: string
 experience?: number
 bio?: string
 photoUrl?: string
 isActive: boolean
 businessId: string
}

interface Service {
 id: string
 name: string
 price: number
 duration: number
 description?: string
 category: string
 isActive: boolean
 businessId: string
}

interface Appointment {
 id: string
 customerName: string
 customerPhone: string
 customerEmail?: string
 date: Date
 status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
 notes?: string
 service: Service
 staff?: Staff
 businessId: string
}

interface Inquiry {
 id: string
 type: 'consultation' | 'project' | 'contact'
 title: string
 description?: string
 customerName: string
 customerPhone: string
 customerEmail?: string
 date?: Date
 time?: string
 status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
 meetingType?: string
 duration?: number
 budget?: string
 timeline?: string
 location?: string
 urgency?: string
 inquiryType?: string
 notes?: string
 createdAt: Date
}

type CalendarItem = (Appointment & { itemType: 'appointment' }) | (Inquiry & { itemType: 'inquiry' })

export default function AppointmentsPage() {
 const { data: session, status } = useSession()
 const [isDarkMode, setIsDarkMode] = useState(false)
 const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
 const [selectedDate, setSelectedDate] = useState(new Date())
 const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
 const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
 const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
 const [showEditModal, setShowEditModal] = useState(false)
 const [expandedDay, setExpandedDay] = useState<number | null>(null)
 
 // API Data States
 const [appointments, setAppointments] = useState<Appointment[]>([])
 const [inquiries, setInquiries] = useState<Inquiry[]>([])
 const [services, setServices] = useState<Service[]>([])
 const [staff, setStaff] = useState<Staff[]>([])
 const [userBusiness, setUserBusiness] = useState<any>(null)
 
 const [loading, setLoading] = useState(false)
 const [initialLoading, setInitialLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [statusFilter, setStatusFilter] = useState<string>('all')
 const [staffFilter, setStaffFilter] = useState<string>('all')

 // New appointment form state
 const [newAppointment, setNewAppointment] = useState({
   customerName: '',
   customerPhone: '',
   customerEmail: '',
   serviceId: '',
   date: new Date().toISOString().split('T')[0],
   time: '09:00',
   staffId: '',
   notes: '',
   price: 0
 })

 // Load initial data when session is ready
 useEffect(() => {
   console.log('🎯 Session status:', status)
   console.log('👤 Session user:', session?.user)
   
   if (status === 'authenticated' && session?.user) {
     // Kullanıcı giriş yapmış, işletmelerini yükle
     loadUserBusinesses(session.user.id)
   } else if (status === 'unauthenticated') {
     // Redirect to login
     window.location.href = '/auth/signin'
   }
 }, [session, status])

 // Load user businesses from API
 const loadUserBusinesses = async (userId: string) => {
   try {
     const response = await fetch(`/api/businesses?userId=${userId}`)
     if (response.ok) {
       const data = await response.json()
       console.log('🏢 Businesses loaded:', data.businesses)
       
       if (data.businesses && data.businesses.length > 0) {
         const business = data.businesses[0] // İlk işletmeyi al
         setUserBusiness(business)
         loadInitialData(business.id)
       } else {
         console.log('❌ No businesses found for user')
         setInitialLoading(false)
       }
     } else {
       console.error('❌ Error loading businesses:', response.statusText)
       setInitialLoading(false)
     }
   } catch (error) {
     console.error('❌ Error loading businesses:', error)
     setInitialLoading(false)
   }
 }

 // Load initial data function
 const loadInitialData = async (businessId: string) => {
   setInitialLoading(true)
   try {
     await Promise.all([
       loadServices(businessId),
       loadStaff(businessId),
       loadAppointments(businessId),
       loadInquiries(businessId)
     ])
   } catch (error) {
     console.error('Error loading initial data:', error)
     alert('Veriler yüklenirken bir hata oluştu')
   } finally {
     setInitialLoading(false)
   }
 }

 // Load services from API
 const loadServices = async (businessId: string) => {
   try {
     const response = await fetch(`/api/services?businessId=${businessId}`)
     if (response.ok) {
       const data = await response.json()
       setServices(data.services || [])
     } else {
       console.error('Error loading services:', response.statusText)
     }
   } catch (error) {
     console.error('Error loading services:', error)
   }
 }

 // Load staff from API
 const loadStaff = async (businessId: string) => {
   try {
     const response = await fetch(`/api/staff?businessId=${businessId}`)
     if (response.ok) {
       const data = await response.json()
       setStaff(data.staff || [])
     } else {
       console.error('Error loading staff:', response.statusText)
     }
   } catch (error) {
     console.error('Error loading staff:', error)
   }
 }

 // Load appointments from API
 const loadAppointments = async (businessId: string) => {
   try {
     const response = await fetch(`/api/appointments?businessId=${businessId}`)
     if (response.ok) {
       const data = await response.json()
       setAppointments(data.appointments || [])
     } else {
       console.error('Error loading appointments:', response.statusText)
     }
   } catch (error) {
     console.error('Error loading appointments:', error)
   }
 }

 // Load inquiries from API
 const loadInquiries = async (businessId: string) => {
   try {
     const response = await fetch(`/api/inquiries/all?businessId=${businessId}`)
     if (response.ok) {
       const data = await response.json()
       setInquiries(data.inquiries || [])
       console.log('📋 Inquiries loaded:', data.inquiries)
     } else {
       console.error('Error loading inquiries:', response.statusText)
     }
   } catch (error) {
     console.error('Error loading inquiries:', error)
   }
 }

 // Update new appointment date when selectedDate changes
 useEffect(() => {
   setNewAppointment(prev => ({
     ...prev,
     date: selectedDate.toISOString().split('T')[0]
   }))
 }, [selectedDate])

 // Filtered appointments for list view
 const filteredAppointments = useMemo(() => {
   let filtered = appointments

   if (searchTerm) {
     filtered = filtered.filter(apt => 
       apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       apt.customerPhone.includes(searchTerm) ||
       apt.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (apt.staff && apt.staff.name.toLowerCase().includes(searchTerm.toLowerCase()))
     )
   }

   if (statusFilter !== 'all') {
     filtered = filtered.filter(apt => apt.status === statusFilter.toUpperCase())
   }

   if (staffFilter !== 'all') {
     filtered = filtered.filter(apt => apt.staff?.id === staffFilter)
   }

   return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
 }, [appointments, searchTerm, statusFilter, staffFilter])

 // Time slots for new appointment
 const timeSlots = [
   '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
   '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
   '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
 ]

 // Handle new appointment form changes
 const handleNewAppointmentChange = (field: string, value: string) => {
   setNewAppointment(prev => {
     const updated = { ...prev, [field]: value }
     
     // Auto-set price when service changes
     if (field === 'serviceId') {
       const selectedService = services.find(s => s.id === value)
       if (selectedService) {
         updated.price = selectedService.price
       }
     }
     
     return updated
   })
 }

 // Get available time slots based on existing appointments and service duration
 const getAvailableTimeSlots = () => {
   if (!newAppointment.serviceId || !newAppointment.date) {
     return timeSlots
   }

   const selectedService = services.find(s => s.id === newAppointment.serviceId)
   if (!selectedService) return timeSlots

   // Get appointments for the selected date
   const selectedDateObj = new Date(newAppointment.date)
   const dayAppointments = appointments.filter(apt => {
     const aptDate = new Date(apt.date)
     return aptDate.toDateString() === selectedDateObj.toDateString()
   })
   
   // Filter out cancelled appointments
   const activeAppointments = dayAppointments.filter(apt => apt.status !== 'CANCELLED')

   return timeSlots.filter(timeSlot => {
     const [hours, minutes] = timeSlot.split(':').map(Number)
     const slotStart = hours * 60 + minutes // Convert to minutes
     const slotEnd = slotStart + selectedService.duration // Add service duration

     // Check if this time slot conflicts with any existing appointments
     return !activeAppointments.some(appointment => {
       // Guard against undefined date
       if (!appointment.date) return false
       
       // Only check appointments, not inquiries (inquiries don't have service property)
       if (!('service' in appointment)) return false
       
       const appointmentDate = new Date(appointment.date)
       const appointmentStart = appointmentDate.getHours() * 60 + appointmentDate.getMinutes()
       const appointmentEnd = appointmentStart + appointment.service.duration

       // Check for overlap: new appointment overlaps with existing one
       return (
         (slotStart >= appointmentStart && slotStart < appointmentEnd) || // Starts during existing appointment
         (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||     // Ends during existing appointment
         (slotStart <= appointmentStart && slotEnd >= appointmentEnd)     // Completely covers existing appointment
       )
     })
   })
 }

 // Auto-select first available time when service or date changes
 useEffect(() => {
   if (newAppointment.serviceId && newAppointment.date) {
     const availableSlots = getAvailableTimeSlots()
     if (availableSlots.length > 0 && !availableSlots.includes(newAppointment.time)) {
       setNewAppointment(prev => ({
         ...prev,
         time: availableSlots[0]
       }))
     }
   }
 }, [newAppointment.serviceId, newAppointment.date, appointments])

 // Submit new appointment
 const handleSubmitNewAppointment = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!userBusiness) return
   
   setLoading(true)
   
   try {
     // Create date object properly to avoid timezone issues
     const [year, month, day] = newAppointment.date.split('-').map(Number)
     const [hour, minute] = newAppointment.time.split(':').map(Number)
     const appointmentDate = new Date(year, month - 1, day, hour, minute)
     
     const appointmentData = {
       customerName: newAppointment.customerName,
       customerPhone: newAppointment.customerPhone,
       customerEmail: newAppointment.customerEmail || null,
       serviceId: newAppointment.serviceId,
       staffId: newAppointment.staffId || null,
       date: appointmentDate.toISOString(),
       notes: newAppointment.notes || null,
       businessId: userBusiness.id
     }

     const response = await fetch('/api/appointments', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(appointmentData)
     })

     if (response.ok) {
       const data = await response.json()
       alert('Randevu başarıyla oluşturuldu!')
       setShowNewAppointmentModal(false)
       
       // Reset form
       setNewAppointment({
         customerName: '',
         customerPhone: '',
         customerEmail: '',
         serviceId: '',
         date: selectedDate.toISOString().split('T')[0],
         time: '09:00',
         staffId: '',
         notes: '',
         price: 0
       })
       
       // Reload appointments
       await loadAppointments(userBusiness.id)
     } else {
       const errorData = await response.json()
       alert(`Hata: ${errorData.error}`)
     }
   } catch (error) {
     console.error('Error creating appointment:', error)
     alert('Randevu oluşturulurken bir hata oluştu!')
   } finally {
     setLoading(false)
   }
 }

 // Update appointment status
 const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
   if (!userBusiness) return
   
   setLoading(true)
   try {
     const response = await fetch(`/api/appointments/${appointmentId}`, {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         status: newStatus.toUpperCase(),
         businessId: userBusiness.id
       })
     })

     if (response.ok) {
       const statusMessages = {
         'PENDING': 'Randevu bekliyor!',
         'CONFIRMED': 'Randevu onaylandı!',
         'COMPLETED': 'Randevu tamamlandı olarak işaretlendi!',
         'CANCELLED': 'Randevu iptal edildi!'
       }
       alert(statusMessages[newStatus.toUpperCase() as keyof typeof statusMessages] || 'Durum güncellendi!')
       
       // Reload appointments
       await loadAppointments(userBusiness.id)
       
       // Update selected appointment if it's the same one
       if (selectedAppointment?.id === appointmentId) {
         setSelectedAppointment(prev => prev ? { ...prev, status: newStatus.toUpperCase() as any } : null)
       }
     } else {
       const errorData = await response.json()
       alert(`Hata: ${errorData.error}`)
     }
   } catch (error) {
     console.error('Error updating appointment:', error)
     alert('Durum güncellenirken bir hata oluştu!')
   } finally {
     setLoading(false)
   }
 }

 // Delete appointment
 const deleteAppointment = async (appointmentId: string) => {
   if (!confirm('Bu randevuyu kalıcı olarak silmek istediğinizden emin misiniz?')) return
   if (!userBusiness) return
   
   setLoading(true)
   try {
     const response = await fetch(`/api/appointments/${appointmentId}?businessId=${userBusiness.id}`, {
       method: 'DELETE'
     })

     if (response.ok) {
       alert('Randevu başarıyla silindi!')
       setSelectedAppointment(null)
       
       // Reload appointments
       await loadAppointments(userBusiness.id)
     } else {
       const errorData = await response.json()
       alert(`Hata: ${errorData.error}`)
     }
   } catch (error) {
     console.error('Error deleting appointment:', error)
     alert('Silme işlemi başarısız!')
   } finally {
     setLoading(false)
   }
 }

 // Contact customer functions
 const callCustomer = (phone: string) => {
   window.open(`tel:${phone}`)
 }

 const messageCustomer = (phone: string) => {
   window.open(`sms:${phone}`)
 }

 const emailCustomer = (email: string) => {
   if (email) {
     window.open(`mailto:${email}`)
   }
 }

 // Refresh appointments
 const refreshAppointments = async () => {
   if (!userBusiness) return
   
   setLoading(true)
   try {
     await loadAppointments(userBusiness.id)
   } catch (error) {
     alert('Veriler yenilenemedi!')
   } finally {
     setLoading(false)
   }
 }

 // Clear all filters
 const clearFilters = () => {
   setSearchTerm('')
   setStatusFilter('all')
   setStaffFilter('all')
 }

 // Calendar helper functions
 const today = new Date()
 const currentMonth = selectedDate.getMonth()
 const currentYear = selectedDate.getFullYear()
 
 const monthNames = [
   'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
 ]
 
 const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

 // Get first day of month and number of days
 const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
 const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
 const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7 // Monday = 0
 const daysInMonth = lastDayOfMonth.getDate()

 // Generate calendar days
 const calendarDays = []
 
 // Add empty cells for days before month starts
 for (let i = 0; i < firstDayWeekday; i++) {
   calendarDays.push(null)
 }
 
 // Add days of the month
 for (let day = 1; day <= daysInMonth; day++) {
   calendarDays.push(day)
 }

 // Navigate months
 const goToPreviousMonth = () => {
   setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
   setExpandedDay(null)
 }

 const goToNextMonth = () => {
   setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
   setExpandedDay(null)
 }

 const goToToday = () => {
   setSelectedDate(new Date())
   setExpandedDay(null)
 }

 // Create date-indexed appointments and inquiries map for better performance
 const appointmentsByDate = useMemo(() => {
   const map = new Map<string, (Appointment | Inquiry)[]>()
   
   // Add appointments
   appointments.forEach(appointment => {
     const appointmentDate = new Date(appointment.date)
     const year = appointmentDate.getFullYear()
     const month = String(appointmentDate.getMonth() + 1).padStart(2, '0')
     const day = String(appointmentDate.getDate()).padStart(2, '0')
     const dateKey = `${year}-${month}-${day}`
     
     if (!map.has(dateKey)) {
       map.set(dateKey, [])
     }
     map.get(dateKey)!.push({ ...appointment, itemType: 'appointment' } as CalendarItem)
   })
   
   // Add inquiries
   inquiries.forEach(inquiry => {
     let inquiryDate: Date
     
     if (inquiry.date) {
       // If inquiry has a preferred date, use it
       inquiryDate = new Date(inquiry.date)
     } else {
       // Otherwise use creation date
       inquiryDate = new Date(inquiry.createdAt)
     }
     
     const year = inquiryDate.getFullYear()
     const month = String(inquiryDate.getMonth() + 1).padStart(2, '0')
     const day = String(inquiryDate.getDate()).padStart(2, '0')
     const dateKey = `${year}-${month}-${day}`
     
     if (!map.has(dateKey)) {
       map.set(dateKey, [])
     }
     map.get(dateKey)!.push({ ...inquiry, itemType: 'inquiry' } as CalendarItem)
   })
   
   return map
 }, [appointments, inquiries])

 // Get appointments and inquiries for a specific date using the map and sort by time
 const getAppointmentsForDateOptimized = (day: number | null) => {
   if (!day) return []
   
   // Create date key using local date components to match appointmentsByDate map
   const year = currentYear
   const month = String(currentMonth + 1).padStart(2, '0')
   const dayStr = String(day).padStart(2, '0')
   const dateString = `${year}-${month}-${dayStr}`
   
   const dayItems = appointmentsByDate.get(dateString) || []
   
   // Sort items by time (earliest first)
   return dayItems.sort((a, b) => {
     // Type assertion to access itemType
     const itemA = a as CalendarItem
     const itemB = b as CalendarItem
     
     let timeA: number
     let timeB: number
     
     if (itemA.itemType === 'appointment') {
       timeA = new Date(itemA.date).getTime()
     } else {
       // For inquiries, use time if available, otherwise creation time
       if (itemA.time) {
         const [hour, minute] = itemA.time.split(':').map(Number)
         const inquiryDate = itemA.date ? new Date(itemA.date) : new Date(itemA.createdAt)
         inquiryDate.setHours(hour, minute, 0, 0)
         timeA = inquiryDate.getTime()
       } else {
         timeA = itemA.date ? new Date(itemA.date).getTime() : new Date(itemA.createdAt).getTime()
       }
     }
     
     if (itemB.itemType === 'appointment') {
       timeB = new Date(itemB.date).getTime()
     } else {
       // For inquiries, use time if available, otherwise creation time
       if (itemB.time) {
         const [hour, minute] = itemB.time.split(':').map(Number)
         const inquiryDate = itemB.date ? new Date(itemB.date) : new Date(itemB.createdAt)
         inquiryDate.setHours(hour, minute, 0, 0)
         timeB = inquiryDate.getTime()
       } else {
         timeB = itemB.date ? new Date(itemB.date).getTime() : new Date(itemB.createdAt).getTime()
       }
     }
     
     return timeA - timeB
   })
 }

 // Check if date is today
 const isToday = (day: number | null) => {
   if (!day) return false
   return (
     day === today.getDate() &&
     currentMonth === today.getMonth() &&
     currentYear === today.getFullYear()
   )
 }

 // Check if date is selected
 const isSelected = (day: number | null) => {
   if (!day) return false
   return (
     day === selectedDate.getDate() &&
     currentMonth === selectedDate.getMonth() &&
     currentYear === selectedDate.getFullYear()
   )
 }

 // Show loading screen while data is being loaded
 if (initialLoading || status === 'loading') {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
         <p className="text-gray-600">Veriler yükleniyor...</p>
       </div>
     </div>
   )
 }

 // Show error if no business found
 if (!userBusiness && status === 'authenticated') {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="text-center">
         <p className="text-red-600 mb-4">İşletme bilgileri bulunamadı</p>
         <p className="text-gray-600 mb-4 text-sm">Lütfen önce bir işletme oluşturun.</p>
         <div className="space-x-2">
           <button 
             onClick={() => window.location.href = '/dashboard/settings'}
             className="bg-purple-600 text-white px-4 py-2 rounded-lg"
           >
             İşletme Oluştur
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="bg-gray-500 text-white px-4 py-2 rounded-lg"
           >
             Sayfayı Yenile
           </button>
         </div>
       </div>
     </div>
   )
 }

 return (
   <div className="space-y-4 sm:space-y-8">
     {/* Header */}
     <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between gap-4">
       <div>
         <h1 className={`text-2xl sm:text-3xl font-bold transition-colors ${
           isDarkMode ? 'text-white' : 'text-gray-900'
         }`}>
           Randevular
         </h1>
         <p className={`text-sm sm:text-lg mt-1 sm:mt-2 transition-colors ${
           isDarkMode ? 'text-gray-400' : 'text-gray-600'
         }`}>
           {userBusiness?.name} - {filteredAppointments.length} randevu
         </p>
       </div>
       <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
         {/* Refresh Button */}
         <button
           onClick={refreshAppointments}
           disabled={loading}
           className={`p-3 rounded-lg border transition-colors ${
             isDarkMode 
               ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
               : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
           } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
           title="Yenile"
         >
           <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
         </button>

         {/* View Mode Toggle */}
         <div className={`flex items-center p-1 rounded-lg border transition-colors ${
           isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-100'
         }`}>
           <button
             onClick={() => setViewMode('calendar')}
             className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
               viewMode === 'calendar'
                 ? 'bg-purple-600 text-white shadow-sm'
                 : isDarkMode
                   ? 'text-gray-300 hover:text-white'
                   : 'text-gray-600 hover:text-gray-900'
             }`}
           >
             <CalendarDaysIcon className="w-4 h-4" />
             <span className="hidden sm:inline">Takvim</span>
           </button>
           <button
             onClick={() => setViewMode('list')}
             className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
               viewMode === 'list'
                 ? 'bg-purple-600 text-white shadow-sm'
                 : isDarkMode
                   ? 'text-gray-300 hover:text-white'
                   : 'text-gray-600 hover:text-gray-900'
             }`}
           >
             <ListBulletIcon className="w-4 h-4" />
             <span className="hidden sm:inline">Liste</span>
           </button>
         </div>
         
         <button 
           onClick={() => setShowNewAppointmentModal(true)}
           disabled={services.length === 0}
           className="bg-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
           title={services.length === 0 ? 'Önce hizmet eklemeniz gerekiyor' : ''}
         >
           <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
           <span className="hidden sm:inline">Yeni Randevu</span>
           <span className="sm:hidden">Yeni</span>
         </button>
       </div>
     </div>

     {/* Show warning if no services or staff */}
     {(services.length === 0 || staff.length === 0) && (
       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
         <div className="flex items-start">
           <div className="flex-shrink-0">
             <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
           </div>
           <div className="ml-2 sm:ml-3">
             <h3 className="text-xs sm:text-sm font-medium text-yellow-800">
               Eksik Kurulum
             </h3>
             <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-yellow-700">
               <p>
                 Randevu oluşturabilmek için:
                 {services.length === 0 && <span className="block">• En az bir hizmet tanımlamanız gerekiyor</span>}
                 {staff.length === 0 && <span className="block">• En az bir personel eklemeniz gerekiyor</span>}
               </p>
             </div>
           </div>
         </div>
       </div>
     )}

     {viewMode === 'calendar' ? (
       /* Calendar View */
       <div className={`rounded-xl shadow-sm border transition-colors ${
         isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
       }`}>
         {/* Calendar Header */}
         <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b gap-4 transition-colors ${
           isDarkMode ? 'border-gray-700' : 'border-gray-100'
         }`}>
           <div className="flex items-center space-x-2 sm:space-x-4">
             <button
               onClick={goToPreviousMonth}
               className={`p-2 rounded-lg transition-colors ${
                 isDarkMode 
                   ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
               }`}
             >
               <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             
             <h2 className={`text-lg sm:text-2xl font-bold transition-colors ${
               isDarkMode ? 'text-white' : 'text-gray-900'
             }`}>
               {monthNames[currentMonth]} {currentYear}
             </h2>
             
             <button
               onClick={goToNextMonth}
               className={`p-2 rounded-lg transition-colors ${
                 isDarkMode 
                   ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
               }`}
             >
               <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
           </div>
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
             <div className="flex items-center space-x-4 text-xs sm:text-sm overflow-x-auto pb-2 sm:pb-0">
               <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                 <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-100 rounded"></div>
                 <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Tamamlandı</span>
               </div>
               <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                 <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-100 rounded"></div>
                 <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Onaylandı</span>
               </div>
               <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                 <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-100 rounded"></div>
                 <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Bekliyor</span>
               </div>
             </div>
             
             <button
               onClick={goToToday}
               className="bg-purple-100 text-purple-700 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors text-xs sm:text-sm whitespace-nowrap"
             >
               Bugün
             </button>
           </div>
         </div>

         {/* Calendar Grid */}
         <div className="p-3 sm:p-6">
           {/* Day Headers */}
           <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4">
             {dayNames.map((day) => (
               <div
                 key={day}
                 className={`p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold transition-colors ${
                   isDarkMode ? 'text-gray-400' : 'text-gray-500'
                 }`}
               >
                 <span className="hidden sm:inline">{day}</span>
                 <span className="sm:hidden">{day.slice(0, 1)}</span>
               </div>
             ))}
           </div>

           {/* Calendar Days */}
           <div className="grid grid-cols-7 gap-1">
             {calendarDays.map((day, index) => {
               const dayItems = getAppointmentsForDateOptimized(day)
               const dayIsToday = isToday(day)
               const dayIsSelected = isSelected(day)
               const hasMany = dayItems.length > 2 // Mobilde 2'den fazla için +daha göster
               const displayItems = dayItems.slice(0, 2) // Mobilde en fazla 2 göster

               return (
                 <div
                   key={index}
                   onClick={() => day && setSelectedDate(new Date(currentYear, currentMonth, day))}
                   className={`min-h-[100px] sm:min-h-[160px] p-1 sm:p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                     day 
                       ? isDarkMode 
                         ? 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600'
                         : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                       : 'border-transparent'
                   } ${
                     dayIsToday 
                       ? 'ring-1 sm:ring-2 ring-blue-500 ring-opacity-50'
                       : ''
                   } ${
                     dayIsSelected 
                       ? 'ring-1 sm:ring-2 ring-purple-500 ring-opacity-50'
                       : ''
                   }`}
                 >
                   {day && (
                     <>
                       <div className="flex items-center justify-between mb-1 sm:mb-2">
                         <div className={`text-xs sm:text-sm font-medium ${
                           dayIsToday 
                             ? 'text-blue-600 font-bold'
                             : isDarkMode 
                               ? 'text-white' 
                               : 'text-gray-900'
                         }`}>
                           {day}
                         </div>
                         {dayItems.length > 0 && (
                           <div className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${
                             dayItems.length >= 10 ? 'bg-red-100 text-red-800' :
                             dayItems.length >= 5 ? 'bg-orange-100 text-orange-800' :
                             dayItems.length >= 3 ? 'bg-yellow-100 text-yellow-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {dayItems.length}
                           </div>
                         )}
                       </div>
                       
                       {/* Items (Appointments + Inquiries) */}
                       <div className="space-y-0.5 sm:space-y-1">
                         {displayItems.map((item, idx) => {
                           // Type assertion for itemType access
                           const calendarItem = item as CalendarItem
                           
                           if (calendarItem.itemType === 'appointment') {
                             const appointment = item as Appointment
                             return (
                               <div
                               key={appointment.id}
                               onClick={(e) => {
                               e.stopPropagation()
                               setSelectedAppointment(appointment)
                               }}
                               className={`text-xs p-1 sm:p-2 rounded truncate cursor-pointer transition-colors ${
                               appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                               appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                               appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                               'bg-red-100 text-red-800 hover:bg-red-200'
                               }`}
                               >
                               <div className="font-medium flex items-center justify-between">
                               <span>{new Date(appointment.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="text-xs hidden sm:inline">₺{appointment.service.price}</span>
                               </div>
                               <div className="truncate">{appointment.customerName}</div>
                               <div className="truncate text-gray-600 hidden sm:block">{appointment.service.name}</div>
                               </div>
                             )
                           } else {
                             // Inquiry
                             const inquiry = item as Inquiry
                             return (
                               <div
                                 key={inquiry.id}
                                 onClick={(e) => {
                                   e.stopPropagation()
                                   setSelectedInquiry(inquiry)
                                 }}
                                 className={`text-xs p-1 sm:p-2 rounded truncate cursor-pointer transition-colors border-2 border-dashed ${
                                   inquiry.type === 'consultation' ? 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200' :
                                   inquiry.type === 'project' ? 'bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200' :
                                   'bg-gray-50 text-gray-800 hover:bg-gray-100 border-gray-200'
                                 }`}
                               >
                                 <div className="font-medium flex items-center justify-between">
                                   <span className="flex items-center gap-1">
                                     {inquiry.type === 'consultation' && '💡'}
                                     {inquiry.type === 'project' && '🔨'}
                                     {inquiry.type === 'contact' && '💬'}
                                     {inquiry.time || 'Ön Görüşme'}
                                   </span>
                                   <span className={`text-xs px-1 rounded ${
                                     inquiry.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                     inquiry.status === 'CONFIRMED' ? 'bg-green-200 text-green-800' :
                                     'bg-gray-200 text-gray-800'
                                   }`}>
                                     {inquiry.status === 'PENDING' ? 'Yeni' : inquiry.status}
                                   </span>
                                 </div>
                                 <div className="truncate">{inquiry.customerName}</div>
                                 <div className="truncate text-gray-600 hidden sm:block">{inquiry.title}</div>
                               </div>
                             )
                           }
                         })}
                         
                         {hasMany && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation()
                               setExpandedDay(day)
                             }}
                             className={`w-full text-xs text-center py-1 sm:py-2 rounded transition-colors flex items-center justify-center space-x-1 border-2 border-dashed ${
                               isDarkMode 
                                 ? 'text-gray-400 hover:text-white hover:bg-gray-600 border-gray-600' 
                                 : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-gray-300'
                             }`}
                           >
                             <span>+{dayItems.length - 2}</span>
                             <ChevronDownIcon className="w-3 h-3" />
                           </button>
                         )}
                       </div>
                     </>
                   )}
                 </div>
               )
             })}
           </div>
         </div>
       </div>
     ) : (
       /* List View */
       <div className={`rounded-xl shadow-sm border transition-colors ${
         isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
       }`}>
         {/* Filters */}
         <div className={`p-4 sm:p-6 border-b transition-colors ${
           isDarkMode ? 'border-gray-700' : 'border-gray-100'
         }`}>
           <div className="flex flex-col gap-4">
             <div className="w-full">
               <div className="relative">
                 <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                   isDarkMode ? 'text-gray-400' : 'text-gray-400'
                 }`} />
                 <input
                   type="text"
                   placeholder="Müşteri adı, telefon, hizmet veya personel ara..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className={`w-full pl-9 sm:pl-10 pr-4 py-3 border rounded-lg transition-colors text-sm sm:text-base ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                       : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                   }`}
                 />
               </div>
             </div>
             <div className="flex flex-col sm:flex-row gap-3">
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className={`flex-1 px-3 sm:px-4 py-3 border rounded-lg transition-colors text-sm sm:text-base ${
                   isDarkMode 
                     ? 'bg-gray-700 border-gray-600 text-white'
                     : 'bg-white border-gray-300 text-gray-900'
                 }`}
               >
                 <option value="all">Tüm Durumlar</option>
                 <option value="pending">Bekliyor</option>
                 <option value="confirmed">Onaylandı</option>
                 <option value="completed">Tamamlandı</option>
                 <option value="cancelled">İptal</option>
               </select>
               <select
                 value={staffFilter}
                 onChange={(e) => setStaffFilter(e.target.value)}
                 className={`flex-1 px-3 sm:px-4 py-3 border rounded-lg transition-colors text-sm sm:text-base ${
                   isDarkMode 
                     ? 'bg-gray-700 border-gray-600 text-white'
                     : 'bg-white border-gray-300 text-gray-900'
                 }`}
               >
                 <option value="all">Tüm Personel</option>
                 {staff.map(person => (
                   <option key={person.id} value={person.id}>{person.name}</option>
                 ))}
               </select>
               <button
                 onClick={clearFilters}
                 className={`px-3 sm:px-4 py-3 border rounded-lg transition-colors flex items-center justify-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                   isDarkMode 
                     ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                     : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
                 }`}
               >
                 <FunnelIcon className="w-4 h-4" />
                 <span className="hidden sm:inline text-sm">Temizle</span>
               </button>
             </div>
           </div>
         </div>

         {/* Appointments List */}
         <div className={`divide-y transition-colors ${
           isDarkMode ? 'divide-gray-700' : 'divide-gray-100'
         }`}>
           {filteredAppointments.length > 0 ? (
             filteredAppointments.map((appointment) => (
               <div key={appointment.id} className={`p-4 sm:p-6 transition-all hover:scale-[1.01] ${
                 isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
               }`}>
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                     <div className="relative flex-shrink-0">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center shadow-md">
                         <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                       </div>
                       <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                         appointment.status === 'COMPLETED' ? 'bg-green-500' :
                         appointment.status === 'CONFIRMED' ? 'bg-blue-500' :
                         appointment.status === 'PENDING' ? 'bg-yellow-500' :
                         'bg-red-500'
                       } ${isDarkMode ? 'border-gray-800' : 'border-white'}`}>
                         {appointment.status === 'COMPLETED' && <CheckIcon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />}
                         {appointment.status === 'PENDING' && <ClockIcon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />}
                       </div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className={`font-semibold text-base sm:text-lg transition-colors ${
                         isDarkMode ? 'text-white' : 'text-gray-900'
                       }`}>
                         {appointment.customerName}
                       </h3>
                       <p className={`transition-colors text-sm sm:text-base ${
                         isDarkMode ? 'text-gray-400' : 'text-gray-600'
                       }`}>
                         {appointment.service.name}
                       </p>
                       <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 sm:mt-2 space-y-1 sm:space-y-0">
                         <div className={`flex items-center space-x-1 text-xs sm:text-sm transition-colors ${
                           isDarkMode ? 'text-gray-500' : 'text-gray-500'
                         }`}>
                           <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                           <span>{new Date(appointment.date).toLocaleString('tr-TR')}</span>
                         </div>
                         {appointment.staff && (
                           <div className={`flex items-center space-x-1 text-xs sm:text-sm transition-colors ${
                             isDarkMode ? 'text-gray-500' : 'text-gray-500'
                           }`}>
                             <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                             <span>{appointment.staff.name}</span>
                           </div>
                         )}
                         <div className={`flex items-center space-x-1 text-xs sm:text-sm transition-colors ${
                           isDarkMode ? 'text-gray-500' : 'text-gray-500'
                         }`}>
                           <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                           <span>{appointment.customerPhone}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="flex flex-row sm:flex-col lg:flex-row items-end sm:items-center justify-between sm:space-x-4 gap-4">
                     <div className="text-left sm:text-right">
                       <span className={`text-lg sm:text-xl font-bold transition-colors ${
                         isDarkMode ? 'text-white' : 'text-gray-900'
                       }`}>
                         ₺{appointment.service.price}
                       </span>
                       <div className="mt-1">
                         <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                           appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                           appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                           appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-red-100 text-red-800'
                         }`}>
                           {appointment.status === 'COMPLETED' ? 'Tamamlandı' :
                            appointment.status === 'CONFIRMED' ? 'Onaylandı' :
                            appointment.status === 'PENDING' ? 'Bekliyor' :
                            'İptal'}
                         </span>
                       </div>
                     </div>
                     <div className="flex items-center space-x-1 sm:space-x-2">
                       <button 
                         onClick={() => callCustomer(appointment.customerPhone)}
                         className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                         }`}
                         title="Ara"
                       >
                         <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                       <button 
                         onClick={() => messageCustomer(appointment.customerPhone)}
                         className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                         }`}
                         title="Mesaj Gönder"
                       >
                         <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                       <button 
                         onClick={() => setSelectedAppointment(appointment)}
                         className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                         }`}
                         title="Detayları Gör"
                       >
                         <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                       <button 
                         onClick={() => deleteAppointment(appointment.id)}
                         className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                         }`}
                         title="Sil"
                       >
                         <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center py-8 sm:py-12">
               <CalendarDaysIcon className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 transition-colors ${
                 isDarkMode ? 'text-gray-600' : 'text-gray-400'
               }`} />
               <h3 className={`mt-2 text-sm font-medium transition-colors ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-900'
               }`}>
                 Randevu bulunamadı
               </h3>
               <p className={`mt-1 text-xs sm:text-sm transition-colors ${
                 isDarkMode ? 'text-gray-500' : 'text-gray-500'
               }`}>
                 Arama kriterlerinizi değiştirmeyi deneyin veya yeni randevu oluşturun.
               </p>
             </div>
           )}
         </div>
       </div>
     )}

     {/* Day Detail Modal for expanded view */}
     {expandedDay && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className={`rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${
           isDarkMode ? 'bg-gray-800' : 'bg-white'
         }`}>
           <div className={`flex items-center justify-between p-6 border-b ${
             isDarkMode ? 'border-gray-700' : 'border-gray-100'
           }`}>
             <div>
               <h2 className={`text-2xl font-bold transition-colors ${
                 isDarkMode ? 'text-white' : 'text-gray-900'
               }`}>
                 {expandedDay} {monthNames[currentMonth]} {currentYear}
               </h2>
               <p className={`text-sm mt-1 transition-colors ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-600'
               }`}>
                 {getAppointmentsForDateOptimized(expandedDay).length} randevu • {getAppointmentsForDateOptimized(expandedDay).filter(a => a.status === 'COMPLETED').length} tamamlandı
               </p>
             </div>
             <div className="flex items-center space-x-3">
               <button
                 onClick={() => {
                   setSelectedDate(new Date(currentYear, currentMonth, expandedDay))
                   setShowNewAppointmentModal(true)
                   setExpandedDay(null)
                 }}
                 className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
               >
                 <PlusIcon className="w-4 h-4" />
                 <span>Yeni Randevu</span>
               </button>
               <button
                 onClick={() => setExpandedDay(null)}
                 className={`p-2 rounded-lg transition-colors ${
                   isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                 }`}
               >
                 <XMarkIcon className="w-6 h-6" />
               </button>
             </div>
           </div>

           <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
             {getAppointmentsForDateOptimized(expandedDay).length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {getAppointmentsForDateOptimized(expandedDay).map((item) => {
                   // Type assertion for itemType access
                   const calendarItem = item as CalendarItem
                   
                   if (calendarItem.itemType === 'appointment') {
                     const appointment = item as Appointment
                     return (
                       <div
                         key={appointment.id}
                         onClick={() => setSelectedAppointment(appointment)}
                         className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                           isDarkMode 
                             ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                             : 'border-gray-200 bg-white hover:bg-gray-50'
                         }`}
                       >
                         <div className="flex items-center justify-between mb-3">
                           <span className={`font-bold text-lg transition-colors ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>
                             {new Date(appointment.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                             appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                             appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                             appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-red-100 text-red-800'
                           }`}>
                             {appointment.status === 'COMPLETED' ? 'Tamamlandı' :
                              appointment.status === 'CONFIRMED' ? 'Onaylandı' :
                              appointment.status === 'PENDING' ? 'Bekliyor' :
                              'İptal'}
                           </span>
                         </div>
                         
                         <div className="flex items-center space-x-3 mb-3">
                           <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                             <UserIcon className="w-6 h-6 text-purple-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className={`font-medium truncate transition-colors ${
                               isDarkMode ? 'text-white' : 'text-gray-900'
                             }`}>
                               {appointment.customerName}
                             </p>
                             <p className={`text-sm truncate transition-colors ${
                               isDarkMode ? 'text-gray-400' : 'text-gray-600'
                             }`}>
                               {appointment.service.name}
                             </p>
                             {appointment.staff && (
                               <p className={`text-sm transition-colors ${
                                 isDarkMode ? 'text-gray-500' : 'text-gray-500'
                               }`}>
                                 {appointment.staff.name}
                               </p>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <span className={`font-bold text-lg transition-colors ${
                             isDarkMode ? 'text-white' : 'text-gray-900'
                           }`}>
                             ₺{appointment.service.price}
                           </span>
                           <div className="flex items-center space-x-1">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation()
                                 callCustomer(appointment.customerPhone)
                               }}
                               className={`p-1 rounded transition-colors ${
                                 isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'
                               }`}
                               title="Ara"
                             >
                               <PhoneIcon className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation()
                                 setSelectedAppointment(appointment)
                               }}
                               className={`p-1 rounded transition-colors ${
                                 isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                               }`}
                               title="Detayları Gör"
                             >
                               <EyeIcon className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       </div>
                     )
                   } else {
                     // Inquiry
                     const inquiry = item as Inquiry
                     return (
                       <div
                         key={inquiry.id}
                         onClick={() => setSelectedInquiry(inquiry)}
                         className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:shadow-md ${
                           inquiry.type === 'consultation' ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' :
                           inquiry.type === 'project' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' :
                           'border-gray-200 bg-gray-50 hover:bg-gray-100'
                         }`}
                       >
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <span className="text-2xl">
                               {inquiry.type === 'consultation' && '💡'}
                               {inquiry.type === 'project' && '🔨'}
                               {inquiry.type === 'contact' && '💬'}
                             </span>
                             <span className="font-bold text-lg">
                               {inquiry.time || 'Talep'}
                             </span>
                           </div>
                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                             inquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                             inquiry.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {inquiry.status === 'PENDING' ? 'Yeni Talep' : inquiry.status}
                           </span>
                         </div>
                         
                         <div className="mb-3">
                           <p className="font-medium text-gray-900 mb-1">{inquiry.customerName}</p>
                           <p className="text-sm text-gray-600 mb-2">{inquiry.title}</p>
                           {inquiry.description && (
                             <p className="text-xs text-gray-500 truncate">{inquiry.description}</p>
                           )}
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <div className="text-sm text-gray-500">
                             {inquiry.type === 'consultation' && 'Danışmanlık Talebi'}
                             {inquiry.type === 'project' && 'Proje Talebi'}
                             {inquiry.type === 'contact' && 'İletişim Talebi'}
                           </div>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation()
                               callCustomer(inquiry.customerPhone)
                             }}
                             className="p-1 rounded transition-colors text-gray-400 hover:text-green-600"
                             title="Ara"
                           >
                             <PhoneIcon className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     )
                   }
                 })}
               </div>
             ) : (
               <div className="text-center py-12">
                 <CalendarDaysIcon className={`mx-auto h-12 w-12 transition-colors ${
                   isDarkMode ? 'text-gray-600' : 'text-gray-400'
                 }`} />
                 <h3 className={`mt-2 text-sm font-medium transition-colors ${
                   isDarkMode ? 'text-gray-400' : 'text-gray-900'
                 }`}>
                   Bu gün için randevu yok
                 </h3>
                 <p className={`mt-1 text-sm transition-colors ${
                   isDarkMode ? 'text-gray-500' : 'text-gray-500'
                 }`}>
                   Yeni randevu oluşturmak için yukarıdaki butonu kullanabilirsiniz.
                 </p>
               </div>
             )}
           </div>
         </div>
       </div>
     )}

     {/* Inquiry Detail Modal */}
     {selectedInquiry && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Ön Görüşme Detayları
            </h2>
            <button
              onClick={() => setSelectedInquiry(null)}
              className={`p-1 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedInquiry.type === 'consultation' ? 'bg-purple-100' :
                selectedInquiry.type === 'project' ? 'bg-orange-100' :
                'bg-gray-100'
              }`}>
                <span className="text-2xl">
                  {selectedInquiry.type === 'consultation' && '💡'}
                  {selectedInquiry.type === 'project' && '🔨'}
                  {selectedInquiry.type === 'contact' && '💬'}
                </span>
              </div>
              <div>
                <h3 className={`font-semibold text-lg transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedInquiry.customerName}
                </h3>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedInquiry.customerPhone}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedInquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedInquiry.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  selectedInquiry.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedInquiry.status === 'PENDING' ? 'Yeni Talep' :
                   selectedInquiry.status === 'CONFIRMED' ? 'Onaylandı' :
                   selectedInquiry.status === 'COMPLETED' ? 'Tamamlandı' :
                   'İptal'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Talep Başlığı
                </label>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedInquiry.title}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Talep Türü
                </label>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedInquiry.type === 'consultation' ? 'Danışmanlık Talebi' :
                   selectedInquiry.type === 'project' ? 'Proje Talebi' :
                   'İletişim Talebi'}
                </p>
              </div>

              {selectedInquiry.description && (
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Açıklama
                  </label>
                  <p className={`transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedInquiry.description}
                  </p>
                </div>
              )}

              {selectedInquiry.date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Talep Edilen Tarih
                    </label>
                    <p className={`transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {new Date(selectedInquiry.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  {selectedInquiry.time && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Talep Edilen Saat
                      </label>
                      <p className={`transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedInquiry.time}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(selectedInquiry.budget || selectedInquiry.timeline) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedInquiry.budget && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Bütçe
                      </label>
                      <p className={`transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedInquiry.budget}
                      </p>
                    </div>
                  )}
                  {selectedInquiry.timeline && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Zaman Çizelgesi
                      </label>
                      <p className={`transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedInquiry.timeline}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedInquiry.location && (
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Lokasyon
                  </label>
                  <p className={`transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedInquiry.location}
                  </p>
                </div>
              )}

              {selectedInquiry.notes && (
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Notlar
                  </label>
                  <p className={`transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedInquiry.notes}
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Talep Tarihi
                </label>
                <p className={`text-sm transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {new Date(selectedInquiry.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <button 
                onClick={() => callCustomer(selectedInquiry.customerPhone)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Ara</span>
              </button>
              <button 
                onClick={() => messageCustomer(selectedInquiry.customerPhone)}
                className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
              >
                <DevicePhoneMobileIcon className="w-4 h-4" />
                <span>Mesaj</span>
              </button>
              {selectedInquiry.customerEmail && (
                <button 
                  onClick={() => emailCustomer(selectedInquiry.customerEmail!)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email</span>
                </button>
              )}
            </div>

            {/* Status Actions */}
            <div className="space-y-3 pt-4">
              {selectedInquiry.status === 'PENDING' && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      // Update inquiry status - implement API call if needed
                      setSelectedInquiry(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Reddet'}
                  </button>
                  <button 
                    onClick={() => {
                      // Update inquiry status - implement API call if needed
                      setSelectedInquiry(prev => prev ? { ...prev, status: 'CONFIRMED' } : null)
                    }}
                    disabled={loading}
                    className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Onayla'}
                  </button>
                </div>
              )}
              
              {selectedInquiry.status === 'CONFIRMED' && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      // Update inquiry status - implement API call if needed
                      setSelectedInquiry(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'İptal Et'}
                  </button>
                  <button 
                    onClick={() => {
                      // Update inquiry status - implement API call if needed
                      setSelectedInquiry(prev => prev ? { ...prev, status: 'COMPLETED' } : null)
                    }}
                    disabled={loading}
                    className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Tamamlandı Olarak İşaretle'}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  // Convert to appointment - this could open the new appointment modal with pre-filled data
                  setSelectedInquiry(null)
                  setNewAppointment(prev => ({
                    ...prev,
                    customerName: selectedInquiry!.customerName,
                    customerPhone: selectedInquiry!.customerPhone,
                    customerEmail: selectedInquiry!.customerEmail || '',
                    date: selectedInquiry!.date ? new Date(selectedInquiry!.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    time: selectedInquiry!.time || '09:00',
                    notes: selectedInquiry!.description || ''
                  }))
                  setShowNewAppointmentModal(true)
                }}
                className="w-full bg-purple-100 text-purple-700 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
              >
                <CalendarDaysIcon className="w-4 h-4" />
                <span>Randevuya Dönüştür</span>
              </button>
            </div>
          </div>
        </div>
      </div>
     )}

     {/* Appointment Detail Modal */}
     {selectedAppointment && !showEditModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Randevu Detayları
            </h2>
            <button
              onClick={() => setSelectedAppointment(null)}
              className={`p-1 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className={`font-semibold text-lg transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedAppointment.customerName}
                </h3>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedAppointment.customerPhone}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAppointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  selectedAppointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedAppointment.status === 'COMPLETED' ? 'Tamamlandı' :
                   selectedAppointment.status === 'CONFIRMED' ? 'Onaylandı' :
                   selectedAppointment.status === 'PENDING' ? 'Bekliyor' :
                   'İptal'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Hizmet
                </label>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedAppointment.service.name}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fiyat
                </label>
                <p className={`font-semibold text-lg transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ₺{selectedAppointment.service.price}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tarih ve Saat
                </label>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {new Date(selectedAppointment.date).toLocaleString('tr-TR')}
                </p>
              </div>
              {selectedAppointment.staff && (
                <div>
                  <label className={`block text-sm font-medium mb-1 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Personel
                  </label>
                  <p className={`transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedAppointment.staff.name}
                  </p>
                </div>
              )}
            </div>

            {selectedAppointment.notes && (
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Notlar
                </label>
                <p className={`transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            {/* Contact Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <button 
                onClick={() => callCustomer(selectedAppointment.customerPhone)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Ara</span>
              </button>
              <button 
                onClick={() => messageCustomer(selectedAppointment.customerPhone)}
                className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
              >
                <DevicePhoneMobileIcon className="w-4 h-4" />
                <span>Mesaj</span>
              </button>
              {selectedAppointment.customerEmail && (
                <button 
                  onClick={() => emailCustomer(selectedAppointment.customerEmail!)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email</span>
                </button>
              )}
            </div>

            {/* Status Actions */}
            <div className="space-y-3 pt-4">
              {selectedAppointment.status === 'PENDING' && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CANCELLED')}
                    disabled={loading}
                    className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Reddet'}
                  </button>
                  <button 
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CONFIRMED')}
                    disabled={loading}
                    className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Onayla'}
                  </button>
                </div>
              )}
              
              {selectedAppointment.status === 'CONFIRMED' && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CANCELLED')}
                    disabled={loading}
                    className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'İptal Et'}
                  </button>
                  <button 
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'COMPLETED')}
                    disabled={loading}
                    className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Tamamlandı Olarak İşaretle'}
                  </button>
                </div>
              )}

              {(selectedAppointment.status === 'COMPLETED' || selectedAppointment.status === 'CANCELLED') && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CONFIRMED')}
                    disabled={loading}
                    className="bg-blue-100 text-blue-700 py-3 px-6 rounded-lg font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'İşleniyor...' : 'Tekrar Aktif Et'}
                  </button>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={() => deleteAppointment(selectedAppointment.id)}
                disabled={loading}
                className="w-full bg-red-50 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{loading ? 'Siliniyor...' : 'Randevuyu Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
     )}

     {/* New Appointment Modal */}
     {showNewAppointmentModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className={`rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto ${
           isDarkMode ? 'bg-gray-800' : 'bg-white'
         }`}>
           <div className="flex items-center justify-between mb-6">
             <h2 className={`text-xl font-bold transition-colors ${
               isDarkMode ? 'text-white' : 'text-gray-900'
             }`}>
               Yeni Randevu Oluştur
             </h2>
             <button
               onClick={() => setShowNewAppointmentModal(false)}
               className={`p-1 transition-colors ${
                 isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               <XMarkIcon className="w-5 h-5" />
             </button>
           </div>

           <form onSubmit={handleSubmitNewAppointment} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Müşteri Adı *
                 </label>
                 <input
                   type="text"
                   required
                   value={newAppointment.customerName}
                   onChange={(e) => handleNewAppointmentChange('customerName', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                       : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                   }`}
                   placeholder="Müşteri adını girin"
                 />
               </div>

               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Telefon Numarası *
                 </label>
                 <input
                   type="tel"
                   required
                   value={newAppointment.customerPhone}
                   onChange={(e) => {
                     // Sadece rakam ve bazı özel karakterlere izin ver
                     let value = e.target.value.replace(/[^0-9+()\s-]/g, '')
                     
                     // Türk telefon formatına otomatik çevir
                     if (value.startsWith('0') && value.length === 11) {
                       // 05321234567 -> +90 532 123 45 67 formatına çevir
                       value = `+90 ${value.slice(1, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)}`
                     } else if (value.startsWith('+90') && value.replace(/\D/g, '').length === 12) {
                       // +905321234567 -> +90 532 123 45 67 formatına çevir
                       const digits = value.replace(/\D/g, '')
                       value = `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
                     }
                     
                     handleNewAppointmentChange('customerPhone', value)
                   }}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                       : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                   }`}
                   placeholder="+90 532 123 45 67 veya 05321234567"
                   minLength={10}
                 />
                 {newAppointment.customerPhone && newAppointment.customerPhone.replace(/\D/g, '').length < 10 && (
                   <p className="text-sm text-red-600 mt-1">
                     Telefon numarası en az 10 haneli olmalıdır
                   </p>
                 )}
               </div>

               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   E-posta (Opsiyonel)
                 </label>
                 <input
                   type="email"
                   value={newAppointment.customerEmail}
                   onChange={(e) => handleNewAppointmentChange('customerEmail', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                       : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                   }`}
                   placeholder="musteri@email.com"
                 />
               </div>

               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Hizmet *
                 </label>
                 <select
                   required
                   value={newAppointment.serviceId}
                   onChange={(e) => handleNewAppointmentChange('serviceId', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white'
                       : 'bg-white border-gray-300 text-gray-900'
                   }`}
                 >
                   <option value="">Hizmet seçin</option>
                   {services.filter(s => s.isActive).map(service => (
                     <option key={service.id} value={service.id}>
                       {service.name} - ₺{service.price} ({service.duration} dk)
                     </option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Tarih *
                 </label>
                 <input
                   type="date"
                   required
                   min={new Date().toISOString().split('T')[0]} // Bugünden itibaren aktif
                   value={newAppointment.date}
                   onChange={(e) => handleNewAppointmentChange('date', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white'
                       : 'bg-white border-gray-300 text-gray-900'
                   }`}
                 />
               </div>

               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Saat *
                 </label>
                 <select
                   required
                   value={newAppointment.time}
                   onChange={(e) => handleNewAppointmentChange('time', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white'
                       : 'bg-white border-gray-300 text-gray-900'
                   }`}
                 >
                   {(() => {
                     const availableSlots = getAvailableTimeSlots()
                     return availableSlots.length > 0 ? (
                       availableSlots.map(time => (
                         <option key={time} value={time}>{time}</option>
                       ))
                     ) : (
                       <option value="">Bu gün için müsait saat yok</option>
                     )
                   })()} 
                 </select>
                 {(() => {
                   const availableSlots = getAvailableTimeSlots()
                   const selectedService = services.find(s => s.id === newAppointment.serviceId)
                   return availableSlots.length === 0 && selectedService ? (
                     <p className="text-sm text-red-600 mt-1">
                       Seçilen tarihte {selectedService.duration} dakikalık hizmet için müsait saat bulunmuyor.
                     </p>
                   ) : selectedService ? (
                     <p className={`text-sm mt-1 transition-colors ${
                       isDarkMode ? 'text-gray-400' : 'text-gray-600'
                     }`}>
                       Hizmet süresi: {selectedService.duration} dakika
                     </p>
                   ) : null
                 })()} 
               </div>
             </div>

             {staff.length > 0 && (
               <div>
                 <label className={`block text-sm font-medium mb-2 transition-colors ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   Personel (Opsiyonel)
                 </label>
                 <select
                   value={newAppointment.staffId}
                   onChange={(e) => handleNewAppointmentChange('staffId', e.target.value)}
                   className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                     isDarkMode 
                       ? 'bg-gray-700 border-gray-600 text-white'
                       : 'bg-white border-gray-300 text-gray-900'
                   }`}
                 >
                   <option value="">Personel seçin (opsiyonel)</option>
                   {staff.filter(s => s.isActive).map(person => (
                     <option key={person.id} value={person.id}>
                       {person.name}
                     </option>
                   ))}
                 </select>
               </div>
             )}

             <div>
               <label className={`block text-sm font-medium mb-2 transition-colors ${
                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
               }`}>
                 Notlar (Opsiyonel)
               </label>
               <textarea
                 value={newAppointment.notes}
                 onChange={(e) => handleNewAppointmentChange('notes', e.target.value)}
                 rows={3}
                 className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                   isDarkMode 
                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                     : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                 }`}
                 placeholder="Ek notlar..."
               />
             </div>

             {/* Price Display */}
             {newAppointment.serviceId && (
               <div className={`p-4 rounded-lg border transition-colors ${
                 isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
               }`}>
                 <div className="flex items-center justify-between">
                   <span className={`font-medium transition-colors ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                   }`}>
                     Toplam Tutar:
                   </span>
                   <span className={`text-xl font-bold transition-colors ${
                     isDarkMode ? 'text-white' : 'text-gray-900'
                   }`}>
                     ₺{newAppointment.price}
                   </span>
                 </div>
               </div>
             )}

             <div className="flex space-x-4 pt-4">
               <button
                 type="button"
                 onClick={() => setShowNewAppointmentModal(false)}
                 className={`flex-1 py-3 rounded-lg font-medium border transition-colors ${
                   isDarkMode 
                     ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                     : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                 }`}
               >
                 İptal
               </button>
               <button
                 type="submit"
                 disabled={loading || !newAppointment.customerName || !newAppointment.customerPhone || newAppointment.customerPhone.replace(/\D/g, '').length < 10 || !newAppointment.serviceId || getAvailableTimeSlots().length === 0}
                 className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? 'Oluşturuluyor...' : 
                  newAppointment.customerPhone && newAppointment.customerPhone.replace(/\D/g, '').length < 10 ? 'Geçerli Telefon Girin' :
                  getAvailableTimeSlots().length === 0 && newAppointment.serviceId ? 'Müsait Saat Yok' : 'Randevu Oluştur'}
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 )
}