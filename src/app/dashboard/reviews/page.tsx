'use client';

import { useState, useEffect } from 'react';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Star, 
  MessageCircle, 
  Calendar, 
  User, 
  Eye,
  EyeOff,
  Filter,
  Search,
  Reply
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceRating?: number;
  staffRating?: number;
  facilitiesRating?: number;
  priceRating?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  isApproved: boolean;
  isVisible: boolean;
  photos?: string;
  ownerReply?: string;
  ownerReplyAt?: string;
  createdAt: string;
  appointment: {
    id: string;
    date: string;
    service: {
      name: string;
    };
    staff?: {
      name: string;
    };
  };
}

export default function ReviewsPage() {
  const { business, isLoading: businessLoading } = useActiveBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'replied' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (business?.id) {
      fetchReviews();
    }
  }, [business?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/reviews', window.location.origin);
      url.searchParams.set('businessId', business!.id);

      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (reviewId: string, visible: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: visible }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleReply = async (reviewId: string) => {
    const reply = replyText[reviewId]?.trim();
    if (!reply) return;

    try {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ownerReply: reply }),
      });

      if (response.ok) {
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        fetchReviews();
      }
    } catch (error) {
      console.error('Error replying to review:', error);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'replied':
        return !!review.ownerReply;
      case 'pending':
        return !review.ownerReply;
      default:
        return true;
    }
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0';

  if (businessLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-br from-gray-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
              <div>
                <h1 className="text-3xl font-bold mb-2">Değerlendirmeler</h1>
                <p className="text-blue-100 text-lg">
                  Müşteri yorumlarını yönetin ve yanıtlayın
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{averageRating}</div>
                    <div className="text-blue-100 text-sm">({reviews.length} değerlendirme)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Müşteri adı veya yorum içinde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg text-base bg-white placeholder-gray-500 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {[
                { key: 'all', label: 'Tümü', count: reviews.length, color: 'blue' },
                { key: 'replied', label: 'Yanıtlananlar', count: reviews.filter(r => r.ownerReply).length, color: 'green' },
                { key: 'pending', label: 'Yanıt Bekleyenler', count: reviews.filter(r => !r.ownerReply).length, color: 'orange' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    filter === filterOption.key 
                      ? `bg-gradient-to-r ${
                          filterOption.color === 'blue' 
                            ? 'from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                            : filterOption.color === 'green'
                            ? 'from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                            : 'from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                        }` 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {filterOption.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    filter === filterOption.key 
                      ? 'bg-white/20 text-white' 
                      : `${
                          filterOption.color === 'blue' 
                            ? 'bg-blue-100 text-blue-600' 
                            : filterOption.color === 'green'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                        }`
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-16 text-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchTerm || filter !== 'all' ? 'Arama kriterinize uygun değerlendirme bulunamadı' : 'Henüz değerlendirme yok'}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {searchTerm || filter !== 'all' 
                    ? 'Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.'
                    : 'Müşterilerinizden değerlendirme geldiğinde burada görüntülenecek.'}
                </p>
              </div>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-8">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900 text-lg">{review.customerName}</span>
                            <Badge className={`text-sm font-medium ${getRatingColor(review.rating)} px-2 py-1`}>
                              {review.rating}/5
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating, 'md')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-gray-600 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">{format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="font-medium text-indigo-600">{review.appointment.service.name}</span>
                        {review.appointment.staff && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-700">{review.appointment.staff.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVisibilityToggle(review.id, !review.isVisible)}
                        className={review.isVisible 
                          ? "text-green-600 hover:text-green-800 hover:bg-green-50 border border-green-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
                        }
                      >
                        {review.isVisible ? (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Görünür
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Gizli
                          </>
                        )}
                      </Button>

                      {!review.ownerReply && (
                        <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200 px-3 py-1">
                          Yanıt Bekliyor
                        </Badge>
                      )}
                      {review.ownerReply && (
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-3 py-1">
                          Yanıtlandı
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                    <p className="text-gray-800 leading-relaxed text-lg font-medium">“{review.comment}”</p>
                  </div>

                  {/* Photos */}
                  {review.photos && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Eklenen Fotoğraflar</h4>
                      <div className="flex gap-3 flex-wrap">
                        {JSON.parse(review.photos).map((photo: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Owner Reply */}
                  {review.ownerReply && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-xl border-l-4 border-indigo-400 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Reply className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-indigo-900 text-lg">İşletme Yanıtı</span>
                          {review.ownerReplyAt && (
                            <div className="text-sm text-indigo-600 mt-1">
                              {format(new Date(review.ownerReplyAt), 'dd MMMM yyyy', { locale: tr })}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-indigo-800 leading-relaxed text-base">{review.ownerReply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!review.ownerReply && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-indigo-600" />
                          Bu değerlendirmeye yanıt verin
                        </h4>
                        <Textarea
                          placeholder="Müşterinize profesyonel ve samimi bir yanıt yazın..."
                          value={replyText[review.id] || ''}
                          onChange={(e) => setReplyText(prev => ({
                            ...prev,
                            [review.id]: e.target.value
                          }))}
                          rows={4}
                          className="resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white rounded-lg text-base text-gray-900 placeholder-gray-500 font-medium"
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleReply(review.id)}
                            disabled={!replyText[review.id]?.trim() || submittingReply[review.id]}
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                          >
                            {submittingReply[review.id] ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            ) : (
                              <MessageCircle className="w-5 h-5 mr-3" />
                            )}
                            Yanıtı Gönder
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                Değerlendirme İstatistikleri
              </h3>
              <p className="text-gray-300">Müşteri yorumlarınızın genel durumu</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{reviews.length}</div>
                  <div className="text-sm text-blue-700 font-medium">Toplam Değerlendirme</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Reply className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{reviews.filter(r => r.ownerReply).length}</div>
                  <div className="text-sm text-green-700 font-medium">Yanıtlanan</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{reviews.filter(r => !r.ownerReply).length}</div>
                  <div className="text-sm text-orange-700 font-medium">Yanıt Bekleyen</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{averageRating}</div>
                  <div className="text-sm text-yellow-700 font-medium">Ortalama Puan</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}