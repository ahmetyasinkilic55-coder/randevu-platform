'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface VideoCallProps {
  appointmentId: string
  participantName: string
  userRole: 'customer' | 'business'
}

const VideoCall = ({ appointmentId, participantName, userRole }: VideoCallProps) => {
  const router = useRouter()
  const [callEnded, setCallEnded] = useState(false)
  const [callStarted, setCallStarted] = useState(false)

  // Jitsi room name - unique per appointment
  const roomName = `randevupro-${appointmentId}-${Date.now()}`
  const jitsiDomain = 'meet.jit.si'

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

  // Jitsi iframe URL with custom config
  const jitsiUrl = `https://${jitsiDomain}/${roomName}` +
    `?userInfo.displayName=${encodeURIComponent(participantName)}` +
    `&config.startWithAudioMuted=false` +
    `&config.startWithVideoMuted=false` +
    `&config.prejoinPageEnabled=false` +
    `&config.enableWelcomePage=false` +
    `&config.requireDisplayName=false` +
    `&config.enableUserRolesBasedOnToken=false` +
    `&config.enableInsecureRoomNameWarning=false` +
    `&config.disableDeepLinking=true` +
    `&config.startScreenSharing=false` +
    `&config.channelLastN=-1` +
    `&config.startWithVideoMuted=false` +
    `&config.startWithAudioMuted=false` +
    `&interfaceConfig.SHOW_JITSI_WATERMARK=false` +
    `&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false` +
    `&interfaceConfig.DEFAULT_BACKGROUND=%23667eea` +
    `&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true` +
    `&interfaceConfig.HIDE_INVITE_MORE_HEADER=true`

  useEffect(() => {
    // Call started tracking
    startAppointmentTracking()

    // Listen for page unload (call ended)
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
          </div>
          <div className="flex space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'business' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {userRole === 'business' ? 'İşletme' : 'Müşteri'}
            </div>
            <button
              onClick={handleEndCall}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium"
            >
              Görüşmeyi Bitir
            </button>
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
            title="Video Call"
          />
          
          {/* Overlay with instructions */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm max-w-xs">
            <p className="font-medium mb-1">🎥 Video Randevu Başladı</p>
            <p className="text-xs opacity-90">
              Kamera ve mikrofon izinlerini vermeyi unutmayın. 
              Görüşme kayıt altına alınmaktadır.
            </p>
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
        Görüşme Tamamlandı
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
          💡 <strong>İpucu:</strong> Düzenli randevularınız için hatırlatma kurabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default VideoCall
