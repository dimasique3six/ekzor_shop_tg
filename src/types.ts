export interface ProductVariantValue {
  label: string
  priceDiff: number
}
export interface ProductVariant {
  name: string
  values: ProductVariantValue[]
}
export interface Product {
  id: number
  name: string
  price: string | number
  description?: string | null
  images: string[]
  status: 'available' | 'unavailable'
  variants?: ProductVariant[] | null
}
export interface CartItem {
  product: Product
  quantity: number
  selectedVariants: Record<string, string>
}
export type OrderStatus = 'new' | 'confirmed' | 'cancelled' | 'expired'
export interface OrderItemRecord {
  id: number
  productId: number
  quantity: number
  price: string | number
  variants?: Record<string, string> | null
  product: { name: string }
}
export interface Order {
  id: string
  status: OrderStatus
  customerName: string
  customerPhone: string
  telegramUsername?: string | null
  address: string
  comment?: string | null
  totalAmount: string | number
  reservedUntil: string
  createdAt: string
  items: OrderItemRecord[]
}
