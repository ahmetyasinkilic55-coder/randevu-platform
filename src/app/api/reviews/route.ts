import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('API de alınan review verileri:', requestBody);
    
    const {
      appointmentId,
      rating,
      comment,
      serviceRating,
      staffRating,
      facilitiesRating,
      priceRating,
      photos,
      customerName,
      customerPhone,
      customerEmail
    } = requestBody;

    // Validate required fields
    if (!appointmentId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Randevu ID, puan ve yorum gerekli' },
        { status: 400 }
      );
    }

    // customerName and customerPhone should be provided by the client
    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: 'Müşteri adı eksik' },
        { status: 400 }
      );
    }

    // customerPhone can be optional since user might not have provided it
    // if (!customerPhone?.trim()) {
    //   return NextResponse.json(
    //     { error: 'Müşteri telefonu eksik' },
    //     { status: 400 }
    //   );
    // }

    // Check if appointment exists and is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { business: true }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      );
    }

    if (appointment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Sadece tamamlanmış randevular için değerlendirme yapılabilir' },
        { status: 400 }
      );
    }

    // Check if review already exists for this appointment
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Bu randevu için zaten değerlendirme yapılmış' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        appointmentId,
        businessId: appointment.businessId,
        rating,
        comment,
        serviceRating,
        staffRating,
        facilitiesRating,
        priceRating,
        photos: photos ? JSON.stringify(photos) : null,
        customerName: customerName?.trim() || 'Kullanıcı',
        customerPhone: customerPhone?.trim() || null,
        customerEmail: customerEmail?.trim() || null,
        isApproved: true, // Otomatik onay - işletme sonra cevap verebilir
        isVisible: true
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Değerlendirme oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// GET - Get reviews for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approved = searchParams.get('approved');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
      isVisible: true
    };

    // If approved filter is specified
    if (approved !== null) {
      where.isApproved = approved === 'true';
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          appointment: {
            include: {
              service: true,
              staff: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Değerlendirmeler alınırken hata oluştu' },
      { status: 500 }
    );
  }
}
