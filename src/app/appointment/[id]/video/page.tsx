'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import WebRTCVideoCall from '@/components/WebRTCVideoCall'
import { toast } from 'react-hot-toast'

interface Appointment {
  id: string
  customerName: string
  businessName: string
  customerId: string
  businessId: string
  date: string
  status: string
  hasVideoCall: boolean
}

const VideoAppointmentPage = () => {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const appointmentId = params?.id as string
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }
    
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId, session, status])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Randevu bulunamadı')
      }
      
      const data = await response.json()
      setAppointment(data.appointment)
      
      // Kullanıcı bu randevuya katılabilir mi kontrol et
      const canJoin = (
        data.appointment.customerId === session?.user.id ||
        data.appointment.businessId === session?.user.id
      )
      
      if (!canJoin) {
        setError('Bu video randevuya katılma yetkiniz yok')
        return
      }
      
      // Video call özelliği var mı kontrol et
      if (!data.appointment.hasVideoCall) {
        setError('Bu randevu video görüşme içermiyor')
        return
      }
      
      setAuthorized(true)
      
    } catch (error) {
      console.error('Randevu yüklenemedi:', error)
      setError(error instanceof Error ? error.message : 'Randevu yüklenirken bir hata oluştu')
      toast.error('Randevu bilgileri alınamadı')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Video randevu yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-6">{error || 'Bu video randevuya katılma yetkiniz yok'}</p>
          <button
            onClick={() => router.push('/appointments')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Randevularıma Dön
          </button>
        </div>
      </div>
    )
  }

  // Determine user role and participant name
  const userRole = appointment?.customerId === session?.user.id ? 'customer' : 'business'
  const participantName = session?.user.name || 'Katılımcı'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Video Randevu</h1>
            <p className="text-sm text-gray-600">
              {userRole === 'customer' 
                ? `${appointment?.businessName} ile randevunuz`
                : `${appointment?.customerName} ile randevunuz`
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Randevu Tarihi</p>
            <p className="font-medium">{appointment?.date}</p>
          </div>
        </div>
      </div>

      {/* Video Call Container */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {appointment && (
            <WebRTCVideoCall
              appointmentId={appointment.id}
              participantName={participantName}
              userRole={userRole}
            />
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>🎥</span>
              <span>Video kalitesi sorunları için kameranızı kontrol edin</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎵</span>
              <span>Ses sorunları için mikrofonunuzu kontrol edin</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>Mobil cihazlarda Chrome veya Safari kullanın</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoAppointmentPage
