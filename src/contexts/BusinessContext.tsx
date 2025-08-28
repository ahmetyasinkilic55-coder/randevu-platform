'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface BusinessContextType {
  businessSlug: string
  businessData: {
    name: string
    slug: string
    category: string
    description: string
  } | null
  setBusinessSlug: (slug: string) => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

interface BusinessProviderProps {
  children: ReactNode
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [businessSlug, setBusinessSlug] = useState<string>('')
  const [businessData, setBusinessData] = useState<BusinessContextType['businessData']>(null)
  const { data: session } = useSession()

  // Gerçek business data'sını al
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/business/current')
          if (response.ok) {
            const data = await response.json()
            setBusinessData({
              name: data.name,
              slug: data.slug,
              category: data.category,
              description: data.description || ''
            })
            setBusinessSlug(data.slug)
          } else {
            // Fallback mock data for development
            setBusinessData({
              name: 'Ali\'nin Berberi',
              slug: 'berber-ali',
              category: 'Berber',
              description: 'Profesyonel saç bakımı hizmetleri'
            })
            setBusinessSlug('berber-ali')
          }
        } catch (error) {
          console.error('Business data fetch error:', error)
          // Fallback mock data
          setBusinessData({
            name: 'Ali\'nin Berberi',
            slug: 'berber-ali',
            category: 'Berber',
            description: 'Profesyonel saç bakımı hizmetleri'
          })
          setBusinessSlug('berber-ali')
        }
      }
    }

    fetchBusinessData()
  }, [session])

  return (
    <BusinessContext.Provider value={{
      businessSlug,
      businessData,
      setBusinessSlug
    }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}
