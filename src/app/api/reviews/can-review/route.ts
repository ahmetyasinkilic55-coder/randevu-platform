import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Check if user can review an appointment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const customerPhone = searchParams.get('customerPhone');

    if (!appointmentId || !customerPhone) {
      return NextResponse.json(
        { error: 'Randevu ID ve telefon numarası gerekli' },
        { status: 400 }
      );
    }

    // Check if appointment exists and belongs to customer
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        customerPhone,
        status: 'COMPLETED'
      },
      include: {
        business: true,
        service: true,
        staff: true,
        review: true
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { 
          canReview: false,
          reason: 'Randevu bulunamadı veya henüz tamamlanmamış'
        },
        { status: 404 }
      );
    }

    // Check if review already exists
    if (appointment.review) {
      return NextResponse.json({
        canReview: false,
        reason: 'Bu randevu için zaten değerlendirme yapılmış',
        existingReview: appointment.review
      });
    }

    // Check if appointment was completed recently (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (appointment.date < thirtyDaysAgo) {
      return NextResponse.json({
        canReview: false,
        reason: 'Değerlendirme süresi dolmuş (30 gün)'
      });
    }

    return NextResponse.json({
      canReview: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        business: appointment.business,
        service: appointment.service,
        staff: appointment.staff
      }
    });
  } catch (error) {
    console.error('Can review check error:', error);
    return NextResponse.json(
      { error: 'Değerlendirme kontrolü yapılırken hata oluştu' },
      { status: 500 }
    );
  }
}
