import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Papara Payment API configuration
const PAPARA_API_KEY = process.env.PAPARA_API_KEY!;
const PAPARA_API_SECRET = process.env.PAPARA_API_SECRET!;
const PAPARA_MERCHANT_ID = process.env.PAPARA_MERCHANT_ID!;

interface PricingPlan {
  id: string;
  name: string;
  price: number;
}

const pricingPlans: Record<string, PricingPlan> = {
  basic: { id: 'basic', name: 'Temel Paket', price: 199 },
  premium: { id: 'premium', name: 'Premium Paket', price: 349 },
  pro: { id: 'pro', name: 'Kurumsal Paket', price: 599 }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, businessId } = body;

    // Plan validation
    const plan = pricingPlans[planId];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz plan seçimi' },
        { status: 400 }
      );
    }

    // Business validation
    let business;
    if (businessId) {
      business = await prisma.business.findUnique({
        where: { id: businessId }
      });
      
      if (!business) {
        return NextResponse.json(
          { success: false, error: 'İşletme bulunamadı' },
          { status: 404 }
        );
      }
    }

    // Generate unique order ID
    const orderId = `RV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // İlk 3 ay ücretsiz olduğu için ödeme tutarı 0
    // Ama ileride otomatik yenileme için kayıt tutacağız
    const paymentAmount = 0; // İlk 3 ay ücretsiz

    // Papara ödeme request'i
    const paparaPayload = {
      merchantId: PAPARA_MERCHANT_ID,
      orderId: orderId,
      amount: paymentAmount,
      currency: 'TRY',
      description: `RandeVur ${plan.name} - 3 Ay Ücretsiz Deneme`,
      notificationUrl: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
      redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success?orderId=${orderId}`,
      failRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/failed?orderId=${orderId}`,
      
      // Müşteri bilgileri
      customer: {
        name: business?.name || 'İşletme Sahibi',
        email: business?.email || 'info@randevur.com',
        phone: business?.phone || '',
        identityNumber: '',
        address: business?.address || ''
      },

      // Sipariş detayları
      basketItems: [{
        id: planId,
        name: `${plan.name} - 3 Ay Ücretsiz`,
        category: 'Subscription',
        price: paymentAmount,
        quantity: 1
      }]
    };

    // Papara API çağrısı (MOCK - gerçek entegrasyon için Papara SDK kullanılmalı)
    const paparaResponse = await createPaparaPayment(paparaPayload);
    
    if (!paparaResponse.success) {
      return NextResponse.json(
        { success: false, error: 'Ödeme başlatılamadı' },
        { status: 500 }
      );
    }

    // Database'e ödeme kaydını kaydet
    // Not: Payments tablosu henüz yok, şimdilik log'layalım
    console.log('Payment record would be saved:', {
      orderId,
      businessId,
      planId,
      amount: paymentAmount,
      paparaPaymentId: paparaResponse.paymentId
    });

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentUrl: paparaResponse.paymentUrl,
      paymentId: paparaResponse.paymentId
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'İç sunucu hatası' },
      { status: 500 }
    );
  }
}

// Papara ödeme oluşturma fonksiyonu (MOCK)
async function createPaparaPayment(payload: any) {
  // GERÇEK ENTEGRASYON İÇİN:
  // npm install @papara/sdk
  // import { Papara } from '@papara/sdk';
  
  // ŞUAN MOCK RESPONSE DÖNELİM
  console.log('Papara payment payload:', payload);
  
  // Mock successful response
  return {
    success: true,
    paymentId: `PAP-${Date.now()}`,
    paymentUrl: `https://merchant.test.papara.com/pay/${payload.orderId}` // Test URL
  };

  /* GERÇEK ENTEGRASYON ÖRNEĞİ:
  try {
    const papara = new Papara({
      apiKey: PAPARA_API_KEY,
      secretKey: PAPARA_API_SECRET,
      environment: 'sandbox' // production için 'live'
    });

    const payment = await papara.payment.create({
      amount: payload.amount,
      orderId: payload.orderId,
      description: payload.description,
      notificationUrl: payload.notificationUrl,
      redirectUrl: payload.redirectUrl,
      failRedirectUrl: payload.failRedirectUrl
    });

    return {
      success: true,
      paymentId: payment.id,
      paymentUrl: payment.paymentUrl
    };
  } catch (error) {
    console.error('Papara API error:', error);
    return { success: false, error: error.message };
  }
  */
}
