'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoCameraIcon, MicrophoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline'

const WebRTCTest = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callStarted, setCallStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)

  const addDebug = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const startCall = async () => {
    try {
      setError(null)
      setDebugInfo([])
      addDebug('🔄 Kamera erişimi başlatılıyor...')
      
      // Önce mevcut cihazları listele
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      addDebug(`📹 ${videoDevices.length} video cihaz bulundu`)
      
      videoDevices.forEach((device, index) => {
        addDebug(`   ${index + 1}. ${device.label || 'Bilinmeyen kamera'} (${device.deviceId})`)
      })

      // Stream constraint'leri
      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      }
      
      addDebug('📝 Stream constraints: ' + JSON.stringify(constraints, null, 2))

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      addDebug('✅ Stream başarıyla alındı')
      
      // Stream detayları
      addDebug(`🎥 Video tracks: ${stream.getVideoTracks().length}`)
      addDebug(`🎵 Audio tracks: ${stream.getAudioTracks().length}`)
      
      stream.getVideoTracks().forEach((track, index) => {
        addDebug(`   Video Track ${index + 1}:`)
        addDebug(`     - Label: ${track.label}`)
        addDebug(`     - Kind: ${track.kind}`)
        addDebug(`     - Enabled: ${track.enabled}`)
        addDebug(`     - ReadyState: ${track.readyState}`)
        addDebug(`     - Settings: ${JSON.stringify(track.getSettings())}`)
      })

      setLocalStream(stream)
      setCallStarted(true)
      
      // Video element'e stream atama - immediate ve delayed
      addDebug('🔗 Video element\'e stream atanıyor...')
      
      const assignStreamToVideo = () => {
        if (localVideoRef.current) {
          addDebug('✅ Video element bulundu')
          localVideoRef.current.srcObject = stream
          addDebug('🎬 srcObject atandı')
          
          // Video element event listeners
          localVideoRef.current.onloadstart = () => addDebug('📺 Video loadstart event')
          localVideoRef.current.onloadeddata = () => addDebug('📺 Video loadeddata event')
          localVideoRef.current.onloadedmetadata = () => {
            addDebug('📺 Video loadedmetadata event')
            addDebug(`   Video boyutları: ${localVideoRef.current?.videoWidth}x${localVideoRef.current?.videoHeight}`)
          }
          localVideoRef.current.oncanplay = () => addDebug('📺 Video canplay event')
          localVideoRef.current.oncanplaythrough = () => addDebug('📺 Video canplaythrough event')
          localVideoRef.current.onplay = () => addDebug('📺 Video play event')
          localVideoRef.current.onplaying = () => addDebug('📺 Video playing event - GÖRÜNTÜ BAŞLADI!')
          localVideoRef.current.onstalled = () => addDebug('❌ Video stalled event')
          localVideoRef.current.onerror = (e) => {
            addDebug('❌ Video error event: ' + JSON.stringify(e))
          }
          
          // Manuel play çağrısı
          localVideoRef.current.play()
            .then(() => addDebug('✅ Video.play() başarılı'))
            .catch(err => addDebug('❌ Video.play() hatası: ' + err.message))
            
        } else {
          addDebug('❌ Video element bulunamadı!')
        }
      }
      
      // Immediate assignment
      assignStreamToVideo()
      
      // Delayed assignment (React render cycle için)
      setTimeout(assignStreamToVideo, 100)
      setTimeout(assignStreamToVideo, 500)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      addDebug('❌ Hata: ' + errorMsg)
      setError(errorMsg)
    }
  }

  const testVideoElement = () => {
    if (!localVideoRef.current) {
      addDebug('❌ Video element yok')
      return
    }
    
    const video = localVideoRef.current
    addDebug('🔍 Video Element Test:')
    addDebug(`   - srcObject: ${video.srcObject ? 'Var' : 'Yok'}`)
    addDebug(`   - readyState: ${video.readyState}`)
    addDebug(`   - videoWidth: ${video.videoWidth}`)
    addDebug(`   - videoHeight: ${video.videoHeight}`)
    addDebug(`   - paused: ${video.paused}`)
    addDebug(`   - currentTime: ${video.currentTime}`)
    addDebug(`   - duration: ${video.duration}`)
    addDebug(`   - ended: ${video.ended}`)
    addDebug(`   - muted: ${video.muted}`)
    addDebug(`   - volume: ${video.volume}`)
    
    // Manuel play dene
    video.play()
      .then(() => addDebug('✅ Manuel play başarılı'))
      .catch(err => addDebug('❌ Manuel play hatası: ' + err.message))
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        addDebug(`🎥 Video ${videoTrack.enabled ? 'açıldı' : 'kapatıldı'}`)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        addDebug(`🎵 Audio ${audioTrack.enabled ? 'açıldı' : 'kapatıldı'}`)
      }
    }
  }

  const endCall = () => {
    addDebug('🛑 Çağrı sonlandırılıyor...')
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop()
        addDebug(`🛑 ${track.kind} track durduruldu`)
      })
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    setLocalStream(null)
    setCallStarted(false)
  }

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎥 WebRTC Debug Test
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Test Area */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Kamera Testi</h2>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
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
                      📹 DEBUG TEST BAŞLAT
                    </button>
                  </div>
                ) : (
                  <div className="relative h-64 bg-black">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      controls={false}
                      className={`w-full h-full object-cover ${!isVideoEnabled ? 'opacity-0' : ''}`}
                      style={{ 
                        transform: 'scaleX(-1)',
                        backgroundColor: '#000',
                        border: '2px solid red' // Debug için kırmızı border
                      }}
                    />
                    
                    {!isVideoEnabled && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-white">
                          <VideoCameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p>Video Kapalı</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      Siz
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {localStream ? `${localStream.getVideoTracks().length}V ${localStream.getAudioTracks().length}A` : 'No Stream'}
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              {callStarted && (
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
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
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={testVideoElement}
                    className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                    title="Video Element Test"
                  >
                    🔍
                  </button>

                  <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <PhoneXMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Debug Panel */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Debug Log</h2>
              
              <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto text-xs font-mono">
                {debugInfo.length === 0 ? (
                  <p className="text-gray-500">Debug logları burada görünecek...</p>
                ) : (
                  debugInfo.map((log, index) => (
                    <div key={index} className="mb-1 break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => setDebugInfo([])}
                className="mt-2 w-full bg-gray-600 text-white py-2 rounded text-sm"
              >
                Logları Temizle
              </button>

              {/* Quick Status */}
              {callStarted && (
                <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                  <h3 className="font-semibold mb-2">⚡ Hızlı Durum:</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Stream:</span>
                      <span className={localStream ? 'text-green-600' : 'text-red-600'}>
                        {localStream ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video Element:</span>
                      <span className={localVideoRef.current ? 'text-green-600' : 'text-red-600'}>
                        {localVideoRef.current ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video Ready:</span>
                      <span className={localVideoRef.current?.readyState === 4 ? 'text-green-600' : 'text-red-600'}>
                        {localVideoRef.current?.readyState === 4 ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video Size:</span>
                      <span>
                        {localVideoRef.current?.videoWidth || 0}x{localVideoRef.current?.videoHeight || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebRTCTest