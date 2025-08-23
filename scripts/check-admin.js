const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('Veritabanına bağlanıyor...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:')
      console.log('- Email:', existingAdmin.email)
      console.log('- Name:', existingAdmin.name)
      console.log('- ID:', existingAdmin.id)
      return
    }

    console.log('Admin kullanıcısı bulunamadı, oluşturuluyor...')

    // Create admin user without password (for OAuth/email login)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@randevu.com',
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin kullanıcısı oluşturuldu:')
    console.log('- Email: admin@randevu.com')
    console.log('- Name: Admin User')
    console.log('- ID:', admin.id)
    console.log('- Role:', admin.role)
    
    console.log('\n🔐 Giriş yapmak için NextAuth ile email login kullanabilirsiniz.')

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
