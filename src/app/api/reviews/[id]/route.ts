import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET - Get specific review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            service: true,
            staff: true
          }
        },
        business: true
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Değerlendirme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Değerlendirme alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Update review (owner reply or approve/disapprove)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ownerReply, isApproved, isVisible } = await request.json();

    // Get the review to check ownership
    const review = await prisma.review.findUnique({
      where: { id },
      include: { business: { include: { owner: true } } }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Değerlendirme bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user owns the business
    if (review.business.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (ownerReply !== undefined) {
      updateData.ownerReply = ownerReply;
      updateData.ownerReplyAt = new Date();
    }

    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
    }

    if (isVisible !== undefined) {
      updateData.isVisible = isVisible;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        appointment: {
          include: {
            service: true,
            staff: true
          }
        },
        business: true
      }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { error: 'Değerlendirme güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the review to check ownership
    const review = await prisma.review.findUnique({
      where: { id },
      include: { business: { include: { owner: true } } }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Değerlendirme bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user owns the business
    if (review.business.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Değerlendirme silindi' });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { error: 'Değerlendirme silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
