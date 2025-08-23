'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoCameraIcon, MicrophoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline'

const WebRTCTest = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callStarted, setCallStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)

  const startCall = async () => {
    try {
      setError(null)
      console.log('Kamera erişimi isteniyor...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      })

      console.log('Stream alındı:', stream)
      console.log('Video tracks:', stream.getVideoTracks())
      console.log('Audio tracks:', stream.getAudioTracks())

      setLocalStream(stream)
      setCallStarted(true)
      
      // Video element'ine stream atama - async olarak yapıyoruz
      setTimeout(() => {
        if (localVideoRef.current) {
          console.log('Video element bulundu, stream atanıyor...')
          localVideoRef.current.srcObject = stream
          
          // Video yüklendiğinde play etme
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata yüklendi')
            localVideoRef.current?.play().catch(err => {
              console.error('Video play error:', err)
            })
          }
          
          // Video akışı başladığında
          localVideoRef.current.onloadstart = () => {
            console.log('Video yüklenmeye başladı')
          }
          
          // Video çalınmaya başladığında
          localVideoRef.current.onplay = () => {
            console.log('Video çalmaya başladı')
          }
        } else {
          console.error('Video element bulunamadı!')
        }
      }, 100)
      
    } catch (err) {
      console.error('Media access error:', err)
      setError(`Kamera hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        console.log('Video durumu:', videoTrack.enabled ? 'Açık' : 'Kapalı')
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        console.log('Audio durumu:', audioTrack.enabled ? 'Açık' : 'Kapalı')
      }
    }
  }

  const endCall = () => {
    console.log('Çağrı sonlandırılıyor...')
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop()
        console.log('Track durduruldu:', track.kind)
      })
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    setLocalStream(null)
    setCallStarted(false)
  }

  // Debug: Stream değişikliklerini izle
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Stream güncellendi, video element\'e atanıyor...')
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎥 WebRTC Video Test
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Test Area */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Kamera Testi</h2>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                {!callStarted ? (
                  <div className="h-64 flex flex-col items-center justify-center text-white">
                    <VideoCameraIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-gray-300 mb-4 text-center">
                      Kameranızı test etmek için başlatın
                    </p>
                    <button
                      onClick={startCall}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      📹 Kamerayı Başlat
                    </button>
                  </div>
                ) : (
                  <div className="relative h-64">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover ${!isVideoEnabled ? 'opacity-0' : ''}`}
                      style={{ 
                        transform: 'scaleX(-1)', // Selfie modunda ayna etkisi
                        backgroundColor: '#000' 
                      }}
                      onError={(e) => {
                        console.error('Video element hatası:', e)
                        setError('Video gösterme hatası')
                      }}
                      onCanPlay={() => console.log('Video çalmaya hazır')}
                      onPlaying={() => console.log('Video çalıyor')}
                    />
                    
                    {!isVideoEnabled && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-white">
                          <VideoCameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p>Video Kapalı</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      Siz
                    </div>
                    
                    {/* Debug Info */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {localStream ? `${localStream.getVideoTracks().length} video, ${localStream.getAudioTracks().length} audio` : 'Stream yok'}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              {callStarted && (
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
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
                    className={`p-3 rounded-full transition-colors ${
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
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                    title="Testi Bitir"
                  >
                    <PhoneXMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-red-600 underline text-sm"
                  >
                    Sayfayı yenile ve tekrar dene
                  </button>
                </div>
              )}
              
              {/* Debug Panel */}
              {callStarted && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p><strong>Debug:</strong></p>
                  <p>Stream: {localStream ? '✅ Var' : '❌ Yok'}</p>
                  <p>Video Tracks: {localStream?.getVideoTracks().length || 0}</p>
                  <p>Audio Tracks: {localStream?.getAudioTracks().length || 0}</p>
                  <p>Video Element: {localVideoRef.current ? '✅ Var' : '❌ Yok'}</p>
                  <p>Video Ready State: {localVideoRef.current?.readyState}</p>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Bilgileri</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">🔧 Sorun Giderme:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Kamera izni verdiğinizden emin olun</li>
                    <li>• Başka bir uygulama kamerayı kullanıyor olabilir</li>
                    <li>• F12 &gt; Console'da hata mesajlarını kontrol edin</li>
                    <li>• Sayfayı yenileyin ve tekrar deneyin</li>
                    <li>• HTTPS bağlantısı gereklidir</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">✅ WebRTC Avantajları:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Hiç login gerektirmez</li>
                    <li>• Ücretsiz ve sınırsız</li>
                    <li>• Tarayıcı tabanlı</li>
                    <li>• P2P güvenli bağlantı</li>
                    <li>• Düşük gecikme</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🔧 Test Adımları:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. "Kamerayı Başlat" tıklayın</li>
                    <li>2. Kamera izni verin</li>
                    <li>3. Kendinizi göreceksiniz</li>
                    <li>4. Butonlarla test edin</li>
                    <li>5. Ses ve video kontrolü yapın</li>
                  </ol>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">📱 Desteklenen Tarayıcılar:</h3>
                  <div className="text-sm text-purple-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Chrome:</span>
                      <span className="text-green-600">✓ Mükemmel</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firefox:</span>
                      <span className="text-green-600">✓ Mükemmel</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safari:</span>
                      <span className="text-green-600">✓ İyi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge:</span>
                      <span className="text-green-600">✓ İyi</span>
                    </div>
                  </div>
                </div>

                {callStarted && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">🎮 Kontroller:</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span>Mavi: Video aç/kapat</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Yeşil: Ses aç/kapat</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Kırmızı: Testi bitir</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {callStarted && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-4">🎉 Test Başarılı!</h3>
              <p className="text-green-800 mb-4">
                WebRTC video sistemi mükemmel çalışıyor! Artık RandevuPro'da hiç login gerektirmeden video randevu alabilirsiniz.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '/appointment/test-123/video'}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                >
                  Gerçek Test Yap
                </button>
                <button
                  onClick={() => window.location.href = '/video-test'}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
                >
                  Diğer Testler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WebRTCTest