// src/utils/constants.ts

export const BUSINESS_CATEGORIES = [
  { value: 'BARBER_SALON', label: 'Berber & Kuaför' },
  { value: 'BEAUTY_CENTER', label: 'Güzellik Merkezi' },
  { value: 'DENTAL_CLINIC', label: 'Diş Kliniği' },
  { value: 'CAR_WASH', label: 'Oto Yıkama' },
  { value: 'EVENT_HALL', label: 'Düğün & Event Salonu' },
  { value: 'FITNESS_CENTER', label: 'Fitness & Spor' },
  { value: 'VETERINARY', label: 'Veteriner' },
  { value: 'OTHER', label: 'Diğer' },
] as const

export const SUBSCRIPTION_TYPES = [
  { value: 'FREE', label: 'Ücretsiz', price: 0 },
  { value: 'BASIC', label: 'Temel', price: 99 },
  { value: 'PREMIUM', label: 'Profesyonel', price: 199 },
  { value: 'ENTERPRISE', label: 'Kurumsal', price: 299 },
] as const

export const APPOINTMENT_STATUSES = [
  { value: 'PENDING', label: 'Beklemede', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Onaylandı', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'Devam Ediyor', color: 'purple' },
  { value: 'COMPLETED', label: 'Tamamlandı', color: 'green' },
  { value: 'CANCELLED', label: 'İptal Edildi', color: 'red' },
  { value: 'NO_SHOW', label: 'Gelmedi', color: 'gray' },
] as const

export const DEFAULT_WORKING_HOURS = {
  monday: { start: '09:00', end: '18:00', closed: false },
  tuesday: { start: '09:00', end: '18:00', closed: false },
  wednesday: { start: '09:00', end: '18:00', closed: false },
  thursday: { start: '09:00', end: '18:00', closed: false },
  friday: { start: '09:00', end: '18:00', closed: false },
  saturday: { start: '09:00', end: '17:00', closed: false },
  sunday: { start: '10:00', end: '16:00', closed: true },
}