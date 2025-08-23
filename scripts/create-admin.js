const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@randevu.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('Admin kullanıcısı oluşturuldu:')
    console.log('Email: admin@randevu.com')
    console.log('Password: admin123')
    console.log('ID:', admin.id)

  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
