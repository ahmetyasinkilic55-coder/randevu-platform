import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      businesses: any[]
      phone?: string
      birthDate?: string
      gender?: 'MALE' | 'FEMALE' | 'OTHER'
      city?: string
      district?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    businesses: any[]
    password?: string
    phone?: string
    birthDate?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    city?: string
    district?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    businesses: any[]
    phone?: string
    birthDate?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    city?: string
    district?: string
  }
}
