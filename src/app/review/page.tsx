'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AppointmentData {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  business: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  service: {
    name: string;
    price: number;
  };
  staff?: {
    name: string;
  };
}

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointment');
  const customerPhone = searchParams.get('phone');

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceRating, setServiceRating] = useState(0);
  const [staffRating, setStaffRating] = useState(0);
  const [facilitiesRating, setFacilitiesRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Phone verification state
  const [phoneInput, setPhoneInput] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      checkCanReview();
    } else {
      setError('Randevu ID bulunamadı');
      setLoading(false);
    }
  }, [appointmentId]);

  const checkCanReview = async () => {
    try {
      setLoading(true);
      
      // Eğer phone parametresi boş veya yoksa, telefon doğrulama ekranını göster
      if (!customerPhone || customerPhone.trim() === '') {
        setShowPhoneVerification(true);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/reviews/can-review?appointmentId=${appointmentId}&customerPhone=${encodeURIComponent(customerPhone)}`
      );
      const data = await response.json();

      if (data.canReview) {
        setAppointment(data.appointment);
        setCanReview(true);
        setCustomerName(data.appointment.customerName || '');
      } else {
        setError(data.reason || 'Bu randevu için değerlendirme yapılamaz');
      }
    } catch (err) {
      setError('Değerlendirme kontrolü yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (!phoneInput.trim()) {
      setError('Lütfen telefon numaranızı girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/reviews/can-review?appointmentId=${appointmentId}&customerPhone=${encodeURIComponent(phoneInput)}`
      );
      const data = await response.json();

      if (data.canReview) {
        setAppointment(data.appointment);
        setCanReview(true);
        setShowPhoneVerification(false);
        setCustomerName(data.appointment.customerName || '');
        
        // URL'i güncelle
        const newUrl = `${window.location.pathname}?appointment=${appointmentId}&phone=${encodeURIComponent(phoneInput)}`;
        window.history.replaceState({}, '', newUrl);
      } else {
        setError(data.reason || 'Bu telefon numarası ile randevu bulunamadı');
      }
    } catch (err) {
      setError('Telefon doğrulaması yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !comment.trim() || !customerName.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const reviewData = {
        appointmentId,
        rating,
        comment: comment.trim(),
        serviceRating: serviceRating || null,
        staffRating: staffRating || null,
        facilitiesRating: facilitiesRating || null,
        priceRating: priceRating || null,
        photos: photos.length > 0 ? photos : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone || phoneInput,
        customerEmail: customerEmail.trim() || null
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || 'Değerlendirme gönderilirken hata oluştu');
      }
    } catch (err) {
      setError('Değerlendirme gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, setRatingFunc: (rating: number) => void, label: string) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingFunc(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  star <= currentRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          {currentRating > 0 && (
            <span className="ml-2 text-sm text-gray-600">({currentRating}/5)</span>
          )}
        </div>
      </div>
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Phone verification screen
  if (showPhoneVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Telefon Doğrulama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Değerlendirme yapabilmek için randevuda kullandığınız telefon numarasını girin.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numaranız
                </label>
                <Input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9+()\s-]/g, '');
                    if (value.startsWith('0') && value.length === 11) {
                      value = `+90 ${value.slice(1, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)}`;
                    }
                    setPhoneInput(value);
                  }}
                  placeholder="+90 532 123 45 67 veya 05321234567"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={verifyPhone}
                disabled={!phoneInput.trim() || loading}
                className="w-full"
              >
                {loading ? 'Kontrol Ediliyor...' : 'Devam Et'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Değerlendirme Gönderildi!
            </h2>
            <p className="text-gray-600 mb-6">
              Değerlendirmeniz başarıyla gönderildi. İşletme sahibi onayladıktan sonra yayınlanacak.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !canReview) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <X className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Değerlendirme Yapılamaz
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                Ana Sayfaya Dön
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPhoneVerification(true)} 
                className="w-full"
              >
                Farklı Telefon Deneyin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deneyiminizi Değerlendirin
          </h1>
          <p className="text-gray-600">
            Aldığınız hizmet hakkında görüşlerinizi paylaşın
          </p>
        </div>

        {/* Appointment Info */}
        {appointment && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">{appointment.business.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(appointment.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{appointment.service.name}</span>
                  <Badge className="ml-2">{appointment.service.price}₺</Badge>
                </div>
                {appointment.staff && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Personel: {appointment.staff.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{appointment.business.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme Formu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adınız Soyadınız *
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Adınızı girin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta (İsteğe bağlı)
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                  />
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                {renderStars(rating, setRating, 'Genel Değerlendirme *')}
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderStars(serviceRating, setServiceRating, 'Hizmet Kalitesi')}
                {renderStars(staffRating, setStaffRating, 'Personel')}
                {renderStars(facilitiesRating, setFacilitiesRating, 'Mekan/Temizlik')}
                {renderStars(priceRating, setPriceRating, 'Fiyat/Değer')}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorumunuz *
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Deneyiminizi detaylarıyla paylaşın..."
                  rows={4}
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotoğraflar (İsteğe bağlı)
                </label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Fotoğraf Ekle
                    </label>
                  </div>

                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !rating || !comment.trim() || !customerName.trim()}
                className="w-full"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  'Değerlendirmeyi Gönder'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for Suspense
function ReviewPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewPageLoading />}>
      <ReviewPageContent />
    </Suspense>
  );
}
