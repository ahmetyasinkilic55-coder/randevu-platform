import { prisma } from './prisma'
import { Business, Service, Staff, WorkingHour, GalleryItem, Review, WebsiteConfig, BusinessSettings } from '@prisma/client'

export type BusinessWithDetails = Business & {
  services: Service[]
  staff: Staff[]
  workingHours: WorkingHour[]
  gallery: GalleryItem[]
  reviews: (Review & { customerName: string })[]
  websiteConfig: WebsiteConfig | null
  settings?: BusinessSettings | null
  _count: {
    reviews: number
    appointments: number
  }
}

export class BusinessService {
  // Get business by slug with all details
  static async getBySlug(slug: string): Promise<BusinessWithDetails | null> {
    try {
      const business = await prisma.business.findUnique({
        where: { 
          slug,
          isActive: true 
        },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { popularity: 'desc' }
          },
          staff: {
            where: { isActive: true },
            orderBy: { experience: 'desc' }
          },
          workingHours: {
            orderBy: { dayOfWeek: 'asc' }
          },
          gallery: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          reviews: {
            where: { 
              isApproved: true,
              isVisible: true 
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          websiteConfig: true,
          settings: true,
          _count: {
            select: {
              reviews: {
                where: { isApproved: true }
              },
              appointments: {
                where: { status: 'COMPLETED' }
              }
            }
          }
        }
      })

      return business
    } catch (error) {
      console.error('Error fetching business by slug:', error)
      return null
    }
  }

  // Get business by ID for dashboard
  static async getById(id: string): Promise<BusinessWithDetails | null> {
    try {
      const business = await prisma.business.findUnique({
        where: { id },
        include: {
          services: {
            orderBy: { createdAt: 'desc' }
          },
          staff: {
            orderBy: { createdAt: 'desc' }
          },
          workingHours: {
            orderBy: { dayOfWeek: 'asc' }
          },
          gallery: {
            orderBy: { order: 'asc' }
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          websiteConfig: true,
          _count: {
            select: {
              reviews: true,
              appointments: true
            }
          }
        }
      })

      return business
    } catch (error) {
      console.error('Error fetching business by ID:', error)
      return null
    }
  }

  // Create new business
  static async create(data: {
    name: string
    category: string  // sector yerine category
    phone: string
    email?: string
    address: string
    description?: string
    ownerId: string
  }) {
    try {
      // Generate slug from business name
      const slug = data.name
        .toLowerCase()
        .replace(/[şğıçöü]/g, char => {
          const map = { 'ş': 's', 'ğ': 'g', 'ı': 'i', 'ç': 'c', 'ö': 'o', 'ü': 'u' }
          return map[char as keyof typeof map] || char
        })
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')

      // Check if slug already exists
      let finalSlug = slug
      let counter = 1
      while (await prisma.business.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}${counter}`
        counter++
      }

      const business = await prisma.business.create({
        data: {
          ...data,
          slug: finalSlug
        }
      })

      // Create default website config
      await this.createDefaultWebsiteConfig(business.id, business.name, business.category)

      // Create default working hours
      await this.createDefaultWorkingHours(business.id)

      return business
    } catch (error) {
      console.error('Error creating business:', error)
      throw error
    }
  }

  // Create default website configuration
  static async createDefaultWebsiteConfig(businessId: string, businessName: string, category: string) {
    const sectorConfigs = {
      BERBER: {
        heroTitle: 'Profesyonel Berberlik Deneyimi',
        heroSubtitle: 'Stil ve zarafeti bir arada yaşayın',
        primaryColor: '#2c3e50',
        gradientColors: 'linear-gradient(135deg, #2c3e50, #4a6741)'
      },
      KUAFOR: {
        heroTitle: 'Güzelliğinizi Keşfedin',
        heroSubtitle: 'Her detayda mükemmellik',
        primaryColor: '#e91e63',
        gradientColors: 'linear-gradient(135deg, #e91e63, #9c27b0)'
      },
      DISHEKIMI: {
        heroTitle: 'Sağlıklı Gülüşler',
        heroSubtitle: 'Modern diş hekimliği hizmetleri',
        primaryColor: '#2196f3',
        gradientColors: 'linear-gradient(135deg, #2196f3, #21cbf3)'
      },
      DEFAULT: {
        heroTitle: 'Profesyonel Hizmet',
        heroSubtitle: 'Kaliteli hizmet anlayışı',
        primaryColor: '#2563eb',
        gradientColors: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
      }
    }

    const config = sectorConfigs[category as keyof typeof sectorConfigs] || sectorConfigs.DEFAULT

    await prisma.websiteConfig.create({
      data: {
        businessId,
        urlSlug: businessName.toLowerCase().replace(/\s+/g, '-'), // URL slug ekle
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        primaryColor: config.primaryColor,
        gradientColors: config.gradientColors,
        metaTitle: `${businessName} - Randevu Al`,
        metaDescription: `${businessName} - ${config.heroSubtitle}. Online randevu alın.`
      }
    })
  }

  // Create default working hours
  static async createDefaultWorkingHours(businessId: string) {
    const defaultHours = [
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Pazartesi
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Salı
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Çarşamba
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Perşembe
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' }, // Cuma
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Cumartesi
      { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '16:00' } // Pazar
    ]

    await prisma.workingHour.createMany({
      data: defaultHours.map(hour => ({
        ...hour,
        businessId
      }))
    })
  }

  // Update website configuration
  static async updateWebsiteConfig(businessId: string, config: Partial<WebsiteConfig>) {
    try {
      const updatedConfig = await prisma.websiteConfig.upsert({
        where: { businessId },
        update: config,
        create: {
          businessId,
          urlSlug: config.urlSlug || 'default-slug', // urlSlug ekle
          heroTitle: config.heroTitle || 'Profesyonel Hizmet',
          heroSubtitle: config.heroSubtitle || 'Kaliteli hizmet anlayışı',
          ...config
        }
      })

      return updatedConfig
    } catch (error) {
      console.error('Error updating website config:', error)
      throw error
    }
  }

  // Calculate average rating
  static calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  // Get formatted working hours
  static formatWorkingHours(workingHours: WorkingHour[]) {
    const dayNames = [
      'Pazar',     // 0
      'Pazartesi', // 1
      'Salı',      // 2
      'Çarşamba',  // 3
      'Perşembe',  // 4
      'Cuma',      // 5
      'Cumartesi'  // 6
    ]

    return dayNames.map((dayName, index) => {
      const hour = workingHours.find(h => h.dayOfWeek === index)
      return {
        day: dayName,
        hours: !hour?.isOpen ? 'Kapalı' : `${hour?.openTime || '09:00'} - ${hour?.closeTime || '18:00'}`,
        isClosed: !hour?.isOpen
      }
    })
  }

  // Search businesses
  static async search(query: string, category?: string, limit = 10) {
    try {
      const businesses = await prisma.business.findMany({
        where: {
          isActive: true,
          AND: [
            query ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { address: { contains: query } }
              ]
            } : {},
            category ? { category: category.toUpperCase() } : {}
          ]
        },
        include: {
          websiteConfig: true,
          _count: {
            select: {
              reviews: { where: { isApproved: true } },
              appointments: { where: { status: 'COMPLETED' } }
            }
          }
        },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      })

      return businesses
    } catch (error) {
      console.error('Error searching businesses:', error)
      return []
    }
  }
}
