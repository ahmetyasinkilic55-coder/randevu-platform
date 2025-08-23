'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User, Calendar, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  photos?: string;
  ownerReply?: string;
  ownerReplyAt?: string;
  createdAt: string;
  appointment: {
    service: {
      name: string;
    };
    staff?: {
      name: string;
    };
  };
}

interface BusinessReviewsProps {
  businessId: string;
  showTitle?: boolean;
  limit?: number;
  showPagination?: boolean;
}

export default function BusinessReviews({ 
  businessId, 
  showTitle = true, 
  limit = 6,
  showPagination = true 
}: BusinessReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [businessId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews?businessId=${businessId}&approved=true&page=${currentPage}&limit=${limit}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
        setTotalPages(data.pagination?.pages || 1);
        
        // Calculate stats
        const allReviews = data.reviews || [];
        const total = allReviews.length;
        const average = total > 0 
          ? allReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / total
          : 0;
        
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach((review: Review) => {
          breakdown[review.rating as keyof typeof breakdown]++;
        });

        setStats({ total, average, breakdown });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5', 
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBreakdown = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.breakdown[rating as keyof typeof stats.breakdown];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-[60px]">
                <span className="text-sm">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[30px]">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Henüz değerlendirme yok
        </h3>
        <p className="text-gray-600">
          Bu işletme için henüz müşteri değerlendirmesi bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Müşteri Değerlendirmeleri
          </h2>
          <p className="text-gray-600">
            Müşterilerimizin deneyimlerini okuyun
          </p>
        </div>
      )}

      {/* Rating Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {stats.average.toFixed(1)}
                </div>
                <div>
                  {renderStars(Math.round(stats.average), 'lg')}
                  <p className="text-sm text-gray-600 mt-1">
                    {stats.total} değerlendirme
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div>
              {renderRatingBreakdown()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {review.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: tr })}
                      </div>
                      <span>•</span>
                      <span>{review.appointment.service.name}</span>
                      {review.appointment.staff && (
                        <>
                          <span>•</span>
                          <span>{review.appointment.staff.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Ratings */}
                {(review.serviceRating || review.staffRating || review.facilitiesRating || review.priceRating) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                    {review.serviceRating && (
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Hizmet</div>
                        {renderStars(review.serviceRating, 'sm')}
                      </div>
                    )}
                    {review.staffRating && (
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Personel</div>
                        {renderStars(review.staffRating, 'sm')}
                      </div>
                    )}
                    {review.facilitiesRating && (
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Mekan</div>
                        {renderStars(review.facilitiesRating, 'sm')}
                      </div>
                    )}
                    {review.priceRating && (
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Fiyat</div>
                        {renderStars(review.priceRating, 'sm')}
                      </div>
                    )}
                  </div>
                )}

                {/* Review Content */}
                <div>
                  <p className="text-gray-800 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* Photos */}
                {review.photos && (
                  <div className="flex gap-2 flex-wrap">
                    {JSON.parse(review.photos).map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {/* Owner Reply */}
                {review.ownerReply && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-blue-900">
                        İşletme Yanıtı
                      </span>
                      {review.ownerReplyAt && (
                        <span className="text-xs text-blue-600">
                          {format(new Date(review.ownerReplyAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{review.ownerReply}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Önceki
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sonraki
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
