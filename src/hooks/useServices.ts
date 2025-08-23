import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string
  category: string
  isActive: boolean
  businessId: string
  createdAt: string
  updatedAt: string
}

interface CreateServiceData {
  name: string
  price: number
  duration: number
  description?: string
  category: string
  active: boolean
  businessId: string
}

interface UpdateServiceData {
  name?: string
  price?: number
  duration?: number
  description?: string
  category?: string
  active?: boolean
}

export function useServices(businessId: string | null) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    if (!businessId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/services?businessId=${businessId}`)
      
      if (!response.ok) {
        throw new Error('Hizmetler alınamadı')
      }

      const data = await response.json()
      setServices(data.services || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const createService = async (serviceData: CreateServiceData): Promise<boolean> => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hizmet oluşturulamadı')
      }

      const data = await response.json()
      setServices(prev => [data.service, ...prev])
      toast.success('Hizmet başarıyla oluşturuldu')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  const updateService = async (serviceId: string, updateData: UpdateServiceData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hizmet güncellenemedi')
      }

      const data = await response.json()
      setServices(prev => prev.map(service => 
        service.id === serviceId ? data.service : service
      ))
      toast.success('Hizmet başarıyla güncellendi')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  const deleteService = async (serviceId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hizmet silinemedi')
      }

      setServices(prev => prev.filter(service => service.id !== serviceId))
      toast.success('Hizmet başarıyla silindi')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  useEffect(() => {
    fetchServices()
  }, [businessId])

  return {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices
  }
}
