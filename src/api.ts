import type { Product, Order } from './types'

const BASE = import.meta.env.VITE_API_URL || ''

function getInitData(): string {
  if (import.meta.env.DEV) return 'dev'
  return (window as any).Telegram?.WebApp?.initData || 'dev'
}

async function req<T>(path: string, init: RequestInit = {}, admin = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {})
  }
  if (admin) {
    const t = localStorage.getItem('admin_token')
    if (t) headers['Authorization'] = `Bearer ${t}`
  } else {
    headers['X-Telegram-Init-Data'] = getInitData()
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  if (res.status === 204) return null as T
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data.error || 'Ошибка'), { status: res.status, data })
  return data as T
}

export const api = {
  products: {
    list: () => req<Product[]>('/api/products'),
    get:  (id: number) => req<Product>(`/api/products/${id}`)
  },
  orders: {
    get:    (id: string) => req<Order>(`/api/orders/${id}`),
    create: (body: object, ikey: string) =>
      req<Order>('/api/orders', {
        method: 'POST', body: JSON.stringify(body),
        headers: { 'X-Idempotency-Key': ikey }
      })
  }
}

export const adminApi = {
  auth: (password: string) =>
    req<{ token: string }>('/api/admin/auth', { method: 'POST', body: JSON.stringify({ password }) }, true),
  orders: {
    list: (params?: { status?: string; page?: number; search?: string }) => {
      const q = new URLSearchParams()
      if (params?.status) q.set('status', params.status)
      if (params?.page)   q.set('page', String(params.page))
      if (params?.search) q.set('search', params.search)
      return req<{ orders: any[]; total: number; page: number; pageSize: number }>(
        `/api/admin/orders?${q}`, {}, true
      )
    },
    updateStatus: (id: string, status: string) =>
      req<Order>(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, true)
  },
  products: {
    list:   () => req<Product[]>('/api/admin/products', {}, true),
    create: (d: object) => req<Product>('/api/admin/products', { method: 'POST', body: JSON.stringify(d) }, true),
    update: (id: number, d: object) => req<Product>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(d) }, true),
    delete: (id: number) => req<null>(`/api/admin/products/${id}`, { method: 'DELETE' }, true)
  }
}
