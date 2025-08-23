import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface Staff {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  specialty?: string | null
  experience?: number | null
  rating?: number | null
  bio?: string | null
  photoUrl?: string | null
  isActive: boolean
  businessId: string
  createdAt: string
  updatedAt: string
  _count?: {
    appointments: number
  }
}

interface CreateStaffData {
  name: string
  phone?: string
  email?: string
  specialty?: string
  experience?: number
  bio?: string
  photoUrl?: string
  isActive: boolean
  businessId: string
}

interface UpdateStaffData {
  name?: string
  phone?: string
  email?: string
  specialty?: string
  experience?: number
  bio?: string
  photoUrl?: string
  isActive?: boolean
}

export function useStaff(businessId: string | null) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = async () => {
    if (!businessId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff?businessId=${businessId}`)
      
      if (!response.ok) {
        throw new Error('Personeller alınamadı')
      }

      const data = await response.json()
      setStaff(data.staff || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const createStaff = async (staffData: CreateStaffData): Promise<boolean> => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Personel oluşturulamadı')
      }

      const data = await response.json()
      setStaff(prev => [data.staff, ...prev])
      toast.success('Personel başarıyla oluşturuldu')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  const updateStaff = async (staffId: string, updateData: UpdateStaffData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Personel güncellenemedi')
      }

      const data = await response.json()
      setStaff(prev => prev.map(member => 
        member.id === staffId ? data.staff : member
      ))
      toast.success('Personel başarıyla güncellendi')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  const deleteStaff = async (staffId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Personel silinemedi')
      }

      setStaff(prev => prev.filter(member => member.id !== staffId))
      toast.success('Personel başarıyla silindi')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [businessId])

  return {
    staff,
    isLoading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff
  }
}
