import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Kullanıcının servis taleplerini ve gelen teklifleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    // Session kontrolü - giriş yapmış kullanıcı veya telefon/email ile arama
    const userRequests = []
    
    if (session?.user?.id) {
      // Giriş yapmış kullanıcının talepleri
      const sessionRequests = await prisma.serviceRequest.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          responses: {
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  phone: true,
                  email: true,
                  province: true,
                  district: true,
                  address: true,
                  profilePhotoUrl: true,
                  isPremium: true
                }
              }
            },
            orderBy: [
              { business: { isPremium: 'desc' } }, // Premium işletmeler önce
              { createdAt: 'desc' }
            ]
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      userRequests.push(...sessionRequests)
    }
    
    // Telefon veya email ile arama (giriş yapmamış kullanıcılar için)
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')
    
    if (phone || email) {
      const phoneEmailRequests = await prisma.serviceRequest.findMany({
        where: {
          OR: [
            phone ? { customerPhone: phone.replace(/\s/g, '') } : {},
            email ? { customerEmail: email } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        },
        include: {
          responses: {
            include: {
              business: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  phone: true,
                  email: true,
                  province: true,
                  district: true,
                  address: true,
                  profilePhotoUrl: true,
                  isPremium: true
                }
              }
            },
            orderBy: [
              { business: { isPremium: 'desc' } },
              { createdAt: 'desc' }
            ]
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      userRequests.push(...phoneEmailRequests)
    }
    
    // Duplikasyon kontrolü (aynı ID'li taleplar)
    const uniqueRequests = userRequests.filter((request, index, self) =>
      self.findIndex(r => r.id === request.id) === index
    )

    return NextResponse.json({
      success: true,
      requests: uniqueRequests,
      total: uniqueRequests.length
    })

  } catch (error) {
    console.error('My requests GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Talepleriniz yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
