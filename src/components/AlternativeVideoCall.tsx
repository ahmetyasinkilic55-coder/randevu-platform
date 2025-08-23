'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface AlternativeVideoCallProps {
  appointmentId: string
  participantName: string
  userRole: 'customer' | 'business'
}

const AlternativeVideoCall = ({ appointmentId, participantName, userRole }: AlternativeVideoCallProps) => {
  const router = useRouter()
  const [callEnded, setCallEnded] = useState(false)
  const [callStarted, setCallStarted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>('')

  // Farklı video seçenekleri
  const videoOptions = [
    {
      id: 'jitsi',
      name: 'Jitsi Meet',
      url: `https://meet.jit.si/randevupro${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`,
      description: 'Ücretsiz, kayıt gerektirmez',
      icon: '🎥'
    },
    {
      id: 'whereby',
      name: 'Whereby',
      url: `https://whereby.com/randevupro-${appointmentId}`,
      description: 'Kolay kullanım, browser tabanlı',
      icon: '📹'
    },
    {
      id: 'meet8x8',
      name: '8x8 Meet',
      url: `https://8x8.vc/randevupro${appointmentId}`,
      description: 'Jitsi alternatifi',
      icon: '🎬'
    },
    {
      id: 'google',
      name: 'Google Meet',
      url: `https://meet.google.com/new`,
      description: 'Google hesabı gerekli',
      icon: '💼'
    }
  ]

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

  const startVideoCall = (option: any) => {
    setSelectedOption(option.id)
    window.open(option.url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  }

  if (callEnded) {
    return <CallEndedScreen appointmentId={appointmentId} />
  }

  return (
    <div className="video-call-container">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <h2 className="text-white text-2xl font-bold mb-2">Video Randevu Başlatın</h2>
          <p className="text-white opacity-90">Randevu ID: {appointmentId}</p>
          <p className="text-white opacity-75 text-sm">Katılımcı: {participantName} ({userRole === 'business' ? 'İşletme' : 'Müşteri'})</p>
        </div>
        
        {/* Video Platform Seçenekleri */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Video görüşme platformu seçin:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoOptions.map((option) => (
              <div
                key={option.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOption === option.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
                onClick={() => startVideoCall(option)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                    Başlat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manuel Link */}
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="font-medium text-gray-900 mb-3">🔗 Manuel Bağlantı</h4>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">
              Platformlar çalışmazsa bu linki kopyalayıp tarayıcınızda açın:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`https://meet.jit.si/randevupro${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://meet.jit.si/randevupro${appointmentId.replace(/[^a-zA-Z0-9]/g, '')}`)
                  alert('Link kopyalandı!')
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
              >
                Kopyala
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="p-6 bg-yellow-50 border-t">
          <h4 className="font-medium text-yellow-900 mb-3">⚠️ Sorun Giderme</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <p className="font-medium mb-2">Jitsi "Toplantı sahibi bekleniyor" diyor:</p>
              <ul className="space-y-1 pl-4">
                <li>• Whereby'i deneyin (daha kolay)</li>
                <li>• 8x8 Meet'i deneyin</li>
                <li>• Manuel linki farklı tarayıcıda açın</li>
                <li>• Incognito/Özel mod kullanın</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Genel çözümler:</p>
              <ul className="space-y-1 pl-4">
                <li>• Chrome veya Safari kullanın</li>
                <li>• Kamera/mikrofon izinlerini verin</li>
                <li>• VPN kapatın</li>
                <li>• Sayfayı yenileyin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* End Call Button */}
        <div className="p-4 bg-gray-100 border-t text-center">
          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Görüşmeyi Bitir
          </button>
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
          💡 <strong>Feedback:</strong> Hangi platform en iyi çalıştı? Bize bildirin!
        </p>
      </div>
    </div>
  )
}

export default AlternativeVideoCall
