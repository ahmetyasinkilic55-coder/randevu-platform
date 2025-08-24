import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to see debug info
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUrl = process.env.DATABASE_URL
    const directDbUrl = process.env.DIRECT_DATABASE_URL
    
    // Parse database connection info safely
    const parseDbInfo = (url?: string) => {
      if (!url) return 'Not set'
      try {
        const parts = url.split('@')
        if (parts.length > 1) {
          const hostPart = parts[1].split('/')[0]
          const isAccelerate = url.includes('accelerate.prisma-data.net')
          return {
            host: hostPart,
            type: isAccelerate ? 'Prisma Accelerate' : 'Direct Connection',
            isAccelerate
          }
        }
        return 'Invalid format'
      } catch (error) {
        return 'Parse error'
      }
    }

    return NextResponse.json({
      message: 'Database connection debug info',
      database: {
        primary: {
          url: dbUrl ? parseDbInfo(dbUrl) : 'Not set',
          isSet: !!dbUrl
        },
        direct: {
          url: directDbUrl ? parseDbInfo(directDbUrl) : 'Not set', 
          isSet: !!directDbUrl
        },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Failed to get debug info' }, { status: 500 })
  }
}
