// scripts/add-categories.js
// Bu scripti çalıştırarak kategori tablolarını ve verilerini ekleyin

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  console.log('🚀 Kategori verilerini yükleniyor...')
  
  try {
    // Prisma bağlantısını test et
    await prisma.$connect()
    console.log('✅ Database bağlantısı başarılı')
    
    // Önce mevcut kategori verileri var mı kontrol et
    const existingCategories = await prisma.category.count()
    
    if (existingCategories > 0) {
      console.log(`✅ Zaten ${existingCategories} kategori mevcut. İşlem atlanıyor.`)
      return
    }

    // Ana kategorileri ekle
    const categories = [
      {
        name: 'Sağlık & Tıp',
        slug: 'saglik-tip',
        description: 'Sağlık hizmetleri ve tıbbi bakım',
        icon: '🏥',
        color: '#ef4444',
        orderIndex: 1
      },
      {
        name: 'Güzellik & Bakım',
        slug: 'guzellik-bakim',
        description: 'Güzellik salonu ve kişisel bakım hizmetleri',
        icon: '💅',
        color: '#ec4899',
        orderIndex: 2
      },
      {
        name: 'Otomotiv',
        slug: 'otomotiv',
        description: 'Araç bakım ve tamiri hizmetleri',
        icon: '🚗',
        color: '#3b82f6',
        orderIndex: 3
      },
      {
        name: 'Eğitim & Kurs',
        slug: 'egitim-kurs',
        description: 'Eğitim ve öğretim hizmetleri',
        icon: '📚',
        color: '#8b5cf6',
        orderIndex: 4
      },
      {
        name: 'Spor & Fitness',
        slug: 'spor-fitness',
        description: 'Spor salonu ve fitness hizmetleri',
        icon: '💪',
        color: '#10b981',
        orderIndex: 5
      },
      {
        name: 'Pet & Veteriner',
        slug: 'pet-veteriner',
        description: 'Evcil hayvan bakım hizmetleri',
        icon: '🐕',
        color: '#f97316',
        orderIndex: 6
      },
      {
        name: 'Ev & Yaşam',
        slug: 'ev-yasam',
        description: 'Ev bakım ve yaşam hizmetleri',
        icon: '🏠',
        color: '#6366f1',
        orderIndex: 7
      },
      {
        name: 'Teknoloji',
        slug: 'teknoloji',
        description: 'Teknoloji ve bilişim hizmetleri',
        icon: '💻',
        color: '#06b6d4',
        orderIndex: 8
      }
    ]

    console.log('📂 Ana kategoriler ekleniyor...')
    
    for (const categoryData of categories) {
      await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ ${categoryData.name} kategorisi eklendi`)
    }

    // Alt kategorileri ekle
    const subcategoriesData = [
      // Sağlık & Tıp alt kategorileri
      { categorySlug: 'saglik-tip', name: 'Diş Kliniği', slug: 'dis-klinigi', description: 'Diş hekimi ve ağız-diş sağlığı', icon: '🦷', orderIndex: 1 },
      { categorySlug: 'saglik-tip', name: 'Göz Kliniği', slug: 'goz-klinigi', description: 'Göz muayene ve tedavisi', icon: '👁️', orderIndex: 2 },
      { categorySlug: 'saglik-tip', name: 'Fizik Tedavi', slug: 'fizik-tedavi', description: 'Fizyoterapi ve rehabilitasyon', icon: '🏥', orderIndex: 3 },
      { categorySlug: 'saglik-tip', name: 'Psikoloji', slug: 'psikologi', description: 'Psikolojik danışmanlık', icon: '🧠', orderIndex: 4 },
      { categorySlug: 'saglik-tip', name: 'Beslenme & Diyet', slug: 'beslenme-diyet', description: 'Diyetisyen ve beslenme danışmanlığı', icon: '🥗', orderIndex: 5 },

      // Güzellik & Bakım alt kategorileri
      { categorySlug: 'guzellik-bakim', name: 'Kuaför (Kadın)', slug: 'kuafor-kadin', description: 'Kadın kuaförlük hizmetleri', icon: '💇‍♀️', orderIndex: 1 },
      { categorySlug: 'guzellik-bakim', name: 'Berber (Erkek)', slug: 'berber-erkek', description: 'Erkek kuaförlük hizmetleri', icon: '💇‍♂️', orderIndex: 2 },
      { categorySlug: 'guzellik-bakim', name: 'Güzellik Salonu', slug: 'guzellik-salonu', description: 'Güzellik bakım hizmetleri', icon: '✨', orderIndex: 3 },
      { categorySlug: 'guzellik-bakim', name: 'Nail Art', slug: 'nail-art', description: 'Tırnak bakım ve tasarımı', icon: '💅', orderIndex: 4 },
      { categorySlug: 'guzellik-bakim', name: 'Masaj & SPA', slug: 'masaj-spa', description: 'Masaj ve spa hizmetleri', icon: '🧖‍♀️', orderIndex: 5 },
      { categorySlug: 'guzellik-bakim', name: 'Estetik Merkezi', slug: 'estetik-merkezi', description: 'Estetik işlemler', icon: '💉', orderIndex: 6 },

      // Otomotiv alt kategorileri
      { categorySlug: 'otomotiv', name: 'Oto Yıkama', slug: 'oto-yikama', description: 'Araç yıkama ve temizlik', icon: '🚿', orderIndex: 1 },
      { categorySlug: 'otomotiv', name: 'Oto Tamiri', slug: 'oto-tamiri', description: 'Araç tamiri ve bakımı', icon: '🔧', orderIndex: 2 },
      { categorySlug: 'otomotiv', name: 'Lastik & Jant', slug: 'lastik-jant', description: 'Lastik ve jant hizmetleri', icon: '🛞', orderIndex: 3 },
      { categorySlug: 'otomotiv', name: 'Araç Ekspertizi', slug: 'arac-ekspertizi', description: 'Araç ekspertiz hizmetleri', icon: '📋', orderIndex: 4 },

      // Eğitim & Kurs alt kategorileri
      { categorySlug: 'egitim-kurs', name: 'Dil Kursu', slug: 'dil-kursu', description: 'Yabancı dil eğitimi', icon: '🗣️', orderIndex: 1 },
      { categorySlug: 'egitim-kurs', name: 'Müzik Kursu', slug: 'muzik-kursu', description: 'Müzik eğitimi', icon: '🎵', orderIndex: 2 },
      { categorySlug: 'egitim-kurs', name: 'Sürücü Kursu', slug: 'surucu-kursu', description: 'Sürücü belgesi eğitimi', icon: '🚗', orderIndex: 3 },
      { categorySlug: 'egitim-kurs', name: 'Özel Ders', slug: 'ozel-ders', description: 'Birebir özel dersler', icon: '👨‍🏫', orderIndex: 4 },

      // Spor & Fitness alt kategorileri
      { categorySlug: 'spor-fitness', name: 'Fitness Salonu', slug: 'fitness-salonu', description: 'Fitness ve vücut geliştirme', icon: '🏋️', orderIndex: 1 },
      { categorySlug: 'spor-fitness', name: 'Yoga & Pilates', slug: 'yoga-pilates', description: 'Yoga ve pilates dersleri', icon: '🧘‍♀️', orderIndex: 2 },
      { categorySlug: 'spor-fitness', name: 'Yüzme Havuzu', slug: 'yuzme-havuzu', description: 'Yüzme eğitimi', icon: '🏊', orderIndex: 3 },
      { categorySlug: 'spor-fitness', name: 'Dövüş Sanatları', slug: 'dovus-sanatlari', description: 'Karate, tekvando vb.', icon: '🥋', orderIndex: 4 },

      // Pet & Veteriner alt kategorileri
      { categorySlug: 'pet-veteriner', name: 'Veteriner Kliniği', slug: 'veteriner-klinigi', description: 'Veteriner hekimlik', icon: '🐾', orderIndex: 1 },
      { categorySlug: 'pet-veteriner', name: 'Pet Kuaförü', slug: 'pet-kuaforu', description: 'Evcil hayvan bakımı', icon: '🐕‍🦺', orderIndex: 2 },
      { categorySlug: 'pet-veteriner', name: 'Pet Shop', slug: 'pet-shop', description: 'Evcil hayvan ürünleri', icon: '🛍️', orderIndex: 3 },

      // Ev & Yaşam alt kategorileri
      { categorySlug: 'ev-yasam', name: 'Temizlik Hizmeti', slug: 'temizlik-hizmeti', description: 'Ev ve ofis temizliği', icon: '🧽', orderIndex: 1 },
      { categorySlug: 'ev-yasam', name: 'Elektrikçi', slug: 'elektrikci', description: 'Elektrik işleri', icon: '⚡', orderIndex: 2 },
      { categorySlug: 'ev-yasam', name: 'Tesisatçı', slug: 'tesisatci', description: 'Su ve doğalgaz tesisatı', icon: '🔧', orderIndex: 3 },
      { categorySlug: 'ev-yasam', name: 'Boyacı', slug: 'boyaci', description: 'Ev boyama hizmetleri', icon: '🎨', orderIndex: 4 },

      // Teknoloji alt kategorileri
      { categorySlug: 'teknoloji', name: 'Bilgisayar Tamiri', slug: 'bilgisayar-tamiri', description: 'PC ve laptop tamiri', icon: '💻', orderIndex: 1 },
      { categorySlug: 'teknoloji', name: 'Telefon Tamiri', slug: 'telefon-tamiri', description: 'Cep telefonu tamiri', icon: '📱', orderIndex: 2 },
      { categorySlug: 'teknoloji', name: 'Web Tasarım', slug: 'web-tasarim', description: 'Web sitesi tasarımı', icon: '🌐', orderIndex: 3 },
      { categorySlug: 'teknoloji', name: 'IT Danışmanlık', slug: 'it-danismanlik', description: 'Bilişim danışmanlığı', icon: '👨‍💻', orderIndex: 4 }
    ]

    console.log('📋 Alt kategoriler ekleniyor...')

    for (const subData of subcategoriesData) {
      // Kategori ID'sini bul
      const category = await prisma.category.findUnique({
        where: { slug: subData.categorySlug }
      })

      if (category) {
        await prisma.subcategory.create({
          data: {
            categoryId: category.id,
            name: subData.name,
            slug: subData.slug,
            description: subData.description,
            icon: subData.icon,
            orderIndex: subData.orderIndex
          }
        })
        console.log(`  ✅ ${subData.name} alt kategorisi eklendi`)
      }
    }

    console.log('🎉 Tüm kategoriler başarıyla eklendi!')
    
    // Özet bilgi
    const totalCategories = await prisma.category.count()
    const totalSubcategories = await prisma.subcategory.count()
    
    console.log(`📊 Özet: ${totalCategories} ana kategori, ${totalSubcategories} alt kategori`)
    
  } catch (error) {
    console.error('❌ Hata:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
