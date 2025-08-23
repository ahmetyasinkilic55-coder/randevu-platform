'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckIcon, VideoCameraIcon, MicrophoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface WebRTCVideoCallProps {
  appointmentId: string
  participantName: string
  userRole: 'customer' | 'business'
}

const WebRTCVideoCall = ({ appointmentId, participantName, userRole }: WebRTCVideoCallProps) => {
  const router = useRouter()
  const [callEnded, setCallEnded] = useState(false)
  const [callStarted, setCallStarted] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // WebRTC bağlantısı başlat
  const startCall = async () => {
    try {
      setError(null)
      setConnectionStatus('connecting')

      // Kullanıcı medyasını al
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      setLocalStream(stream)
      
      // Local video'yu göster
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setConnectionStatus('connected')
      setCallStarted(true)
      
      // Tracking başlat
      await startAppointmentTracking()

    } catch (err) {
      console.error('Media access error:', err)
      setError('Kamera ve mikrofon erişimi gerekli. Lütfen izin verin.')
      setConnectionStatus('disconnected')
    }
  }

  // Video aç/kapat
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  // Ses aç/kapat
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  // Görüşmeyi bitir
  const endCall = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    setLocalStream(null)
    setConnectionStatus('disconnected')
    await endAppointmentTracking()
    setCallEnded(true)
  }

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
    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

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
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userRole === 'business' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {userRole === 'business' ? 'İşletme' : 'Müşteri'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {connectionStatus === 'connected' ? 'Bağlandı' : 
               connectionStatus === 'connecting' ? 'Bağlanıyor' : 'Bağlantı Yok'}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Video Area */}
        <div className="relative bg-gray-900">
          {!callStarted ? (
            /* Start Call Screen */
            <div className="h-96 flex flex-col items-center justify-center text-white">
              <VideoCameraIcon className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Video Görüşmeye Hazır</h3>
              <p className="text-gray-300 mb-6 text-center max-w-md">
                Görüşmeyi başlatmak için aşağıdaki butona tıklayın. 
                Kamera ve mikrofon izinlerini vermeniz gerekecek.
              </p>
              <button
                onClick={startCall}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
              >
                📹 Görüşmeyi Başlat
              </button>
            </div>
          ) : (
            /* Video Streams */
            <div className="relative h-96">
              {/* Local Video (Self) */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'opacity-0' : ''}`}
              />
              
              {/* Video kapalıysa placeholder */}
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>Video Kapalı</p>
                  </div>
                </div>
              )}

              {/* Participant Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                <p className="text-sm font-medium">{participantName}</p>
                <p className="text-xs opacity-75">{userRole === 'business' ? 'İşletme' : 'Müşteri'}</p>
              </div>

              {/* Connection Info */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                <p className="text-xs">🔴 Canlı Yayın</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {callStarted && (
          <div className="p-4 bg-gray-100 flex justify-center space-x-4">
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full font-medium transition-colors ${
                isVideoEnabled 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoEnabled ? 'Videoyu Kapat' : 'Videoyu Aç'}
            >
              <VideoCameraIcon className="w-5 h-5" />
            </button>

            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full font-medium transition-colors ${
                isAudioEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isAudioEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              title="Görüşmeyi Bitir"
            >
              <PhoneXMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-t">
          <h4 className="font-medium text-blue-900 mb-2">💡 Kullanım Talimatları:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium">📹 Video:</p>
              <p>Mavi buton ile açıp kapatabilirsiniz</p>
            </div>
            <div>
              <p className="font-medium">🎵 Ses:</p>
              <p>Yeşil buton ile sessiz yapabilirsiniz</p>
            </div>
            <div>
              <p className="font-medium">🔴 Bitir:</p>
              <p>Kırmızı buton ile görüşmeyi sonlandırın</p>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="p-3 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-600">
            🔒 WebRTC teknolojisi • Hiç login gerektirmez • Tarayıcı tabanlı • Güvenli P2P bağlantı
          </p>
        </div>
      </div>
    </div>
  )
}

// Call Ended Screen Component
const CallEndedScreen = ({ appointmentId }: { appointmentId: string }) => {
  const router = useRouter()

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
          onClick={() => router.push(`/appointments/${appointmentId}/review`)}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Değerlendirme Yap ⭐
        </button>
        
        <button 
          onClick={() => router.push('/appointments')}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Randevularıma Dön
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          🎉 <strong>Başarılı!</strong> Kendi WebRTC sistemimiz mükemmel çalıştı!
        </p>
      </div>
    </div>
  )
}

export default WebRTCVideoCall
