'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, ArrowRight, Globe } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basit validasyon
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      setIsLoading(false)
      return
    }

    try {
      // API call simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    } catch (error) {
      setError('Kayıt sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Kayıt Başarılı! ✅</h2>
          <p className="text-slate-600">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo ve Başlık */}
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Kayıt Ol
          </h2>
          <p className="text-slate-600">
            Randevu platformuna katılın ve işletmenizi büyütün
          </p>
        </div>

        {/* Kayıt Formu */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Ad Soyad */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  placeholder="Ahmet Yılmaz"
                />
              </div>
            </div>

            {/* E-posta */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Şifre Tekrarı */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800 mb-2">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-900 focus:ring-4 focus:ring-slate-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Kayıt yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Kayıt Ol</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Alt Linkler */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Zaten hesabınız var mı?{' '}
            <button 
              onClick={() => router.push('/auth/signin')}
              className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
            >
              Giriş yapın
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
