'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface SimpleVideoCallProps {
  appointmentId: string
  participantName: string
  userRole: 'customer' | 'business'
}

const SimpleVideoCall = ({ appointmentId, participantName, userRole }: SimpleVideoCallProps) => {
  const router = useRouter()
  const [callEnded, setCallEnded] = useState(false)
  const [callStarted, setCallStarted] = useState(false)

  // Basit room name - Google auth problemini önler
  const roomName = `randevupro${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`

  // Video call tracking functions
  const startAppointmentTracking = async () => {
    try {
      await fetch('/api/video-calls/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'START',
          appointmentId,
          timestamp: new Date(),
          participant: participantName,
          role: userRole
        })
      })
      setCallStarted(true)
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }

  const endAppointmentTracking = async () => {
    try {
      await fetch('/api/video-calls/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'END',
          appointmentId,
          timestamp: new Date(),
          participant: participantName
        })
      })
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }

  // Basit Jitsi URL - hiç parameter yok, Google auth problemi çıkmaz
  const jitsiUrl = `https://meet.jit.si/${roomName}`

  useEffect(() => {
    startAppointmentTracking()

    const handleBeforeUnload = () => {
      endAppointmentTracking()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (callStarted) {
        endAppointmentTracking()
      }
    }
  }, [])

  const handleEndCall = async () => {
    await endAppointmentTracking()
    setCallEnded(true)
  }

  const openInNewTab = () => {
    window.open(jitsiUrl, '_blank', 'width=1200,height=800')
  }

  if (callEnded) {
    return <CallEndedScreen appointmentId={appointmentId} />
  }

  return (
    <div className="video-call-container">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Video Randevu</h2>
            <p className="text-white opacity-90 text-sm">Randevu ID: {appointmentId}</p>
            <p className="text-white opacity-75 text-xs">Katılımcı: {participantName}</p>
          </div>
          <div className="flex space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'business' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {userRole === 'business' ? 'İşletme' : 'Müşteri'}
            </div>
            <button
              onClick={openInNewTab}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium"
            >
              Yeni Sekmede Aç
            </button>
            <button
              onClick={handleEndCall}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium"
            >
              Bitir
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="p-6 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Video Görüşme Talimatları:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-2">✅ Otomatik Katılım:</p>
              <ol className="space-y-1 pl-4">
                <li>1. Aşağıdaki iframe'e tıklayın</li>
                <li>2. "Join Meeting" butonuna basın</li>
                <li>3. Kamera/mikrofon izni verin</li>
                <li>4. İsminiz otomatik gelecek</li>
              </ol>
            </div>
            <div>
              <p className="font-medium mb-2">🔧 Sorun Yaşarsanız:</p>
              <ol className="space-y-1 pl-4">
                <li>1. "Yeni Sekmede Aç" butonunu kullanın</li>
                <li>2. Chrome veya Safari kullanın</li>
                <li>3. Sayfayı yenileyin</li>
                <li>4. Kamera/mikrofon ayarlarını kontrol edin</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Jitsi Meet Iframe */}
        <div className="relative">
          <iframe
            src={jitsiUrl}
            width="100%"
            height="600"
            style={{ border: 'none' }}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title={`Video Call - ${appointmentId}`}
          />
        </div>
        
        {/* Help Section */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
            <div className="flex space-x-4">
              <span>🎥 HD Video</span>
              <span>🎵 Ses</span>
              <span>💬 Chat</span>
              <span>🖥️ Ekran Paylaşımı</span>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-xs">Oda Adı: {roomName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Call Ended Screen Component
const CallEndedScreen = ({ appointmentId }: { appointmentId: string }) => {
  const router = useRouter()

  const handleRating = () => {
    router.push(`/appointments/${appointmentId}/review`)
  }

  const goToAppointments = () => {
    router.push('/appointments')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckIcon className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Görüşme Tamamlandı ✅
      </h2>
      
      <p className="text-gray-600 mb-6">
        Video randevunuz başarıyla tamamlandı. Teşekkür ederiz!
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={handleRating}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Değerlendirme Yap ⭐
        </button>
        
        <button 
          onClick={goToAppointments}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Randevularıma Dön
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>İpucu:</strong> Video randevu deneyiminizi değerlendirmeyi unutmayın!
        </p>
      </div>
    </div>
  )
}

export default SimpleVideoCall
