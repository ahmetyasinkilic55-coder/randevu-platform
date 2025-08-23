// app/[businessSlug]/BusinessSiteClient.jsx
'use client'

import React, { useState } from 'react'
import { Star, MapPin, Phone, Mail, Clock, Calendar, MessageCircle } from 'lucide-react'

export default function BusinessSiteClient({ businessData }) {
  const [showBookingModal, setShowBookingModal] = useState(false)

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const colors = businessData.customizations.colorTheme

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="h-80 bg-cover bg-center relative"
          style={{ 
            backgroundImage: businessData.coverPhoto ? `url(${businessData.coverPhoto})` : '',
            background: !businessData.coverPhoto ? colors.gradient : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Profile Photo */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
              {businessData.profilePhoto ? (
                <img 
                  src={businessData.profilePhoto} 
                  alt={businessData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                  {businessData.sector === 'berber' ? '✂️' : '💇‍♀️'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Business Info */}
        <div className="pt-20 pb-12 px-4 text-center bg-white">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{businessData.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{businessData.customizations.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {renderStars(Math.floor(businessData.rating))}
            <span className="text-gray-600 ml-2 font-medium">
              {businessData.rating} ({businessData.reviewCount} değerlendirme)
            </span>
          </div>
          <button 
            onClick={() => setShowBookingModal(true)}
            className="bg-white text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2"
            style={{ 
              backgroundColor: colors.primary,
              borderColor: colors.primary 
            }}
          >
            📅 {businessData.customizations.buttonText}
          </button>
        </div>
      </div>

      {/* Services Section */}
      {businessData.customizations.showServices && (
        <div className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
              Hizmetlerimiz
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {businessData.services.map((service, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-3xl font-black mb-3" style={{ color: colors.primary }}>{service.price}₺</p>
                  <p className="text-sm text-gray-500 mb-4">{service.duration} dakika</p>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {businessData.customizations.showGallery && businessData.gallery && (
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
              Galeri
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {businessData.gallery.map((photo, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-lg">
                  <img 
                    src={photo} 
                    alt={`${businessData.name} Galeri ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {businessData.customizations.showReviews && (
        <div className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
              Müşteri Yorumları
            </h2>
            <div className="space-y-8">
              {businessData.reviews.map((review, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="flex items-start gap-6">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-bold text-lg text-gray-900">{review.name}</h4>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed text-lg">{review.comment}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      {businessData.customizations.showMap && (
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.primary }}>
              Konum
            </h2>
            <div className="bg-gray-200 h-80 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg">
              {/* Simulated Interactive Map */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                <div className="absolute top-6 left-6 bg-white p-3 rounded-lg shadow">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div className="absolute bottom-6 right-6 bg-white/95 p-4 rounded-xl max-w-sm shadow-lg">
                  <p className="font-bold text-lg">{businessData.name}</p>
                  <p className="text-sm text-gray-600">{businessData.address}</p>
                  <p className="text-xs text-gray-500 mt-1">Haritada yol tarifi için tıklayın</p>
                </div>
                {/* Simulated roads and location */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-400 transform -rotate-12 opacity-60"></div>
                <div className="absolute top-0 left-1/3 w-2 h-full bg-gray-400 opacity-60"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      {businessData.customizations.showContact && (
        <div className="py-16 px-4 bg-gray-900 text-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">İletişim</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <Phone className="w-6 h-6" />
                  İletişim Bilgileri
                </h3>
                <div className="space-y-4">
                  <a href={`tel:${businessData.phone}`} className="flex items-center gap-3 text-lg hover:text-blue-300 transition-colors">
                    <Phone className="w-5 h-5" />
                    {businessData.phone}
                  </a>
                  <a href={`mailto:${businessData.email}`} className="flex items-center gap-3 text-lg hover:text-blue-300 transition-colors">
                    <Mail className="w-5 h-5" />
                    {businessData.email}
                  </a>
                  <div className="flex items-start gap-3 text-lg">
                    <MapPin className="w-5 h-5 mt-1" />
                    <span>{businessData.address}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  Çalışma Saatleri
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Pazartesi - Cuma:</span>
                    <span className="font-medium">{businessData.workingHours.monday}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Cumartesi:</span>
                    <span className="font-medium">{businessData.workingHours.saturday}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Pazar:</span>
                    <span className="font-medium">{businessData.workingHours.sunday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-center mb-6" style={{ color: colors.primary }}>
              Randevu Al
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Randevu almak için telefon numaramızı arayabilir veya WhatsApp üzerinden mesaj gönderebilirsiniz.
            </p>
            <div className="space-y-4">
              <a 
                href={`tel:${businessData.phone}`}
                className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                📞 {businessData.phone}
              </a>
              <a 
                href={`https://wa.me/${businessData.phone.replace(/\s/g, '').replace(/[()]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all hover:scale-105"
              >
                💬 WhatsApp ile Mesaj Gönder
              </a>
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowBookingModal(true)}
          className="w-16 h-16 rounded-full text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Calendar className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}