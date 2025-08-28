'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="text-white text-2xl font-bold">📅</div>
          </div>
          
          {/* Loading Animation */}
          <div className="mb-6">
            <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Yönlendiriliyor...
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Sisteme erişim sağlanıyor. Ana sayfaya yönlendiriliyorsunuz.
          </p>
          
          {/* Countdown */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {countdown}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${((3 - countdown) / 3) * 100}%`
              }}
            ></div>
          </div>
          
          {/* Manual Redirect Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Ana Sayfaya Git</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Bottom Info */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Randevu Yönetim Platformu
          </p>
        </div>
      </div>
    </div>
  )
}
