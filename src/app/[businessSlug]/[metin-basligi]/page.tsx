import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Eye } from 'lucide-react'

interface BlogPostProps {
  params: Promise<{
    businessSlug: string
    'metin-basligi': string
  }>
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  publishDate?: string
  author: string
  readTime: string
  category: string
  tags: string[]
  featuredImage?: string
  isPublished: boolean
  views: number
  createdAt: string
  updatedAt: string
  // Prisma relations
  authorUser?: {
    name: string | null
    email: string
  } | null
  business?: {
    name: string
    slug: string
  } | null
}

interface Business {
  id: string
  name: string
  slug: string
  category: string
  description?: string
  phone: string
  email?: string
  address: string
}

async function getBlogPost(businessSlug: string, postSlug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXTAUTH_URL
    const response = await fetch(`${baseUrl}/api/blog/posts/by-slug?businessSlug=${businessSlug}&postSlug=${postSlug}`, {
      cache: 'no-store' // Her zaman fresh data
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return null
  }
}

async function getBusiness(slug: string): Promise<Business | null> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXTAUTH_URL
    const response = await fetch(`${baseUrl}/api/business/by-slug?slug=${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Business fetch error:', error)
    return null
  }
}

// Görüntülenme sayısını artır
async function incrementViews(postId: string) {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXTAUTH_URL
    await fetch(`${baseUrl}/api/blog/posts/${postId}/view`, {
      method: 'POST',
      cache: 'no-store'
    })
  } catch (error) {
    console.error('View increment error:', error)
  }
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { businessSlug } = await params
  const blogSlug = (await params)['metin-basligi']
  
  const [post, business] = await Promise.all([
    getBlogPost(businessSlug, blogSlug),
    getBusiness(businessSlug)
  ])
  
  if (!post || !business) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı.'
    }
  }
  
  return {
    title: `${post.title} | ${business.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishDate || post.createdAt,
      authors: [post.author],
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { businessSlug } = await params
  const blogSlug = (await params)['metin-basligi']

  // Paralel olarak blog yazısı ve işletme bilgilerini al
  const [post, business] = await Promise.all([
    getBlogPost(businessSlug, blogSlug),
    getBusiness(businessSlug)
  ])

  // Blog yazısı veya işletme bulunamazsa 404
  if (!post || !business) {
    notFound()
  }

  // Yayınlanmamış yazıları gösterme
  if (!post.isPublished) {
    notFound()
  }

  // Görüntülenme sayısını artır (async, blocking olmayan)
  incrementViews(post.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href={`/${businessSlug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {business.name}
          </Link>
        </div>
      </header>

      {/* Blog Post Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage ? (
            <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-20">BLOG</span>
            </div>
          )}

          {/* Article Header */}
          <div className="p-6 lg:p-8">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

           

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.authorUser?.name || post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {post.publishDate ? 
                  new Date(post.publishDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) :
                  new Date(post.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                }
              </div>
              
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                {post.views + 1} görüntülenme
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg prose-xl max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Etiketler:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center text-white">
          <h3 className="text-xl font-semibold mb-3">
            {business.category === 'BARBER' ? 'Profesyonel Saç Bakımı İçin Randevu Alın' : `${business.name} - Randevu Alın`}
          </h3>
          
          <Link
            href={`/${businessSlug}`}
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Hizmetleri Keşfet
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href={`/${businessSlug}`}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Link>
          
          <div className="text-sm text-gray-500">
            {business.name}
          </div>
        </div>
      </main>
    </div>
  )
}
