'use client'

import React, { useState, useRef } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { 
  XMarkIcon,
  UserIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  initialUserType?: 'customer' | 'business'
}

// Basit CAPTCHA bileşeni
const SimpleCaptcha = ({ onVerify }: { onVerify: (isValid: boolean) => void }) => {
  const [captchaValue, setCaptchaValue] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operators = ['+', '-', '*']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let result
    let question
    
    switch(operator) {
      case '+':
        result = num1 + num2
        question = `${num1} + ${num2}`
        break
      case '-':
        result = Math.abs(num1 - num2)
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`
        break
      case '*':
        result = num1 * num2
        question = `${num1} × ${num2}`
        break
      default:
        result = num1 + num2
        question = `${num1} + ${num2}`
    }
    
    setCaptchaValue(result.toString())
    return question
  }

  const [captchaQuestion, setCaptchaQuestion] = useState(() => generateCaptcha())

  const refreshCaptcha = () => {
    const newQuestion = generateCaptcha()
    setCaptchaQuestion(newQuestion)
    setUserInput('')
    setIsVerified(false)
    onVerify(false)
  }

  const verifyCaptcha = (input: string) => {
    const isValid = input === captchaValue
    setIsVerified(isValid)
    onVerify(isValid)
    return isValid
  }

  React.useEffect(() => {
    refreshCaptcha()
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Güvenlik Doğrulaması</label>
      <div className="flex items-center space-x-3">
        <div className="flex-1 flex items-center space-x-2">
          <div className="bg-slate-100 px-4 py-2 rounded-lg font-mono text-lg font-bold text-slate-800 min-w-[100px] text-center border-2 border-slate-200">
            {captchaQuestion} = ?
          </div>
          <button
            type="button"
            onClick={refreshCaptcha}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Yenile"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Sonucu yazın"
          value={userInput}
          onChange={(e) => {
            const value = e.target.value
            setUserInput(value)
            verifyCaptcha(value)
          }}
          className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors ${
            userInput ? (isVerified ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : 'border-slate-300'
          }`}
          required
        />
        {userInput && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isVerified ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Şifre gücü kontrolü
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (pwd: string) => {
    let score = 0
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    return { score, checks }
  }

  if (!password) return null

  const { score, checks } = getStrength(password)
  
  const strengthLevels = [
    { text: 'Çok Zayıf', color: 'bg-red-500', textColor: 'text-red-600' },
    { text: 'Zayıf', color: 'bg-red-400', textColor: 'text-red-600' },
    { text: 'Orta', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { text: 'Güçlü', color: 'bg-green-500', textColor: 'text-green-600' }
  ]

  const currentLevel = strengthLevels[score - 1] || strengthLevels[0]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Şifre Gücü:</span>
        <span className={`text-xs font-semibold ${currentLevel.textColor}`}>
          {currentLevel.text}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${currentLevel.color}`}
          style={{ width: `${(score / 4) * 100}%` }}
        ></div>
      </div>
      <div className="text-xs text-slate-500 space-y-1">
        <div className={`flex items-center space-x-1 ${checks.length ? 'text-green-600' : ''}`}>
          <span>{checks.length ? '✓' : '✗'}</span>
          <span>En az 8 karakter</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.uppercase && checks.lowercase ? 'text-green-600' : ''}`}>
          <span>{checks.uppercase && checks.lowercase ? '✓' : '✗'}</span>
          <span>Büyük ve küçük harf</span>
        </div>
        <div className={`flex items-center space-x-1 ${checks.number ? 'text-green-600' : ''}`}>
          <span>{checks.number ? '✓' : '✗'}</span>
          <span>En az bir rakam</span>
        </div>
      </div>
    </div>
  )
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  initialUserType = 'customer' 
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState(initialMode)
  const [userType, setUserType] = useState(initialUserType)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  const resetForm = () => {
    // Beni hatırla seçili değilse tüm alanları temizle
    if (!rememberMe) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
    } else {
      // Beni hatırla seçiliyse sadece şifre dışındaki alanları temizle (kayıt modu için)
      setFormData(prev => ({ 
        ...prev, 
        name: '', 
        confirmPassword: '', 
        phone: '' 
      }))
    }
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsCaptchaVerified(false)
    // rememberMe durumunu koruştur
  }

  // Sayfa yüklenirken "Beni hatırla" bilgilerini kontrol et - sadece login modunda
  React.useEffect(() => {
    if (authMode === 'login') {
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      const rememberedPassword = localStorage.getItem('rememberedPassword')
      const rememberMeState = localStorage.getItem('rememberMe')
      
      if (rememberMeState === 'true' && rememberedEmail) {
        setFormData(prev => ({ 
          ...prev, 
          email: rememberedEmail,
          password: rememberedPassword ? atob(rememberedPassword) : '' // Base64 decode
        }))
        setRememberMe(true)
      }
    } else {
      // Kayıt modunda "Beni hatırla" bilgilerini temizle
      setFormData(prev => ({ 
        ...prev, 
        email: '', 
        password: '' 
      }))
      setRememberMe(false)
    }
  }, [isOpen, authMode])

  const handleClose = () => {
    // Sadece form verilerini sıfırla, "Beni hatırla" durumunu koru
    if (!rememberMe) {
      resetForm()
    }
    setShowForgotPassword(false)
    onClose()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Şifre sıfırlama API'si çağrısı burada olacak
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.')
      setShowForgotPassword(false)
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isCaptchaVerified) {
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın.')
      return
    }
    
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Giriş başarısız. Email ve şifrenizi kontrol edin.')
      } else {
        // Başarılı giriş sonrası session'u yenile ve kontrol et
        const sessionResponse = await fetch('/api/auth/session')
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          
          // Kullanıcı tipi kontrolü
          if (sessionData?.user?.role) {
            const userRole = sessionData.user.role
            
            // Seçilen tip ile gerçek rol eşleşiyor mu kontrol et
            if (userType === 'customer' && userRole !== 'CUSTOMER') {
              toast.error('Bu hesap müşteri hesabı değil. Lütfen İşletme seçeneğini kullanın.')
              await signOut({ redirect: false })
              setIsLoading(false)
              return
            }
            
            if (userType === 'business' && userRole !== 'BUSINESS_OWNER') {
              toast.error('Bu hesap işletme hesabı değil. Lütfen Müşteri seçeneğini kullanın.')
              await signOut({ redirect: false })
              setIsLoading(false)
              return
            }
            
            // Beni hatırla seçeneği
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', formData.email)
              localStorage.setItem('rememberedPassword', btoa(formData.password)) // Base64 encode
              localStorage.setItem('rememberMe', 'true')
            } else {
              localStorage.removeItem('rememberedEmail')
              localStorage.removeItem('rememberedPassword')
              localStorage.removeItem('rememberMe')
            }
            
            toast.success('Başarıyla giriş yaptınız!')
            handleClose()
            
            // İşletme hesabı ise dashboard'a yönlendir
            if (userType === 'business' && userRole === 'BUSINESS_OWNER') {
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 500)
            }
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor.')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır.')
      return
    }
    
    // Telefon kontrolü
    if (!formData.phone || formData.phone.trim() === '') {
      toast.error('Telefon numarası zorunludur.')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: 'customer', // Sadece müşteri kaydı
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.')
        setAuthMode('login')
        resetForm()
      } else {
        toast.error(data.error || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
    setShowForgotPassword(false)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          type="button"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {showForgotPassword ? 'Şifremi Unuttum' : (authMode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur')}
          </h2>
          <p className="text-slate-600 mb-4">
            {showForgotPassword 
              ? 'E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim'
              : authMode === 'login'
                ? 'Randevularınızı kolayca yönetin'
                : 'Hemen ücretsiz hesap oluşturun'
            }
          </p>
          
          {/* İşletme Kaydı Butonu - Sadece kayıt formunda göster */}
          {authMode === 'register' && (
            <div className="mb-4">
              <Link
                href="/business"
                onClick={handleClose}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <BuildingStorefrontIcon className="w-4 h-4" />
                <span>İşletme Kaydı</span>
              </Link>
              <p className="text-xs text-slate-500 mt-2">İşletme sahibi misiniz? Yukarıdaki butonu kullanın.</p>
            </div>
          )}
        </div>

        {showForgotPassword ? (
          /* Şifremi Unuttum Formu */
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta Adresi</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors"
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-emerald-600 font-semibold hover:underline transition-colors"
                disabled={isLoading}
              >
                ← Giriş ekranına dön
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* User Type Toggle - Sadece Giriş Yaparken */}
            {authMode === 'login' && (
              <div className="bg-slate-50 rounded-xl p-1 mb-8">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setUserType('customer')}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      userType === 'customer'
                        ? 'bg-white text-emerald-700 shadow-md border-2 border-emerald-200'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Müşteri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('business')}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      userType === 'business'
                        ? 'bg-white text-emerald-700 shadow-md border-2 border-emerald-200'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <BuildingStorefrontIcon className="w-5 h-5" />
                    <span>İşletme</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-6">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad *</label>
                  <input
                    type="text"
                    placeholder="Adınızı ve soyadınızı girin"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors"
                    required
                    autoComplete="name"
                  />
                </div>
              )}
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon *</label>
                  <input
                    type="tel"
                    placeholder="0555 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors"
                    required
                    autoComplete="tel"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta Adresi *</label>
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Şifre *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'register' ? 'Güçlü bir şifre oluşturun' : 'Şifrenizi girin'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors"
                    required
                    minLength={authMode === 'register' ? 8 : undefined}
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {authMode === 'register' && formData.password && (
                  <div className="mt-3">
                    <PasswordStrength password={formData.password} />
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Şifrenizi tekrar girin"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:border-emerald-500 text-slate-800 placeholder-slate-500 transition-colors ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-emerald-500'
                      }`}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Şifreler eşleşmiyor</p>
                  )}
                </div>
              )}

              {/* CAPTCHA - Sadece giriş yaparken */}
              {authMode === 'login' && (
                <SimpleCaptcha onVerify={setIsCaptchaVerified} />
              )}

              {/* Remember Me - Sadece giriş yaparken */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Beni hatırla</span>
                      <span className="text-xs text-slate-400">(Email ve şifre kaydedilir)</span>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-emerald-600 font-semibold hover:underline transition-colors"
                  >
                    Şifremi unuttum
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading || (authMode === 'login' && !isCaptchaVerified)}
                className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isLoading || (authMode === 'login' && !isCaptchaVerified)
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>{authMode === 'login' ? 'Güvenli Giriş Yap' : 'Hesap Oluştur'}</span>
                  </div>
                )}
              </button>
            </form>

            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                {authMode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-emerald-600 font-semibold ml-2 hover:underline transition-colors"
                  disabled={isLoading}
                >
                  {authMode === 'login' ? 'Hemen kayıt olun' : 'Giriş yapın'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
